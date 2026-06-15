<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Mail\AppointmentReminderMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SendAppointmentReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'appointments:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send reminder emails to clients for appointments scheduled tomorrow';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Log that the command started
        Log::info('=== Appointment Reminder Command Started ===');
        Log::info('Current time: ' . Carbon::now()->toDateTimeString());
        Log::info('Timezone: ' . config('app.timezone'));
        
        $this->info('Checking for appointments scheduled tomorrow...');

        // Get tomorrow's date and today's date
        $tomorrow = Carbon::tomorrow()->format('Y-m-d');
        $today = Carbon::today();
        
        // Debug: Show what date we're looking for
        $this->info("Looking for appointments on: {$tomorrow}");
        $this->info("Today's date: " . $today->format('Y-m-d'));
        Log::info("Looking for appointments on: {$tomorrow}");
        Log::info("Today's date: " . $today->format('Y-m-d'));

        // Find appointments scheduled for tomorrow with status 'pending' or 'confirmed'
        // Only get appointments where reminder hasn't been sent today
        $appointments = Appointment::whereHas('appointmentSlot', function ($query) use ($tomorrow) {
            $query->where('date', $tomorrow);
        })
        ->whereIn('status', ['pending', 'confirmed'])
        ->where(function ($query) use ($today) {
            // Reminder hasn't been sent, OR it was sent before today
            $query->whereNull('reminder_sent_at')
                  ->orWhereDate('reminder_sent_at', '<', $today);
        })
        ->with(['user', 'appointmentSlot', 'services'])
        ->get();
        
        // Debug: Show all appointments found
        $this->info("Found {$appointments->count()} appointment(s) matching criteria.");
        Log::info("Found {$appointments->count()} appointment(s) matching criteria.");
        
        foreach ($appointments as $apt) {
            $userEmail = $apt->user->email ?? 'N/A';
            $this->info("  - Appointment #{$apt->id}: Date={$apt->appointmentSlot->date}, Status={$apt->status}, User={$userEmail}");
            Log::info("  - Appointment #{$apt->id}: Date={$apt->appointmentSlot->date}, Status={$apt->status}, User={$userEmail}, ReminderSentAt={$apt->reminder_sent_at}");
        }

        if ($appointments->isEmpty()) {
            $this->info('No appointments found for tomorrow.');
            Log::info('No appointments found for tomorrow.');
            
            // Also check if there are any appointments at all for debugging
            $allAppointments = Appointment::with(['appointmentSlot', 'user'])
                ->whereIn('status', ['pending', 'confirmed'])
                ->get();
            Log::info("Total appointments with pending/confirmed status: {$allAppointments->count()}");
            foreach ($allAppointments->take(5) as $apt) {
                $aptDate = $apt->appointmentSlot->date ?? 'N/A';
                Log::info("  Sample: Appointment #{$apt->id}, Date={$aptDate}, Status={$apt->status}");
            }
            
            return 0;
        }

        $this->info("Found {$appointments->count()} appointment(s) for tomorrow.");

        $sentCount = 0;
        $failedCount = 0;

        foreach ($appointments as $appointment) {
            try {
                // Check if user has email
                if (!$appointment->user || !$appointment->user->email) {
                    $this->warn("Skipping appointment #{$appointment->id} - user email not found.");
                    $failedCount++;
                    continue;
                }

                // Send reminder email
                Log::info("Attempting to send reminder email to {$appointment->user->email} for appointment #{$appointment->id}");
                Mail::to($appointment->user->email)->send(new AppointmentReminderMail($appointment));
                
                // Mark reminder as sent
                $appointment->update(['reminder_sent_at' => Carbon::now()]);
                
                $sentCount++;
                $this->info("Reminder sent to {$appointment->user->email} for appointment #{$appointment->id}");
                Log::info("✅ Appointment reminder sent successfully to {$appointment->user->email} for appointment #{$appointment->id}");

            } catch (\Exception $e) {
                $failedCount++;
                $this->error("Failed to send reminder for appointment #{$appointment->id}: " . $e->getMessage());
                Log::error("❌ Failed to send appointment reminder for appointment #{$appointment->id}: " . $e->getMessage());
                Log::error("Error trace: " . $e->getTraceAsString());
            }
        }

        $this->info("Reminder emails sent: {$sentCount} successful, {$failedCount} failed.");
        Log::info("=== Appointment Reminder Command Completed === Sent: {$sentCount}, Failed: {$failedCount}");

        return 0;
    }
}
