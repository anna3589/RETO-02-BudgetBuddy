<?php

namespace App\Http\Controllers;

use App\Models\Envelope;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnvelopeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // 1. Obtenemos los IDs de las cuentas del usuario
        $accountIds = Auth::user()->accounts->pluck('id');

        // 2. Buscamos los sobres asociados a esas cuentas
        $envelopes = Envelope::whereIn('account_id', $accountIds)->get();

        return response()->json($envelopes);
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
            'account_id' => 'required|exists:accounts,id',
            'name' => 'required|string|max:50',
            'allocated_amount' => 'required|numeric|min:0',
            'target_amount' => 'required|numeric|min:0',
            'icon' => 'required|string'
        ]);

        // Verificar propiedad
        $account = Account::where('id', $validated['account_id'])
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $envelope = Envelope::create($validated);

        return response()->json(['message' => 'Sobre creado', 'envelope' => $envelope], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Envelope $envelope)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Envelope $envelope)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Envelope $envelope)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Envelope $envelope)
    {
        //
    }
}
