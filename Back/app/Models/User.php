<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Appointment;
use App\Models\Role;
use App\Models\Payment;
use App\Models\ContactMessage;
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'company_name',
        'phone',
        'address',
        'role_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }
    public function appointments(): HasMany
{
    return $this->hasMany(Appointment::class);
}
public function payments(): HasMany
{
    return $this->hasMany(Payment::class);
}

public function contactMessages(): HasMany
{
    return $this->hasMany(ContactMessage::class);
}

public function isAdmin(): bool
{
    return $this->role && strtolower($this->role->name) === 'admin';
}

public function isClient(): bool
{
    return $this->role && strtolower($this->role->name) === 'client';
}

}
