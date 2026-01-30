<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Envelope extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id',
        'name',
        'allocated_amount',
        'target_amount',
        'icon'
    ];

    // Relación con la cuenta
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Relación con los movimientos
     * Un sobre puede contener muchos movimientos
     * Movimientos asignados a este sobre
     */
    public function movements(): HasMany
    {
        return $this->hasMany(Movement::class);
    }
}