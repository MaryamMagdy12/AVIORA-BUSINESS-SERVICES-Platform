<?php

namespace App\Services\Payment;

use App\Models\Payment;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PaymentTokenService
{
    public function generateAccessToken(): array
    {
        $plainToken = Str::random(64);

        return [
            'plain' => $plainToken,
            'hash' => Hash::make($plainToken),
        ];
    }

    public function validate(Payment $payment, ?string $plainToken): bool
    {
        if (!$plainToken || !$payment->access_token_hash) {
            return false;
        }

        return Hash::check($plainToken, $payment->access_token_hash);
    }

    public function buildClientUrl(Payment $payment, string $plainToken): string
    {
        $frontendUrl = rtrim(config('app.frontend_url', config('app.url')), '/');

        return $frontendUrl . '/payment/' . urlencode($payment->transaction_id)
            . '?token=' . urlencode($plainToken);
    }
}
