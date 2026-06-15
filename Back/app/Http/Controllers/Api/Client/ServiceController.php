<?php

namespace App\Http\Controllers\Api\Client;

use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ServiceController
{
    public function index(): JsonResponse
    {
        try {
            $services = Cache::remember('services.public.v2', now()->addMinutes(5), function () {
                return Service::with('subcategories')->orderBy('name')->get();
            });

            return response()->json([
                'success' => true,
                'data' => $services,
            ]);
        } catch (\Exception $e) {
            Log::error('ServiceController::index failed', ['message' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Unable to load services. Please try again later.',
            ], 500);
        }
    }
}
