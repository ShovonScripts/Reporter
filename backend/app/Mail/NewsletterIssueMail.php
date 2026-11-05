<?php

namespace App\Mail;

use App\Models\NewsletterIssue;
use App\Models\Subscriber;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewsletterIssueMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public NewsletterIssue $issue,
        public Subscriber $subscriber,
        public string $unsubscribeUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->issue->subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.newsletter.issue-mail',
            with: [
                'issue' => $this->issue,
                'subscriber' => $this->subscriber,
                'unsubscribeUrl' => $this->unsubscribeUrl,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}