<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Movement extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id',
        'card_id',
        'envelope_id',
        // 'tag_id', // ← YA NO EXISTE, se maneja con N:M
        'amount',
        'description',
        'date',
        'type'
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    public const TYPE_EXPENSE = 'gasto';
    public const TYPE_INCOME = 'ingreso';
    public const TYPE_TRANSFER = 'traspaso';

    /**
     * Relación con la cuenta (1:N)
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Relación con la tarjeta (1:N opcional)
     */
    public function card(): BelongsTo
    {
        return $this->belongsTo(Card::class);
    }

    /**
     * Relación con el sobre (1:N opcional)
     */
    public function envelope(): BelongsTo
    {
        return $this->belongsTo(Envelope::class);
    }

    /**
     * RELACIÓN N:M CON TAGS
     * Un movimiento puede tener muchas etiquetas
     * Una etiqueta puede estar en muchos movimientos
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'movement_tag')
                    ->withTimestamps();
    }

    /**
     * Scopes para filtrado
     */
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

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Método para sincronizar tags fácilmente
     */
    public function syncTags(array $tagIds): void
    {
        $this->tags()->sync($tagIds);
    }

    /**
     * Verificar si tiene una etiqueta específica
     */
    public function hasTag($tagId): bool
    {
        return $this->tags()->where('tag_id', $tagId)->exists();
    }
}