<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Compra extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',  // Debe ser nullable en la base de datos
        'productos',
        'total'
    ];

    /**
     * Relación con el cliente (opcional ya que puede ser null)
     */
    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}