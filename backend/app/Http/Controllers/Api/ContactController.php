<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string|max:10000',
            'honeypot' => 'nullable|string', // Honeypot field - should be empty
        ]);

        // Check honeypot
        if ($request->filled('honeypot')) {
            // Silently succeed but don't store
            return response()->json([
                'message' => 'Message sent successfully.',
            ]);
        }

        // Rate limiting check (simple IP-based)
        $recentCount = ContactMessage::where('created_at', '>', now()->subHour())
            ->where('email', $request->email)
            ->count();

        if ($recentCount >= 5) {
            throw ValidationException::withMessages([
                'email' => 'Too many messages from this email. Please try again later.',
            ]);
        }

        ContactMessage::create([
            'name' => $request->name,
            'email' => $request->email,
            'message' => $request->message,
        ]);

        // TODO: Send notification email to journalist

        return response()->json([
            'message' => 'Message sent successfully. We\'ll get back to you soon.',
        ]);
    }
}