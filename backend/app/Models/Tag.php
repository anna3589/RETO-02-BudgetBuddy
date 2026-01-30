<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',     // #Viaje, #Urgente (según tu diagrama)
        'color',    // Color de la etiqueta
    ];

    /**
     * Relación con los movimientos
     * Una etiqueta puede estar en muchos movimientos
     */
    public function movements(): HasMany
    {
        return $this->hasMany(Movement::class);
    }
}