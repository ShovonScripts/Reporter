<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CaseFile;
use App\Models\Article;
use Illuminate\Http\JsonResponse;

class CaseFileController extends Controller
{
    public function index(): JsonResponse
    {
        $caseFiles = CaseFile::published()
            ->with([
                'featuredMedia:id,path,mime,alt_text,credit,caption,rights_confirmed',
                'parts.article:id,type,title,slug,summary,published_at,publication_id',
                'parts.article.publication:id,name,slug',
            ])
            ->orderBy('period_start', 'desc')
            ->get();

        return response()->json($caseFiles->map(function ($caseFile) {
            return $this->transformCaseFile($caseFile);
        }));
    }

    public function show(string $slug): JsonResponse
    {
        $caseFile = CaseFile::published()
            ->with([
                'featuredMedia:id,path,mime,alt_text,credit,caption,rights_confirmed',
                'ogMedia:id,path,mime,alt_text,credit,caption,rights_confirmed',
                'parts' => function ($query) {
                    $query->with([
                        'article:id,type,title,slug,summary,published_at,publication_id,original_url,archived_url',
                        'article.publication:id,name,slug',
                    ])->orderBy('position');
                },
                'timeline' => function ($query) {
                    $query->orderBy('position');
                },
                'documents' => function ($query) {
                    $query->with('media:id,path,mime,alt_text,credit,caption,rights_confirmed')
                          ->where('is_public', true)
                          ->orderBy('position');
                },
            ])
            ->where('slug', $slug)
            ->firstOrFail();

        // Increment view count
        \App\Models\PageViewsDaily::incrementViews($caseFile->slug, null);

        return response()->json($this->transformCaseFile($caseFile, true));
    }

    private function transformCaseFile(CaseFile $caseFile, bool $detailed = false): array
    {
        $data = [
            'id' => $caseFile->id,
            'title' => $caseFile->title,
            'slug' => $caseFile->slug,
            'deck' => $caseFile->deck,
            'status' => $caseFile->status,
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

        if ($detailed) {
            $data = array_merge($data, [
                'overview_html' => $caseFile->overview_html,
                'methods_html' => $caseFile->methods_html,
                'impact_html' => $caseFile->impact_html,
                'parts' => $caseFile->parts->map(function ($part) {
                    return [
                        'id' => $part->id,
                        'position' => $part->position,
                        'note' => $part->note,
                        'article' => $part->article ? [
                            'id' => $part->article->id,
                            'type' => $part->article->type,
                            'title' => $part->article->title,
                            'slug' => $part->article->slug,
                            'summary' => $part->article->summary,
                            'published_at' => $part->article->published_at?->toISOString(),
                            'publication' => $part->article->publication ? [
                                'id' => $part->article->publication->id,
                                'name' => $part->article->publication->name,
                                'slug' => $part->article->publication->slug,
                            ] : null,
                            'original_url' => $part->article->original_url,
                            'archived_url' => $part->article->archived_url,
                        ] : null,
                    ];
                }),
                'timeline' => $caseFile->timeline->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'date' => $item->date->toDateString(),
                        'text' => $item->text,
                        'position' => $item->position,
                    ];
                }),
                'documents' => $caseFile->documents->map(function ($doc) {
                    return [
                        'id' => $doc->id,
                        'title' => $doc->title,
                        'type' => $doc->type,
                        'url' => $doc->url,
                        'media' => $doc->media && $doc->media->canBePublic() ? [
                            'url' => $doc->media->url,
                            'alt_text' => $doc->media->alt_text,
                            'credit' => $doc->media->credit,
                        ] : null,
                        'position' => $doc->position,
                    ];
                }),
                'seo_title' => $caseFile->seo_title,
                'seo_description' => $caseFile->seo_description,
                'og_image' => $caseFile->ogMedia && $caseFile->ogMedia->canBePublic() ? [
                    'url' => $caseFile->ogMedia->url,
                    'alt_text' => $caseFile->ogMedia->alt_text,
                    'credit' => $caseFile->ogMedia->credit,
                ] : null,
            ]);
        }

        return $data;
    }
}