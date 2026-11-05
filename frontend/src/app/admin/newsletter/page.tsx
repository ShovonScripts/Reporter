'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { api } from '@/lib/api';

interface NewsletterIssue {
  id: number;
  subject: string;
  preview_text: string | null;
  body_html: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent';
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-blue-100 text-blue-800',
  sending: 'bg-yellow-100 text-yellow-800',
  sent: 'bg-green-100 text-green-800',
};

export default function AdminNewsletterPage() {
  const [issues, setIssues] = useState<NewsletterIssue[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', page: 1 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<NewsletterIssue | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    preview_text: '',
    body_html: '',
    status: 'draft' as 'draft' | 'scheduled' | 'sending' | 'sent',
    scheduled_for: '',
  });
  const [error, setError] = useState('');

  const loadIssues = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      params.append('page', String(filters.page));
      params.append('per_page', '20');

      const response = await api.adminGetNewsletterIssues(Object.fromEntries(params));
      setIssues(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
      });
    } catch (error) {
      console.error('Failed to load newsletter issues:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  const openCreate = () => {
    setEditing(null);
    setFormData({ subject: '', preview_text: '', body_html: '', status: 'draft', scheduled_for: '' });
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (issue: NewsletterIssue) => {
    setEditing(issue);
    setFormData({
      subject: issue.subject,
      preview_text: issue.preview_text || '',
      body_html: issue.body_html,
      status: issue.status === 'sent' ? 'draft' : issue.status,
      scheduled_for: issue.scheduled_for ? issue.scheduled_for.slice(0, 16) : '',
    });
    setError('');
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const payload = {
        subject: formData.subject,
        preview_text: formData.preview_text || undefined,
        body_html: formData.body_html,
        status: formData.status,
        scheduled_for: formData.scheduled_for || undefined,
      };

      if (editing) {
        await api.adminUpdateNewsletterIssue(editing.id, payload);
      } else {
        await api.adminCreateNewsletterIssue(payload);
      }

      setDialogOpen(false);
      loadIssues();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save issue');
    }
  };

  const handleSend = async (id: number) => {
    if (!confirm('Send this newsletter to all confirmed subscribers?')) return;
    try {
      await api.adminSendNewsletterIssue(id);
      loadIssues();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send');
    }
  };

  const handleSchedule = async (id: number, scheduledFor: string) => {
    if (!confirm('Schedule this newsletter?')) return;
    try {
      await api.adminScheduleNewsletterIssue(id, scheduledFor);
      loadIssues();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to schedule');
    }
  };

  const handleTestSend = async (id: number) => {
    const email = prompt('Test email address:');
    if (!email) return;
    try {
      await api.adminTestSendNewsletterIssue(id, email);
      alert('Test email sent (logged only)');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send test');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this newsletter issue?')) return;
    try {
      await api.adminDeleteNewsletterIssue(id);
      loadIssues();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return format(new Date(date), 'MMM d, yyyy HH:mm');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Newsletter</h1>
          <p className="text-muted mt-1">Manage newsletter issues. Note: email sending is logged only.</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          + New Issue
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
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="sending">Sending</option>
          <option value="sent">Sent</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted">Loading...</div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-hairline bg-manila">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Subject</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Scheduled</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Sent</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Created</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {issues.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted">
                      No newsletter issues found.
                    </td>
                  </tr>
                ) : (
                  issues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-white/50">
                      <td className="px-4 py-4 max-w-md">
                        <Link href={`/admin/newsletter/${issue.id}`} className="font-medium hover:underline">
                          {issue.subject}
                        </Link>
                        {issue.preview_text && (
                          <p className="text-sm text-muted truncate mt-1">{issue.preview_text}</p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-none ${statusColors[issue.status]}`}>
                          {issue.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">{formatDate(issue.scheduled_for)}</td>
                      <td className="px-4 py-4 text-sm">{formatDate(issue.sent_at)}</td>
                      <td className="px-4 py-4 text-sm text-muted">{formatDate(issue.created_at)}</td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/newsletter/${issue.id}`}
                            className="btn btn-secondary text-sm py-1 px-3"
                          >
                            Edit
                          </Link>
                          {issue.status === 'draft' && (
                            <>
                              <button
                                onClick={() => handleSend(issue.id)}
                                className="btn btn-primary text-sm py-1 px-3"
                              >
                                Send Now
                              </button>
                              <button
                                onClick={() => {
                                  const when = prompt('Schedule for (YYYY-MM-DD HH:MM):', new Date(Date.now() + 3600000).toISOString().slice(0, 16));
                                  if (when) handleSchedule(issue.id, when);
                                }}
                                className="btn btn-secondary text-sm py-1 px-3"
                              >
                                Schedule
                              </button>
                            </>
                          )}
                          {issue.status === 'scheduled' && (
                            <button
                              onClick={() => handleSend(issue.id)}
                              className="btn btn-primary text-sm py-1 px-3"
                            >
                              Send Now
                            </button>
                          )}
                          <button
                            onClick={() => handleTestSend(issue.id)}
                            className="btn btn-secondary text-sm py-1 px-3"
                          >
                            Test
                          </button>
                          <button
                            onClick={() => handleDelete(issue.id)}
                            className="btn btn-secondary text-sm py-1 px-3 text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
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
                  {pagination.total} issues
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

      {dialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-none w-full max-w-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold">{editing ? 'Edit Issue' : 'New Issue'}</h2>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="input w-full"
                  required
                  maxLength={255}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Preview Text</label>
                <input
                  type="text"
                  value={formData.preview_text}
                  onChange={(e) => setFormData({ ...formData, preview_text: e.target.value })}
                  className="input w-full"
                  maxLength={255}
                  placeholder="Shown in inbox preview"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Body HTML *</label>
                <textarea
                  value={formData.body_html}
                  onChange={(e) => setFormData({ ...formData, body_html: e.target.value })}
                  className="input w-full font-mono text-sm"
                  rows={15}
                  required
                  spellCheck={false}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'scheduled' })}
                    className="input w-full"
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Scheduled For</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduled_for}
                    onChange={(e) => setFormData({ ...formData, scheduled_for: e.target.value })}
                    className="input w-full"
                    disabled={formData.status !== 'scheduled'}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editing ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}