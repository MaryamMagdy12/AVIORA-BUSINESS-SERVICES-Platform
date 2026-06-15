<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Services\OtpService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'client']);
        Role::create(['name' => 'admin']);
    }

    public function test_registration_stores_hashed_otp_not_plaintext_in_cache(): void
    {
        $response = $this->postJson('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '+1234567890',
            'company_name' => 'Test Co',
        ]);

        $response->assertOk();

        $cached = Cache::get('registration:test@example.com');

        if (!is_array($cached)) {
            throw new \AssertionError('Registration cache entry was not stored.');
        }
        if (!array_key_exists('otp_hash', $cached)) {
            throw new \AssertionError('Registration cache must store otp_hash.');
        }
        if (array_key_exists('otp', $cached)) {
            throw new \AssertionError('Registration cache must not store plain otp.');
        }
    }

    public function test_otp_brute_force_locks_after_max_attempts(): void
    {
        $otpService = app(OtpService::class);
        $otpService->store('registration', 'brute@example.com', [
            'name' => 'Brute',
            'email' => 'brute@example.com',
            'password' => Hash::make('password123'),
            'phone' => '+1',
            'company_name' => 'Co',
        ]);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/verify-email', [
                'email' => 'brute@example.com',
                'otp' => '000000',
            ]);
        }

        $response = $this->postJson('/verify-email', [
            'email' => 'brute@example.com',
            'otp' => '000000',
        ]);

        $response->assertStatus(429);
    }
}
