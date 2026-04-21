<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\PropriedadeController;
use App\Http\Controllers\AreaPlantioController;
use App\Http\Controllers\CulturaController;
use App\Http\Controllers\InsumoController;
use App\Http\Controllers\EquipamentoController;
use App\Http\Controllers\TipoSensorController;
use App\Http\Controllers\LeituraController;
use App\Http\Controllers\ChatController;


Route::get('/hello', function () {
    return response()->json(['message' => 'Hello World! A API esta no ar.'], 200);
});


// --- Autenticação ---
Route::post('/login', [AuthController::class, 'login']);

// --- Cadastro público ---
Route::post('/usuarios', [UsuarioController::class, 'store']);


// --- Rotas protegidas ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // --- Gestão de Usuários ---
    Route::apiResource('usuarios', UsuarioController::class)->except(['store']);

    // --- Gestão Agrícola (Propriedades, Áreas e Culturas) ---
    Route::apiResource('propriedades', PropriedadeController::class);
    Route::apiResource('areas-plantio', AreaPlantioController::class);
    Route::apiResource('culturas', CulturaController::class);
    Route::apiResource('insumos', InsumoController::class);

    // --- Monitoramento e Sensores ---
    Route::apiResource('equipamentos', EquipamentoController::class);
    Route::apiResource('tipos-sensores', TipoSensorController::class);
    Route::apiResource('leituras', LeituraController::class);

    // --- Inteligência Artificial ---
    Route::post('/mcp/chat', [ChatController::class, 'chat']);
});


// --- Utilitários de Sistema (Uso Interno) ---
Route::prefix('internal')->group(function () {
    Route::get('/run-migrations-once', function () {
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
});
