<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller {
    
    public function index(Request $request) {
        if ($request->header('X-Inertia')) {
            return Inertia::render('Dashboard', [
                'productos' => Product::with('tipo')->get(),
            ]);
        }

        return response()->json(Product::with('tipo')->get(), 200, ['Content-Type' => 'application/json']);
    }

    // Obtener un solo producto
    public function show($id) {
        $product = Product::with('tipo')->find($id);
        if (!$product) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }
        return response()->json($product, 200, ['Content-Type' => 'application/json']);
    }

    // Crear un producto con imagen
    public function store(Request $request) {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'tipo_id' => 'nullable|exists:tipos,id',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048'
        ]);

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        } else {
            $imagePath = null;
        }

        $product = Product::create([
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'stock' => $request->stock,
            'tipo_id' => $request->tipo_id,
            'image' => $imagePath
        ]);

        if ($request->header('X-Inertia')) {
            return redirect()->route('dashboard')->with('success', 'Producto creado correctamente');
        }

        return response()->json($product, 201);
    }

    // Actualizar un producto
    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('error', 'Producto no encontrado');
            }
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'price' => 'numeric|min:0',
            'stock' => 'integer|min:0',
            'tipo_id' => 'nullable|exists:tipos,id',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048'
        ]);

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $product->image = $request->file('image')->store('products', 'public');
        } else if ($request->input('remove_image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $product->image = null;
        }

        $product->update($request->except('image', 'remove_image'));

        // Si es una solicitud de Inertia, redireccionar a Dashboard
        if ($request->header('X-Inertia')) {
            return redirect()->route('dashboard')->with('success', 'Producto actualizado correctamente');
        }

        // Para solicitudes API normales, devolver JSON
        return response()->json($product, 200, ['Content-Type' => 'application/json']);
    }

    // Eliminar un producto
    public function destroy($id) {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();
        return response()->json(['message' => 'Producto eliminado correctamente'], 200);
    }
}