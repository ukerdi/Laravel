<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Si la tabla no existe, créala
        if (!Schema::hasTable('password_resets')) {
            Schema::create('password_resets', function (Blueprint $table) {
                $table->string('email')->index();
                $table->string('token');
                $table->string('code')->nullable();
                $table->timestamp('created_at')->nullable();
            });
        } 
        // Si la tabla existe pero no tiene la columna 'code', agrégala
        else if (!Schema::hasColumn('password_resets', 'code')) {
            Schema::table('password_resets', function (Blueprint $table) {
                $table->string('code')->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // No elimines la tabla completa, solo la columna que agregaste
        if (Schema::hasTable('password_resets') && Schema::hasColumn('password_resets', 'code')) {
            Schema::table('password_resets', function (Blueprint $table) {
                $table->dropColumn('code');
            });
        }
    }
};