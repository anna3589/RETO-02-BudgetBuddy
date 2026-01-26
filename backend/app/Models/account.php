<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class Account extends Model
{
    use HasFactory;

    // Datos que permitimos guardar masivamente
    protected $fillable = [
        'user_id',          // <--- Esto arregla el error SQL
        'bank_name',
        'current_balance',
        'iban',
        'color',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}