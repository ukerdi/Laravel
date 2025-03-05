<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller {
    // Fetch all products
    public function index(Request $request) {
        $products = Product::with('tipo')->get();
        
        if ($request->header('X-Inertia')) {
            return Inertia::render('Dashboard', ['productos' => $products]);
        }

        return response()->json($products, 200);
    }

    // Show a single product
    public function show($id) {
        $product = Product::with('tipo')->find($id);
        if (!$product) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }
        return response()->json($product, 200);
    }

    // Create a product with images
    public function store(Request $request) {
        $request->validate([
            'name' => 'required|string|max:255|unique:productos,name',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'tipo_id' => 'nullable|exists:tipos,id',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpg,jpeg,png,gif|max:2048',
        ]);

        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $imagePaths[] = $image->store('productos', 'public');
            }
        }

        $product = Product::create([
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'stock' => $request->stock,
            'tipo_id' => $request->tipo_id,
            'images' => json_encode($imagePaths),
        ]);

        if ($request->header('X-Inertia')) {
            return redirect()->route('dashboard')->with('success', 'Producto creado correctamente');
        }

        return response()->json($product, 201);
    }

    // Update a product with new images
    public function update(Request $request, $id)
{
    $product = Product::findOrFail($id);
    
    // Actualizar campos básicos
    $product->name = $request->name;
    $product->description = $request->description;
    $product->price = $request->price;
    $product->stock = $request->stock;
    $product->tipo_id = $request->tipo_id;
    
    // Obtener imágenes actuales
    $currentImages = json_decode($product->images) ?? [];
    
    // Eliminar imágenes si es necesario
    if ($request->has('images_to_remove')) {
        $imagesToRemove = json_decode($request->images_to_remove);
        
        // Filtrar las imágenes actuales para eliminar las que están en la lista
        $currentImages = array_filter($currentImages, function($image) use ($imagesToRemove) {
            $filename = basename($image);
            return !in_array($filename, $imagesToRemove);
        });
        
        // Eliminar archivos físicos
        foreach ($imagesToRemove as $imageToRemove) {
            Storage::delete('public/productos/' . $imageToRemove);
        }
    }
    
    // Procesar nuevas imágenes
    if ($request->hasFile('images')) {
        $newImages = [];
        foreach ($request->file('images') as $image) {
            $path = $image->store('productos', 'public');
            $relativePath = str_replace('public/', '', $path);
            $newImages[] = $relativePath;
        }
        
        // Combinar imágenes existentes con nuevas
        $currentImages = array_merge($currentImages, $newImages);
    }
    
    // Procesar el orden de las imágenes si se ha enviado
    if ($request->has('images_order')) {
        $orderedImages = json_decode($request->input('images_order'));
        if (is_array($orderedImages) && count($orderedImages) > 0) {
            // Usar directamente el array ordenado de imágenes
            $currentImages = $orderedImages;
            
            // Establecer la primera imagen como imagen principal
            if (!empty($orderedImages)) {
                $product->image = $orderedImages[0];
            }
        }
    }
    
    // Guardar array de imágenes actualizado
    $product->images = json_encode(array_values($currentImages));
    $product->save();
    
    return response()->json($product);
}

    // Delete a product
    public function destroy($id) {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        if ($product->images) {
            $imagePaths = json_decode($product->images, true);
            foreach ($imagePaths as $imagePath) {
                if (Storage::disk('public')->exists($imagePath)) {
                    Storage::disk('public')->delete($imagePath);
                }
            }
        }

        $product->delete();
        return response()->noContent();
    }
}