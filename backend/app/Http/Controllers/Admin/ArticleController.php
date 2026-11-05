<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Media;
use App\Models\Publication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ArticleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Article::with([
            'publication:id,name,slug',
            'featuredMedia:id,path,mime,alt_text,credit',
            'categories:id,name,slug',
            'tags:id,name,slug',
        ])->orderBy('created_at', 'desc');

        // Filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('q')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->q}%")
                  ->orWhere('slug', 'like', "%{$request->q}%");
            });
        }

        $perPage = min($request->integer('per_page', 20), 100);
        $articles = $query->paginate($perPage);

        return response()->json($articles);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(['external', 'internal'])],
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:articles,slug',
            'summary' => 'nullable|string',
            'body_json' => 'nullable|string',
            'body_html' => 'nullable|string',
            'status' => ['required', Rule::in(['draft', 'scheduled', 'published', 'archived'])],
            'published_at' => 'nullable|date',
            'scheduled_for' => 'nullable|date|after:now',
            'publication_id' => 'nullable|exists:publications,id',
            'original_url' => 'nullable|url|max:500',
            'archived_url' => 'nullable|url|max:500',
            'featured_media_id' => 'nullable|exists:media,id',
            'show_image' => 'boolean',
            'is_featured' => 'boolean',
            'featured_order' => 'nullable|integer|min:0',
            'reading_minutes' => 'nullable|integer|min:1',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
            'og_media_id' => 'nullable|exists:media,id',
            'canonical_url' => 'nullable|url|max:500',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:tags,id',
            'primary_category_id' => 'nullable|exists:categories,id',
        ]);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
            // Ensure uniqueness
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (Article::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter++;
            }
        }

        // Validate external article requirements
        if ($validated['type'] === 'external') {
            $request->validate([
                'publication_id' => 'required|exists:publications,id',
                'original_url' => 'required|url|max:500',
            ]);
        }

        // Validate internal article requirements for publishing
        if ($validated['type'] === 'internal' && $validated['status'] === 'published') {
            $request->validate([
                'body_html' => 'required|string',
            ]);
        }

        // Extract relationship IDs
        $categoryIds = $validated['category_ids'] ?? [];
        $tagIds = $validated['tag_ids'] ?? [];
        $primaryCategoryId = $validated['primary_category_id'] ?? null;

        unset($validated['category_ids'], $validated['tag_ids'], $validated['primary_category_id']);

        // Compute reading minutes for internal articles
        if ($validated['type'] === 'internal' && !empty($validated['body_html'])) {
            $wordCount = str_word_count(strip_tags($validated['body_html']));
            $validated['reading_minutes'] = max(1, (int) ceil($wordCount / 200));
        }

        $article = Article::create($validated);

        // Sync categories
        $categorySync = [];
        foreach ($categoryIds as $index => $catId) {
            $categorySync[$catId] = ['is_primary' => ($primaryCategoryId && $primaryCategoryId == $catId)];
        }
        // If no primary set but categories exist, make first one primary
        if (!$primaryCategoryId && !empty($categoryIds)) {
            $categorySync[$categoryIds[0]]['is_primary'] = true;
        }
        $article->categories()->sync($categorySync);

        // Sync tags
        $article->tags()->sync($tagIds);

        return response()->json($article->load(['publication', 'featuredMedia', 'categories', 'tags']), 201);
    }

    public function show(int $id): JsonResponse
    {
        $article = Article::with([
            'publication:id,name,slug,website_url',
            'featuredMedia:id,path,mime,alt_text,credit,caption,rights_confirmed',
            'ogMedia:id,path,mime,alt_text,credit,caption,rights_confirmed',
            'categories:id,name,slug',
            'tags:id,name,slug',
        ])->findOrFail($id);

        return response()->json($article);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $article = Article::findOrFail($id);

        $validated = $request->validate([
            'type' => ['sometimes', Rule::in(['external', 'internal'])],
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:articles,slug,' . $id,
            'summary' => 'nullable|string',
            'body_json' => 'nullable|string',
            'body_html' => 'nullable|string',
            'status' => ['sometimes', Rule::in(['draft', 'scheduled', 'published', 'archived'])],
            'published_at' => 'nullable|date',
            'scheduled_for' => 'nullable|date',
            'publication_id' => 'nullable|exists:publications,id',
            'original_url' => 'nullable|url|max:500',
            'archived_url' => 'nullable|url|max:500',
            'featured_media_id' => 'nullable|exists:media,id',
            'show_image' => 'boolean',
            'is_featured' => 'boolean',
            'featured_order' => 'nullable|integer|min:0',
            'reading_minutes' => 'nullable|integer|min:1',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
            'og_media_id' => 'nullable|exists:media,id',
            'canonical_url' => 'nullable|url|max:500',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:tags,id',
            'primary_category_id' => 'nullable|exists:categories,id',
        ]);

        // Validate external article requirements if type changed
        $type = $validated['type'] ?? $article->type;
        if ($type === 'external') {
            $pubId = $validated['publication_id'] ?? $article->publication_id;
            $origUrl = $validated['original_url'] ?? $article->original_url;
            if (!$pubId || !$origUrl) {
                return response()->json([
                    'message' => 'External articles require publication_id and original_url.',
                ], 422);
            }
        }

        // Validate internal article requirements for publishing
        $status = $validated['status'] ?? $article->status;
        if ($type === 'internal' && $status === 'published') {
            $bodyHtml = $validated['body_html'] ?? $article->body_html;
            if (!$bodyHtml) {
                return response()->json([
                    'message' => 'Internal articles require body_html when publishing.',
                ], 422);
            }
        }

        // Compute reading minutes for internal articles
        if ($type === 'internal' && isset($validated['body_html'])) {
            $wordCount = str_word_count(strip_tags($validated['body_html']));
            $validated['reading_minutes'] = max(1, (int) ceil($wordCount / 200));
        }

        // Extract relationship IDs
        $categoryIds = $validated['category_ids'] ?? null;
        $tagIds = $validated['tag_ids'] ?? null;
        $primaryCategoryId = $validated['primary_category_id'] ?? null;

        unset($validated['category_ids'], $validated['tag_ids'], $validated['primary_category_id']);

        $article->update($validated);

        // Sync categories if provided
        if ($categoryIds !== null) {
            $categorySync = [];
            foreach ($categoryIds as $catId) {
                $categorySync[$catId] = ['is_primary' => ($primaryCategoryId && $primaryCategoryId == $catId)];
            }
            if (!$primaryCategoryId && !empty($categoryIds)) {
                $categorySync[$categoryIds[0]]['is_primary'] = true;
            }
            $article->categories()->sync($categorySync);
        }

        // Sync tags if provided
        if ($tagIds !== null) {
            $article->tags()->sync($tagIds);
        }

        return response()->json($article->load(['publication', 'featuredMedia', 'categories', 'tags']));
    }

    public function destroy(int $id): JsonResponse
    {
        $article = Article::findOrFail($id);
        $article->delete();

        return response()->json(['message' => 'Article deleted.']);
    }

    // Additional actions
    public function publish(Request $request, int $id): JsonResponse
    {
        $article = Article::findOrFail($id);

        if ($article->type === 'internal' && !$article->body_html) {
            return response()->json([
                'message' => 'Cannot publish internal article without content.',
            ], 422);
        }

        $article->update([
            'status' => 'published',
            'published_at' => $article->published_at ?? now(),
            'scheduled_for' => null,
        ]);

        // Trigger revalidation webhook
        $this->triggerRevalidation($article->slug);

        return response()->json($article->load(['publication', 'featuredMedia', 'categories', 'tags']));
    }

    public function schedule(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'scheduled_for' => 'required|date|after:now',
        ]);

        $article = Article::findOrFail($id);
        $article->update([
            'status' => 'scheduled',
            'scheduled_for' => $request->scheduled_for,
        ]);

        return response()->json($article);
    }

    public function feature(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'is_featured' => 'required|boolean',
            'featured_order' => 'nullable|integer|min:0',
        ]);

        $article = Article::findOrFail($id);
        $article->update([
            'is_featured' => $request->is_featured,
            'featured_order' => $request->is_featured ? ($request->featured_order ?? 0) : null,
        ]);

        $this->triggerRevalidation('homepage');

        return response()->json($article);
    }

    private function triggerRevalidation(string $path): void
    {
        // TODO: Call Next.js revalidation webhook
        // This will be implemented when Next.js is set up
        \Log::info('Revalidation triggered', ['path' => $path]);
    }
}