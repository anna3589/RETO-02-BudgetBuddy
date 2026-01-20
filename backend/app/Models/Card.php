<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    // fillable es lo que puedes rellenar
    protected $fillable = ['alias', 'last_4_digits', 'expiration_date', 'type'];

    public function cards()
    {
        return $this->hasOne(Account::class, 'account_id');
    }
}
