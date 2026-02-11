<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

// 1. Redirecciones públicas
Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/accesibilidad', function () {
    return view('accesibilidad');
})->name('accesibilidad');

Route::get('/get-csrf-token', function() {
    return response()->json(['token' => csrf_token()]);
});

// 2. Rutas Protegidas (Auth)
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard lógico
    Route::get('/dashboard', function () {
        $user = Auth::user();
        if ($user->accounts()->count() === 0) {
            return redirect()->route('setup.view');
        }
        return redirect()->route('desktop.index');
    })->name('dashboard');

    // Vistas Setup y Desktop
    Route::get('/setup', function () {
        if (Auth::user()->accounts()->count() > 0) {
            return redirect()->route('dashboard');
        }
        return view('setup');
    })->name('setup.view');

    Route::get('/desktop', function () {
        return view('desktop');
    })->name('desktop.index');


    // --- AQUÍ ESTÁ EL CAMBIO DE LA OPCIÓN A ---
    // Usamos '/profile' para todo. 
    // Si entras por navegador -> Verás la vista de ajustes.
    // Si entra el JS -> Recibirá JSON.
    Route::get('/ajustes', [ProfileController::class, 'show'])->name('profile.view');
    Route::put('/ajustes', [ProfileController::class, 'update'])->name('profile.update');
});

require __DIR__ . '/auth.php';