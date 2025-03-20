<?php

namespace App\Http\Controllers;

use App\Models\Compra;
use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class VentasController extends Controller
{
    /**
     * Mostrar listado de ventas con filtros opcionales
     */
    public function index(Request $request)
    {
        $query = Compra::query()
            ->select('compras.*', 'clients.name as cliente_nombre', 'clients.email as cliente_email')
            ->leftJoin('clients', 'compras.client_id', '=', 'clients.id')
            ->orderBy('compras.created_at', 'desc');

        // Aplicar filtro por nombre si existe
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('clients.name', 'like', "%{$search}%")
                  ->orWhere('clients.email', 'like', "%{$search}%");
            });
        }

        $ventas = $query->paginate(10)->withQueryString();

        // Procesar los datos para convertir el campo JSON de productos
        foreach ($ventas as $venta) {
            $venta->productos_array = json_decode($venta->productos, true);
            
            // Calcular totales por venta
            $venta->cantidad_productos = count($venta->productos_array);
            $venta->cliente_nombre = $venta->cliente_nombre ?? 'Compra anónima';
            $venta->cliente_email = $venta->cliente_email ?? 'No disponible';
        }

        return Inertia::render('Ventas/Index', [
            'ventas' => $ventas,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Ver detalles de una venta específica
     */
    public function show($id)
    {
        $venta = Compra::select('compras.*', 'clients.name as cliente_nombre', 'clients.email as cliente_email')
            ->leftJoin('clients', 'compras.client_id', '=', 'clients.id')
            ->findOrFail($id);
        
        // Convertir el campo JSON de productos
        $venta->productos_array = json_decode($venta->productos, true);
        $venta->cliente_nombre = $venta->cliente_nombre ?? 'Compra anónima';
        $venta->cliente_email = $venta->cliente_email ?? 'No disponible';
        
        return Inertia::render('Ventas/Show', [
            'venta' => $venta
        ]);
    }

    /**
     * Generar reportes de ventas
     */
    public function reportes(Request $request)
    {
        // Ventas por día (últimos 30 días)
        $ventasPorDia = DB::table('compras')
            ->select(DB::raw('DATE(created_at) as fecha'), DB::raw('COUNT(*) as total_ventas'), DB::raw('SUM(total) as total_ingresos'))
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('fecha')
            ->orderBy('fecha')
            ->get();
        
        // Top clientes con más compras
        $topClientes = DB::table('compras')
            ->select('clients.name', 'clients.email', DB::raw('COUNT(*) as total_compras'), DB::raw('SUM(compras.total) as total_gastado'))
            ->leftJoin('clients', 'compras.client_id', '=', 'clients.id')
            ->whereNotNull('client_id')
            ->groupBy('clients.name', 'clients.email')
            ->orderByDesc('total_compras')
            ->limit(5)
            ->get();
        
        // Resumen general
        $resumen = [
            'total_ventas' => Compra::count(),
            'total_ingresos' => Compra::sum('total'),
            'promedio_venta' => Compra::avg('total'),
            'venta_mayor' => Compra::max('total'),
            'ventas_hoy' => Compra::whereDate('created_at', today())->count(),
            'ingresos_hoy' => Compra::whereDate('created_at', today())->sum('total'),
        ];

        return Inertia::render('Ventas/Reportes', [
            'ventasPorDia' => $ventasPorDia,
            'topClientes' => $topClientes,
            'resumen' => $resumen
        ]);
    }
}