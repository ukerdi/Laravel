<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Product;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::get('create', function () {
    return Inertia::render('create');
})->name('create');

Route::get('clientes', function () {
    return Inertia::render('clientes');
})->name('clientes');

Route::get('edit/{productId}', function ($productId) {
    return Inertia::render('edit', ['productId' => $productId]);
})->name('edit');

Route::get('/clientes/{id}/edit', function ($id) {
    return Inertia::render('editarCliente', ['id' => $id]);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';