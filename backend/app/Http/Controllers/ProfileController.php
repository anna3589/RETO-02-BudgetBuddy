<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Profile;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    // ==========================================
    // 1. MOSTRAR DATOS (GET)
    // ==========================================
    public function show(Request $request)
    {
        $user = $request->user()->load('profile');

        // MODO API/SETUP: Si el JS pide datos, devolvemos JSON limpio
        if ($request->wantsJson()) {
            return $user;
        }

        // MODO WEB: Si entras por el navegador, devolvemos la VISTA
        return view('ajustes', compact('user'));
    }

    // ==========================================
    // 2. GUARDAR DATOS (PUT/POST)
    // ==========================================
    public function update(Request $request)
    {
        $user = $request->user();

        // Validación común para ambos mundos
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255', // En setup es obligatorio
            'phone'      => 'nullable|string|max:20',
        ]);

        // 1. Guardar en tabla USERS (Nombre de pila)
        $user->update([
            'name' => $validated['first_name']
        ]);

        // 2. Guardar en tabla PROFILES (Apellidos y teléfono)
        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'lastname' => $validated['last_name'],
                'phone'    => $validated['phone'],  
            ]
        );

        // --- AQUÍ ESTÁ EL TRUCO ---
        
        // MODO API/SETUP: El JS espera un "OK" para pasar al siguiente paso
        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Perfil guardado correctamente',
                'user' => $user->load('profile')
            ], 200);
        }

        // MODO WEB: La página de ajustes espera una recarga/redirección
        return redirect()->route('profile.view')
            ->with('success', 'Perfil actualizado correctamente.');
    }
}