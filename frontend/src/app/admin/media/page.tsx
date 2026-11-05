'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { format } from 'date-fns';
import { api } from '@/lib/api';

interface MediaItem {
  id: number;
  path: string;
  mime: string;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  credit: string | null;
  caption: string | null;
  rights_confirmed: boolean;
  rights_note: string | null;
  created_at: string;
  url: string;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filters, setFilters] = useState({ q: '', page: 1 });
  const [showUpload, setShowUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.q) params.append('q', filters.q);
      params.append('page', String(filters.page));
      params.append('per_page', '30');

      const response = await api.adminGetMedia(Object.fromEntries(params));
      setMedia(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
      });
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    uploadFiles(Array.from(files));
    e.target.value = ''; // Reset for next selection
  };

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    try {
      for (const file of files) {
        await api.adminUploadMedia(file);
      }
      loadMedia();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRightsToggle = async (item: MediaItem) => {
    try {
      await api.adminConfirmMediaRights(item.id, !item.rights_confirmed);
      loadMedia();
    } catch (error) {
      console.error('Failed to update rights:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this media file? This cannot be undone.')) return;
    try {
      await api.adminDeleteMedia(id);
      loadMedia();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const isImage = (mime: string) => mime.startsWith('image/');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Media Library</h1>
          <p className="text-muted mt-1">Upload and manage images and documents.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="btn btn-primary"
          >
            {showUpload ? 'Hide Upload' : 'Upload Files'}
          </button>
        </div>
      </div>

      {/* Upload Dropzone */}
      {showUpload && (
        <div className="card p-8 border-2 border-dashed border-hairline hover:border-accent transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <div className="text-center">
            <p className="text-lg font-medium mb-2">
              Drag & drop files here, or click to browse
            </p>
            <p className="text-sm text-muted mb-4">
              Images (JPG, PNG, WebP, AVIF, SVG) and PDFs. Max 10MB each.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn btn-secondary"
            >
              {uploading ? 'Uploading...' : 'Choose Files'}
            </button>
            {uploading && <span className="ml-4 text-sm text-muted">Processing...</span>}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card flex flex-wrap gap-4 p-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search media..."
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })}
            className="input w-full"
          />
        </div>
      </div>

      {/* Media Grid */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
              {media.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted">
                  No media files found. Click &ldquo;Upload Files&rdquo; to add some.
                </div>
              ) : (
                media.map((item) => (
                  <div
                    key={item.id}
                    className="relative group border border-hairline overflow-hidden bg-white"
                  >
                    <div className="aspect-square relative overflow-hidden">
                      {isImage(item.mime) ? (
                        <img
                          src={item.url}
                          alt={item.alt_text || ''}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-manila">
                          <span className="font-mono text-sm text-muted">PDF</span>
                        </div>
                      )}
                      {!item.rights_confirmed && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="badge badge-casefile-ongoing text-sm">
                            Rights Unconfirmed
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium truncate" title={item.path}>
                        {item.path.split('/').pop()}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-mono text-xs text-muted">
                          {item.width && item.height ? `${item.width}×${item.height}` : ''}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleRightsToggle(item)}
                            className={`p-1 rounded-none transition-colors ${
                              item.rights_confirmed
                                ? 'text-green-600 hover:bg-green-100'
                                : 'text-muted hover:bg-manila'
                            }`}
                            title={item.rights_confirmed ? 'Rights confirmed' : 'Confirm rights'}
                          >
                            {item.rights_confirmed ? '✓' : '✗'}
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 text-muted hover:text-red-600 hover:bg-red-50 rounded-none transition-colors"
                            title="Delete"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {pagination && pagination.last_page > 1 && (
              <div className="px-4 py-4 border-t border-hairline flex items-center justify-between">
                <p className="text-sm text-muted">
                  Showing {((pagination.current_page - 1) * 30) + 1} to{' '}
                  {Math.min(pagination.current_page * 30, pagination.total)} of{' '}
                  {pagination.total} files
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