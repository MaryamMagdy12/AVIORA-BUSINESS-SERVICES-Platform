<?php

namespace App\Http\Controllers\Api\Admin;

use App\Models\Service;
use App\Models\Subcategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Cache;

class ServiceController
{
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Service::class);

        $perPage = min((int) $request->input('per_page', 50), 100);
        $services = Service::with('subcategories')->orderBy('name')->paginate($perPage);

        return response()->json([
            'data' => $services->items(),
            'meta' => [
                'current_page' => $services->currentPage(),
                'last_page' => $services->lastPage(),
                'per_page' => $services->perPage(),
                'total' => $services->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create', Service::class);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'subcategories' => 'nullable|array',
            'subcategories.*.name' => 'required|string|max:255',
        ]);

        $service = Service::create($request->only(['name', 'description']));
        Cache::forget('services.public');
        Cache::forget('services.public.v2');

        if ($request->has('subcategories')) {
            foreach ($request->subcategories as $sub) {
                $service->subcategories()->create(['name' => $sub['name']]);
            }
        }

        return response()->json($service->load('subcategories'), 201);
    }

    public function update(Request $request, $id)
    {
        $service = Service::with('subcategories')->findOrFail($id);
        Gate::authorize('update', $service);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'subcategories' => 'nullable|array',
            'subcategories.*.id' => 'sometimes|exists:subcategories,id',
            'subcategories.*.name' => 'required|string|max:255',
        ]);

        $service->update($request->only(['name', 'description']));
        Cache::forget('services.public');
        Cache::forget('services.public.v2');

        if ($request->has('subcategories')) {
            $existingIds = $service->subcategories->pluck('id')->toArray();
            $submittedIds = [];

            foreach ($request->subcategories as $sub) {
                if (isset($sub['id'])) {
                    $subcategory = Subcategory::where('id', $sub['id'])
                        ->where('service_id', $service->id)
                        ->firstOrFail();
                    $subcategory->update(['name' => $sub['name']]);
                    $submittedIds[] = $sub['id'];
                } else {
                    $newSub = $service->subcategories()->create(['name' => $sub['name']]);
                    $submittedIds[] = $newSub->id;
                }
            }

            $toDelete = array_diff($existingIds, $submittedIds);
            if (!empty($toDelete)) {
                Subcategory::where('service_id', $service->id)->whereIn('id', $toDelete)->delete();
            }
        }

        return response()->json($service->load('subcategories'));
    }

    public function show($id)
    {
        $service = Service::with('subcategories')->findOrFail($id);
        Gate::authorize('view', $service);

        return response()->json($service);
    }

    public function destroy($id)
    {
        $service = Service::findOrFail($id);
        Gate::authorize('delete', $service);

        $service->delete();
        Cache::forget('services.public');
        Cache::forget('services.public.v2');

        return response()->json(null, 204);
    }
}
