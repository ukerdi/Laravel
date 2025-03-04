<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $table = 'productos'; // Especificar la tabla 'productos'

    protected $fillable = [
        'name',
        'description',
        'price',
        'stock',
        'tipo_id',
        'images', // Cambiar 'image' a 'images'
    ];

    public function tipo()
    {
        return $this->belongsTo(Tipo::class);
    }
}