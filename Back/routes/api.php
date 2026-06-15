<?php

use Illuminate\Support\Facades\Route;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\ClientMiddleware;
use App\Http\Controllers\Api\Client\ServiceController;

// =========================
//  Public Routes
// =========================

Route::post('/register', [App\Http\Controllers\Api\Auth\RegisterController::class, 'register'])
    ->middleware('throttle:auth-register');
Route::post('/verify-email', [App\Http\Controllers\Api\Auth\RegisterController::class, 'verifyEmail'])
    ->middleware('throttle:otp-verify');
Route::post('/resend-otp', [App\Http\Controllers\Api\Auth\RegisterController::class, 'resendOtp'])
    ->middleware('throttle:otp-resend');
Route::post('/login', [App\Http\Controllers\Api\Auth\LoginController::class, 'login'])
    ->middleware('throttle:auth-login');

Route::post('/forgot-password', [App\Http\Controllers\Api\Auth\ForgotPasswordController::class, 'requestPasswordReset'])
    ->middleware('throttle:password-reset');
Route::post('/verify-reset-otp', [App\Http\Controllers\Api\Auth\ForgotPasswordController::class, 'verifyOtp'])
    ->middleware('throttle:otp-verify');
Route::post('/reset-password', [App\Http\Controllers\Api\Auth\ForgotPasswordController::class, 'resetPassword'])
    ->middleware('throttle:password-reset');
Route::post('/resend-reset-otp', [App\Http\Controllers\Api\Auth\ForgotPasswordController::class, 'resendOtp'])
    ->middleware('throttle:otp-resend');

Route::get('/services', [ServiceController::class, 'index']);

Route::post('/contact', [App\Http\Controllers\Api\ContactController::class, 'store'])
    ->middleware('throttle:contact');

// Payment view (token required) — client self-confirm removed
Route::get('/payment/{transactionId}', [App\Http\Controllers\Api\PaymentConfirmationController::class, 'show'])
    ->middleware('throttle:payment-view');
Route::get('/payment/confirm/{transactionId}', [App\Http\Controllers\Api\PaymentConfirmationController::class, 'show'])
    ->middleware('throttle:payment-view');

// Verified payment gateway webhook
Route::post('/webhooks/payment', [App\Http\Controllers\Api\PaymentWebhookController::class, 'handle']);

// =========================
//  Client Routes
// =========================

Route::middleware(['auth:sanctum', 'client'])->group(function () {
    Route::get('/client/profile', [App\Http\Controllers\Api\Client\ProfileController::class, 'index']);
    Route::put('/client/profile', [App\Http\Controllers\Api\Client\ProfileController::class, 'update']);

    Route::get('/client/appointments/slots', [App\Http\Controllers\Api\Client\AppointmentController::class, 'index']);
    Route::get('/client/appointments', [App\Http\Controllers\Api\Client\AppointmentController::class, 'list']);
    Route::post('/client/appointments', [App\Http\Controllers\Api\Client\AppointmentController::class, 'store']);
    Route::get('/client/appointments/{id}', [App\Http\Controllers\Api\Client\AppointmentController::class, 'show']);

    Route::post('/logout', [App\Http\Controllers\Api\Auth\LoginController::class, 'logout']);
    Route::post('/logout-all', [App\Http\Controllers\Api\Auth\LoginController::class, 'logoutAll']);
});

// =========================
//  Admin Routes
// =========================

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/services', [App\Http\Controllers\Api\Admin\ServiceController::class, 'index']);
    Route::post('/services', [App\Http\Controllers\Api\Admin\ServiceController::class, 'store']);
    Route::get('/services/{id}', [App\Http\Controllers\Api\Admin\ServiceController::class, 'show']);
    Route::put('/services/{id}', [App\Http\Controllers\Api\Admin\ServiceController::class, 'update']);
    Route::delete('/services/{id}', [App\Http\Controllers\Api\Admin\ServiceController::class, 'destroy']);

    Route::get('/subcategories', [App\Http\Controllers\Api\Admin\SubcategoryController::class, 'index']);
    Route::post('/subcategories', [App\Http\Controllers\Api\Admin\SubcategoryController::class, 'store']);
    Route::get('/subcategories/{id}', [App\Http\Controllers\Api\Admin\SubcategoryController::class, 'show']);
    Route::put('/subcategories/{id}', [App\Http\Controllers\Api\Admin\SubcategoryController::class, 'update']);
    Route::delete('/subcategories/{id}', [App\Http\Controllers\Api\Admin\SubcategoryController::class, 'destroy']);

    Route::get('/clients', [App\Http\Controllers\Api\Admin\ClientController::class, 'index']);
    Route::get('/clients/{id}/appointments', [App\Http\Controllers\Api\Admin\ClientController::class, 'getAppointments']);
    Route::get('/clients/{id}', [App\Http\Controllers\Api\Admin\ClientController::class, 'show']);
    Route::delete('/clients/{id}', [App\Http\Controllers\Api\Admin\ClientController::class, 'destroy']);

    Route::get('/appointments/slots', [App\Http\Controllers\Api\Admin\AppointmentController::class, 'index']);
    Route::post('/appointments/slots', [App\Http\Controllers\Api\Admin\AppointmentController::class, 'store']);
    Route::get('/appointments/slots/{id}', [App\Http\Controllers\Api\Admin\AppointmentController::class, 'show']);
    Route::put('/appointments/slots/{id}', [App\Http\Controllers\Api\Admin\AppointmentController::class, 'update']);
    Route::delete('/appointments/slots/{id}', [App\Http\Controllers\Api\Admin\AppointmentController::class, 'destroy']);
    Route::post('/appointments/slots/{id}/send-meeting-link', [App\Http\Controllers\Api\Admin\AppointmentController::class, 'sendMeetingLink']);
    Route::post('/appointments/slots/{id}/cancel', [App\Http\Controllers\Api\Admin\AppointmentController::class, 'cancelAppointment']);

    Route::get('/payments', [App\Http\Controllers\Api\Admin\PaymentController::class, 'index']);
    Route::get('/payments/appointment/{appointmentId}/services', [App\Http\Controllers\Api\Admin\PaymentController::class, 'getAppointmentServices']);
    Route::post('/payments', [App\Http\Controllers\Api\Admin\PaymentController::class, 'store']);
    Route::get('/payments/{id}', [App\Http\Controllers\Api\Admin\PaymentController::class, 'show']);
    Route::put('/payments/{id}', [App\Http\Controllers\Api\Admin\PaymentController::class, 'update']);
    Route::post('/payments/{id}/confirm', [App\Http\Controllers\Api\Admin\PaymentController::class, 'confirm']);
    Route::delete('/payments/{id}', [App\Http\Controllers\Api\Admin\PaymentController::class, 'destroy']);

    Route::get('/admins', [App\Http\Controllers\Api\Admin\AdminController::class, 'index']);
    Route::post('/admins', [App\Http\Controllers\Api\Admin\AdminController::class, 'store']);
    Route::get('/admins/{id}', [App\Http\Controllers\Api\Admin\AdminController::class, 'show']);
    Route::put('/admins/{id}', [App\Http\Controllers\Api\Admin\AdminController::class, 'update']);
    Route::delete('/admins/{id}', [App\Http\Controllers\Api\Admin\AdminController::class, 'destroy']);

    Route::get('/contacts', [App\Http\Controllers\Api\Admin\ContactController::class, 'index']);
    Route::get('/contacts/{id}', [App\Http\Controllers\Api\Admin\ContactController::class, 'show']);
    Route::post('/contacts/{id}/reply', [App\Http\Controllers\Api\Admin\ContactController::class, 'reply']);
    Route::put('/contacts/{id}', [App\Http\Controllers\Api\Admin\ContactController::class, 'update']);
    Route::delete('/contacts/{id}', [App\Http\Controllers\Api\Admin\ContactController::class, 'destroy']);

    Route::post('/logout', [App\Http\Controllers\Api\Auth\LoginController::class, 'logout']);
    Route::post('/logout-all', [App\Http\Controllers\Api\Auth\LoginController::class, 'logoutAll']);
});
