<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\PublicPaymentResource;
use App\Models\Payment;
use App\Services\Payment\PaymentAuditLogger;
use App\Services\Payment\PaymentTokenService;
use Illuminate\Http\Request;

/**
 * Public payment view — requires signed access token from email link.
 * Client self-confirm removed; payment is marked paid via admin or verified webhook only.
 */
class PaymentConfirmationController
{
    public function __construct(
        private PaymentTokenService $tokenService,
        private PaymentAuditLogger $auditLogger,
    ) {}

    public function show(Request $request, string $transactionId)
    {
        $payment = Payment::where('transaction_id', $transactionId)
            ->with(['appointment.appointmentSlot', 'appointment.services'])
            ->firstOrFail();

        $token = $request->query('token') ?? $request->header('X-Payment-Token');

        if (!$this->tokenService->validate($payment, $token)) {
            return response()->json([
                'error' => 'Invalid or missing payment access token.',
            ], 403);
        }

        $this->auditLogger->log($payment, 'payment_viewed', 'client_link', null, [
            'transaction_id' => $transactionId,
        ]);

        return new PublicPaymentResource($payment);
    }
}
