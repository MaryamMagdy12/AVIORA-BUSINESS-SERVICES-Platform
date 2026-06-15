<?php

namespace App\Services\Payment;

use App\Models\Appointment;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentConfirmationService
{
    public function __construct(
        private PaymentAuditLogger $auditLogger,
        private PaymentTokenService $tokenService,
    ) {}

    /**
     * Mark payment paid after verified gateway webhook (HMAC validated at controller).
     */
    public function confirmFromWebhook(Payment $payment, array $gatewayPayload = []): Payment
    {
        return $this->markPaid($payment, 'webhook', null, $gatewayPayload);
    }

    /**
     * Admin-authenticated confirmation after manual verification.
     */
    public function confirmByAdmin(Payment $payment, int $adminUserId): Payment
    {
        return $this->markPaid($payment, 'admin', $adminUserId);
    }

    private function markPaid(Payment $payment, string $source, ?int $actorId = null, array $metadata = []): Payment
    {
        return DB::transaction(function () use ($payment, $source, $actorId, $metadata) {
            $locked = Payment::whereKey($payment->id)->lockForUpdate()->firstOrFail();

            if ($locked->status === 'paid') {
                return $locked->load(['user', 'appointment.services']);
            }

            $locked->update([
                'status' => 'paid',
                'paid_at' => now(),
                'confirmed_by' => $source,
                'confirmed_by_user_id' => $actorId,
            ]);

            if ($locked->appointment) {
                Appointment::whereKey($locked->appointment_id)->update(['status' => 'confirmed']);
            }

            $this->auditLogger->log($locked, 'payment_confirmed', $source, $actorId, $metadata);

            return $locked->fresh(['user', 'appointment.services']);
        });
    }

    /**
     * Verify webhook signature from payment gateway.
     */
    public function verifyWebhookSignature(string $payload, ?string $signature): bool
    {
        $secret = config('services.payment.webhook_secret');

        if (!$secret || !$signature) {
            return false;
        }

        $expected = hash_hmac('sha256', $payload, $secret);

        return hash_equals($expected, $signature);
    }

    public function generateTransactionId(): string
    {
        return 'TXN-' . strtoupper(Str::random(32));
    }
}
