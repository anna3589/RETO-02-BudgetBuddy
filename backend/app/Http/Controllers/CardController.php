<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Card;
use App\Models\Account;
use Illuminate\Support\Facades\Auth;

class CardController extends Controller
{
    public function store(Request $request)
    {
        try {
            // 1. Валідація
            $validated = $request->validate([
                'account_id' => 'required|exists:accounts,id',
                'alias' => 'required|string|max:50',
                'last_four_digits' => 'required|string|size:4', // ← ЗМІНА: last_four_digits
                'expiration_date' => 'required|date',           // YYYY-MM-DD
                'type' => 'required|in:credit,debit',
            ]);

            // 2. Перевірка власності акаунта
            $account = Account::where('id', $validated['account_id'])
                ->where('user_id', Auth::id())
                ->first();

            if (!$account) {
                return response()->json([
                    'message' => 'La cuenta no existe o no te pertenece'
                ], 403);
            }

            // 3. Створення карти
            $card = Card::create([
                'account_id' => $account->id,
                'alias' => $validated['alias'],
                'last_4_digits' => $validated['last_four_digits'], // ← Перейменування
                'expiration_date' => $validated['expiration_date'],
                'type' => $validated['type']
            ]);

            return response()->json([
                'message' => 'Tarjeta creada con éxito',
                'card' => $card
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al crear la tarjeta',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}