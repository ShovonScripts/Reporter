'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  position: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', position: '' });
  const [error, setError] = useState('');

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.adminGetCategories();
      setCategories(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
      });
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const openCreate = () => {
    setEditing(null);
    setFormData({ name: '', slug: '', description: '', position: '' });
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      position: String(category.position),
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
        description: formData.description || undefined,
        position: formData.position ? Number(formData.position) : undefined,
      };

      if (editing) {
        await api.adminUpdateCategory(editing.id, payload);
      } else {
        await api.adminCreateCategory(payload);
      }

      setDialogOpen(false);
      loadCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.adminDeleteCategory(id);
      loadCategories();
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted mt-1">Manage article categories.</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          + New Category
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
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Position</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-white/50">
                      <td className="px-4 py-4 font-medium">{cat.name}</td>
                      <td className="px-4 py-4 text-sm text-muted font-mono">{cat.slug}</td>
                      <td className="px-4 py-4 text-sm text-muted max-w-xs truncate">
                        {cat.description || '—'}
                      </td>
                      <td className="px-4 py-4 text-sm">{cat.position}</td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(cat)}
                            className="btn btn-secondary text-sm py-1 px-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
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
                  {pagination.total} categories
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadCategories()}
                    disabled={pagination.current_page === 1}
                    className="btn btn-secondary text-sm py-1 px-3"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => loadCategories()}
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
            <h2 className="text-xl font-bold">
              {editing ? 'Edit Category' : 'New Category'}
            </h2>
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
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input w-full"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Position</label>
                <input
                  type="number"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="input w-full"
                  min="0"
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