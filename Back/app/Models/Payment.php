<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;
use App\Models\Appointment;

class Payment extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id',
        'appointment_id',
        'amount',
        'services',
        'method',
        'payment_link',
        'transaction_id',
        'access_token_hash',
        'status',
        'paid_at',
        'confirmed_by',
        'confirmed_by_user_id',
    ];

    protected $hidden = [
        'access_token_hash',
    ];

    protected $casts = [
        'services' => 'array',
        'paid_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(PaymentAuditLog::class);
    }

    public function confirmedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by_user_id');
    }
}
