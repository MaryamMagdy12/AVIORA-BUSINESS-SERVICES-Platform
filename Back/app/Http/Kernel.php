<?php
namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    protected $routeMiddleware = [
    // Laravel default middlewares...

    'admin' => \App\Http\Middleware\AdminMiddleware::class,
    'client' => \App\Http\Middleware\ClientMiddleware::class,
];
}