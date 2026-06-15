<?php

namespace App\Http\Controllers\Api\Auth;

use App\Models\User;
use App\Mail\PasswordResetMail;
use App\Services\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class ForgotPasswordController
{
    private const OTP_PREFIX = 'password_reset';

    public function __construct(private OtpService $otpService) {}

    public function requestPasswordReset(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'If an account exists with this email, a password reset OTP has been sent.',
                'email' => $request->email,
            ], 200);
        }

        if (!$user->email_verified_at) {
            return response()->json([
                'error' => 'Email not verified. Please verify your email first.',
            ], 403);
        }

        if (!$this->otpService->canResend(self::OTP_PREFIX, $request->email)) {
            return response()->json([
                'error' => 'Please wait before requesting another OTP.',
                'retry_after_seconds' => $this->otpService->resendCooldownSeconds(),
            ], 429);
        }

        $otp = $this->otpService->store(self::OTP_PREFIX, $request->email, [
            'email' => $request->email,
        ]);

        try {
            Mail::to($user->email)->send(new PasswordResetMail($otp, $user->name));
            Log::info('Password reset OTP email sent', ['email' => $user->email]);
        } catch (\Exception $e) {
            Log::error('Failed to send password reset OTP email', ['email' => $user->email, 'error' => $e->getMessage()]);
            $this->otpService->forget(self::OTP_PREFIX, $request->email);

            return response()->json([
                'error' => 'Failed to send email. Please try again later.',
            ], 500);
        }

        $this->otpService->markResent(self::OTP_PREFIX, $request->email);

        return response()->json([
            'message' => 'Password reset request received. Please wait 1-2 minutes for the OTP email to arrive.',
            'email' => $request->email,
            'note' => 'We are sending a 6-digit OTP code to your email. Please wait 1-2 minutes and check your inbox (and spam folder). The code expires in 10 minutes.',
            'wait_time' => '1-2 minutes',
        ], 200);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        $result = $this->otpService->verify(self::OTP_PREFIX, $request->email, $request->otp);

        if (!$result['success']) {
            return response()->json(['error' => $result['error']], $result['status']);
        }

        $this->otpService->markVerified(self::OTP_PREFIX, $request->email);

        return response()->json([
            'message' => 'OTP verified successfully. You can now reset your password.',
            'email' => $request->email,
        ], 200);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if (!$this->otpService->isVerified(self::OTP_PREFIX, $request->email)) {
            return response()->json([
                'error' => 'Please verify your OTP before resetting your password.',
            ], 403);
        }

        $result = $this->otpService->verify(self::OTP_PREFIX, $request->email, $request->otp);

        if (!$result['success']) {
            return response()->json(['error' => $result['error']], $result['status']);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['error' => 'User not found.'], 404);
        }

        $user->update(['password' => Hash::make($request->password)]);
        $user->tokens()->delete();

        $this->otpService->forget(self::OTP_PREFIX, $request->email);

        Log::info('Password reset successful', ['user_id' => $user->id]);

        return response()->json([
            'message' => 'Password reset successfully. You can now login with your new password.',
        ], 200);
    }

    public function resendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'If an account exists with this email, a password reset OTP has been sent.',
                'email' => $request->email,
            ], 200);
        }

        if (!$this->otpService->canResend(self::OTP_PREFIX, $request->email)) {
            return response()->json([
                'error' => 'Please wait before requesting another OTP.',
                'retry_after_seconds' => $this->otpService->resendCooldownSeconds(),
            ], 429);
        }

        $otp = $this->otpService->store(self::OTP_PREFIX, $request->email, [
            'email' => $request->email,
        ]);

        try {
            Mail::to($user->email)->send(new PasswordResetMail($otp, $user->name));
            Log::info('Password reset OTP resend email sent', ['email' => $user->email]);
        } catch (\Exception $e) {
            Log::error('Failed to send password reset OTP resend email', ['email' => $user->email, 'error' => $e->getMessage()]);

            return response()->json([
                'error' => 'Failed to send email. Please try again later.',
            ], 500);
        }

        $this->otpService->markResent(self::OTP_PREFIX, $request->email);

        return response()->json([
            'message' => 'OTP resend request received. Please wait 1-2 minutes for the email to arrive.',
            'email' => $request->email,
            'note' => 'We are sending a new 6-digit OTP code to your email. Please wait 1-2 minutes and check your inbox (and spam folder). The code expires in 10 minutes.',
            'wait_time' => '1-2 minutes',
        ], 200);
    }
}
