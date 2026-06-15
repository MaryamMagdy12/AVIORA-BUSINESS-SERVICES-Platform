<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            // Load API routes without /api prefix since Laravel is already in /api folder on server
            Route::middleware('api')
                ->group(base_path('routes/api.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'client' => \App\Http\Middleware\ClientMiddleware::class,
        ]);
        
        // Trust proxies (Sucuri, Cloudflare, etc.) - must be first
        $middleware->priority([
            \App\Http\Middleware\TrustProxies::class,
        ]);
        
        // Add security middleware globally
        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);
        $middleware->append(\App\Http\Middleware\ForceHttps::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Log all exceptions for debugging
        $exceptions->report(function (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Unhandled exception', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
        });
    })->create();
