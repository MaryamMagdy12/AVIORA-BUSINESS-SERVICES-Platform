<?php

namespace App\Http\Controllers\Api\Admin;

use App\Models\Appointment;
use App\Models\AppointmentSlot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\MeetingLinkMail;
use Carbon\Carbon;

class AppointmentController
{
    public function index(Request $request)
    {
        Gate::authorize('manageAny', Appointment::class);

        $perPage = min((int) $request->input('per_page', 50), 100);
        $query = AppointmentSlot::with(['appointments.user', 'appointments.services']);

        if ($request->filled('start_date')) {
            $query->where('date', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->where('date', '<=', $request->end_date);
        }

        $slots = $query->orderBy('date')->orderBy('time')->paginate($perPage);

        $formatted = $slots->getCollection()->map(function ($slot) {
            $appointment = $slot->appointments
                ->whereNotIn('status', ['canceled', 'completed'])
                ->first()
                ?? $slot->appointments->first();

            return [
                'id' => $slot->id,
                'date' => $slot->date,
                'time' => $slot->time,
                'status' => $slot->status,
                'appointment' => $appointment ? [
                    'id' => $appointment->id,
                    'status' => $appointment->status,
                    'client' => [
                        'id' => $appointment->user->id,
                        'name' => $appointment->user->name,
                        'email' => $appointment->user->email,
                        'phone' => $appointment->user->phone,
                        'company_name' => $appointment->user->company_name,
                    ],
                    'services' => $appointment->services->map(fn ($service) => [
                        'id' => $service->id,
                        'name' => $service->name,
                        'description' => $service->description,
                    ]),
                ] : null,
            ];
        });

        return response()->json([
            'data' => $formatted,
            'meta' => [
                'current_page' => $slots->currentPage(),
                'last_page' => $slots->lastPage(),
                'per_page' => $slots->perPage(),
                'total' => $slots->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('manageAny', Appointment::class);

        $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required|date_format:H:i',
            'status' => 'sometimes|in:available,reserved,canceled',
        ]);

        $requestedDate = Carbon::parse($request->date);
        if ($requestedDate->lt(Carbon::today())) {
            return response()->json([
                'error' => 'Appointment date cannot be in the past',
                'message' => 'Please select a date that is today or in the future.',
            ], 422);
        }

        try {
            $slot = AppointmentSlot::create([
                'date' => $request->date,
                'time' => $request->time,
                'status' => $request->status ?? 'available',
            ]);
        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json([
                'error' => 'A slot already exists for this date and time.',
            ], 409);
        }

        return response()->json($slot, 201);
    }

    public function show($id)
    {
        $slot = AppointmentSlot::with(['appointments.user', 'appointments.services'])->findOrFail($id);
        Gate::authorize('manageAny', Appointment::class);

        $appointment = $slot->appointments->first();
        $slotData = $slot->toArray();
        $slotData['appointment'] = $appointment ? [
            'id' => $appointment->id,
            'status' => $appointment->status,
            'client' => $appointment->user,
            'services' => $appointment->services,
        ] : null;

        return response()->json($slotData);
    }

    public function update(Request $request, $id)
    {
        Gate::authorize('manageAny', Appointment::class);

        $request->validate([
            'date' => 'sometimes|date',
            'time' => 'sometimes|date_format:H:i',
            'status' => 'sometimes|in:available,reserved,canceled',
        ]);

        $slot = AppointmentSlot::findOrFail($id);

        try {
            $slot->update($request->only(['date', 'time', 'status']));
        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json([
                'error' => 'A slot already exists for this date and time.',
            ], 409);
        }

        return response()->json($slot->load(['appointments.user', 'appointments.services']));
    }

    public function destroy($id)
    {
        Gate::authorize('manageAny', Appointment::class);

        $slot = AppointmentSlot::findOrFail($id);

        if ($slot->appointments()->whereNotIn('status', ['canceled', 'completed'])->exists()) {
            return response()->json([
                'error' => 'Cannot delete slot with existing appointments',
            ], 409);
        }

        $slot->delete();

        return response()->json(null, 204);
    }

    public function sendMeetingLink(Request $request, $slotId)
    {
        Gate::authorize('manageAny', Appointment::class);

        $request->validate([
            'meeting_link' => 'required|url|max:500',
        ]);

        $slot = AppointmentSlot::with(['appointments.user', 'appointments.services'])
            ->findOrFail($slotId);

        $appointment = $slot->appointments
            ->whereNotIn('status', ['canceled', 'completed'])
            ->first();

        if (!$appointment) {
            return response()->json(['error' => 'No appointment found for this slot'], 404);
        }

        if (!$appointment->user?->email) {
            return response()->json(['error' => 'Client email not found'], 404);
        }

        try {
            Mail::to($appointment->user->email)->queue(new MeetingLinkMail($appointment, $request->meeting_link));

            return response()->json([
                'message' => 'Meeting link email will be sent shortly. Please wait 1-2 minutes.',
                'email' => $appointment->user->email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to queue meeting link email', ['error' => $e->getMessage()]);

            return response()->json(['error' => 'Failed to queue meeting link email.'], 500);
        }
    }

    public function cancelAppointment($slotId)
    {
        Gate::authorize('manageAny', Appointment::class);

        $slot = AppointmentSlot::with(['appointments.user', 'appointments.services'])
            ->findOrFail($slotId);

        $appointment = $slot->appointments
            ->whereNotIn('status', ['canceled', 'completed'])
            ->first();

        if (!$appointment) {
            return response()->json(['error' => 'No appointment found for this slot'], 404);
        }

        if ($appointment->status === 'completed') {
            return response()->json(['error' => 'Cannot cancel a completed appointment'], 422);
        }

        $appointment->update(['status' => 'canceled']);
        $slot->update(['status' => 'available']);

        return response()->json([
            'message' => 'Appointment cancelled successfully',
            'appointment' => $appointment->fresh(['user', 'services', 'appointmentSlot']),
        ]);
    }
}
