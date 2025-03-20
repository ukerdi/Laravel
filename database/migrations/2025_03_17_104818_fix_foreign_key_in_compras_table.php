<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Crear una tabla temporal con la estructura correcta
        Schema::create('compras_temp', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('client_id')->nullable();
            $table->text('productos');
            $table->decimal('total', 10, 2);
            $table->timestamps();
            
            // Definir correctamente la clave foránea
            $table->foreign('client_id')
                  ->references('id')
                  ->on('clients')  // Asegúrate de que esta tabla existe
                  ->onDelete('set null');
        });
        
        // Copiar los datos existentes
        if (Schema::hasTable('compras')) {
            // Intenta copiar los datos existentes sin el client_id
            DB::statement('INSERT INTO compras_temp (id, productos, total, created_at, updated_at) 
                           SELECT id, productos, total, created_at, updated_at 
                           FROM compras');
        }
        
        // Eliminar la tabla original
        Schema::dropIfExists('compras');
        
        // Renombrar la tabla temporal
        Schema::rename('compras_temp', 'compras');
    }

    public function down(): void
    {
        // No es necesario implementar el down ya que estamos arreglando la estructura
    }
};