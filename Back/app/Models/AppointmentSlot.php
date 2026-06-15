<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Appointment;

class AppointmentSlot extends Model
{
    use HasFactory;
    
    protected $table = 'appointments_slots'; // Specify table name since model is singular but table is plural
    
    protected $fillable = ['date', 'time', 'status'];

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'slot_id');
    }
}

