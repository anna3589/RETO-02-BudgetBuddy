<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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

    public function account()
    {
        return $this->belongsTo(Account::class);
    }
}