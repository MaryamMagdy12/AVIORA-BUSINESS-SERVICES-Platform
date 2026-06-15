<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'company_name' => $this->company_name,
            'address' => $this->address,
            'role' => $this->whenLoaded('role', fn () => [
                'id' => $this->role->id,
                'name' => $this->role->name,
            ]),
            'is_admin' => $this->when($this->relationLoaded('role'), fn () => $this->isAdmin()),
            'is_client' => $this->when($this->relationLoaded('role'), fn () => $this->isClient()),
            'created_at' => $this->created_at,
        ];
    }
}
