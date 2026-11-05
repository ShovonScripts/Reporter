'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Publication {
  id: number;
  name: string;
  slug: string;
  website_url: string | null;
}

export default function AdminPublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Publication | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', website_url: '' });
  const [error, setError] = useState('');

  const loadPublications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.adminGetPublications();
      setPublications(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
      });
    } catch (error) {
      console.error('Failed to load publications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPublications();
  }, [loadPublications]);

  const openCreate = () => {
    setEditing(null);
    setFormData({ name: '', slug: '', website_url: '' });
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (pub: Publication) => {
    setEditing(pub);
    setFormData({
      name: pub.name,
      slug: pub.slug,
      website_url: pub.website_url || '',
    });
    setError('');
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const payload = {
        name: formData.name,
        slug: formData.slug || undefined,
        website_url: formData.website_url || undefined,
      };

      if (editing) {
        await api.adminUpdatePublication(editing.id, payload);
      } else {
        await api.adminCreatePublication(payload);
      }

      setDialogOpen(false);
      loadPublications();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save publication');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this publication?')) return;
    try {
      await api.adminDeletePublication(id);
      loadPublications();
    } catch (err) {
      console.error('Failed to delete publication:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Publications</h1>
          <p className="text-muted mt-1">Manage external publications.</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          + New Publication
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted">Loading...</div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-hairline bg-manila">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Slug</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Website</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {publications.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-muted">
                      No publications found.
                    </td>
                  </tr>
                ) : (
                  publications.map((pub) => (
                    <tr key={pub.id} className="hover:bg-white/50">
                      <td className="px-4 py-4 font-medium">{pub.name}</td>
                      <td className="px-4 py-4 text-sm text-muted font-mono">{pub.slug}</td>
                      <td className="px-4 py-4 text-sm text-muted max-w-xs truncate">
                        {pub.website_url ? (
                          <a href={pub.website_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                            {pub.website_url}
                          </a>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(pub)}
                            className="btn btn-secondary text-sm py-1 px-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(pub.id)}
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
                  Showing {((pagination.current_page - 1) * 50) + 1} to{' '}
                  {Math.min(pagination.current_page * 50, pagination.total)} of{' '}
                  {pagination.total} publications
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadPublications()}
                    disabled={pagination.current_page === 1}
                    className="btn btn-secondary text-sm py-1 px-3"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => loadPublications()}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-none w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-bold">{editing ? 'Edit Publication' : 'New Publication'}</h2>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input w-full"
                  required
                  maxLength={255}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="input w-full"
                  maxLength={255}
                  placeholder="Auto-generated from name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Website URL</label>
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  className="input w-full"
                  maxLength={500}
                />
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