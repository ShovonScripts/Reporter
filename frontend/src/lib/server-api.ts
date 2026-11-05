const API_BASE_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000/api/v1';

export interface PublicationSummary {
  id: number;
  name: string;
  slug: string;
}

export interface MediaSummary {
  url: string;
  alt_text: string | null;
  credit: string | null;
  caption: string | null;
}

export interface TaxonomyTerm {
  id: number;
  name: string;
  slug: string;
}

export interface ArticleSummary {
  id: number;
  type: 'external' | 'internal';
  title: string;
  slug: string;
  summary: string | null;
  status: string;
  published_at: string | null;
  publication: PublicationSummary | null;
  original_url: string | null;
  archived_url: string | null;
  featured_image: MediaSummary | null;
  show_image: boolean;
  categories: TaxonomyTerm[];
  tags: TaxonomyTerm[];
  reading_minutes: number | null;
  seo_title: string | null;
  seo_description: string | null;
}

export interface ArticleDetail extends ArticleSummary {
  body_html: string | null;
  og_image: MediaSummary | null;
  canonical_url: string | null;
}

export interface CaseFileSummary {
  id: number;
  title: string;
  slug: string;
  deck: string | null;
  status: string;
  case_status: string | null;
  period_start: string | null;
  period_end: string | null;
  featured_image: MediaSummary | null;
}

export interface CaseFilePart {
  id: number;
  position: number;
  note: string | null;
  article: (ArticleSummary & { archived_url: string | null }) | null;
}

export interface CaseFileTimelineEvent {
  id: number;
  date: string;
  text: string;
  position: number;
}

export interface CaseFileDocument {
  id: number;
  title: string;
  type: string | null;
  url: string | null;
  media: MediaSummary | null;
  position: number;
}

export interface CaseFileDetail extends CaseFileSummary {
  overview_html: string | null;
  methods_html: string | null;
  impact_html: string | null;
  parts: CaseFilePart[];
  timeline: CaseFileTimelineEvent[];
  documents: CaseFileDocument[];
  seo_title: string | null;
  seo_description: string | null;
  og_image: MediaSummary | null;
}

export interface Profile {
  journalist_name: string;
  positioning_line: string;
  bio: string;
  social_links: unknown[];
  contact_details: Record<string, unknown>;
  newsletter_copy: string;
  career: unknown[];
  education: unknown[];
  recognition: unknown[];
}

export interface Paginated<T> {
  current_page: number;
  data: T[];
  last_page: number;
  total: number;
  per_page: number;
}

async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getArticles(
  params: Record<string, string | number | undefined> = {}
): Promise<Paginated<ArticleSummary>> {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  });

  const query = search.toString();
  const result = await apiFetch<Paginated<ArticleSummary>>(
    `/articles${query ? `?${query}` : ''}`
  );

  return (
    result ?? {
      current_page: 1,
      data: [],
      last_page: 1,
      total: 0,
      per_page: 20,
    }
  );
}

export function getArticle(slug: string): Promise<ArticleDetail | null> {
  return apiFetch<ArticleDetail>(`/articles/${encodeURIComponent(slug)}`);
}

export async function getCaseFiles(): Promise<CaseFileSummary[]> {
  return (await apiFetch<CaseFileSummary[]>('/case-files')) ?? [];
}

export function getCaseFile(slug: string): Promise<CaseFileDetail | null> {
  return apiFetch<CaseFileDetail>(`/case-files/${encodeURIComponent(slug)}`);
}

export function getProfile(): Promise<Profile | null> {
  return apiFetch<Profile>('/profile');
}

export async function getCategories(): Promise<TaxonomyTerm[]> {
  return (await apiFetch<TaxonomyTerm[]>('/categories')) ?? [];
}

export async function getPublications(): Promise<PublicationSummary[]> {
  return (await apiFetch<PublicationSummary[]>('/publications')) ?? [];
}

export interface NewsletterActionResult {
  ok: boolean;
  message: string;
}

async function newsletterAction(path: string): Promise<NewsletterActionResult> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    const payload = (await response.json().catch(() => ({}))) as { message?: string };

    return {
      ok: response.ok,
      message:
        payload.message ||
        (response.ok
          ? 'Your subscription has been updated.'
          : 'This link is invalid or has expired.'),
    };
  } catch {
    return {
      ok: false,
      message: 'Could not reach the server. Please try again later.',
    };
  }
}

export function confirmNewsletter(token: string): Promise<NewsletterActionResult> {
  return newsletterAction(`/newsletter/confirm/${encodeURIComponent(token)}`);
}

export function unsubscribeNewsletter(token: string): Promise<NewsletterActionResult> {
  return newsletterAction(`/newsletter/unsubscribe/${encodeURIComponent(token)}`);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatMonthYear(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

export function formatPeriod(start: string | null, end: string | null): string {
  const startLabel = formatMonthYear(start);
  const endLabel = formatMonthYear(end);
  if (startLabel && endLabel) return `${startLabel} – ${endLabel}`;
  if (startLabel) return `${startLabel} – Present`;
  return '';
}
