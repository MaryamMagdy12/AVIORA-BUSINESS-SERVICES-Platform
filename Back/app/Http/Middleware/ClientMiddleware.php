<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ClientMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user instanceof User) {
            return response()->json([
                'error' => 'Unauthenticated',
                'message' => 'Please log in to access this resource',
            ], 401);
        }

        if (!$user->relationLoaded('role')) {
            $user->load('role');
        }

        if (!$user->role_id || !$user->role) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Your account does not have a valid role. Please contact support.',
            ], 403);
        }

        if (!$user->isClient()) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Client access required. You do not have permission to access this resource.',
            ], 403);
        }

        return $next($request);
    }
}
