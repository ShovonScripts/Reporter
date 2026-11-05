<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscriber;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class NewsletterController extends Controller
{
    public function subscribe(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|max:255',
            'source' => 'nullable|string|max:100',
        ]);

        // Check if already exists
        $existing = Subscriber::where('email', $request->email)->first();

        if ($existing) {
            if ($existing->isConfirmed()) {
                throw ValidationException::withMessages([
                    'email' => 'This email is already subscribed.',
                ]);
            }

            // Re-send confirmation if pending
            if ($existing->isPending()) {
                $this->sendConfirmationEmail($existing);
                return response()->json([
                    'message' => 'Confirmation email sent. Please check your inbox.',
                ]);
            }

            // Resubscribe if unsubscribed or bounced
            $existing->update([
                'status' => 'pending',
                'source' => $request->source ?? $existing->source,
                'consent_text_version' => $this->getConsentVersion(),
            ]);
            $this->sendConfirmationEmail($existing);

            return response()->json([
                'message' => 'Confirmation email sent. Please check your inbox.',
            ]);
        }

        // Create new subscriber
        $subscriber = Subscriber::create([
            'email' => $request->email,
            'status' => 'pending',
            'source' => $request->source ?? 'website',
            'consent_text_version' => $this->getConsentVersion(),
        ]);

        $confirmToken = Subscriber::generateToken();
        $subscriber->setConfirmToken($confirmToken);
        $subscriber->save();

        // Send confirmation email
        $this->sendConfirmationEmail($subscriber, $confirmToken);

        return response()->json([
            'message' => 'Confirmation email sent. Please check your inbox to complete your subscription.',
        ]);
    }

    public function confirm(string $token): JsonResponse
    {
        // Find subscriber by token hash
        $subscribers = Subscriber::where('status', 'pending')->get();

        $subscriber = null;
        foreach ($subscribers as $s) {
            if ($s->verifyConfirmToken($token)) {
                $subscriber = $s;
                break;
            }
        }

        if (!$subscriber) {
            return response()->json([
                'message' => 'Invalid or expired confirmation link.',
            ], 400);
        }

        $subscriber->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
            'confirm_token_hash' => null,
        ]);

        // Generate unsubscribe token
        $unsubscribeToken = Subscriber::generateToken();
        $subscriber->setUnsubscribeToken($unsubscribeToken);
        $subscriber->save();

        return response()->json([
            'message' => 'You have been successfully subscribed!',
        ]);
    }

    public function unsubscribe(string $token): JsonResponse
    {
        $subscribers = Subscriber::where('status', 'confirmed')->get();

        $subscriber = null;
        foreach ($subscribers as $s) {
            if ($s->verifyUnsubscribeToken($token)) {
                $subscriber = $s;
                break;
            }
        }

        if (!$subscriber) {
            return response()->json([
                'message' => 'Invalid or expired unsubscribe link.',
            ], 400);
        }

        $subscriber->update([
            'status' => 'unsubscribed',
            'unsubscribe_token_hash' => null,
        ]);

        return response()->json([
            'message' => 'You have been unsubscribed.',
        ]);
    }

    private function getConsentVersion(): string
    {
        return SiteSetting::get('newsletter_consent_version', '1.0');
    }

    private function sendConfirmationEmail(Subscriber $subscriber, ?string $token = null): void
    {
        // TODO: Implement actual email sending via transactional email provider
        // For now, log the token for development
        \Log::info('Newsletter confirmation', [
            'email' => $subscriber->email,
            'confirm_token' => $token,
            'confirm_url' => config('app.url') . "/newsletter/confirm/{$token}",
        ]);
    }
}