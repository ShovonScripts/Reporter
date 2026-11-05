<?php

namespace App\Mail;

use App\Models\Subscriber;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewsletterConfirmation extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Subscriber $subscriber,
        public string $confirmUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Confirm your subscription to ' . config('app.name'),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.newsletter.confirmation',
            with: [
                'subscriber' => $this->subscriber,
                'confirmUrl' => $this->confirmUrl,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}