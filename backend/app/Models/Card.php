<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Card extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id',
        'alias',
        'last_4_digits',
        // ¡AÑADE ESTOS DOS O FALLARÁ LA BASE DE DATOS!
        'expiration_date', 
        'type'
    ];

    public function account()
    {
        return $this->belongsTo(Account::class);
    }
}