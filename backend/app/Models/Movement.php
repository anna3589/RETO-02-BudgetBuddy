<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Movement extends Model
{
    use HasFactory;

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

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    public const TYPE_EXPENSE = 'gasto';
    public const TYPE_INCOME = 'ingreso';
    public const TYPE_TRANSFER = 'traspaso';

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function card(): BelongsTo
    {
        return $this->belongsTo(Card::class);
    }

    public function envelope(): BelongsTo
    {
        return $this->belongsTo(Envelope::class);
    }

    public function tag(): BelongsTo
    {
        return $this->belongsTo(Tag::class);
    }

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
}