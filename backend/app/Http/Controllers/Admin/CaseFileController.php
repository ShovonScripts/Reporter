<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CaseFile;
use App\Models\Article;
use App\Models\Media;
use App\Models\CaseFilePart;
use App\Models\CaseFileTimeline;
use App\Models\CaseFileDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CaseFileController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = CaseFile::with([
            'featuredMedia:id,path,mime,alt_text,credit',
            'parts.article:id,title,slug,type',
        ])->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('q')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->q}%")
                  ->orWhere('slug', 'like', "%{$request->q}%");
            });
        }

        $perPage = min($request->integer('per_page', 20), 100);
        $caseFiles = $query->paginate($perPage);

        return response()->json($caseFiles);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:case_files,slug',
            'deck' => 'nullable|string',
            'status' => ['required', Rule::in(['draft', 'published'])],
            'case_status' => 'nullable|string|max:50',
            'period_start' => 'nullable|date',
            'period_end' => 'nullable|date|after_or_equal:period_start',
            'overview_html' => 'nullable|string',
            'methods_html' => 'nullable|string',
            'impact_html' => 'nullable|string',
            'featured_media_id' => 'nullable|exists:media,id',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
            'og_media_id' => 'nullable|exists:media,id',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (CaseFile::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter++;
            }
        }

        $caseFile = CaseFile::create($validated);

        return response()->json($caseFile->load(['featuredMedia', 'parts.article']), 201);
    }

    public function show(int $id): JsonResponse
    {
        $caseFile = CaseFile::with([
            'featuredMedia:id,path,mime,alt_text,credit,caption,rights_confirmed',
            'ogMedia:id,path,mime,alt_text,credit,caption,rights_confirmed',
            'parts' => function ($query) {
                $query->with('article:id,title,slug,type,summary,published_at,publication_id,original_url,archived_url')
                      ->orderBy('position');
            },
            'timeline' => function ($query) {
                $query->orderBy('position');
            },
            'allDocuments' => function ($query) {
                $query->with('media:id,path,mime,alt_text,credit,caption,rights_confirmed')
                      ->orderBy('position');
            },
        ])->findOrFail($id);

        return response()->json($caseFile);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $caseFile = CaseFile::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:case_files,slug,' . $id,
            'deck' => 'nullable|string',
            'status' => ['sometimes', Rule::in(['draft', 'published'])],
            'case_status' => 'nullable|string|max:50',
            'period_start' => 'nullable|date',
            'period_end' => 'nullable|date|after_or_equal:period_start',
            'overview_html' => 'nullable|string',
            'methods_html' => 'nullable|string',
            'impact_html' => 'nullable|string',
            'featured_media_id' => 'nullable|exists:media,id',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
            'og_media_id' => 'nullable|exists:media,id',
        ]);

        $caseFile->update($validated);

        return response()->json($caseFile->load(['featuredMedia', 'ogMedia', 'parts.article', 'timeline', 'allDocuments.media']));
    }

    public function destroy(int $id): JsonResponse
    {
        $caseFile = CaseFile::findOrFail($id);
        $caseFile->delete();

        return response()->json(['message' => 'Case file deleted.']);
    }

    // Parts management
    public function addPart(Request $request, int $id): JsonResponse
    {
        $caseFile = CaseFile::findOrFail($id);

        $request->validate([
            'article_id' => 'required|exists:articles,id',
            'position' => 'nullable|integer|min:0',
            'note' => 'nullable|string',
        ]);

        $maxPosition = $caseFile->parts()->max('position') ?? -1;
        $position = $request->position ?? $maxPosition + 1;

        $part = CaseFilePart::create([
            'case_file_id' => $caseFile->id,
            'article_id' => $request->article_id,
            'position' => $position,
            'note' => $request->note,
        ]);

        return response()->json($part->load('article'), 201);
    }

    public function updatePart(Request $request, int $id, int $partId): JsonResponse
    {
        $caseFile = CaseFile::findOrFail($id);
        $part = $caseFile->parts()->findOrFail($partId);

        $request->validate([
            'position' => 'nullable|integer|min:0',
            'note' => 'nullable|string',
        ]);

        $part->update($request->only(['position', 'note']));

        return response()->json($part->load('article'));
    }

    public function removePart(int $id, int $partId): JsonResponse
    {
        $caseFile = CaseFile::findOrFail($id);
        $part = $caseFile->parts()->findOrFail($partId);
        $part->delete();

        // Reorder remaining parts
        $this->normalizePartPositions($caseFile->id);

        return response()->json(['message' => 'Part removed.']);
    }

    public function reorderParts(Request $request, int $id): JsonResponse
    {
        $caseFile = CaseFile::findOrFail($id);

        $request->validate([
            'part_ids' => 'required|array',
            'part_ids.*' => 'exists:case_file_parts,id',
        ]);

        foreach ($request->part_ids as $index => $partId) {
            $caseFile->parts()->where('id', $partId)->update(['position' => $index]);
        }

        return response()->json(['message' => 'Parts reordered.']);
    }

    // Timeline management
    public function addTimelineEvent(Request $request, int $id): JsonResponse
    {
        $caseFile = CaseFile::findOrFail($id);

        $request->validate([
            'date' => 'required|date',
            'text' => 'required|string',
            'position' => 'nullable|integer|min:0',
        ]);

        $maxPosition = $caseFile->timeline()->max('position') ?? -1;
        $position = $request->position ?? $maxPosition + 1;

        $event = CaseFileTimeline::create([
            'case_file_id' => $caseFile->id,
            'date' => $request->date,
            'text' => $request->text,
            'position' => $position,
        ]);

        return response()->json($event, 201);
    }

    public function updateTimelineEvent(Request $request, int $id, int $eventId): JsonResponse
    {
        $caseFile = CaseFile::findOrFail($id);
        $event = $caseFile->timeline()->findOrFail($eventId);

        $request->validate([
            'date' => 'sometimes|required|date',
            'text' => 'sometimes|required|string',
            'position' => 'nullable|integer|min:0',
        ]);

        $event->update($request->only(['date', 'text', 'position']));

        return response()->json($event);
    }

    public function removeTimelineEvent(int $id, int $eventId): JsonResponse
    {
        $caseFile = CaseFile::findOrFail($id);
        $event = $caseFile->timeline()->findOrFail($eventId);
        $event->delete();

        $this->reorderTimeline($caseFile->id);

        return response()->json(['message' => 'Timeline event removed.']);
    }

    // Document management
    public function addDocument(Request $request, int $id): JsonResponse
    {
        $caseFile = CaseFile::findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string|max:50',
            'media_id' => 'nullable|exists:media,id',
            'url' => 'nullable|url|max:500',
            'is_public' => 'boolean',
            'position' => 'nullable|integer|min:0',
        ]);

        // Either media_id or url is required
        if (!$request->media_id && !$request->url) {
            return response()->json([
                'message' => 'Either media_id or url is required.',
            ], 422);
        }

        $maxPosition = $caseFile->allDocuments()->max('position') ?? -1;
        $position = $request->position ?? $maxPosition + 1;

        $doc = CaseFileDocument::create([
            'case_file_id' => $caseFile->id,
            'title' => $request->title,
            'type' => $request->type,
            'media_id' => $request->media_id,
            'url' => $request->url,
            'is_public' => $request->boolean('is_public', true),
            'position' => $position,
        ]);

        return response()->json($doc->load('media'), 201);
    }

    public function updateDocument(Request $request, int $id, int $docId): JsonResponse
    {
        $caseFile = CaseFile::findOrFail($id);
        $doc = $caseFile->allDocuments()->findOrFail($docId);

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|string|max:50',
            'media_id' => 'nullable|exists:media,id',
            'url' => 'nullable|url|max:500',
            'is_public' => 'boolean',
            'position' => 'nullable|integer|min:0',
        ]);

        $doc->update($request->only(['title', 'type', 'media_id', 'url', 'is_public', 'position']));

        return response()->json($doc->load('media'));
    }

    public function removeDocument(int $id, int $docId): JsonResponse
    {
        $caseFile = CaseFile::findOrFail($id);
        $doc = $caseFile->allDocuments()->findOrFail($docId);
        $doc->delete();

        $this->reorderDocuments($caseFile->id);

        return response()->json(['message' => 'Document removed.']);
    }

    private function normalizePartPositions(int $caseFileId): void
    {
        $parts = CaseFilePart::where('case_file_id', $caseFileId)->orderBy('position')->get();
        foreach ($parts as $index => $part) {
            $part->update(['position' => $index]);
        }
    }

    private function reorderTimeline(int $caseFileId): void
    {
        $events = CaseFileTimeline::where('case_file_id', $caseFileId)->orderBy('position')->get();
        foreach ($events as $index => $event) {
            $event->update(['position' => $index]);
        }
    }

    private function reorderDocuments(int $caseFileId): void
    {
        $docs = CaseFileDocument::where('case_file_id', $caseFileId)->orderBy('position')->get();
        foreach ($docs as $index => $doc) {
            $doc->update(['position' => $index]);
        }
    }
}