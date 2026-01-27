<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use App\Models\Profile; // Importante

class ProfileController extends Controller
{
    // 1. OBTENER DATOS (GET)
    public function show(Request $request)
    {
        // Cargamos el usuario Y su perfil asociado
        $user = $request->user()->load('profile');
        return response()->json($user);
    }

    // 2. ACTUALIZAR DATOS (PUT)
    public function update(Request $request)
    {
        $user = $request->user();

        // Validamos todo junto
        $validated = $request->validate([
            'first_name' => 'required|string|max:255', // Enviaremos 'first_name' desde JS
            'last_name'  => 'nullable|string|max:255', // Enviaremos 'last_name' desde JS
            'email'      => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'phone'      => 'nullable|string|max:20',
        ]);

        // A. Actualizar Tabla USERS (Nombre y Email)
        $user->update([
            'name'  => $validated['first_name'], // En users.name guardamos el nombre de pila
            'email' => $validated['email'],
        ]);

        // B. Actualizar Tabla PROFILES (Apellido y Teléfono)
        // updateOrCreate busca el perfil por user_id, si no existe lo crea, si existe lo actualiza
        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'lastname' => $validated['last_name'],
                'phone'    => $validated['phone'],
            ]
        );

        // Devolvemos el usuario recargado con los cambios
        return response()->json([
            'message' => 'Perfil actualizado', 
            'user' => $user->load('profile')
        ]);
    }

    // 3. LOGOUT (Sin cambios, el tuyo estaba bien, pero asegúrate de los imports)
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->json(['message' => 'Sesión cerrada']);
    }
}