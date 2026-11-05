<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Publication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Article::published()
            ->with([
                'publication:id,name,slug',
                'featuredMedia:id,path,mime,alt_text,credit,caption,rights_confirmed',
                'categories:id,name,slug',
                'tags:id,name,slug',
            ])
            ->orderBy('published_at', 'desc');

        // Filters
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('category')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        if ($request->filled('tag')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('slug', $request->tag);
            });
        }

        if ($request->filled('publication')) {
            $query->whereHas('publication', function ($q) use ($request) {
                $q->where('slug', $request->publication);
            });
        }

        if ($request->filled('year')) {
            $query->whereYear('published_at', $request->year);
        }

        if ($request->filled('q')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->q}%")
                  ->orWhere('summary', 'like', "%{$request->q}%");
            });
        }

        $perPage = min($request->integer('per_page', 20), 100);
        $articles = $query->paginate($perPage);

        // Transform for API response
        $articles->getCollection()->transform(function ($article) {
            return [
                'id' => $article->id,
                'type' => $article->type,
                'title' => $article->title,
                'slug' => $article->slug,
                'summary' => $article->summary,
                'status' => $article->status,
                'published_at' => $article->published_at?->toISOString(),
                'publication' => $article->publication ? [
                    'id' => $article->publication->id,
                    'name' => $article->publication->name,
                    'slug' => $article->publication->slug,
                ] : null,
                'original_url' => $article->original_url,
                'archived_url' => $article->archived_url,
                'featured_image' => $article->featuredMedia && $article->featuredMedia->canBePublic() ? [
                    'url' => $article->featuredMedia->url,
                    'alt_text' => $article->featuredMedia->alt_text,
                    'credit' => $article->featuredMedia->credit,
                    'caption' => $article->featuredMedia->caption,
                ] : null,
                'show_image' => $article->show_image,
                'categories' => $article->categories->map(fn($c) => ['id' => $c->id, 'name' => $c->name, 'slug' => $c->slug]),
                'tags' => $article->tags->map(fn($t) => ['id' => $t->id, 'name' => $t->name, 'slug' => $t->slug]),
                'reading_minutes' => $article->reading_minutes,
                'seo_title' => $article->seo_title,
                'seo_description' => $article->seo_description,
            ];
        });

        return response()->json($articles);
    }

    public function show(string $slug): JsonResponse
    {
        $article = Article::published()
            ->with([
                'publication:id,name,slug,website_url',
                'featuredMedia:id,path,mime,alt_text,credit,caption,rights_confirmed',
                'ogMedia:id,path,mime,alt_text,credit,caption,rights_confirmed',
                'categories:id,name,slug',
                'tags:id,name,slug',
            ])
            ->where('slug', $slug)
            ->firstOrFail();

        // Increment view count
        \App\Models\PageViewsDaily::incrementViews($article->slug, $article->id);

        $data = [
            'id' => $article->id,
            'type' => $article->type,
            'title' => $article->title,
            'slug' => $article->slug,
            'summary' => $article->summary,
            'body_html' => $article->body_html,
            'status' => $article->status,
            'published_at' => $article->published_at?->toISOString(),
            'publication' => $article->publication ? [
                'id' => $article->publication->id,
                'name' => $article->publication->name,
                'slug' => $article->publication->slug,
                'website_url' => $article->publication->website_url,
            ] : null,
            'original_url' => $article->original_url,
            'archived_url' => $article->archived_url,
            'featured_image' => $article->featuredMedia && $article->featuredMedia->canBePublic() && $article->show_image ? [
                'url' => $article->featuredMedia->url,
                'alt_text' => $article->featuredMedia->alt_text,
                'credit' => $article->featuredMedia->credit,
                'caption' => $article->featuredMedia->caption,
            ] : null,
            'og_image' => $article->ogMedia && $article->ogMedia->canBePublic() ? [
                'url' => $article->ogMedia->url,
                'alt_text' => $article->ogMedia->alt_text,
                'credit' => $article->ogMedia->credit,
            ] : null,
            'show_image' => $article->show_image,
            'categories' => $article->categories->map(fn($c) => ['id' => $c->id, 'name' => $c->name, 'slug' => $c->slug]),
            'tags' => $article->tags->map(fn($t) => ['id' => $t->id, 'name' => $t->name, 'slug' => $t->slug]),
            'reading_minutes' => $article->reading_minutes,
            'seo_title' => $article->seo_title,
            'seo_description' => $article->seo_description,
            'canonical_url' => $article->canonical_url,
        ];

        return response()->json($data);
    }
}