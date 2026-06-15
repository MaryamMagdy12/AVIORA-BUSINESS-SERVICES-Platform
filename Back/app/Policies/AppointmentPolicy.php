<?php

namespace App\Policies;

use App\Models\Appointment;
use App\Models\User;

class AppointmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isClient();
    }

    public function view(User $user, Appointment $appointment): bool
    {
        return $user->isAdmin() || $user->id === $appointment->user_id;
    }

    public function create(User $user): bool
    {
        return $user->isClient();
    }

    public function manageAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Appointment $appointment): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Appointment $appointment): bool
    {
        return $user->isAdmin();
    }
}
