'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Subscriber {
  id: number;
  email: string;
  status: 'pending' | 'confirmed' | 'unsubscribed' | 'bounced';
  source: string | null;
  confirmed_at: string | null;
  consent_text_version: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  unsubscribed: 'bg-gray-100 text-gray-800',
  bounced: 'bg-red-100 text-red-800',
};

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', q: '', page: 1 });

  const loadSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.q) params.append('q', filters.q);
      params.append('page', String(filters.page));
      params.append('per_page', '50');

      const response = await api.adminGetSubscribers(Object.fromEntries(params));
      setSubscribers(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
      });
    } catch (error) {
      console.error('Failed to load subscribers:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadSubscribers();
  }, [loadSubscribers]);

  const handleExport = async () => {
    try {
      const response = await api.adminExportSubscribers(filters.status || undefined);
      const data = response.data;
      if (!data.length) {
        alert('No subscribers to export');
        return;
      }

      const headers = ['email', 'confirmed_at', 'source', 'consent_text_version'];
      const rows = data.map((s: any) => [
        s.email,
        s.confirmed_at || '',
        s.source || '',
        s.consent_text_version || '',
      ]);
      const csv = [headers.join(','), ...rows.map((r: string[]) => r.map(v => `"${v}"`).join(','))].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `subscribers-${filters.status || 'all'}-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this subscriber?')) return;
    try {
      await api.adminDeleteSubscriber(id);
      loadSubscribers();
    } catch (err) {
      console.error('Failed to delete subscriber:', err);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscribers</h1>
          <p className="text-muted mt-1">Manage newsletter subscribers.</p>
        </div>
        <button onClick={handleExport} className="btn btn-secondary">
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-4 p-4">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
          className="input w-auto"
        >
          <option value="">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="unsubscribed">Unsubscribed</option>
          <option value="bounced">Bounced</option>
        </select>
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search email..."
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })}
            className="input w-full"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted">Loading...</div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-hairline bg-manila">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Source</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Confirmed</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Joined</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted">
                      No subscribers found.
                    </td>
                  </tr>
                ) : (
                  subscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-white/50">
                      <td className="px-4 py-4 font-medium">{sub.email}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-none ${statusColors[sub.status]}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted">{sub.source || '—'}</td>
                      <td className="px-4 py-4 text-sm">{formatDate(sub.confirmed_at)}</td>
                      <td className="px-4 py-4 text-sm text-muted">{formatDate(sub.created_at)}</td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="btn btn-secondary text-sm py-1 px-3 text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {pagination && pagination.last_page > 1 && (
              <div className="px-4 py-4 border-t border-hairline flex items-center justify-between">
                <p className="text-sm text-muted">
                  Showing {((pagination.current_page - 1) * 50) + 1} to{' '}
                  {Math.min(pagination.current_page * 50, pagination.total)} of{' '}
                  {pagination.total} subscribers
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