<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AdminController
{
    public function index(Request $request)
    {
        Gate::authorize('manage-admins');

        $adminRole = Role::where('name', 'admin')->firstOrFail();
        $perPage = min((int) $request->input('per_page', 25), 100);

        $admins = User::where('role_id', $adminRole->id)
            ->with('role')
            ->orderBy('name')
            ->paginate($perPage);

        return UserResource::collection($admins)->additional([
            'meta' => [
                'current_page' => $admins->currentPage(),
                'last_page' => $admins->lastPage(),
                'per_page' => $admins->perPage(),
                'total' => $admins->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('manage-admins');

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'required|string|regex:/^\+?\d+$/|max:255',
            'address' => 'nullable|string|max:255',
        ]);

        $adminRole = Role::where('name', 'admin')->first();

        if (!$adminRole) {
            return response()->json(['error' => 'Admin role not found'], 404);
        }

        $admin = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'address' => $request->address,
            'role_id' => $adminRole->id,
            'email_verified_at' => now(),
        ]);

        return (new UserResource($admin->load('role')))->response()->setStatusCode(201);
    }

    public function show($id)
    {
        Gate::authorize('manage-admins');

        $adminRole = Role::where('name', 'admin')->firstOrFail();
        $admin = User::where('role_id', $adminRole->id)->with('role')->findOrFail($id);

        return new UserResource($admin);
    }

    public function update(Request $request, $id)
    {
        Gate::authorize('manage-admins');

        $adminRole = Role::where('name', 'admin')->firstOrFail();
        $admin = User::where('role_id', $adminRole->id)->findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:8|confirmed',
            'phone' => 'required|string|regex:/^\+?\d+$/|max:255',
            'address' => 'nullable|string|max:255',
        ]);

        $updateData = $request->only(['name', 'email', 'phone', 'address']);

        if ($request->has('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $admin->update($updateData);

        return new UserResource($admin->load('role'));
    }

    public function destroy($id)
    {
        Gate::authorize('manage-admins');

        $adminRole = Role::where('name', 'admin')->firstOrFail();
        $admin = User::where('role_id', $adminRole->id)->findOrFail($id);

        if ($admin->email === config('admin.super_admin_email')) {
            return response()->json(['error' => 'Cannot delete the super admin account.'], 403);
        }

        $admin->delete();

        return response()->json(null, 204);
    }
}
