'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { api } from '@/lib/api';

// HTML form inputs always hand back strings; coerce them to the types the API expects.
const optionalId = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
  z.number().int().positive().nullable()
);

const optionalPositiveInt = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
  z.number().int().min(0).nullable()
);

const idList = z.preprocess(
  (v) => {
    if (v === '' || v === null || v === undefined) return [];
    const values = Array.isArray(v) ? v : [v];
    return values
      .map((item) => Number(item))
      .filter((n) => Number.isInteger(n) && n > 0);
  },
  z.array(z.number().int().positive())
);

const articleSchema = z.object({
  type: z.enum(['external', 'internal']).default('external'),
  title: z.string().min(1, 'Title is required').max(255),
  slug: z.string().max(255).optional(),
  summary: z.string().optional(),
  body_json: z.string().optional(),
  body_html: z.string().optional(),
  status: z.enum(['draft', 'scheduled', 'published', 'archived']).default('draft'),
  published_at: z.string().optional(),
  scheduled_for: z.string().optional(),
  publication_id: optionalId,
  original_url: z.string().url().optional().or(z.literal('')),
  archived_url: z.string().url().optional().or(z.literal('')),
  featured_media_id: optionalId,
  show_image: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  featured_order: optionalPositiveInt,
  reading_minutes: optionalPositiveInt,
  seo_title: z.string().max(255).optional(),
  seo_description: z.string().max(500).optional(),
  og_media_id: optionalId,
  canonical_url: z.string().url().optional().or(z.literal('')),
  category_ids: idList.default([]),
  tag_ids: idList.default([]),
  primary_category_id: optionalId,
});

type ArticleForm = z.infer<typeof articleSchema>;

export default function NewArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [publications, setPublications] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ArticleForm>({
    resolver: zodResolver(articleSchema) as any,
    defaultValues: {
      type: 'external',
      status: 'draft',
      show_image: true,
      is_featured: false,
      category_ids: [],
      tag_ids: [],
    },
  });

  const type = watch('type');
  const status = watch('status');

  useEffect(() => {
    loadReferenceData();
  }, []);

  const loadReferenceData = async () => {
    setLoading(true);
    try {
      const [catsRes, tagsRes, pubsRes, mediaRes] = await Promise.all([
        api.adminGetCategories(),
        api.adminGetTags(),
        api.adminGetPublications(),
        api.adminGetMedia(),
      ]);
      setCategories(catsRes.data.data);
      setTags(tagsRes.data.data);
      setPublications(pubsRes.data.data);
      setMedia(mediaRes.data.data);
    } catch (error) {
      console.error('Failed to load reference data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        publication_id: data.publication_id || null,
        featured_media_id: data.featured_media_id || null,
        og_media_id: data.og_media_id || null,
        original_url: data.original_url || null,
        archived_url: data.archived_url || null,
        canonical_url: data.canonical_url || null,
        category_ids: data.category_ids || [],
        tag_ids: data.tag_ids || [],
        primary_category_id: data.primary_category_id || null,
        scheduled_for: data.scheduled_for || null,
        published_at: data.published_at || null,
        featured_order: data.featured_order ?? null,
        reading_minutes: data.reading_minutes || null,
      };

      const response = await api.adminCreateArticle(payload);
      router.push(`/admin/articles/${response.data.id}`);
      router.refresh();
    } catch (error: any) {
      console.error('Failed to create article:', error);
      alert(error.response?.data?.message || 'Failed to create article');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">New Article</h1>
          <p className="text-muted mt-1">Create a new article or external publication.</p>
        </div>
        <Link href="/admin/articles" className="btn btn-secondary">
          ← Back to Articles
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Type & Status */}
        <div className="card p-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Type</label>
            <select {...register('type')} className="input">
              <option value="external">External Publication</option>
              <option value="internal">Original Article</option>
            </select>
            {errors.type && <p className="text-red-600 text-sm mt-1">{errors.type.message}</p>}
          </div>

          <div>
            <label className="label">Status</label>
            <select {...register('status')} className="input">
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            {errors.status && <p className="text-red-600 text-sm mt-1">{errors.status.message}</p>}
          </div>

          {/* Scheduled date */}
          {(status === 'scheduled') && (
            <div className="md:col-span-2">
              <label className="label">Scheduled For</label>
              <input type="datetime-local" {...register('scheduled_for')} className="input" />
              {errors.scheduled_for && <p className="text-red-600 text-sm mt-1">{errors.scheduled_for.message}</p>}
            </div>
          )}

          {/* Published date */}
          {(status === 'published') && (
            <div className="md:col-span-2">
              <label className="label">Published At</label>
              <input type="datetime-local" {...register('published_at')} className="input" />
              {errors.published_at && <p className="text-red-600 text-sm mt-1">{errors.published_at.message}</p>}
            </div>
          )}
        </div>

        {/* Title & Slug */}
        <div className="card p-6 space-y-4">
          <div>
            <label className="label">Title</label>
            <input type="text" {...register('title')} className="input text-xl" placeholder="Enter article title" />
            {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="label">Slug (auto-generated if empty)</label>
            <input type="text" {...register('slug')} className="input font-mono" placeholder="auto-generated-from-title" />
            {errors.slug && <p className="text-red-600 text-sm mt-1">{errors.slug.message}</p>}
          </div>
        </div>

        {/* External Article Fields */}
        {type === 'external' && (
          <div className="card p-6 space-y-4 border-accent">
            <h3 className="font-bold text-accent">External Publication Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Publication <span className="text-red-500">*</span></label>
                <select {...register('publication_id')} className="input">
                  <option value="">Select publication</option>
                  {publications.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {errors.publication_id && <p className="text-red-600 text-sm mt-1">{errors.publication_id.message}</p>}
              </div>

              <div>
                <label className="label">Original URL <span className="text-red-500">*</span></label>
                <input type="url" {...register('original_url')} className="input" placeholder="https://www.thedailystar.net/..." />
                {errors.original_url && <p className="text-red-600 text-sm mt-1">{errors.original_url.message}</p>}
              </div>

              <div>
                <label className="label">Archived URL (optional)</label>
                <input type="url" {...register('archived_url')} className="input" placeholder="https://web.archive.org/..." />
              </div>
            </div>
          </div>
        )}

        {/* Internal Article Content */}
        {type === 'internal' && (
          <div className="card p-6 space-y-4">
            <h3 className="font-bold">Article Content</h3>
            <div className="border border-hairline rounded-none p-4 bg-white min-h-[400px]">
              {/* TipTap editor would go here */}
              <textarea
                {...register('body_html')}
                className="w-full min-h-[400px] font-serif text-ink resize-none border-none focus:outline-none"
                placeholder="Write your article content here (HTML)..."
              />
              <p className="text-sm text-muted mt-2">TipTap rich text editor will be integrated here. For now, enter HTML directly.</p>
            </div>
            {errors.body_html && <p className="text-red-600 text-sm">{errors.body_html.message}</p>}
          </div>
        )}

        {/* Summary */}
        <div className="card p-6">
          <label className="label">Summary / Standfirst</label>
          <textarea
            {...register('summary')}
            className="input min-h-[100px] font-serif"
            placeholder="A brief description shown in listings and previews..."
          />
          {errors.summary && <p className="text-red-600 text-sm mt-1">{errors.summary.message}</p>}
        </div>

        {/* Taxonomy */}
        <div className="card p-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Categories</label>
            <select
              {...register('category_ids')}
              multiple
              className="input min-h-[120px]"
            >
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <p className="text-sm text-muted mt-1">Hold Ctrl/Cmd to select multiple. First selected is primary.</p>
          </div>

          <div>
            <label className="label">Primary Category</label>
            <select {...register('primary_category_id')} className="input">
              <option value="">Auto (first selected above)</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="label">Tags</label>
            <select
              {...register('tag_ids')}
              multiple
              className="input min-h-[120px]"
            >
              {tags.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Media */}
        <div className="card p-6 grid gap-4 md:grid-cols-3">
          <div>
            <label className="label">Featured Image</label>
            <select {...register('featured_media_id')} className="input">
              <option value="">None</option>
              {media.filter((m: any) => m.mime.startsWith('image/') && m.rights_confirmed).map((m: any) => (
                <option key={m.id} value={m.id}>{m.alt_text || m.path}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Open Graph Image</label>
            <select {...register('og_media_id')} className="input">
              <option value="">None</option>
              {media.filter((m: any) => m.mime.startsWith('image/') && m.rights_confirmed).map((m: any) => (
                <option key={m.id} value={m.id}>{m.alt_text || m.path}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 w-full">
              <input type="checkbox" {...register('show_image')} className="w-4 h-4 border-hairline rounded-none text-accent focus:ring-accent" />
              Show featured image
            </label>
          </div>
        </div>

        {/* Featured */}
        <div className="card p-6 grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-2">
            <input type="checkbox" {...register('is_featured')} id="is_featured" className="w-4 h-4 border-hairline rounded-none text-accent focus:ring-accent" />
            <label htmlFor="is_featured" className="font-medium">Feature on homepage</label>
          </div>

          <div>
            <label className="label">Featured Order</label>
            <input type="number" {...register('featured_order')} className="input" min="0" placeholder="0" />
          </div>
        </div>

        {/* SEO */}
        <div className="card p-6 space-y-4">
          <h3 className="font-bold">SEO</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">SEO Title</label>
              <input type="text" {...register('seo_title')} className="input" placeholder="Override default title for search engines" maxLength={255} />
            </div>
            <div>
              <label className="label">Canonical URL</label>
              <input type="url" {...register('canonical_url')} className="input" placeholder="If published elsewhere" />
            </div>
          </div>
          <div>
            <label className="label">SEO Description</label>
            <textarea {...register('seo_description')} className="input min-h-[80px]" maxLength={500} placeholder="Meta description for search engines" />
          </div>
        </div>

        {/* Reading minutes */}
        <div className="card p-6">
          <label className="label">Reading Time (minutes, auto-calculated if empty)</label>
          <input type="number" {...register('reading_minutes')} className="input w-24" min="1" />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 border-t border-hairline pt-6">
          <Link href="/admin/articles" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Creating...' : 'Create Article'}
          </button>
        </div>
      </form>
    </div>
  );
}