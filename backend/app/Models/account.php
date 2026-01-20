<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class account extends Model
{
    //u
    use HasFactory;

    // datos que pueden ser rellenados por el usuario
    protected $fillable = ['bank_name', 'iban', 'current_balance', 'color'];

    public function accounts()
    {
        return $this->BelongsTo(User::class, 'user_id');
    }

}

