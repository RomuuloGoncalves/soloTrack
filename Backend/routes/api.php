<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\AuthController;

// Auth
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::apiResource('usuarios', UsuarioController::class);
Route::apiResource('culturas', UsuarioController::class);
Route::apiResource('propriedades', UsuarioController::class);

Route::post('/mcp/chat', [ChatController::class, 'chat']);

Route::get('/hello', function () {
    return response()->json(['message' => 'Hello World! A API esta no ar.'], 200);
});


// rodar as migrations em prod
Route::get('/internal/run-migrations-once', function () {
    try {
        Artisan::call('migrate', ['--force' => true]);
        $output_migrate = Artisan::output();

        Artisan::call('migrate:refresh', [
            '--seed' => true,
            '--force' => true
        ]);
        $output_refresh_seed = Artisan::output();

        return response()->json([
            'status' => 'success',
            'message' => 'Comandos migrate e migrate:refresh --seed executados.',
            'output_migrate' => $output_migrate,
            'output_refresh_seed' => $output_refresh_seed
        ], 200);

    } catch (\Throwable $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Ocorreu um erro ao executar as migrações.',
            'error_message' => $e->getMessage()
        ], 500);
    }
});
