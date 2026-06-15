<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MeetingLinkMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $appointment;
    public $userName;
    public $meetingLink;

    /**
     * Create a new message instance.
     */
    public function __construct(Appointment $appointment, string $meetingLink)
    {
        $this->appointment = $appointment->load(['user', 'services', 'appointmentSlot']);
        $this->userName = $appointment->user->name;
        $this->meetingLink = $meetingLink;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Meeting Link - Your Appointment',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.meeting-link',
            with: [
                'appointment' => $this->appointment,
                'userName' => $this->userName,
                'meetingLink' => $this->meetingLink,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}

