<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PageViewsDaily;
use App\Models\ReferrersDaily;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function track(Request $request): JsonResponse
    {
        $request->validate([
            'path' => 'required|string|max:500',
            'article_id' => 'nullable|integer|exists:articles,id',
            'referrer' => 'nullable|string|max:500',
        ]);

        $path = $request->path;
        $articleId = $request->article_id;
        $referrer = $request->referrer;

        // Increment page view
        PageViewsDaily::incrementViews($path, $articleId);

        // Increment unique visitor (simple approach - could use salted hash of IP + user agent)
        // For now, we'll increment on every request - can be improved later
        PageViewsDaily::incrementUniqueVisitors($path, $articleId);

        // Track referrer if provided
        if ($referrer) {
            $source = $this->parseReferrer($referrer);
            ReferrersDaily::incrementViews($source);
        }

        return response()->json(['success' => true]);
    }

    private function parseReferrer(string $referrer): string
    {
        try {
            $url = parse_url($referrer);
            $host = $url['host'] ?? 'direct';

            // Remove www. prefix
            $host = preg_replace('/^www\./', '', $host);

            // Group common referrers
            $knownReferrers = [
                'google.com' => 'Google',
                'bing.com' => 'Bing',
                'duckduckgo.com' => 'DuckDuckGo',
                'yahoo.com' => 'Yahoo',
                'facebook.com' => 'Facebook',
                'twitter.com' => 'Twitter',
                't.co' => 'Twitter',
                'linkedin.com' => 'LinkedIn',
                'reddit.com' => 'Reddit',
                'newsletter' => 'Newsletter',
            ];

            foreach ($knownReferrers as $domain => $name) {
                if (str_contains($host, $domain)) {
                    return $name;
                }
            }

            return $host;
        } catch (\Throwable) {
            return 'unknown';
        }
    }
}