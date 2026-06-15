<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Appointment;
use App\Models\Service;

class AppointmentService extends Model
{
    use HasFactory;
    
    protected $fillable = ['appointment_id', 'service_id'];

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }
    
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
