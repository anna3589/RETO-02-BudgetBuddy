<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

// 1. Redirigir la raíz al login
Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {

    // 2. LÓGICA DEL CEREBRO (Dashboard vs Setup)
    Route::get('/dashboard', function () {
        $user = Auth::user();
        
        // Si el usuario no tiene cuentas bancarias creadas, al Wizard
        if ($user->accounts()->count() === 0) {
            return redirect()->route('setup.view');
        }
        
        // Si ya tiene cuentas, al Escritorio principal
        return redirect()->route('desktop.index');
    })->name('dashboard');

    // 3. RUTAS DE VISTAS
    Route::get('/setup', function () {
        if (Auth::user()->accounts()->count() > 0) {
            return redirect()->route('dashboard');
        }
        return view('setup'); 
    })->name('setup.view');

    // Esta ruta carga la vista del escritorio (Blade)
    Route::get('/desktop', function () {
        return view('dashboard'); 
    })->name('desktop.index');

    // 4. API INTERNA PARA EL FRONTEND (JS)
    // Definimos esto aquí para aprovechar la sesión de usuario logueado
    
    // Obtener datos del perfil (GET)
    Route::get('/api/profile', [ProfileController::class, 'show']);
    
    // Guardar datos del perfil (PUT)
    Route::put('/api/profile', [ProfileController::class, 'update']);


    // 5. RUTAS DE PERFIL DE BREEZE (Standard)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';