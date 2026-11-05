'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Tag {
  id: number;
  name: string;
  slug: string;
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '' });
  const [error, setError] = useState('');

  const loadTags = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.adminGetTags();
      setTags(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
      });
    } catch (error) {
      console.error('Failed to load tags:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const openCreate = () => {
    setEditing(null);
    setFormData({ name: '', slug: '' });
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (tag: Tag) => {
    setEditing(tag);
    setFormData({ name: tag.name, slug: tag.slug });
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
      };

      if (editing) {
        await api.adminUpdateTag(editing.id, payload);
      } else {
        await api.adminCreateTag(payload);
      }

      setDialogOpen(false);
      loadTags();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save tag');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this tag?')) return;
    try {
      await api.adminDeleteTag(id);
      loadTags();
    } catch (err) {
      console.error('Failed to delete tag:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tags</h1>
          <p className="text-muted mt-1">Manage article tags.</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          + New Tag
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
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {tags.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center text-muted">
                      No tags found.
                    </td>
                  </tr>
                ) : (
                  tags.map((tag) => (
                    <tr key={tag.id} className="hover:bg-white/50">
                      <td className="px-4 py-4 font-medium">{tag.name}</td>
                      <td className="px-4 py-4 text-sm text-muted font-mono">{tag.slug}</td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(tag)}
                            className="btn btn-secondary text-sm py-1 px-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(tag.id)}
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
                  {pagination.total} tags
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadTags()}
                    disabled={pagination.current_page === 1}
                    className="btn btn-secondary text-sm py-1 px-3"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => loadTags()}
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
            <h2 className="text-xl font-bold">{editing ? 'Edit Tag' : 'New Tag'}</h2>
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
                  maxLength={100}
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
                  maxLength={100}
                  placeholder="Auto-generated from name"
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