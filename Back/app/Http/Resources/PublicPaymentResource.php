<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicPaymentResource extends JsonResource
{
    /** Minimal payment view for token-authenticated client links (no full PII). */
    public function toArray(Request $request): array
    {
        return [
            'transaction_id' => $this->transaction_id,
            'amount' => $this->amount,
            'status' => $this->status,
            'method' => $this->method,
            'services' => $this->services,
            'appointment' => $this->whenLoaded('appointment', function () {
                return [
                    'id' => $this->appointment->id,
                    'status' => $this->appointment->status,
                    'date' => $this->appointment->appointmentSlot?->date,
                    'time' => $this->appointment->appointmentSlot?->time,
                    'services' => $this->appointment->services?->map(fn ($s) => [
                        'id' => $s->id,
                        'name' => $s->name,
                    ]),
                ];
            }),
        ];
    }
}
