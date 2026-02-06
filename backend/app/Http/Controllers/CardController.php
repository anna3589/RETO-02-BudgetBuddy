<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Card;
use App\Models\Account;
use Illuminate\Support\Facades\Auth;

class CardController extends Controller{

        public function index()
        {
            // Отримати всі картки користувача через його рахунки
            $user = Auth::user();
            $cards = Card::whereHas('account', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })->with('account')->get();
            
            return response()->json($cards);
        }

        public function destroy(Card $card)
        {
            // Перевірити, чи картка належить користувачеві
            if ($card->account->user_id !== Auth::id()) {
                return response()->json(['message' => 'No autorizado'], 403);
            }
            
            $card->delete();
            
            return response()->json([
                'message' => 'Tarjeta eliminada correctamente',
                'success' => true
            ], 200);
        }
    public function store(Request $request)
    {
        // 1. Validar los datos que vienen del formulario (setup.js)
        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'alias' => 'required|string|max:50',
            'last_4_digits' => 'required|string|size:4',
            'expiration_date' => 'required|date',      // Espera YYYY-MM-DD
            'type' => 'required|in:credit,debit',      // Solo permite 'credit' o 'debit'
        ]);

        // 2. Seguridad extra: Verificar que la cuenta pertenece al usuario logueado
        // (Para evitar que alguien vincule una tarjeta a la cuenta de otro)
        $account = Account::where('id', $validated['account_id'])
            ->where('user_id', Auth::id())
            ->firstOrFail();

        // 3. Crear la tarjeta
        $card = Card::create([
            'account_id' => $account->id,
            'alias' => $validated['alias'],
            'last_4_digits' => $validated['last_4_digits'],
            'expiration_date' => $validated['expiration_date'],
            'type' => $validated['type']
        ]);

        return response()->json([
            'message' => 'Tarjeta creada con éxito',
            'card' => $card
        ], 201);
    }
}