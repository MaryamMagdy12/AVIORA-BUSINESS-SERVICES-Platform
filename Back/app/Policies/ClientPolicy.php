<?php

namespace App\Policies;

use App\Models\User;

class ClientPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, User $client): bool
    {
        return $user->isAdmin() || $user->id === $client->id;
    }

    public function delete(User $user, User $client): bool
    {
        if (!$user->isAdmin()) {
            return false;
        }

        return $client->isClient() && $client->email !== config('admin.super_admin_email');
    }
}
