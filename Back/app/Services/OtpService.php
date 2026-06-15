<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class OtpService
{
    private const OTP_LENGTH = 6;
    private const TTL_MINUTES = 10;
    private const MAX_ATTEMPTS = 5;
    private const RESEND_COOLDOWN_SECONDS = 60;

    public function generate(): string
    {
        return str_pad((string) random_int(0, 999999), self::OTP_LENGTH, '0', STR_PAD_LEFT);
    }

    public function store(string $prefix, string $email, array $payload): string
    {
        $otp = $this->generate();
        $payload['otp_hash'] = Hash::make($otp);
        $payload['attempts'] = 0;
        $payload['expires_at'] = now()->addMinutes(self::TTL_MINUTES)->toIso8601String();

        Cache::put($this->cacheKey($prefix, $email), $payload, now()->addMinutes(self::TTL_MINUTES));

        return $otp;
    }

    public function get(string $prefix, string $email): ?array
    {
        return Cache::get($this->cacheKey($prefix, $email));
    }

    public function verify(string $prefix, string $email, string $otp): array
    {
        $data = $this->get($prefix, $email);

        if (!$data) {
            return ['success' => false, 'error' => 'OTP not found or expired. Please request a new code.', 'status' => 404];
        }

        if (($data['attempts'] ?? 0) >= self::MAX_ATTEMPTS) {
            Cache::forget($this->cacheKey($prefix, $email));

            return ['success' => false, 'error' => 'Too many failed attempts. Please request a new OTP.', 'status' => 429];
        }

        if (!Hash::check($otp, $data['otp_hash'])) {
            $data['attempts'] = ($data['attempts'] ?? 0) + 1;
            Cache::put($this->cacheKey($prefix, $email), $data, now()->addMinutes(self::TTL_MINUTES));

            return ['success' => false, 'error' => 'Invalid OTP code.', 'status' => 422];
        }

        return ['success' => true, 'data' => $data];
    }

    public function markVerified(string $prefix, string $email): void
    {
        $data = $this->get($prefix, $email);

        if (!$data) {
            return;
        }

        $data['verified'] = true;
        Cache::put($this->cacheKey($prefix, $email), $data, now()->addMinutes(self::TTL_MINUTES));
    }

    public function isVerified(string $prefix, string $email): bool
    {
        $data = $this->get($prefix, $email);

        return (bool) ($data['verified'] ?? false);
    }

    public function forget(string $prefix, string $email): void
    {
        Cache::forget($this->cacheKey($prefix, $email));
    }

    public function canResend(string $prefix, string $email): bool
    {
        $cooldownKey = $this->cooldownKey($prefix, $email);

        return !Cache::has($cooldownKey);
    }

    public function markResent(string $prefix, string $email): void
    {
        Cache::put($this->cooldownKey($prefix, $email), true, now()->addSeconds(self::RESEND_COOLDOWN_SECONDS));
    }

    public function resendCooldownSeconds(): int
    {
        return self::RESEND_COOLDOWN_SECONDS;
    }

    public function updatePayload(string $prefix, string $email, array $payload): string
    {
        $otp = $this->generate();
        $payload['otp_hash'] = Hash::make($otp);
        $payload['attempts'] = 0;
        $payload['verified'] = false;
        $payload['expires_at'] = now()->addMinutes(self::TTL_MINUTES)->toIso8601String();

        Cache::put($this->cacheKey($prefix, $email), $payload, now()->addMinutes(self::TTL_MINUTES));
        $this->markResent($prefix, $email);

        return $otp;
    }

    private function cacheKey(string $prefix, string $email): string
    {
        return $prefix . ':' . Str::lower(trim($email));
    }

    private function cooldownKey(string $prefix, string $email): string
    {
        return $prefix . ':cooldown:' . Str::lower(trim($email));
    }
}
