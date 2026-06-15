<?php

namespace App\Providers;

use App\Models\Appointment;
use App\Models\ContactMessage;
use App\Models\Payment;
use App\Models\Service;
use App\Models\User;
use App\Policies\AdminPolicy;
use App\Policies\AppointmentPolicy;
use App\Policies\ClientPolicy;
use App\Policies\ContactMessagePolicy;
use App\Policies\PaymentPolicy;
use App\Policies\ServicePolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    protected $policies = [
        User::class => ClientPolicy::class,
        Service::class => ServicePolicy::class,
        Payment::class => PaymentPolicy::class,
        Appointment::class => AppointmentPolicy::class,
        ContactMessage::class => ContactMessagePolicy::class,
    ];

    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }

        foreach ($this->policies as $model => $policy) {
            Gate::policy($model, $policy);
        }

        Gate::define('access-admin', [AdminPolicy::class, 'accessAdmin']);
        Gate::define('manage-admins', [AdminPolicy::class, 'manageAdmins']);

        $this->configureRateLimiting();
    }

    protected function configureRateLimiting(): void
    {
        RateLimiter::for('auth-login', function (Request $request) {
            $email = (string) $request->input('email');

            return [
                Limit::perMinute(10)->by($request->ip()),
                Limit::perMinute(5)->by('login:' . strtolower($email)),
            ];
        });

        RateLimiter::for('auth-register', function (Request $request) {
            return [
                Limit::perMinute(5)->by($request->ip()),
                Limit::perHour(10)->by('register:' . strtolower((string) $request->input('email'))),
            ];
        });

        RateLimiter::for('otp-verify', function (Request $request) {
            $email = strtolower((string) $request->input('email'));

            return [
                Limit::perMinute(15)->by($request->ip()),
                Limit::perMinute(10)->by('otp-verify:' . $email),
            ];
        });

        RateLimiter::for('otp-resend', function (Request $request) {
            $email = strtolower((string) $request->input('email'));

            return [
                Limit::perMinute(3)->by($request->ip()),
                Limit::perHour(5)->by('otp-resend:' . $email),
            ];
        });

        RateLimiter::for('password-reset', function (Request $request) {
            $email = strtolower((string) $request->input('email'));

            return [
                Limit::perMinute(5)->by($request->ip()),
                Limit::perHour(5)->by('password-reset:' . $email),
            ];
        });

        RateLimiter::for('contact', function (Request $request) {
            return [
                Limit::perMinute(5)->by($request->ip()),
                Limit::perHour(20)->by('contact:' . strtolower((string) $request->input('email'))),
            ];
        });

        RateLimiter::for('payment-view', function (Request $request) {
            return Limit::perMinute(30)->by($request->ip());
        });
    }
}
