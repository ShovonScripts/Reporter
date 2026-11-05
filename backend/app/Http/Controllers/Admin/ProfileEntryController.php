<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProfileEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProfileEntryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ProfileEntry::orderBy('kind')->orderBy('position');

        if ($request->filled('kind')) {
            $query->where('kind', $request->kind);
        }

        if ($request->filled('verified')) {
            $query->where('verified', $request->boolean('verified'));
        }

        $perPage = min($request->integer('per_page', 50), 100);
        $entries = $query->paginate($perPage);

        return response()->json($entries);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kind' => ['required', Rule::in(['career', 'education', 'recognition'])],
            'title' => 'required|string|max:255',
            'organisation' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'description' => 'nullable|string',
            'url' => 'nullable|url|max:500',
            'verified' => 'boolean',
            'position' => 'nullable|integer|min:0',
        ]);

        $maxPosition = ProfileEntry::where('kind', $validated['kind'])->max('position') ?? -1;
        $validated['position'] = $request->position ?? $maxPosition + 1;

        $entry = ProfileEntry::create($validated);

        return response()->json($entry, 201);
    }

    public function show(int $id): JsonResponse
    {
        $entry = ProfileEntry::findOrFail($id);
        return response()->json($entry);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $entry = ProfileEntry::findOrFail($id);

        $validated = $request->validate([
            'kind' => ['sometimes', Rule::in(['career', 'education', 'recognition'])],
            'title' => 'sometimes|required|string|max:255',
            'organisation' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'description' => 'nullable|string',
            'url' => 'nullable|url|max:500',
            'verified' => 'boolean',
            'position' => 'nullable|integer|min:0',
        ]);

        $entry->update($validated);

        return response()->json($entry);
    }

    public function destroy(int $id): JsonResponse
    {
        $entry = ProfileEntry::findOrFail($id);
        $entry->delete();

        // Reorder remaining entries of same kind
        $this->reorder($entry->kind);

        return response()->json(['message' => 'Profile entry deleted.']);
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'kind' => ['required', Rule::in(['career', 'education', 'recognition'])],
            'entry_ids' => 'required|array',
            'entry_ids.*' => 'exists:profile_entries,id',
        ]);

        foreach ($request->entry_ids as $index => $entryId) {
            ProfileEntry::where('id', $entryId)->update(['position' => $index]);
        }

        return response()->json(['message' => 'Entries reordered.']);
    }

    private function reorder(string $kind): void
    {
        $entries = ProfileEntry::where('kind', $kind)->orderBy('position')->get();
        foreach ($entries as $index => $entry) {
            $entry->update(['position' => $index]);
        }
    }
}