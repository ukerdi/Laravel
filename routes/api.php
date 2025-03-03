<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\TipoController; // Importar el controlador de tipos
use App\Models\Product;

// Grupo de rutas API
Route::middleware('api')->group(function () {
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{id}', [ProductController::class, 'show']);
    Route::post('products', [ProductController::class, 'store']);
    Route::put('products/{id}', [ProductController::class, 'update']);
    Route::delete('products/{id}', [ProductController::class, 'destroy']);

    // ✅ Ruta API para obtener productos sin interferencias de Inertia
    Route::get('/test-redirect', function () {
        return response()->json(Product::all(), 200, ['Content-Type' => 'application/json']);
    });

    // ✅ Ruta API para obtener un producto por ID sin interferencias de Inertia
    Route::put('/test-redirect/{id}', function ($id) {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }
        return response()->json($product, 200, ['Content-Type' => 'application/json']);
    });

    // Rutas para los clientes
    Route::get('clients', [ClientController::class, 'index']);
    Route::get('clients/{id}', [ClientController::class, 'show']);
    Route::post('clients', [ClientController::class, 'store']);
    Route::put('clients/{id}', [ClientController::class, 'update']);
    Route::delete('clients/{id}', [ClientController::class, 'destroy']);

    // Ruta para obtener los tipos
    Route::get('tipos', [TipoController::class, 'index']);
});