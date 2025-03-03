<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->string('tipo')->nullable(); // Agregar tipo, puede ser 'móvil', 'accesorio', etc.
        });
    }

    public function down()
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->dropColumn('tipo'); // Eliminar el campo tipo si se revierte la migración
        });
    }
};
