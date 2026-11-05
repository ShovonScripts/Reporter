<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ContactNotification;
use App\Models\ContactMessage;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string|max:10000',
            'honeypot' => 'nullable|string',
        ]);

        if ($request->filled('honeypot')) {
            return response()->json([
                'message' => 'Message sent successfully.',
            ]);
        }

        $recentCount = ContactMessage::where('created_at', '>', now()->subHour())
            ->where('email', $request->email)
            ->count();

        if ($recentCount >= 5) {
            throw ValidationException::withMessages([
                'email' => 'Too many messages from this email. Please try again later.',
            ]);
        }

        $contactMessage = ContactMessage::create([
            'name' => $request->name,
            'email' => $request->email,
            'message' => $request->message,
        ]);

        $this->sendNotificationEmail($contactMessage);

        return response()->json([
            'message' => "Message sent successfully. We'll get back to you soon.",
        ]);
    }

    private function sendNotificationEmail(ContactMessage $contactMessage): void
    {
        $notificationEmail = SiteSetting::get('contact_notification_email');

        if (!$notificationEmail) {
            return;
        }

        Mail::to($notificationEmail)
            ->queue(new ContactNotification(
                $contactMessage->name,
                $contactMessage->email,
                $contactMessage->message,
            ));
    }
}