<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule appointment reminder emails to be sent every hour
Schedule::command('appointments:send-reminders')
    ->hourly() // Runs every hour (checks for appointments scheduled for tomorrow)
    ->timezone('Africa/Cairo') // Egypt timezone
    ->description('Send reminder emails to clients for appointments scheduled tomorrow');

// Schedule auto-complete appointments to run every hour
Schedule::command('appointments:auto-complete')
    ->hourly() // Runs every hour (checks for appointments that have passed)
    ->timezone('Africa/Cairo') // Egypt timezone
    ->description('Automatically mark appointments as completed when their date/time has passed');

// Process queued jobs (emails, etc.) every minute
// Process one job at a time with longer timeout to handle slow SMTP connections
Schedule::command('queue:work --stop-when-empty --max-jobs=1 --max-time=90 --timeout=120 --tries=3')
    ->everyMinute() // Runs every minute to process queued emails
    ->timezone('Africa/Cairo') // Egypt timezone
    ->withoutOverlapping(3) // Prevent multiple instances, timeout after 3 minutes
    ->runInBackground() // Run in background to avoid blocking
    ->description('Process queued jobs (emails, notifications, etc.)');
