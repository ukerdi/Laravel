<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Compra;
use App\Models\Client;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Mail;
use App\Mail\FacturaCompra;

class CompraController extends Controller
{
    // Directorio para almacenar los archivos temporales
    protected $tempDir = 'storage/app/facturas_temp';

    /**
     * Genera una factura previa para que el usuario confirme la compra
     */
    public function preview(Request $request)
    {
        // Validar los datos de entrada
        $request->validate([
            'productos' => 'required|array',
            'productos.*.id' => 'required|exists:productos,id',
            'productos.*.cantidad' => 'required|integer|min:1',
        ]);

        // Inicializar arrays para el detalle de la factura
        $detalleProductos = [];
        $total = 0;

        // Procesar cada producto
        foreach ($request->productos as $productoData) {
            // Obtener producto de la base de datos para asegurar precio correcto
            $producto = Product::find($productoData['id']);
            
            if ($producto) {
                $cantidad = $productoData['cantidad'];
                $precioUnitario = $producto->price;
                $subtotal = $precioUnitario * $cantidad;
                
                // Acumular al total
                $total += $subtotal;
                
                // Procesar la imagen y obtener la URL absoluta
                $imagenUrl = $this->getFullImageUrl($producto->image);
                
                Log::info("Procesando imagen de producto", [
                    'producto_id' => $producto->id,
                    'producto_nombre' => $producto->name,
                    'imagen_original' => $producto->image,
                    'imagen_procesada' => $imagenUrl
                ]);
                
                // Agregar a la lista de productos
                $detalleProductos[] = [
                    'id' => $producto->id,
                    'nombre' => $producto->name,
                    'precio_unitario' => $precioUnitario,
                    'cantidad' => $cantidad,
                    'subtotal' => $subtotal,
                    'imagen' => $imagenUrl
                ];
            }
        }
        
        // Información del cliente (si está autenticado)
        $clientInfo = null;
        if (Auth::guard('sanctum')->check()) {
            $client = Auth::guard('sanctum')->user();
            $clientInfo = [
                'id' => $client->id,
                'nombre' => $client->name,
                'email' => $client->email
            ];
        }
        
        // Generar un token temporal para esta factura
        $facturaToken = md5(uniqid() . time());
        
        // Crear directorio si no existe
        if (!File::exists(base_path($this->tempDir))) {
            File::makeDirectory(base_path($this->tempDir), 0755, true);
        }
        
        // Guardar datos de la factura en un archivo temporal
        $facturaData = [
            'productos' => $detalleProductos,
            'total' => $total,
            'client_id' => $clientInfo ? $clientInfo['id'] : null,
            'created_at' => now()->timestamp
        ];
        
        File::put(
            base_path($this->tempDir . '/' . $facturaToken . '.json'),
            json_encode($facturaData)
        );
        
        Log::info('Factura temporal creada', ['token' => $facturaToken]);
        
        // Devolver la factura previa
        return response()->json([
            'factura' => [
                'token' => $facturaToken,
                'productos' => $detalleProductos,
                'total' => $total,
                'cliente' => $clientInfo,
                'fecha' => now()->format('Y-m-d H:i:s')
            ],
            'mensaje' => 'Revise la factura y confirme para finalizar la compra.'
        ]);
    }

    /**
     * Finaliza la compra después de la confirmación
     */
    public function confirm(Request $request)
    {
        // Validar token
        $request->validate([
            'token' => 'required|string'
        ]);
        
        $token = $request->token;
        $facturaPath = base_path($this->tempDir . '/' . $token . '.json');
        
        Log::info('Intentando confirmar factura', ['token' => $token, 'path' => $facturaPath]);
        
        // Verificar si el archivo de la factura existe
        if (!File::exists($facturaPath)) {
            return response()->json([
                'message' => 'La factura ha expirado o no existe.',
                'success' => false
            ], 400);
        }
        
        // Cargar los datos de la factura
        $facturaData = json_decode(File::get($facturaPath), true);
        
        // Comprobar si han pasado más de 30 minutos
        $createdAt = $facturaData['created_at'];
        if (now()->timestamp - $createdAt > 1800) { // 1800 segundos = 30 minutos
            // Eliminar el archivo
            File::delete($facturaPath);
            
            return response()->json([
                'message' => 'La factura ha expirado. Por favor, cree una nueva.',
                'success' => false
            ], 400);
        }
        
        // Procesar la compra
        try {
            $compra = Compra::create([
                'client_id' => $facturaData['client_id'],
                'productos' => json_encode($facturaData['productos']),
                'total' => $facturaData['total'],
            ]);
            
            // Eliminar el archivo temporal
            File::delete($facturaPath);
            
            // Si hay un cliente autenticado, enviar el correo automáticamente
            if ($facturaData['client_id']) {
                $cliente = Client::find($facturaData['client_id']);
                if ($cliente) {
                    $compraData = [
                        'id' => $compra->id,
                        'fecha' => now()->format('Y-m-d H:i:s'),
                        'productos' => $facturaData['productos'],
                        'total' => $facturaData['total']
                    ];
                    
                    $clienteInfo = [
                        'id' => $cliente->id,
                        'nombre' => $cliente->name,
                        'email' => $cliente->email
                    ];
                    
                    // Enviar el correo en segundo plano para no bloquear la respuesta
                    Mail::to($cliente->email)->queue(new FacturaCompra($compraData, $clienteInfo));
                    
                    Log::info('Correo de factura enviado automáticamente', [
                        'compra_id' => $compra->id, 
                        'cliente_id' => $cliente->id
                    ]);
                }
            }
            
            Log::info('Compra confirmada con éxito', ['id' => $compra->id]);
            
            return response()->json([
                'message' => 'Compra realizada con éxito',
                'success' => true,
                'compra' => [
                    'id' => $compra->id,
                    'total' => $facturaData['total'],
                    'fecha' => now()->format('Y-m-d H:i:s'),
                    'productos' => $facturaData['productos'],
                    'cliente_autenticado' => $facturaData['client_id'] ? true : false
                ]
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error al confirmar compra: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Error al procesar la compra',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Enviar correo electrónico de confirmación de compra
     */
    public function enviarCorreoFactura(Request $request)
    {
        $request->validate([
            'compra_id' => 'required|exists:compras,id',
            'email' => 'required|email',
        ]);
        
        try {
            // Obtener los datos de la compra
            $compra = Compra::findOrFail($request->compra_id);
            $productos = json_decode($compra->productos, true);
            
            // Asegurar que todas las URL de imágenes sean absolutas
            if (is_array($productos)) {
                foreach ($productos as &$producto) {
                    if (isset($producto['imagen'])) {
                        $producto['imagen'] = $this->asegurarUrlAbsoluta($producto['imagen']);
                    }
                }
            }
            
            $compraData = [
                'id' => $compra->id,
                'fecha' => $compra->created_at->format('Y-m-d H:i:s'),
                'productos' => $productos,
                'total' => $compra->total
            ];
            
            $clienteInfo = null;
            $email = $request->email;
            
            // Verificar si hay cliente asociado
            if ($compra->client_id) {
                $cliente = Client::find($compra->client_id);
                if ($cliente) {
                    $clienteInfo = [
                        'id' => $cliente->id,
                        'nombre' => $cliente->name,
                        'email' => $cliente->email
                    ];
                }
            }
            
            // Enviar el correo
            Mail::to($email)->send(new FacturaCompra($compraData, $clienteInfo));
            
            Log::info('Correo de factura enviado', ['compra_id' => $compra->id, 'email' => $email]);
            
            return response()->json([
                'success' => true,
                'message' => 'Correo electrónico enviado correctamente'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error al enviar correo de factura: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al enviar el correo electrónico: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtiene la URL completa de una imagen
     * Versión mejorada para garantizar URLs absolutas
     */
    private function getFullImageUrl($imagePath)
{
    if (empty($imagePath)) {
        Log::info("URL de imagen vacía");
        return null;
    }
    
    // Si ya es una URL absoluta, devuélvela como está
    if (filter_var($imagePath, FILTER_VALIDATE_URL)) {
        return $imagePath;
    }
    
    // CORRECCIÓN: Si la ruta es incorrecta, intenta corregirla
    // Busca la parte "productos/" en la URL y reemplázala con "storage/productos/"
    if (strpos($imagePath, 'productos/') === 0) {
        $imagePath = 'storage/' . $imagePath;
    }
    
    // Si la ruta sigue siendo incorrecta y no incluye "storage/"
    if (strpos($imagePath, 'storage/') !== 0 && strpos($imagePath, '/storage/') !== 0) {
        // Asume que debería estar en storage/productos
        if (substr($imagePath, 0, 1) === '/') {
            $imagePath = 'storage/productos' . $imagePath;
        } else {
            $imagePath = 'storage/productos/' . $imagePath;
        }
    }
    
    // Ahora construye la URL completa
    $appUrl = config('app.url', 'http://localhost:8000');
    if (substr($imagePath, 0, 1) === '/') {
        $fullUrl = rtrim($appUrl, '/') . $imagePath;
    } else {
        $fullUrl = rtrim($appUrl, '/') . '/' . $imagePath;
    }
    
    Log::info("URL de imagen convertida", [
        "original" => $imagePath,
        "corregida" => $fullUrl
    ]);
    
    return $fullUrl;
}
    
    /**
     * Asegura que una URL sea absoluta
     * Útil para procesar URLs que ya están almacenadas
     */
    private function asegurarUrlAbsoluta($url)
    {
        if (empty($url)) {
            return null;
        }
        
        // Si ya es absoluta
        if (filter_var($url, FILTER_VALIDATE_URL)) {
            return $url;
        }
        
        // Si es una URL relativa con dominio pero sin protocolo (//example.com/img.jpg)
        if (strpos($url, '//') === 0) {
            return 'http:' . $url;
        }
        
        // Si empieza con / es relativa al dominio
        if (strpos($url, '/') === 0) {
            return config('app.url', 'http://localhost:8000') . $url;
        }
        
        // En cualquier otro caso, añadir dominio completo
        return config('app.url', 'http://localhost:8000') . '/' . $url;
    }
}