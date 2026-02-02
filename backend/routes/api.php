<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\EnvelopeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TagController;

// Rutas Públicas
Route::get('/reviews', [ReviewController::class, 'index']);

// Rutas de Tags (PUBLICAS - sin autenticación)
Route::get('/tags', [TagController::class, 'index']);
Route::get('/tags/{tag}', [TagController::class, 'show']);
Route::post('/tags', [TagController::class, 'store']);
Route::delete('/tags/{tag}', [TagController::class, 'destroy']);

// ======== РОБІМО ПУБЛІЧНИМИ ДЛЯ SETUP ========
Route::post('/accounts', [AccountController::class, 'store']); // ТИМЧАСОВО БЕЗ АВТЕНТИФІКАЦІЇ
Route::post('/cards', [CardController::class, 'store']); // ТИМЧАСОВО БЕЗ АВТЕНТИФІКАЦІЇ
Route::post('/envelopes', [EnvelopeController::class, 'store']); // ТИМЧАСОВО БЕЗ АВТЕНТИФІКАЦІЇ

// Rutas de Perfil (через web для сесій)
Route::middleware(['web', 'auth'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/logout', [ProfileController::class, 'logout']); 
});

// Rutas Privadas (Requieren Login)
Route::middleware(['auth:sanctum'])->group(function () {
    // Ruta del usuario
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Rutas de Tags (PRIVADAS - solo actualización)
    Route::put('/tags/{tag}', [TagController::class, 'update']);
    
    // КОМЕНТУЄМО на час тесту (вже винесені вище)
    // Route::post('/accounts', [AccountController::class, 'store']);
    // Route::post('/cards', [CardController::class, 'store']);
    // Route::post('/envelopes', [EnvelopeController::class, 'store']);
});