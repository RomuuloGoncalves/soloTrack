<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UsuarioController;

Route::apiResource('usuarios', UsuarioController::class);
Route::apiResource('culturas', UsuarioController::class);
Route::apiResource('propriedades', UsuarioController::class);
