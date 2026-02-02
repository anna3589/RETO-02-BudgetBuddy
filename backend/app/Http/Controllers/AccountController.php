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
        //
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
                    'user_id' => $user_id,
                    'bank_name' => $validated['bank_name'],
                    'current_balance' => $validated['current_balance'],
                    'iban' => $validated['iban'],
                    'color' => $validated['color'],
                    'country_code' => substr($validated['iban'], 0, 2)
                ]);

                return response()->json([
                    'message' => 'Cuenta creada exitosamente', 
                    'account' => $account,
                    'account_id' => $account->id // Додаємо ID для JavaScript
                ], 201);

            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Error al crear la cuenta',
                    'error' => $e->getMessage()
                ], 500);
            }
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
