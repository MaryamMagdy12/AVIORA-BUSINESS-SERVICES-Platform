<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class ProfileController
{
    public function index()
    {
        /** @var User|null $profile */
        $profile = Auth::user();

        if (!$profile) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        return new UserResource($profile->load('role'));
    }

    public function update(Request $request)
    {
        /** @var User|null $profile */
        $profile = Auth::user();

        if (!$profile) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'company_name' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|required|string|regex:/^\+?\d+$/|max:255',
        ], [
            'name.required' => 'Name is required and cannot be empty.',
            'company_name.required' => 'Company name is required and cannot be empty.',
            'phone.required' => 'Phone number is required and cannot be empty.',
            'phone.regex' => 'Phone number must contain only numbers and optionally start with +.',
        ]);

        $profile->fill($request->only(['name', 'company_name', 'phone']));
        $profile->save();

        return new UserResource($profile->load('role'));
    }
}
