<?php

namespace App\Services\Payment;

use App\Models\Payment;
use App\Models\PaymentAuditLog;
use Illuminate\Support\Facades\Request;

class PaymentAuditLogger
{
    public function log(Payment $payment, string $action, string $source, ?int $actorId = null, array $metadata = []): void
    {
        PaymentAuditLog::create([
            'payment_id' => $payment->id,
            'action' => $action,
            'source' => $source,
            'actor_user_id' => $actorId,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'metadata' => $metadata ?: null,
        ]);
    }
}
