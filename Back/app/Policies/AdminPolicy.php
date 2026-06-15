<?php

namespace App\Policies;

use App\Models\User;

class AdminPolicy
{
    public function accessAdmin(User $user): bool
    {
        return $user->isAdmin();
    }

    public function manageAdmins(User $user): bool
    {
        return $user->isAdmin();
    }
}
