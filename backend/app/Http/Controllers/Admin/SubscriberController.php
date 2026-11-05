<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriberController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Subscriber::orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('q')) {
            $query->where('email', 'like', "%{$request->q}%");
        }

        $perPage = min($request->integer('per_page', 50), 100);
        $subscribers = $query->paginate($perPage);

        return response()->json($subscribers);
    }

    public function destroy(int $id): JsonResponse
    {
        $subscriber = Subscriber::findOrFail($id);
        $subscriber->delete();
        return response()->json(['message' => 'Subscriber removed.']);
    }

    public function export(Request $request): JsonResponse
    {
        $status = $request->get('status', 'confirmed');
        $subscribers = Subscriber::where('status', $status)
            ->orderBy('confirmed_at')
            ->get(['email', 'confirmed_at', 'source', 'consent_text_version']);

        return response()->json($subscribers);
    }
}