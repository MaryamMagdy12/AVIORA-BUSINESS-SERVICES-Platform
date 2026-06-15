<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class ClientController
{
    public function index(Request $request)
    {
        Gate::authorize('viewAny', User::class);

        $clientRole = Role::where('name', 'client')->first();

        if (!$clientRole) {
            return response()->json(['error' => 'Client role not found'], 404);
        }

        $perPage = min((int) $request->input('per_page', 25), 100);

        $clients = User::where('role_id', $clientRole->id)
            ->withCount(['appointments', 'payments'])
            ->with(['role'])
            ->withSum(['payments as total_spent' => fn ($q) => $q->where('status', 'paid')], 'amount')
            ->orderBy('name')
            ->paginate($perPage);

        $data = $clients->getCollection()->map(function ($client) {
            return [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
                'phone' => $client->phone,
                'company_name' => $client->company_name,
                'address' => $client->address,
                'created_at' => $client->created_at,
                'appointments_count' => $client->appointments_count,
                'payments_count' => $client->payments_count,
                'total_spent' => (float) ($client->total_spent ?? 0),
            ];
        });

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $clients->currentPage(),
                'last_page' => $clients->lastPage(),
                'per_page' => $clients->perPage(),
                'total' => $clients->total(),
            ],
        ]);
    }

    public function show($id)
    {
        $clientRole = Role::where('name', 'client')->firstOrFail();

        $client = User::where('role_id', $clientRole->id)
            ->with([
                'appointments.appointmentSlot',
                'appointments.services',
                'payments',
            ])
            ->findOrFail($id);

        Gate::authorize('view', $client);

        $totalSpent = $client->payments()->where('status', 'paid')->sum('amount');
        $servicesCount = DB::table('appointment_services')
            ->join('appointments', 'appointment_services.appointment_id', '=', 'appointments.id')
            ->where('appointments.user_id', $client->id)
            ->count();

        $clientData = (new UserResource($client))->resolve();
        $clientData['appointments'] = $client->appointments;
        $clientData['payments'] = $client->payments;
        $clientData['statistics'] = [
            'total_appointments' => $client->appointments->count(),
            'total_payments' => $client->payments->count(),
            'total_spent' => $totalSpent,
            'services_used_count' => $servicesCount,
        ];

        return response()->json($clientData);
    }

    public function getAppointments($id)
    {
        $clientRole = Role::where('name', 'client')->firstOrFail();
        $client = User::where('role_id', $clientRole->id)->findOrFail($id);

        Gate::authorize('view', $client);

        $appointments = $client->appointments()
            ->with(['appointmentSlot', 'services'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($appointments);
    }

    public function destroy($id)
    {
        $clientRole = Role::where('name', 'client')->firstOrFail();
        $client = User::where('role_id', $clientRole->id)->findOrFail($id);

        Gate::authorize('delete', $client);

        $client->delete();

        return response()->json(null, 204);
    }
}
