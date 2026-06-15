<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Resources\PaymentResource;
use App\Models\Appointment;
use App\Models\Payment;
use App\Services\Payment\PaymentAuditLogger;
use App\Services\Payment\PaymentConfirmationService;
use App\Services\Payment\PaymentTokenService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\PaymentLinkMail;

class PaymentController
{
    public function __construct(
        private PaymentTokenService $tokenService,
        private PaymentConfirmationService $confirmationService,
        private PaymentAuditLogger $auditLogger,
    ) {}

    public function index(Request $request)
    {
        Gate::authorize('viewAny', Payment::class);

        $perPage = min((int) $request->input('per_page', 25), 100);
        $query = Payment::with(['user', 'appointment.services']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $payments = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return PaymentResource::collection($payments)->additional([
            'meta' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'per_page' => $payments->perPage(),
                'total' => $payments->total(),
            ],
        ]);
    }

    public function show($id)
    {
        $payment = Payment::with(['user', 'appointment.services'])->findOrFail($id);
        Gate::authorize('view', $payment);

        return new PaymentResource($payment);
    }

    public function getAppointmentServices($appointmentId)
    {
        Gate::authorize('viewAny', Payment::class);

        $appointment = Appointment::with(['user', 'services', 'appointmentSlot'])
            ->findOrFail($appointmentId);

        return response()->json([
            'appointment' => [
                'id' => $appointment->id,
                'status' => $appointment->status,
                'date' => $appointment->appointmentSlot->date,
                'time' => $appointment->appointmentSlot->time,
            ],
            'client' => [
                'id' => $appointment->user->id,
                'name' => $appointment->user->name,
                'email' => $appointment->user->email,
                'phone' => $appointment->user->phone,
                'company_name' => $appointment->user->company_name,
            ],
            'services' => $appointment->services->map(function ($service) {
                return [
                    'id' => $service->id,
                    'name' => $service->name,
                    'description' => $service->description,
                ];
            }),
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create', Payment::class);

        $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
            'amount' => 'required|numeric|min:0',
            'method' => 'nullable|string|max:255',
        ]);

        $appointment = Appointment::with(['user', 'services'])->findOrFail($request->appointment_id);

        $existingPending = Payment::where('appointment_id', $appointment->id)
            ->where('status', 'pending')
            ->exists();

        if ($existingPending) {
            return response()->json([
                'error' => 'A pending payment already exists for this appointment.',
            ], 409);
        }

        $serviceIds = $appointment->services->pluck('id')->toArray();
        $transactionId = $this->confirmationService->generateTransactionId();
        $tokenData = $this->tokenService->generateAccessToken();

        $payment = Payment::create([
            'user_id' => $appointment->user_id,
            'appointment_id' => $appointment->id,
            'amount' => $request->amount,
            'services' => $serviceIds,
            'method' => $request->input('method') ?? 'online',
            'transaction_id' => $transactionId,
            'access_token_hash' => $tokenData['hash'],
            'status' => 'pending',
        ]);

        $paymentLink = $this->tokenService->buildClientUrl($payment, $tokenData['plain']);
        $payment->update(['payment_link' => $paymentLink]);

        $this->auditLogger->log($payment, 'payment_created', 'admin', $request->user()->id);

        try {
            $user = $appointment->user;
            if ($user && $user->email) {
                Mail::to($user->email)->queue(new PaymentLinkMail($payment->fresh()));
            }
        } catch (\Exception $e) {
            Log::error('Failed to queue payment email', ['payment_id' => $payment->id, 'error' => $e->getMessage()]);
        }

        return (new PaymentResource($payment->load(['user', 'appointment.services'])))->response()->setStatusCode(201);
    }

    public function update(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);
        Gate::authorize('update', $payment);

        $request->validate([
            'method' => 'sometimes|string|max:255',
        ]);

        $payment->update($request->only(['method']));

        return new PaymentResource($payment->load(['user', 'appointment.services']));
    }

    /**
     * Admin confirms payment after manual verification (bank transfer, etc.).
     */
    public function confirm(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);
        Gate::authorize('confirm', $payment);

        if ($payment->status === 'paid') {
            return response()->json([
                'message' => 'Payment already confirmed.',
                'payment' => new PaymentResource($payment->load(['user', 'appointment.services'])),
            ]);
        }

        $confirmed = $this->confirmationService->confirmByAdmin($payment, $request->user()->id);

        return response()->json([
            'message' => 'Payment confirmed successfully.',
            'payment' => new PaymentResource($confirmed),
        ]);
    }

    public function destroy($id)
    {
        $payment = Payment::findOrFail($id);
        Gate::authorize('delete', $payment);

        $this->auditLogger->log($payment, 'payment_deleted', 'admin', request()->user()->id);
        $payment->delete();

        return response()->json(null, 204);
    }
}
