<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PageViewsDaily;
use App\Models\ReferrersDaily;
use App\Models\Article;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $days = $request->integer('days', 30);
        $startDate = now()->subDays($days)->toDateString();

        // Total page views
        $totalViews = PageViewsDaily::where('date', '>=', $startDate)->sum('views');
        $totalUnique = PageViewsDaily::where('date', '>=', $startDate)->sum('unique_visitors');

        // Views by day
        $viewsByDay = PageViewsDaily::where('date', '>=', $startDate)
            ->select('date', DB::raw('SUM(views) as views'), DB::raw('SUM(unique_visitors) as unique_visitors'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Top articles
        $topArticles = PageViewsDaily::where('date', '>=', $startDate)
            ->whereNotNull('article_id')
            ->select('article_id', DB::raw('SUM(views) as views'))
            ->groupBy('article_id')
            ->orderByDesc('views')
            ->limit(10)
            ->with('article:id,title,slug,type,published_at')
            ->get();

        // Top referrers
        $topReferrers = ReferrersDaily::where('date', '>=', $startDate)
            ->select('source', DB::raw('SUM(views) as views'))
            ->groupBy('source')
            ->orderByDesc('views')
            ->limit(10)
            ->get();

        // Top pages
        $topPages = PageViewsDaily::where('date', '>=', $startDate)
            ->select('path', DB::raw('SUM(views) as views'))
            ->groupBy('path')
            ->orderByDesc('views')
            ->limit(20)
            ->get();

        return response()->json([
            'period' => [
                'days' => $days,
                'start_date' => $startDate,
                'end_date' => now()->toDateString(),
            ],
            'totals' => [
                'views' => $totalViews,
                'unique_visitors' => $totalUnique,
            ],
            'views_by_day' => $viewsByDay,
            'top_articles' => $topArticles,
            'top_referrers' => $topReferrers,
            'top_pages' => $topPages,
        ]);
    }

    public function articles(Request $request): JsonResponse
    {
        $days = $request->integer('days', 30);
        $startDate = now()->subDays($days)->toDateString();

        $query = PageViewsDaily::where('date', '>=', $startDate)
            ->whereNotNull('article_id')
            ->select('article_id', DB::raw('SUM(views) as views'), DB::raw('SUM(unique_visitors) as unique_visitors'))
            ->groupBy('article_id')
            ->orderByDesc('views');

        $perPage = min($request->integer('per_page', 50), 100);
        $articles = $query->with('article:id,title,slug,type,published_at')
            ->paginate($perPage);

        return response()->json($articles);
    }
}