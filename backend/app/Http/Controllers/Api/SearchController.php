<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\CaseFile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $query = $request->string('q')->trim();

        if ($query->isEmpty()) {
            return response()->json([
                'articles' => [],
                'case_files' => [],
            ]);
        }

        $searchTerm = $query->value();
        $like = '%' . $searchTerm . '%';
        $driver = DB::connection()->getDriverName();
        $supportsFullText = in_array($driver, ['mysql', 'mariadb'], true);

        // Search articles (FULLTEXT on MySQL, LIKE fallback elsewhere e.g. SQLite)
        $articlesQuery = Article::published()
            ->with([
                'publication:id,name,slug',
                'featuredMedia:id,path,mime,alt_text,credit,caption,rights_confirmed',
                'categories:id,name,slug',
            ]);

        if ($supportsFullText) {
            $articlesQuery
                ->whereRaw("MATCH(title, summary) AGAINST(? IN NATURAL LANGUAGE MODE)", [$searchTerm])
                ->orderByRaw("MATCH(title, summary) AGAINST(? IN NATURAL LANGUAGE MODE) DESC", [$searchTerm]);
        } else {
            $articlesQuery
                ->where(function ($q) use ($like) {
                    $q->where('title', 'like', $like)
                      ->orWhere('summary', 'like', $like);
                })
                ->orderByDesc('published_at');
        }

        $articles = $articlesQuery->limit(20)->get()
            ->map(function ($article) {
                return [
                    'id' => $article->id,
                    'type' => $article->type,
                    'title' => $article->title,
                    'slug' => $article->slug,
                    'summary' => $article->summary,
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
                    'categories' => $article->categories->map(fn($c) => ['id' => $c->id, 'name' => $c->name, 'slug' => $c->slug]),
                ];
            });

        // Search case files (FULLTEXT on MySQL, LIKE fallback elsewhere)
        $caseFilesQuery = CaseFile::published()
            ->with([
                'featuredMedia:id,path,mime,alt_text,credit,caption,rights_confirmed',
            ]);

        if ($supportsFullText) {
            $caseFilesQuery
                ->whereRaw("MATCH(title, deck, overview_html) AGAINST(? IN NATURAL LANGUAGE MODE)", [$searchTerm])
                ->orderByRaw("MATCH(title, deck, overview_html) AGAINST(? IN NATURAL LANGUAGE MODE) DESC", [$searchTerm]);
        } else {
            $caseFilesQuery
                ->where(function ($q) use ($like) {
                    $q->where('title', 'like', $like)
                      ->orWhere('deck', 'like', $like)
                      ->orWhere('overview_html', 'like', $like);
                })
                ->orderByDesc('period_start');
        }

        $caseFiles = $caseFilesQuery->limit(10)->get()
            ->map(function ($caseFile) {
                return [
                    'id' => $caseFile->id,
                    'title' => $caseFile->title,
                    'slug' => $caseFile->slug,
                    'deck' => $caseFile->deck,
                    'case_status' => $caseFile->case_status,
                    'period_start' => $caseFile->period_start?->toDateString(),
                    'period_end' => $caseFile->period_end?->toDateString(),
                    'featured_image' => $caseFile->featuredMedia && $caseFile->featuredMedia->canBePublic() ? [
                        'url' => $caseFile->featuredMedia->url,
                        'alt_text' => $caseFile->featuredMedia->alt_text,
                        'credit' => $caseFile->featuredMedia->credit,
                        'caption' => $caseFile->featuredMedia->caption,
                    ] : null,
                ];
            });

        return response()->json([
            'articles' => $articles,
            'case_files' => $caseFiles,
        ]);
    }
}