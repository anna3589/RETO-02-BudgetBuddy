<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

Route::get('/', action: function () {
    return view('welcome');
});

Route::get('/edit', function () {
    return view('profile.edit', ['user' => Auth::user()]);
})->middleware(['auth', 'verified'])->name('edit');
// ------------------------

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';

// --- ESTA ES LA CLAVE ---
// Si Laravel intenta ir a /dashboard, lo forzamos a ir a /desktop
Route::get('/dashboard', function () {
    $user = Auth::user();

//    dd("He entrado. Número de cuentas: " . $user->accounts()->count());
    // -----------------------

    // 1. Verificamos si el usuario tiene cuentas creadas
    // (Asumiendo que definiste la relación hasMany en el modelo User)
    if ($user->accounts()->count() === 0) {
        // Si es virgen (no tiene datos), lo mandamos al Wizard
        return redirect('/setup');
    }
 
    // 2. Si ya tiene datos, lo mandamos al Dashboard normal
    return redirect('/desktop');

})->middleware(['auth', 'verified'])->name('dashboard');