<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Auth;

class AccountController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Obtenemos las cuentas del usuario actual
        $accounts = auth()->user()->accounts()->orderBy('created_at', 'desc')->get();
        return response()->json($accounts);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
        {
            try {
                // ТИМЧАСОВО: Дозволити без аутентифікації для setup
                // $user_id = Auth::id(); // Закоментуйте це
                $user_id = $request->input('user_id') ?? 2; // ТИМЧАСОВО: використовуємо ID 2 (ваш ID)
                
                // Або отримуємо з сесії, якщо це web запит
                if ($request->hasSession() && $request->user()) {
                    $user_id = $request->user()->id;
                }

                $validated = $request->validate([
                    'bank_name' => 'required|string|max:255',
                    'current_balance' => 'required|numeric',
                    'color' => 'required|string|max:7',
                    'iban' => 'required|string|unique:accounts,iban|max:34'
                ]);

        $account = Account::create([
            'user_id' => Auth::id(),
            'bank_name' => $validated['bank_name'],
            'current_balance' => $validated['current_balance'],
            // Usamos el operador null coalescing (??) por seguridad
            'iban' => $validated['iban'] ?? null,
            'color' => $validated['color'],
            'country_code' => $validated['country_code'] ?? null,
        ]);

        return response()->json([
            'message' => 'Cuenta creada',
            'account' => $account
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(account $account)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(account $account)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, account $account)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(account $account)
    {
        //
    }
}
