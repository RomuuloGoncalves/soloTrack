<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->prependToGroup('api', \Illuminate\Http\Middleware\HandleCors::class);

        // Habilitar a autenticação de SPA (baseada em sessão)
        $middleware->appendToGroup('api', [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        // Sem proteção csrf
        $middleware->validateCsrfTokens(
            except: ['/api/*']
        );
    })
    ->withExceptions(function (Exceptions $exceptions): void {

        //422 - Validação
        $exceptions->render(function (ValidationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erro de validação',
                    'errors'  => $e->errors(),
                ], 422);
            }
        });

        //401 - Não autenticado
        $exceptions->render(function (AuthenticationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Não autenticado'
                ], 401);
            }
        });

        //404 - Não encontrado
        $exceptions->render(function (NotFoundHttpException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Recurso não encontrado'
                ], 404);
            }
        });

        //Outros erros HTTP (403, 405, etc)
        $exceptions->render(function (HttpException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage() ?: 'Erro HTTP'
                ], $e->getStatusCode());
            }
        });

        //ERRO GERAL (500)
        $exceptions->render(function (Throwable $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erro interno do servidor',
                    'debug'   => config('app.debug') ? $e->getMessage() : null
                ], 500);
            }
        });
    })->create();
