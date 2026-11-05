'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Kind = 'career' | 'education' | 'recognition';

interface ProfileEntry {
  id: number;
  kind: Kind;
  title: string;
  organisation: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  url: string | null;
  verified: boolean;
  position: number;
}

const kindLabels: Record<Kind, string> = {
  career: 'Career',
  education: 'Education',
  recognition: 'Recognition',
};

export default function AdminProfilePage() {
  const [entries, setEntries] = useState<ProfileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeKind, setActiveKind] = useState<Kind>('career');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProfileEntry | null>(null);
  const [formData, setFormData] = useState({
    kind: 'career' as Kind,
    title: '',
    organisation: '',
    start_date: '',
    end_date: '',
    description: '',
    url: '',
    verified: false,
    position: '',
  });
  const [error, setError] = useState('');

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.adminGetProfileEntries({ kind: activeKind, per_page: 100 });
      setEntries(response.data.data);
    } catch (error) {
      console.error('Failed to load profile entries:', error);
    } finally {
      setLoading(false);
    }
  }, [activeKind]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const openCreate = () => {
    setEditing(null);
    setFormData({
      kind: activeKind,
      title: '',
      organisation: '',
      start_date: '',
      end_date: '',
      description: '',
      url: '',
      verified: false,
      position: '',
    });
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (entry: ProfileEntry) => {
    setEditing(entry);
    setFormData({
      kind: entry.kind,
      title: entry.title,
      organisation: entry.organisation || '',
      start_date: entry.start_date?.slice(0, 10) || '',
      end_date: entry.end_date?.slice(0, 10) || '',
      description: entry.description || '',
      url: entry.url || '',
      verified: entry.verified,
      position: String(entry.position),
    });
    setError('');
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const payload = {
        kind: formData.kind,
        title: formData.title,
        organisation: formData.organisation || undefined,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        description: formData.description || undefined,
        url: formData.url || undefined,
        verified: formData.verified,
        position: formData.position ? Number(formData.position) : undefined,
      };

      if (editing) {
        await api.adminUpdateProfileEntry(editing.id, payload);
      } else {
        await api.adminCreateProfileEntry(payload);
      }

      setDialogOpen(false);
      loadEntries();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save entry');
    }
  };

  const handleDelete = async (id: number, kind: Kind) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await api.adminDeleteProfileEntry(id);
      loadEntries();
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  const moveUp = async (id: number, position: number) => {
    if (position === 0) return;
    try {
      const all = entries.map(e => ({ id: e.id, position: e.position }));
      const idx = all.findIndex(e => e.id === id);
      if (idx > 0) {
        [all[idx], all[idx - 1]] = [all[idx - 1], all[idx]];
        await api.adminReorderProfileEntries(activeKind, all.map(e => e.id));
        loadEntries();
      }
    } catch (err) {
      console.error('Failed to reorder:', err);
    }
  };

  const moveDown = async (id: number, position: number) => {
    if (position === entries.length - 1) return;
    try {
      const all = entries.map(e => ({ id: e.id, position: e.position }));
      const idx = all.findIndex(e => e.id === id);
      if (idx < all.length - 1) {
        [all[idx], all[idx + 1]] = [all[idx + 1], all[idx]];
        await api.adminReorderProfileEntries(activeKind, all.map(e => e.id));
        loadEntries();
      }
    } catch (err) {
      console.error('Failed to reorder:', err);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const filteredEntries = entries.filter(e => e.kind === activeKind);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted mt-1">Manage career, education, and recognition entries.</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          + Add Entry
        </button>
      </div>

      {/* Kind tabs */}
      <div className="card p-2">
        <div className="flex gap-1" role="tablist">
          {(['career', 'education', 'recognition'] as Kind[]).map((kind) => (
            <button
              key={kind}
              onClick={() => setActiveKind(kind)}
              className={`px-4 py-2 text-sm font-medium rounded-none transition-colors ${
                activeKind === kind
                  ? 'bg-ink text-white'
                  : 'text-muted hover:bg-manila hover:text-ink'
              }`}
              role="tab"
              aria-selected={activeKind === kind}
            >
              {kindLabels[kind]}
            </button>
          ))}
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
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted w-12">Pos</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Organisation</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Period</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Verified</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted">
                      No {kindLabels[activeKind].toLowerCase()} entries.
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-white/50">
                      <td className="px-4 py-4 text-sm font-mono text-muted">{entry.position}</td>
                      <td className="px-4 py-4 font-medium max-w-md truncate">{entry.title}</td>
                      <td className="px-4 py-4 text-sm text-muted max-w-xs truncate">
                        {entry.organisation || '—'}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {formatDate(entry.start_date)} – {formatDate(entry.end_date)}
                      </td>
                      <td className="px-4 py-4">
                        {entry.verified ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-none bg-green-100 text-green-800">Yes</span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-none bg-gray-100 text-gray-800">No</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => moveUp(entry.id, entry.position)}
                            disabled={entry.position === 0}
                            className="btn btn-secondary text-sm py-1 px-2"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveDown(entry.id, entry.position)}
                            disabled={entry.position === filteredEntries.length - 1}
                            className="btn btn-secondary text-sm py-1 px-2"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => openEdit(entry)}
                            className="btn btn-secondary text-sm py-1 px-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id, entry.kind)}
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
          </>
        )}
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-none w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold">{editing ? 'Edit Entry' : 'New Entry'}</h2>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Kind *</label>
                <select
                  value={formData.kind}
                  onChange={(e) => setFormData({ ...formData, kind: e.target.value as Kind })}
                  className="input w-full"
                  required
                >
                  <option value="career">Career</option>
                  <option value="education">Education</option>
                  <option value="recognition">Recognition</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input w-full"
                  required
                  maxLength={255}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Organisation</label>
                <input
                  type="text"
                  value={formData.organisation}
                  onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                  className="input w-full"
                  maxLength={255}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="input w-full"
                  />
                </div>
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
                <label className="block text-sm font-medium mb-1">URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="input w-full"
                  maxLength={500}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="verified"
                  checked={formData.verified}
                  onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                  className="h-4 w-4 rounded-none border-hairline"
                />
                <label htmlFor="verified" className="text-sm">Verified</label>
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