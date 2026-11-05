<?php

namespace App\Jobs;

use App\Mail\NewsletterIssue as NewsletterIssueMail;
use App\Models\NewsletterIssue;
use App\Models\Subscriber;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendNewsletterJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public int $issueId,
        public int $batchSize = 100
    ) {}

    public function handle(): void
    {
        $issue = NewsletterIssue::find($this->issueId);

        if (!$issue) {
            Log::error('Newsletter issue not found', ['issue_id' => $this->issueId]);
            return;
        }

        if (!$issue->isSending()) {
            Log::warning('Newsletter issue not in sending state', [
                'issue_id' => $this->issueId,
                'status' => $issue->status,
            ]);
            return;
        }

        $subscribers = Subscriber::confirmed()->get();

        if ($subscribers->isEmpty()) {
            $issue->update([
                'status' => 'sent',
                'sent_at' => now(),
                'recipient_count' => 0,
            ]);
            return;
        }

        $totalSent = 0;
        $chunks = $subscribers->chunk($this->batchSize);

        foreach ($chunks as $chunk) {
            foreach ($chunk as $subscriber) {
                try {
                    if (!$subscriber->unsubscribe_token_hash) {
                        $unsubscribeToken = Subscriber::generateToken();
                        $subscriber->setUnsubscribeToken($unsubscribeToken);
                        $subscriber->save();
                    } else {
                        $unsubscribeToken = $subscriber->getRawOriginal('unsubscribe_token_hash');
                    }

                    $unsubscribeUrl = rtrim(config('app.frontend_url'), '/') . "/newsletter/unsubscribe/{$unsubscribeToken}";

                    Mail::to($subscriber->email)
                        ->queue(new NewsletterIssueMail($issue, $subscriber, $unsubscribeUrl));

                    $totalSent++;
                } catch (\Throwable $e) {
                    Log::error('Failed to send newsletter', [
                        'issue_id' => $issue->id,
                        'subscriber_email' => $subscriber->email,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }

        $issue->update([
            'status' => 'sent',
            'sent_at' => now(),
            'recipient_count' => $totalSent,
        ]);

        Log::info('Newsletter sending completed', [
            'issue_id' => $issue->id,
            'total_sent' => $totalSent,
        ]);
    }
}