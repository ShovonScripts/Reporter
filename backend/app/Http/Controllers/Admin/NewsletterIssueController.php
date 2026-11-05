<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NewsletterIssue;
use App\Models\Subscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Queue;
use App\Jobs\SendNewsletterJob;

class NewsletterIssueController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = NewsletterIssue::orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = min($request->integer('per_page', 20), 100);
        $issues = $query->paginate($perPage);

        return response()->json($issues);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'preview_text' => 'nullable|string|max:255',
            'body_html' => 'required|string',
            'status' => ['required', Rule::in(['draft', 'scheduled', 'sending', 'sent'])],
            'scheduled_for' => 'nullable|date|after:now',
        ]);

        // Validate scheduled_for when status is scheduled
        if ($validated['status'] === 'scheduled' && empty($validated['scheduled_for'])) {
            return response()->json([
                'message' => 'Scheduled issues require a scheduled_for date.',
            ], 422);
        }

        $issue = NewsletterIssue::create($validated);

        return response()->json($issue, 201);
    }

    public function show(int $id): JsonResponse
    {
        $issue = NewsletterIssue::findOrFail($id);
        return response()->json($issue);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $issue = NewsletterIssue::findOrFail($id);

        $validated = $request->validate([
            'subject' => 'sometimes|required|string|max:255',
            'preview_text' => 'nullable|string|max:255',
            'body_html' => 'sometimes|required|string',
            'status' => ['sometimes', Rule::in(['draft', 'scheduled', 'sending', 'sent'])],
            'scheduled_for' => 'nullable|date',
        ]);

        // Prevent editing sent issues
        if ($issue->isSent()) {
            return response()->json([
                'message' => 'Cannot edit a sent newsletter issue.',
            ], 422);
        }

        // Validate scheduled_for when status is scheduled
        $status = $validated['status'] ?? $issue->status;
        if ($status === 'scheduled' && empty($validated['scheduled_for']) && !$issue->scheduled_for) {
            return response()->json([
                'message' => 'Scheduled issues require a scheduled_for date.',
            ], 422);
        }

        $issue->update($validated);

        return response()->json($issue);
    }

    public function destroy(int $id): JsonResponse
    {
        $issue = NewsletterIssue::findOrFail($id);

        // Prevent deleting sent issues
        if ($issue->isSent()) {
            return response()->json([
                'message' => 'Cannot delete a sent newsletter issue.',
            ], 422);
        }

        $issue->delete();
        return response()->json(['message' => 'Newsletter issue deleted.']);
    }

    public function send(int $id): JsonResponse
    {
        $issue = NewsletterIssue::findOrFail($id);

        if (!$issue->isDraft() && !$issue->isScheduled()) {
            return response()->json([
                'message' => 'Only draft or scheduled issues can be sent.',
            ], 422);
        }

        $issue->update(['status' => 'sending']);

        // Queue the sending job
        SendNewsletterJob::dispatch($issue->id);

        return response()->json(['message' => 'Newsletter queued for sending.']);
    }

    public function schedule(int $id, Request $request): JsonResponse
    {
        $issue = NewsletterIssue::findOrFail($id);

        $request->validate([
            'scheduled_for' => 'required|date|after:now',
        ]);

        if (!$issue->isDraft()) {
            return response()->json([
                'message' => 'Only draft issues can be scheduled.',
            ], 422);
        }

        $issue->update([
            'status' => 'scheduled',
            'scheduled_for' => $request->scheduled_for,
        ]);

        return response()->json($issue);
    }

    public function testSend(int $id, Request $request): JsonResponse
    {
        $issue = NewsletterIssue::findOrFail($id);

        $request->validate([
            'test_email' => 'required|email|max:255',
        ]);

        // TODO: Send test email
        \Log::info('Test newsletter send', [
            'issue_id' => $issue->id,
            'test_email' => $request->test_email,
        ]);

        return response()->json(['message' => 'Test email sent.']);
    }
}