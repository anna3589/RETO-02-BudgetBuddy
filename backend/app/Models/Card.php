<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Card extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id',
        'alias',
        'last_4_digits',
        'expiration_date', 
        'type'
    ];

    // Relación con la cuenta
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Relación con los movimientos
     * Una tarjeta puede tener muchos movimientos
     * Movimientos realizados con esta tarjeta
     */
    public function movements(): HasMany
    {
        return $this->hasMany(Movement::class);
    }
}