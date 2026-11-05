'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { api } from '@/lib/api';

interface CaseFile {
  id: number;
  title: string;
  slug: string;
  deck: string | null;
  status: string;
  case_status: string | null;
  period_start: string | null;
  period_end: string | null;
  featured_image: { url: string } | null;
}

export default function AdminCaseFilesPage() {
  const [caseFiles, setCaseFiles] = useState<CaseFile[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    q: '',
    page: 1,
  });

  useEffect(() => {
    loadCaseFiles();
  }, [filters]);

  const loadCaseFiles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.q) params.append('q', filters.q);
      params.append('page', String(filters.page));
      params.append('per_page', '20');

      const response = await api.adminGetCaseFiles(Object.fromEntries(params));
      setCaseFiles(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
      });
    } catch (error) {
      console.error('Failed to load case files:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    published: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
  };

  const caseStatusColors: Record<string, string> = {
    complete: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Case Files</h1>
          <p className="text-muted mt-1">Manage investigative case files and special projects.</p>
        </div>
        <Link href="/admin/case-files/new" className="btn btn-primary">
          + New Case File
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
        </select>

        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search case files..."
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })}
            className="input w-full"
          />
        </div>
      </div>

      {/* Case Files Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted">Loading...</div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-hairline bg-manila">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Case File</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Investigation Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Period</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {caseFiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted">
                      No case files found.
                    </td>
                  </tr>
                ) : (
                  caseFiles.map((cf) => (
                    <tr key={cf.id} className="hover:bg-white/50">
                      <td className="px-4 py-4">
                        <Link
                          href={`/admin/case-files/${cf.id}`}
                          className="font-medium hover:underline"
                        >
                          {cf.title}
                        </Link>
                        <p className="text-sm text-muted truncate max-w-xs mt-1">{cf.slug}</p>
                        {cf.deck && <p className="text-sm text-muted mt-1">{cf.deck}</p>}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-none ${statusColors[cf.status] || 'bg-gray-100 text-gray-800'}`}>
                          {cf.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {cf.case_status && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-none ${caseStatusColors[cf.case_status] || 'bg-gray-100 text-gray-800'}`}>
                            {cf.case_status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-muted">
                        {cf.period_start && format(new Date(cf.period_start), 'MMM yyyy')}
                        {cf.period_start && cf.period_end && ' – '}
                        {cf.period_end && format(new Date(cf.period_end), 'MMM yyyy')}
                        {(!cf.period_start && !cf.period_end) && '—'}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/case-files/${cf.id}`}
                            className="btn btn-secondary text-sm py-1 px-3"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/case-files/${cf.slug}`}
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

            {pagination && pagination.last_page > 1 && (
              <div className="px-4 py-4 border-t border-hairline flex items-center justify-between">
                <p className="text-sm text-muted">
                  Showing {((pagination.current_page - 1) * 20) + 1} to{' '}
                  {Math.min(pagination.current_page * 20, pagination.total)} of{' '}
                  {pagination.total} case files
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