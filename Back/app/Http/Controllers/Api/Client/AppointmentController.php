<?php

namespace App\Http\Controllers\Api\Client;

use App\Models\Appointment;
use App\Models\AppointmentSlot;
use App\Mail\AppointmentConfirmationMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AppointmentController
{
    public function index()
    {
        $now = Carbon::now();
        $currentDate = $now->format('Y-m-d');
        $currentTime = $now->format('H:i:s');

        $slots = AppointmentSlot::where('status', 'available')
            ->where(function ($query) use ($currentDate, $currentTime) {
                $query->where('date', '>', $currentDate)
                    ->orWhere(function ($q) use ($currentDate, $currentTime) {
                        $q->where('date', '=', $currentDate)
                          ->where('time', '>', $currentTime);
                    });
            })
            ->whereDoesntHave('appointments', function ($query) {
                $query->whereNotIn('status', ['canceled', 'completed']);
            })
            ->orderBy('date', 'asc')
            ->orderBy('time', 'asc')
            ->get();

        return response()->json($slots);
    }

    public function store(Request $request)
    {
        $request->validate([
            'slot_id' => 'required|exists:appointments_slots,id',
            'services' => 'required|array|min:1',
            'services.*' => 'exists:services,id',
        ]);

        try {
            $appointment = DB::transaction(function () use ($request) {
                $slot = AppointmentSlot::whereKey($request->slot_id)->lockForUpdate()->firstOrFail();

                if ($slot->status !== 'available') {
                    abort(409, 'Appointment is not Available');
                }

                $slotDateTime = Carbon::parse($slot->date . ' ' . $slot->time);
                if ($slotDateTime->isPast()) {
                    $slot->update(['status' => 'canceled']);
                    abort(409, 'This appointment slot has already passed and is no longer available');
                }

                $activeAppointment = Appointment::where('slot_id', $slot->id)
                    ->whereNotIn('status', ['canceled', 'completed'])
                    ->lockForUpdate()
                    ->exists();

                if ($activeAppointment) {
                    abort(409, 'This appointment slot has already been booked');
                }

                $appointment = Appointment::create([
                    'user_id' => Auth::id(),
                    'slot_id' => $slot->id,
                    'status' => 'pending',
                ]);

                $appointment->services()->sync($request->services);
                $slot->update(['status' => 'reserved']);

                return $appointment->load('services', 'appointmentSlot', 'user');
            });
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
            return response()->json(['error' => $e->getMessage()], $e->getStatusCode());
        }

        try {
            Mail::to($appointment->user->email)->queue(new AppointmentConfirmationMail($appointment));
        } catch (\Exception $e) {
            Log::error('Failed to queue appointment confirmation email', [
                'appointment_id' => $appointment->id,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json([
            'message' => 'Appointment booked successfully. Confirmation email will be sent shortly.',
            'appointment' => $appointment,
            'note' => 'Please wait 1-2 minutes for the confirmation email to arrive.',
        ], 201);
    }

    public function list(Request $request)
    {
        $perPage = min((int) $request->input('per_page', 25), 100);

        $appointments = Appointment::where('user_id', Auth::id())
            ->with(['appointmentSlot', 'services'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'data' => $appointments->items(),
            'meta' => [
                'current_page' => $appointments->currentPage(),
                'last_page' => $appointments->lastPage(),
                'per_page' => $appointments->perPage(),
                'total' => $appointments->total(),
            ],
        ]);
    }

    public function show($id)
    {
        $appointment = Appointment::where('user_id', Auth::id())
            ->with(['appointmentSlot', 'services'])
            ->findOrFail($id);

        return response()->json($appointment);
    }
}
