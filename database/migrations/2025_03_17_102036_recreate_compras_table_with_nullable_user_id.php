<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Crear una tabla temporal con la nueva estructura
        Schema::create('compras_new', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable(); // Ahora es nullable
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->text('productos');
            $table->decimal('total', 10, 2);
            $table->timestamps();
        });
        
        // Copiar datos existentes (si hay alguno)
        DB::statement('INSERT INTO compras_new (id, user_id, productos, total, created_at, updated_at) 
                       SELECT id, user_id, productos, total, created_at, updated_at FROM compras');
        
        // Eliminar la tabla antigua
        Schema::dropIfExists('compras');
        
        // Renombrar la nueva tabla
        Schema::rename('compras_new', 'compras');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Para revertir, recreamos la tabla con user_id NOT NULL
        Schema::create('compras_old', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->text('productos');
            $table->decimal('total', 10, 2);
            $table->timestamps();
        });
        
        // Copiar datos existentes (excepto los que tienen user_id NULL)
        DB::statement('INSERT INTO compras_old (id, user_id, productos, total, created_at, updated_at) 
                       SELECT id, user_id, productos, total, created_at, updated_at FROM compras 
                       WHERE user_id IS NOT NULL');
        
        // Eliminar la tabla modificada
        Schema::dropIfExists('compras');
        
        // Renombrar la tabla original
        Schema::rename('compras_old', 'compras');
    }
};