<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceHttps
{
    public function handle(Request $request, Closure $next): Response
    {
        if (app()->environment('production') && !$request->secure()) {
            $host = $request->getHost();

            // Never force HTTPS for local development hosts
            if (in_array($host, ['localhost', '127.0.0.1', '::1'], true)) {
                return $next($request);
            }

            return redirect()->secure($request->getRequestUri(), 301);
        }

        return $next($request);
    }
}
