<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only add security headers in production
        if (app()->environment('production')) {
            // Prevent clickjacking
            $response->headers->set('X-Frame-Options', 'DENY', false);
            
            // Prevent MIME type sniffing
            $response->headers->set('X-Content-Type-Options', 'nosniff', false);
            
            // Enable XSS protection
            $response->headers->set('X-XSS-Protection', '1; mode=block', false);
            
            // Referrer policy
            $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin', false);
            
            // Content Security Policy (basic)
            $csp = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' " . config('app.url');
            $response->headers->set('Content-Security-Policy', $csp, false);
            
            // Permissions Policy
            $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()', false);
        }

        return $response;
    }
}

