<?php

namespace App\Http\Controllers;

use App\Models\account;
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
        $validated = $request->validate([
            'bank_name' => 'required|string|max:50',
            'current_balance' => 'required|numeric|min:0',
            'iban' => 'nullable|string|max:34', // Validamos IBAN
            'color' => 'required|string|max:7', // Validamos Color Hex
        ]);

        $account = Account::create([
            'user_id' => Auth::id(),
            'bank_name' => $validated['bank_name'],
            'current_balance' => $validated['current_balance'],
            // Usamos el operador null coalescing (??) por seguridad
            'iban' => $validated['iban'] ?? null, 
            'color' => $validated['color'],
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
