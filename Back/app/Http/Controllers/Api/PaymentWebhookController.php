<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Services\Payment\PaymentConfirmationService;
use Illuminate\Http\Request;

class PaymentWebhookController
{
    public function __construct(
        private PaymentConfirmationService $confirmationService,
    ) {}

    /**
     * Verified gateway webhook — marks payment paid only after HMAC signature validation.
     */
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $signature = $request->header('X-Payment-Signature')
            ?? $request->header('X-Webhook-Signature');

        if (!$this->confirmationService->verifyWebhookSignature($payload, $signature)) {
            return response()->json(['error' => 'Invalid webhook signature.'], 401);
        }

        $data = $request->json()->all();
        $transactionId = $data['transaction_id'] ?? null;

        if (!$transactionId) {
            return response()->json(['error' => 'transaction_id is required.'], 422);
        }

        $payment = Payment::where('transaction_id', $transactionId)->firstOrFail();

        if ($payment->status === 'paid') {
            return response()->json([
                'message' => 'Payment already confirmed.',
                'payment' => new PaymentResource($payment->load(['user', 'appointment.services'])),
            ]);
        }

        $confirmed = $this->confirmationService->confirmFromWebhook($payment, $data);

        return response()->json([
            'message' => 'Payment confirmed via gateway.',
            'payment' => new PaymentResource($confirmed),
        ]);
    }
}
