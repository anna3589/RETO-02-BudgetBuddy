<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Movement extends Model
{
    use HasFactory;

    // Campos que se pueden asignar en masa (mass assignable)
    protected $fillable = [
        'account_id',
        'card_id',
        'envelope_id',
        'tag_id',
        'amount',
        'description',
        'date',
        'type'
    ];

    // Conversiones de tipos
    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    // Constantes para tipos de movimientos
    public const TYPE_EXPENSE = 'gasto';
    public const TYPE_INCOME = 'ingreso';
    public const TYPE_TRANSFER = 'traspaso';

    /**
     * Relación con Account
     * Cada movimiento pertenece a una cuenta
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Relación con Card (opcional)
     * Movimiento puede tener o no una tarjeta asociada
     */
    public function card(): BelongsTo
    {
        return $this->belongsTo(Card::class);
    }

    /**
     * Relación con Envelope (opcional)
     * Movimiento puede pertenecer o no a un sobre
     */
    public function envelope(): BelongsTo
    {
        return $this->belongsTo(Envelope::class);
    }

    /**
     * Relación con Tag (opcional)
     * Según tu migración original, movimiento puede tener una etiqueta
     */
    public function tag(): BelongsTo
    {
        return $this->belongsTo(Tag::class);
    }

    // Scopes básicos para filtrar por tipo de movimiento
    public function scopeExpenses($query)
    {
        return $query->where('type', self::TYPE_EXPENSE);
    }

    public function scopeIncomes($query)
    {
        return $query->where('type', self::TYPE_INCOME);
    }

    public function scopeTransfers($query)
    {
        return $query->where('type', self::TYPE_TRANSFER);
    }

    // Scope para filtrar por rango de fechas
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }
}