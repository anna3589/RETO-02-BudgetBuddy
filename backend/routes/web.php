<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', action: function () {
    return view('welcome');
});

// --- ESTA ES LA CLAVE ---
// Si Laravel intenta ir a /dashboard, lo forzamos a ir a /desktop
Route::get('/dashboard', function () {
    return redirect('/desktop');
})->middleware(['auth', 'verified'])->name('dashboard');
// ------------------------

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';