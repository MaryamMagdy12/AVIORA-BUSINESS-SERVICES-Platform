<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class LoginController
{
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            $user = User::where('email', $request->email)->with('role')->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                throw ValidationException::withMessages([
                    'email' => ['The provided Email are incorrect.'],
                    'password' => ['The provided Password are incorrect.'],
                ]);
            }

            if (!$user->email_verified_at) {
                return response()->json([
                    'error' => 'Email not verified. Please verify your email first.',
                    'email' => $user->email,
                    'requires_verification' => true,
                ], 403);
            }

            $abilities = $user->isAdmin() ? ['admin:*'] : ['client:*'];

            $token = $user->createToken(
                'auth_token',
                $abilities,
                now()->addDays(1)
            )->plainTextToken;

            return response()->json([
                'message' => 'Login successful',
                'token' => $token,
                'token_type' => 'Bearer',
                'user' => (new UserResource($user))->resolve(),
            ]);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('LoginController::login - Error', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Login failed',
                'message' => 'An error occurred during login',
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        if (!$request->user()) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function logoutAll(Request $request)
    {
        if (!$request->user()) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Logged out from all devices successfully']);
    }
}
