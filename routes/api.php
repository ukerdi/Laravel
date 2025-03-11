<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\TipoController;
use App\Http\Controllers\Auth\RegisteredClientController;
use App\Models\Product;

// API routes with proper middleware
Route::middleware('api')->group(function () {
    // Product routes
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{id}', [ProductController::class, 'show']);
    Route::post('products', [ProductController::class, 'store']);
    Route::put('products/{id}', [ProductController::class, 'update']);
    Route::delete('products/{id}', [ProductController::class, 'destroy']);

    // Test routes
    Route::get('/test-redirect', function () {
        return response()->json(Product::all(), 200, ['Content-Type' => 'application/json']);
    });

    Route::put('/test-redirect/{id}', function ($id) {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }
        return response()->json($product, 200, ['Content-Type' => 'application/json']);
    });

    // Client routes
    Route::get('clients', [ClientController::class, 'index']);
    Route::get('clients/{id}', [ClientController::class, 'show']);
    Route::post('clients', [ClientController::class, 'store']);
    Route::put('clients/{id}', [ClientController::class, 'update']);
    Route::delete('clients/{id}', [ClientController::class, 'destroy']);

    // Type routes
    Route::get('tipos', [TipoController::class, 'index']);
    
    // Rutas de autenticación
    Route::post('/login', [RegisteredClientController::class, 'login']);
    Route::post('/register', [RegisteredClientController::class, 'register']);
    
    // Rutas de recuperación de contraseña
    Route::post('/password/email', [RegisteredClientController::class, 'sendResetLinkEmail']);
    Route::post('/password/code/verify', [RegisteredClientController::class, 'verifyResetCode']);
    Route::post('/password/reset', [RegisteredClientController::class, 'resetPassword']);
});

// Protected routes
Route::middleware(['api', 'auth:sanctum'])->group(function () {
    Route::post('/logout', [RegisteredClientController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/user/profile', [RegisteredClientController::class, 'getProfile']);
    Route::put('/user/profile', [RegisteredClientController::class, 'updateProfile']);
});