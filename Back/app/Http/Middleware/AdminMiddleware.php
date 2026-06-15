<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user instanceof User) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        if (!$user->relationLoaded('role')) {
            $user->load('role');
        }

        if (!$user->isAdmin()) {
            return response()->json(['error' => 'Unauthorized. Admin access required.'], 403);
        }

        return $next($request);
    }
}
