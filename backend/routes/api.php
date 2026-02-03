<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\EnvelopeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TagController;

/*
|--------------------------------------------------------------------------
| RUTAS PÚBLICAS (No necesitan login)
|--------------------------------------------------------------------------
*/
// Ejemplo: Reviews para la landing page
Route::get('/reviews', [ReviewController::class, 'index']);

// ¡OJO! Quitamos los Tags de aquí si son personales. 
// Si son tags globales del sistema (ej: "Comida", "Ocio"), déjalos aquí.
// Pero si cada usuario crea los suyos, MUÉVELOS ABAJO.

/*
|--------------------------------------------------------------------------
| RUTAS PRIVADAS (Requieren Login - Sanctum)
|--------------------------------------------------------------------------
| Todas estas rutas llevan el prefijo /api automáticamente
*/
Route::middleware(['web', 'auth'])->group(function () {

    // 1. Usuario y Perfil
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/logout', [ProfileController::class, 'logout']); 

    // 2. TAGS (MOVIDO AQUÍ PARA QUE FUNCIONE)
    // Al estar aquí, Auth::user() ya no será null en el controlador
    Route::get('/tags', [TagController::class, 'index']); 
    Route::post('/tags', [TagController::class, 'store']);
    Route::get('/tags/{tag}', [TagController::class, 'show']);
    Route::put('/tags/{tag}', [TagController::class, 'update']);
    Route::delete('/tags/{tag}', [TagController::class, 'destroy']);

    // 3. Cuentas, Tarjetas y Sobres
    Route::get('/accounts', [AccountController::class, 'index']);
    Route::post('/accounts', [AccountController::class, 'store']);

    Route::post('/cards', [CardController::class, 'store']);
    
    Route::post('/envelopes', [EnvelopeController::class, 'store']);
});