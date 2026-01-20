<?php

use App\Http\Controllers\ReviewController;
use Illuminate\Support\Facades\Route;

Route::get('/reviews', [ReviewController::class, 'index']);

# En el caso de la landing page pública, no es necesario autenticación  
# ->middleware('auth:sanctum');
