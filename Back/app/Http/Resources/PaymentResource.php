<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAdmin = $request->user()?->isAdmin() ?? false;

        return [
            'id' => $this->id,
            'transaction_id' => $this->transaction_id,
            'amount' => $this->amount,
            'services' => $this->services,
            'method' => $this->method,
            'status' => $this->status,
            'paid_at' => $this->paid_at,
            'payment_link' => $this->when($isAdmin, $this->payment_link),
            'user' => new UserResource($this->whenLoaded('user')),
            'appointment' => $this->whenLoaded('appointment'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
