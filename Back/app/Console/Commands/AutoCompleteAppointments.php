<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class AutoCompleteAppointments extends Command
{
    protected $signature = 'appointments:auto-complete';

    protected $description = 'Automatically mark appointments as completed when their date and time have passed';

    public function handle()
    {
        $now = Carbon::now();
        $completedCount = 0;
        $errorCount = 0;

        Appointment::whereIn('status', ['pending', 'confirmed'])
            ->whereHas('appointmentSlot', function ($query) use ($now) {
                $query->where('date', '<', $now->toDateString())
                    ->orWhere(function ($q) use ($now) {
                        $q->where('date', $now->toDateString())
                          ->where('time', '<=', $now->format('H:i:s'));
                    });
            })
            ->with('appointmentSlot')
            ->chunkById(100, function ($appointments) use (&$completedCount, &$errorCount) {
                foreach ($appointments as $appointment) {
                    try {
                        $slot = $appointment->appointmentSlot;
                        if (!$slot) {
                            continue;
                        }

                        $appointmentDateTime = Carbon::parse($slot->date . ' ' . $slot->time);
                        if ($appointmentDateTime->isPast()) {
                            $appointment->update(['status' => 'completed']);
                            $completedCount++;
                        }
                    } catch (\Exception $e) {
                        $errorCount++;
                        Log::error('AutoCompleteAppointments error', [
                            'appointment_id' => $appointment->id,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
            });

        $this->info("Auto-complete: {$completedCount} completed, {$errorCount} errors.");

        return Command::SUCCESS;
    }
}
