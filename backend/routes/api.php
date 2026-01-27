<?php

use Illuminate\Http\Request; // <--- ESTA FALTABA (Vital para /user)
use Illuminate\Support\Facades\Route;

// Importaciones de tus controladores
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\EnvelopeController;

// Rutas Públicas
Route::get('/reviews', [ReviewController::class, 'index']);

// Rutas Privadas (Requieren Login)
Route::middleware(['auth:sanctum'])->group(function () {

    // Ruta del usuario (Ahora sí funcionará porque importamos Request arriba)
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Rutas de Cuentas y Tarjetas
    Route::post('/accounts', [AccountController::class, 'store']);
    Route::post('/cards', [CardController::class, 'store']);
    Route::post('/envelopes', [EnvelopeController::class, 'store']);
});