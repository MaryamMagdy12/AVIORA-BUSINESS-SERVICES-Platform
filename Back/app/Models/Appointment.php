<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;
use App\Models\AppointmentSlot;
use App\Models\Service;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Appointment extends Model
{
    use HasFactory;
    
    protected $fillable = ['user_id', 'slot_id', 'status', 'reminder_sent_at'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    
    public function appointmentSlot(): BelongsTo
    {
        return $this->belongsTo(AppointmentSlot::class, 'slot_id');
    }
    public function services(): BelongsToMany
{
    return $this->belongsToMany(Service::class, 'appointment_services', 'appointment_id', 'service_id');
}
}
