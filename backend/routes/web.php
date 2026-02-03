<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

// 1. Redirigir la raíz al login (DESCOMENTADO)
// Esto es vital para que al entrar a localhost no te salga error 404
Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {

    // 2. LÓGICA DEL CEREBRO (Dashboard)
    Route::get('/dashboard', function () {
        $user = Auth::user();
        
        // Si no tiene cuentas -> Al Wizard de configuración
        if ($user->accounts()->count() === 0) {
            return redirect()->route('setup.view');
        }
        
        // Si ya tiene cuentas -> Al Escritorio Principal
        return redirect()->route('desktop.index');
    })->name('dashboard');

    // 3. RUTAS DE VISTAS (Aquí cumplimos con la profesora)

    // Ruta SETUP (Blade)
    Route::get('/setup', function () {
        // Protección: si ya tiene cuentas, no le dejes entrar al setup
        if (Auth::user()->accounts()->count() > 0) {
            return redirect()->route('dashboard');
        }
        // Retorna la vista resources/views/setup.blade.php
        return view('setup'); 
    })->name('setup.view');

    // Ruta DESKTOP (Blade) - DESCOMENTADA Y ARREGLADA
    // Esta es la ruta que te faltaba y por la que fallaba la redirección anterior
    Route::get('/desktop', function () {
        // Retorna la vista resources/views/desktop.blade.php
        return view('desktop'); 
    })->name('desktop.index');


});

// ¡IMPORTANTE! Faltaba el punto y coma aquí al final
require __DIR__ . '/auth.php';