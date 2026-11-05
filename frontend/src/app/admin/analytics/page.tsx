'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { api } from '@/lib/api';

interface AnalyticsSummary {
  period: { days: number; start_date: string; end_date: string };
  totals: { views: number; unique_visitors: number };
  views_by_day: { date: string; views: number; unique_visitors: number }[];
  top_articles: { article_id: number; views: number; article: { id: number; title: string; slug: string; type: string; published_at: string | null } | null }[];
  top_referrers: { source: string; views: number }[];
  top_pages: { path: string; views: number }[];
}

interface AnalyticsArticle {
  article_id: number;
  views: number;
  unique_visitors: number;
  article: { id: number; title: string; slug: string; type: string; published_at: string | null } | null;
}

export default function AdminAnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [articles, setArticles] = useState<AnalyticsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [articlePage, setArticlePage] = useState(1);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.adminGetAnalyticsSummary(days);
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to load analytics summary:', error);
    } finally {
      setLoading(false);
    }
  }, [days]);

  const loadArticles = useCallback(async () => {
    try {
      const response = await api.adminGetAnalyticsArticles({ days, page: articlePage, per_page: 20 });
      setArticles(response.data.data);
    } catch (error) {
      console.error('Failed to load analytics articles:', error);
    }
  }, [days, articlePage]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const formatNumber = (n: number) => n.toLocaleString();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted mt-1">Site traffic overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">Period:</span>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="input w-auto"
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
            <option value={365}>365 days</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted">Loading...</div>
      ) : summary ? (
        <>
          {/* Totals */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="card p-6">
              <p className="text-sm text-muted">Total Views</p>
              <p className="text-3xl font-bold mt-1">{formatNumber(summary.totals.views)}</p>
            </div>
            <div className="card p-6">
              <p className="text-sm text-muted">Unique Visitors</p>
              <p className="text-3xl font-bold mt-1">{formatNumber(summary.totals.unique_visitors)}</p>
            </div>
            <div className="card p-6">
              <p className="text-sm text-muted">Top Articles</p>
              <p className="text-3xl font-bold mt-1">{summary.top_articles.length}</p>
            </div>
            <div className="card p-6">
              <p className="text-sm text-muted">Top Referrers</p>
              <p className="text-3xl font-bold mt-1">{summary.top_referrers.length}</p>
            </div>
          </div>

          {/* Views by day */}
          <div className="card">
            <div className="p-4 border-b border-hairline">
              <h2 className="text-lg font-bold">Views by Day</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-hairline bg-manila">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted">Date</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted">Views</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted">Unique Visitors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {summary.views_by_day.slice().reverse().map((day) => (
                    <tr key={day.date} className="hover:bg-white/50">
                      <td className="px-4 py-3 text-sm font-mono">{day.date}</td>
                      <td className="px-4 py-3 text-right text-sm">{formatNumber(day.views)}</td>
                      <td className="px-4 py-3 text-right text-sm text-muted">{formatNumber(day.unique_visitors)}</td>
                    </tr>
                  ))}
                  {summary.views_by_day.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-muted">No data for this period.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top articles */}
          <div className="card">
            <div className="p-4 border-b border-hairline">
              <h2 className="text-lg font-bold">Top Articles</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-hairline bg-manila">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted">Article</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted">Type</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted">Views</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted">Unique</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {summary.top_articles.map((item) => (
                    <tr key={item.article_id} className="hover:bg-white/50">
                      <td className="px-4 py-3">
                        {item.article ? (
                          <Link href={`/archive/${item.article.slug}`} target="_blank" className="font-medium hover:underline">
                            {item.article.title}
                          </Link>
                        ) : (
                          <span className="text-muted">(deleted)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {item.article?.type === 'external' ? 'External' : 'Original'}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">{formatNumber(item.views)}</td>
                      <td className="px-4 py-3 text-right text-sm text-muted">—</td>
                    </tr>
                  ))}
                  {summary.top_articles.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted">No article views.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed articles pagination */}
          <div className="card">
            <div className="p-4 border-b border-hairline">
              <h2 className="text-lg font-bold">All Article Views</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-hairline bg-manila">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted">Article</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted">Type</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted">Views</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted">Unique</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {articles.map((item) => (
                    <tr key={item.article_id} className="hover:bg-white/50">
                      <td className="px-4 py-3">
                        {item.article ? (
                          <Link href={`/archive/${item.article.slug}`} target="_blank" className="font-medium hover:underline">
                            {item.article.title}
                          </Link>
                        ) : (
                          <span className="text-muted">(deleted)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {item.article?.type === 'external' ? 'External' : 'Original'}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">{formatNumber(item.views)}</td>
                      <td className="px-4 py-3 text-right text-sm text-muted">{formatNumber(item.unique_visitors)}</td>
                    </tr>
                  ))}
                  {articles.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted">No data.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination for detailed articles */}
            <div className="px-4 py-4 border-t border-hairline flex items-center justify-between">
              <button
                onClick={() => setArticlePage(p => p - 1)}
                disabled={articlePage === 1}
                className="btn btn-secondary text-sm py-1 px-3"
              >
                Previous
              </button>
              <button
                onClick={() => setArticlePage(p => p + 1)}
                className="btn btn-secondary text-sm py-1 px-3"
              >
                Next
              </button>
            </div>
          </div>

          {/* Top referrers */}
          <div className="card">
            <div className="p-4 border-b border-hairline">
              <h2 className="text-lg font-bold">Top Referrers</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-hairline bg-manila">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted">Source</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted">Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {summary.top_referrers.map((ref, i) => (
                    <tr key={i} className="hover:bg-white/50">
                      <td className="px-4 py-3 text-sm">{ref.source || 'Direct'}</td>
                      <td className="px-4 py-3 text-right text-sm">{formatNumber(ref.views)}</td>
                    </tr>
                  ))}
                  {summary.top_referrers.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-muted">No referrer data.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top pages */}
          <div className="card">
            <div className="p-4 border-b border-hairline">
              <h2 className="text-lg font-bold">Top Pages</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-hairline bg-manila">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted">Path</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted">Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {summary.top_pages.map((page, i) => (
                    <tr key={i} className="hover:bg-white/50">
                      <td className="px-4 py-3 text-sm font-mono">{page.path}</td>
                      <td className="px-4 py-3 text-right text-sm">{formatNumber(page.views)}</td>
                    </tr>
                  ))}
                  {summary.top_pages.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-muted">No page view data.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}