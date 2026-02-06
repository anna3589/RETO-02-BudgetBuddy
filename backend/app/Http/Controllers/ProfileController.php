<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    // 1. VER (GET)
    public function show(Request $request)
    {
        // Cargamos usuario y perfil para pasarlo a la vista
        $user = $request->user()->load('profile');
        return view('ajustes', compact('user'));
    }

    // 2. ACTUALIZAR (PUT)
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name'  => 'nullable|string|max:255',
            'email'      => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'phone'      => 'nullable|string|max:20',
        ]);

        // Actualizar Tabla Users
        $user->update([
            'name'  => $validated['first_name'],
            'email' => $validated['email'],
        ]);

        // Actualizar Tabla Profiles
        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'lastname' => $validated['last_name'],
                'phone'    => $validated['phone'],
            ]
        );

        // REDIRECCIÓN con mensaje de éxito (Flash Message)
        return redirect()->route('profile.view')->with('success', 'Perfil actualizado correctamente.');
    }

    // 3. LOGOUT (POST)
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/login');
    }
}