'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface ArticleRecord {
  id: number;
  type: 'external' | 'internal';
  title: string;
  slug: string;
  summary: string | null;
  body_html: string | null;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  published_at: string | null;
  scheduled_for: string | null;
  publication_id: number | null;
  original_url: string | null;
  archived_url: string | null;
  featured_media_id: number | null;
  og_media_id: number | null;
  show_image: boolean;
  is_featured: boolean;
  featured_order: number | null;
  reading_minutes: number | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  categories: { id: number }[];
  tags: { id: number }[];
}

type EditableField = Exclude<keyof ArticleRecord, 'id' | 'categories' | 'tags'>;

function toDatetimeLocal(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function EditArticlePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);

  const [article, setArticle] = useState<ArticleRecord | null>(null);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [tags, setTags] = useState<{ id: number; name: string }[]>([]);
  const [publications, setPublications] = useState<{ id: number; name: string }[]>([]);
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!Number.isInteger(id) || id <= 0) {
      router.push('/admin/articles');
      return;
    }

    Promise.all([
      api.adminGetArticle(id),
      api.adminGetCategories(),
      api.adminGetTags(),
      api.adminGetPublications(),
    ])
      .then(([articleRes, catsRes, tagsRes, pubsRes]) => {
        const data: ArticleRecord = articleRes.data;
        setArticle(data);
        setCategoryIds(data.categories?.map((c) => c.id) ?? []);
        setTagIds(data.tags?.map((t) => t.id) ?? []);
        setCategories(catsRes.data.data);
        setTags(tagsRes.data.data);
        setPublications(pubsRes.data.data);
      })
      .catch((error) => {
        console.error('Failed to load article:', error);
        setMessage({ type: 'error', text: 'Failed to load article.' });
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const setField = <K extends EditableField>(key: K, value: ArticleRecord[K]) => {
    setArticle((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async () => {
    if (!article) return;
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        type: article.type,
        title: article.title,
        slug: article.slug,
        summary: article.summary || null,
        body_html: article.body_html || null,
        status: article.status,
        published_at: article.published_at || null,
        scheduled_for: article.scheduled_for || null,
        publication_id: article.publication_id || null,
        original_url: article.original_url || null,
        archived_url: article.archived_url || null,
        featured_media_id: article.featured_media_id || null,
        og_media_id: article.og_media_id || null,
        show_image: article.show_image,
        is_featured: article.is_featured,
        featured_order: article.featured_order ?? null,
        reading_minutes: article.reading_minutes || null,
        seo_title: article.seo_title || null,
        seo_description: article.seo_description || null,
        canonical_url: article.canonical_url || null,
        category_ids: categoryIds,
        tag_ids: tagIds,
      };

      const response = await api.adminUpdateArticle(id, payload);
      setArticle(response.data);
      setMessage({ type: 'success', text: 'Article saved.' });
    } catch (error) {
      console.error('Failed to save article:', error);
      setMessage({ type: 'error', text: 'Failed to save article. Please check the form.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      const response = await api.adminPublishArticle(id);
      setArticle(response.data);
      setMessage({ type: 'success', text: 'Article published.' });
    } catch (error) {
      console.error('Failed to publish article:', error);
      setMessage({ type: 'error', text: 'Failed to publish article.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this article? This cannot be undone.')) return;
    setSaving(true);
    try {
      await api.adminDeleteArticle(id);
      router.push('/admin/articles');
      router.refresh();
    } catch (error) {
      console.error('Failed to delete article:', error);
      setMessage({ type: 'error', text: 'Failed to delete article.' });
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted">Loading...</div>;
  }

  if (!article) {
    return <div className="p-8 text-center text-muted">Article not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Article</h1>
          <p className="text-muted mt-1">Update content, metadata, and publishing state.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/articles" className="btn btn-secondary">
            ← Back
          </Link>
          {article.status !== 'published' && article.type === 'internal' && (
            <button onClick={handlePublish} disabled={saving} className="btn btn-accent">
              Publish
            </button>
          )}
          <button onClick={handleDelete} disabled={saving} className="btn btn-secondary text-red-600">
            Delete
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <section className="card p-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">Type</label>
          <select
            className="input"
            value={article.type}
            onChange={(e) => setField('type', e.target.value as ArticleRecord['type'])}
          >
            <option value="external">External Publication</option>
            <option value="internal">Original Article</option>
          </select>
        </div>

        <div>
          <label className="label">Status</label>
          <select
            className="input"
            value={article.status}
            onChange={(e) => setField('status', e.target.value as ArticleRecord['status'])}
          >
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="label">Title</label>
          <input
            className="input text-xl"
            value={article.title}
            onChange={(e) => setField('title', e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="label">Slug</label>
          <input
            className="input font-mono"
            value={article.slug}
            onChange={(e) => setField('slug', e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="label">Summary / Standfirst</label>
          <textarea
            className="input min-h-[100px] font-serif"
            value={article.summary ?? ''}
            onChange={(e) => setField('summary', e.target.value)}
          />
        </div>
      </section>

      {article.type === 'external' && (
        <section className="card p-6 grid gap-4 md:grid-cols-2 border-accent">
          <div>
            <label className="label">Publication</label>
            <select
              className="input"
              value={article.publication_id ?? ''}
              onChange={(e) => setField('publication_id', e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Select publication</option>
              {publications.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Original URL</label>
            <input
              className="input"
              type="url"
              value={article.original_url ?? ''}
              onChange={(e) => setField('original_url', e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Archived URL</label>
            <input
              className="input"
              type="url"
              value={article.archived_url ?? ''}
              onChange={(e) => setField('archived_url', e.target.value)}
            />
          </div>
        </section>
      )}

      {article.type === 'internal' && (
        <section className="card p-6 space-y-4">
          <h3 className="font-bold">Article Content (HTML)</h3>
          <textarea
            className="input min-h-[400px] font-mono text-sm"
            value={article.body_html ?? ''}
            onChange={(e) => setField('body_html', e.target.value)}
          />
        </section>
      )}

      <section className="card p-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">Categories</label>
          <select
            multiple
            className="input min-h-[120px]"
            value={categoryIds.map(String)}
            onChange={(e) => setCategoryIds(Array.from(e.target.selectedOptions, (o) => Number(o.value)))}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Tags</label>
          <select
            multiple
            className="input min-h-[120px]"
            value={tagIds.map(String)}
            onChange={(e) => setTagIds(Array.from(e.target.selectedOptions, (o) => Number(o.value)))}
          >
            {tags.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Published At</label>
          <input
            type="datetime-local"
            className="input"
            value={toDatetimeLocal(article.published_at)}
            onChange={(e) => setField('published_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
          />
        </div>
        <div>
          <label className="label">Scheduled For</label>
          <input
            type="datetime-local"
            className="input"
            value={toDatetimeLocal(article.scheduled_for)}
            onChange={(e) => setField('scheduled_for', e.target.value ? new Date(e.target.value).toISOString() : null)}
          />
        </div>
      </section>

      <section className="card p-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">SEO Title</label>
          <input
            className="input"
            maxLength={255}
            value={article.seo_title ?? ''}
            onChange={(e) => setField('seo_title', e.target.value)}
          />
        </div>
        <div>
          <label className="label">Canonical URL</label>
          <input
            className="input"
            type="url"
            value={article.canonical_url ?? ''}
            onChange={(e) => setField('canonical_url', e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="label">SEO Description</label>
          <textarea
            className="input min-h-[80px]"
            maxLength={500}
            value={article.seo_description ?? ''}
            onChange={(e) => setField('seo_description', e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={article.show_image}
            onChange={(e) => setField('show_image', e.target.checked)}
          />
          Show featured image
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={article.is_featured}
            onChange={(e) => setField('is_featured', e.target.checked)}
          />
          Feature on homepage
        </label>
      </section>

      <div className="flex items-center justify-end gap-4 border-t border-hairline pt-6">
        <Link href="/admin/articles" className="btn btn-secondary">Cancel</Link>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
