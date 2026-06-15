<?php

namespace App\Http\Controllers\Api\Admin;

use App\Models\ContactMessage;
use App\Mail\ContactReplyMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class ContactController
{
    public function index(Request $request)
    {
        Gate::authorize('viewAny', ContactMessage::class);

        $perPage = min((int) $request->input('per_page', 25), 100);
        $query = ContactMessage::with('user')->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $messages = $query->paginate($perPage);

        return response()->json([
            'data' => $messages->items(),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
                'per_page' => $messages->perPage(),
                'total' => $messages->total(),
            ],
        ]);
    }

    public function show($id)
    {
        $message = ContactMessage::with('user')->findOrFail($id);
        Gate::authorize('view', $message);

        return response()->json($message);
    }

    public function reply(Request $request, $id)
    {
        $contactMessage = ContactMessage::with('user')->findOrFail($id);
        Gate::authorize('reply', $contactMessage);

        $request->validate([
            'reply_message' => 'required|string|min:10',
        ]);

        try {
            Mail::to($contactMessage->email)->queue(
                new ContactReplyMail($contactMessage, $request->reply_message)
            );

            $contactMessage->update([
                'status' => 'replied',
                'replied_at' => now(),
                'admin_reply' => $request->reply_message,
            ]);

            return response()->json([
                'message' => 'Reply will be sent shortly. Please wait 1-2 minutes.',
                'contact_message' => $contactMessage->fresh(['user']),
                'note' => 'The email is being processed and will arrive within 1-2 minutes.',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to queue contact reply email', ['error' => $e->getMessage()]);

            return response()->json([
                'error' => 'Failed to queue reply email. Please try again.',
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $message = ContactMessage::findOrFail($id);
        Gate::authorize('update', $message);

        $request->validate([
            'status' => 'sometimes|in:new,replied,archived',
        ]);

        $message->update($request->only(['status']));

        return response()->json($message->load('user'));
    }

    public function destroy($id)
    {
        $message = ContactMessage::findOrFail($id);
        Gate::authorize('delete', $message);

        $message->delete();

        return response()->json(null, 204);
    }
}
