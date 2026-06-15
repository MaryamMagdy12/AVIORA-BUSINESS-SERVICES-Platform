<?php

namespace App\Http\Controllers\Api;

use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Public Contact Controller
 * Handles contact form submissions (no auth required)
 */
class ContactController
{
    /**
     * Store a new contact message
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|regex:/^\+?\d+$/|max:255',
            'company_name' => 'required|string|max:255',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string|min:10',
        ]);

        // Check if user is authenticated and link the message
        $userId = Auth::check() ? Auth::id() : null;

        $contactMessage = ContactMessage::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'company_name' => $request->company_name,
            'subject' => $request->subject,
            'message' => $request->message,
            'user_id' => $userId,
            'status' => 'new',
        ]);

        return response()->json([
            'message' => 'Thank you for contacting us! We will get back to you soon.',
            'contact_message' => $contactMessage
        ], 201);
    }
}

