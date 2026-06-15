<?php

namespace App\Http\Controllers\Api\Auth;

use App\Models\User;
use App\Models\Role;
use App\Mail\EmailVerificationMail;
use App\Services\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class RegisterController
{
    private const OTP_PREFIX = 'registration';

    public function __construct(private OtpService $otpService) {}

    public function register(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
                'phone' => 'required|string|regex:/^\+?\d+$/|max:255',
                'address' => 'nullable|string|max:255',
                'company_name' => 'required|string|max:255',
            ], [
                'phone.required' => 'Phone number is required.',
                'phone.regex' => 'Phone number must contain only numbers and optionally start with +.',
                'company_name.required' => 'Company name is required.',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'message' => $e->getMessage(),
                'errors' => $e->errors(),
            ], 422);
        }

        if (User::where('email', $request->email)->exists()) {
            return response()->json([
                'error' => 'This email is already registered.',
                'errors' => ['email' => ['The email has already been taken.']],
            ], 422);
        }

        $payload = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'address' => $request->address,
            'company_name' => $request->company_name,
        ];

        $otp = $this->otpService->store(self::OTP_PREFIX, $request->email, $payload);

        try {
            Mail::to($request->email)->queue(new EmailVerificationMail($otp, $request->name));
            Log::info('OTP email queued for registration', ['email' => $request->email]);
        } catch (\Exception $e) {
            Log::error('Failed to queue OTP email', ['email' => $request->email, 'error' => $e->getMessage()]);
            $this->otpService->forget(self::OTP_PREFIX, $request->email);

            return response()->json([
                'error' => 'Failed to send verification email. Please try again later.',
            ], 500);
        }

        return response()->json([
            'message' => 'Registration request received. Please wait 1-2 minutes for the OTP email to arrive.',
            'email' => $request->email,
            'note' => 'We are sending a 6-digit OTP code to your email. Please wait 1-2 minutes and check your inbox (and spam folder). The code expires in 10 minutes. Your account will be created after verification.',
            'wait_time' => '1-2 minutes',
        ], 200);
    }

    public function verifyEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        $result = $this->otpService->verify(self::OTP_PREFIX, $request->email, $request->otp);

        if (!$result['success']) {
            return response()->json(['error' => $result['error']], $result['status']);
        }

        $registrationData = $result['data'];

        if (User::where('email', $request->email)->exists()) {
            $this->otpService->forget(self::OTP_PREFIX, $request->email);

            return response()->json([
                'error' => 'This email is already registered. Please login instead.',
            ], 422);
        }

        $clientRole = Role::where('name', 'client')->first();

        if (!$clientRole) {
            return response()->json([
                'error' => 'Client role not found. Please run database seeders.',
            ], 500);
        }

        $user = User::create([
            'name' => $registrationData['name'],
            'email' => $registrationData['email'],
            'password' => $registrationData['password'],
            'phone' => $registrationData['phone'],
            'address' => $registrationData['address'],
            'company_name' => $registrationData['company_name'],
            'role_id' => $clientRole->id,
            'email_verified_at' => now(),
        ]);

        $this->otpService->forget(self::OTP_PREFIX, $request->email);

        $token = $user->createToken(
            'auth_token',
            $user->isAdmin() ? ['admin:*'] : ['client:*'],
            now()->addDays(1)
        )->plainTextToken;

        return response()->json([
            'message' => 'Email verified successfully. Your account has been created.',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('role'),
        ]);
    }

    public function resendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        if (User::where('email', $request->email)->exists()) {
            return response()->json([
                'error' => 'This email is already registered. Please login instead.',
            ], 422);
        }

        $registrationData = $this->otpService->get(self::OTP_PREFIX, $request->email);

        if (!$registrationData) {
            return response()->json([
                'error' => 'Registration data not found or expired. Please register again.',
            ], 404);
        }

        if (!$this->otpService->canResend(self::OTP_PREFIX, $request->email)) {
            return response()->json([
                'error' => 'Please wait before requesting another OTP.',
                'retry_after_seconds' => $this->otpService->resendCooldownSeconds(),
            ], 429);
        }

        unset($registrationData['otp_hash'], $registrationData['attempts'], $registrationData['verified']);

        $otp = $this->otpService->updatePayload(self::OTP_PREFIX, $request->email, $registrationData);

        try {
            Mail::to($request->email)->queue(new EmailVerificationMail($otp, $registrationData['name']));
            Log::info('OTP resend email queued', ['email' => $request->email]);
        } catch (\Exception $e) {
            Log::error('Failed to queue OTP resend email', ['email' => $request->email, 'error' => $e->getMessage()]);

            return response()->json([
                'error' => 'Failed to send verification email. Please try again later.',
            ], 500);
        }

        return response()->json([
            'message' => 'OTP resend request received. Please wait 1-2 minutes for the email to arrive.',
            'email' => $request->email,
            'note' => 'We are sending a new 6-digit OTP code to your email. Please wait 1-2 minutes and check your inbox (and spam folder). The code expires in 10 minutes.',
            'wait_time' => '1-2 minutes',
        ]);
    }
}
