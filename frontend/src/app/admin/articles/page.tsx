'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { api } from '@/lib/api';

interface Article {
  id: number;
  type: 'external' | 'internal';
  title: string;
  slug: string;
  status: string;
  published_at: string | null;
  publication: { id: number; name: string; slug: string } | null;
  featured_image: { url: string } | null;
  is_featured: boolean;
  categories: { id: number; name: string; slug: string }[];
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    q: '',
    page: 1,
  });

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.q) params.append('q', filters.q);
      params.append('page', String(filters.page));
      params.append('per_page', '20');

      const response = await api.adminGetArticles(Object.fromEntries(params));
      setArticles(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
      });
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const statusColors: Record<string, string> = {
    published: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-blue-100 text-blue-800',
    archived: 'bg-gray-100 text-gray-600',
  };

  const typeBadges: Record<string, string> = {
    external: 'badge-external',
    internal: 'badge-internal',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Articles</h1>
          <p className="text-muted mt-1">Manage all articles — external publications and original writing.</p>
        </div>
        <Link href="/admin/articles/new" className="btn btn-primary">
          + New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-4 p-4">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
          className="input w-auto"
        >
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="archived">Archived</option>
        </select>

        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
          className="input w-auto"
        >
          <option value="">All Types</option>
          <option value="external">External</option>
          <option value="internal">Internal</option>
        </select>

        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search articles..."
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })}
            className="input w-full"
          />
        </div>
      </div>

      {/* Articles Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted">Loading...</div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-hairline bg-manila">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Article</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Published</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Publication</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Featured</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {articles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted">
                      No articles found.
                    </td>
                  </tr>
                ) : (
                  articles.map((article) => (
                    <tr key={article.id} className="hover:bg-white/50">
                      <td className="px-4 py-4">
                        <Link
                          href={`/admin/articles/${article.id}`}
                          className="font-medium hover:underline"
                        >
                          {article.title}
                        </Link>
                        <p className="text-sm text-muted truncate max-w-xs mt-1">{article.slug}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {article.categories.map((cat) => (
                            <span key={cat.id} className="font-mono text-xs px-2 py-0.5 border border-hairline">
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`badge ${typeBadges[article.type]}`}>
                          {article.type === 'external' ? 'External' : 'Original'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-none ${statusColors[article.status] || 'bg-gray-100 text-gray-800'}`}>
                          {article.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {article.published_at
                          ? format(new Date(article.published_at), 'MMM d, yyyy')
                          : '—'}
                      </td>
                      <td className="px-4 py-4 text-sm text-muted">
                        {article.publication?.name || '—'}
                      </td>
                      <td className="px-4 py-4">
                        {article.is_featured ? (
                          <span className="text-accent font-medium">★ Featured</span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/articles/${article.id}`}
                            className="btn btn-secondary text-sm py-1 px-3"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/archive/${article.slug}`}
                            target="_blank"
                            className="btn btn-secondary text-sm py-1 px-3"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="px-4 py-4 border-t border-hairline flex items-center justify-between">
                <p className="text-sm text-muted">
                  Showing {((pagination.current_page - 1) * 20) + 1} to{' '}
                  {Math.min(pagination.current_page * 20, pagination.total)} of{' '}
                  {pagination.total} articles
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters({ ...filters, page: pagination.current_page - 1 })}
                    disabled={pagination.current_page === 1}
                    className="btn btn-secondary text-sm py-1 px-3"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, page: pagination.current_page + 1 })}
                    disabled={pagination.current_page === pagination.last_page}
                    className="btn btn-secondary text-sm py-1 px-3"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}