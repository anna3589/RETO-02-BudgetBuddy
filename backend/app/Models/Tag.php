<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',     // #Viaje, #Urgente
        'color',    // Color de la etiqueta
        'icon'
    ];

    /**
     * RELACIÓN N:M CON MOVEMENTS
     * Una etiqueta puede estar en muchos movimientos
     * Un movimiento puede tener muchas etiquetas
     */
    public function movements(): BelongsToMany
    {
        return $this->belongsToMany(Movement::class, 'movement_tag')
                    ->withTimestamps();
    }

    /**
     * Accesor para el nombre con hashtag
     */
    public function getNameWithHashAttribute(): string
    {
        return str_starts_with($this->name, '#') 
            ? $this->name 
            : '#' . $this->name;
    }

    /**
     * Scope para buscar por nombre
     */
    public function scopeByName($query, $name)
    {
        return $query->where('name', 'like', "%{$name}%");
    }
}