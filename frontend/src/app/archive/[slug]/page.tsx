import { cache } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatDate, getArticle, getArticles, getProfile } from '@/lib/server-api';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

const getCachedArticle = cache(getArticle);

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getCachedArticle(slug);

  if (!article) {
    return { title: 'Article not found | ProDo Reporter' };
  }

  return {
    title: article.seo_title || `${article.title} | ProDo Reporter`,
    description: article.seo_description || article.summary || undefined,
    alternates: article.canonical_url ? { canonical: article.canonical_url } : undefined,
    openGraph: {
      title: article.seo_title || article.title,
      description: article.seo_description || article.summary || undefined,
      type: 'article',
      publishedTime: article.published_at || undefined,
      images: article.og_image ? [{ url: article.og_image.url, alt: article.og_image.alt_text || article.title }] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getCachedArticle(slug);

  if (!article) notFound();

  const [recentResponse, profile] = await Promise.all([
    getArticles({ per_page: 4 }),
    getProfile(),
  ]);

  const continueReading = recentResponse.data.filter((item) => item.id !== article.id).slice(0, 2);

  return (
    <article className="min-h-screen bg-paper">
      <header className="border-b border-hairline bg-white">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Link href="/archive" className="text-sm text-muted hover:text-ink">
            ← Archive
          </Link>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted mt-4 mb-4">
            <span className={`badge ${article.type === 'external' ? 'badge-external' : 'badge-internal'}`}>
              {article.type === 'external' ? 'External Publication' : 'Original Article'}
            </span>
            {article.publication && <span className="font-mono">{article.publication.name}</span>}
            {article.published_at && (
              <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
            )}
            {article.reading_minutes ? (
              <span className="font-mono text-xs">{article.reading_minutes} min read</span>
            ) : null}
            {article.original_url && (
              <a
                href={article.original_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline font-mono text-xs"
              >
                Original →
              </a>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
            {article.title}
          </h1>

          {article.summary && (
            <p className="text-lg text-muted measure-65 mb-6 font-serif">{article.summary}</p>
          )}

          {article.show_image && article.featured_image && (
            <figure className="mb-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.featured_image.url}
                alt={article.featured_image.alt_text || article.title}
                className="w-full max-w-3xl mx-auto"
              />
              {(article.featured_image.caption || article.featured_image.credit) && (
                <figcaption className="text-sm text-muted mt-2 text-center">
                  {article.featured_image.caption}
                  {article.featured_image.caption && article.featured_image.credit && ' — '}
                  {article.featured_image.credit}
                </figcaption>
              )}
            </figure>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-muted border-t border-hairline pt-4">
            {article.categories.map((category) => (
              <Link
                key={category.id}
                href={`/archive?category=${category.slug}`}
                className="text-accent hover:underline"
              >
                {category.name}
              </Link>
            ))}
            {article.tags.map((tag) => (
              <span key={tag.id} className="font-mono text-xs px-2 py-0.5 border border-hairline">
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 article-column">
        {article.body_html ? (
          <div
            className="font-serif text-ink leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.body_html }}
          />
        ) : (
          <div className="font-serif text-ink leading-relaxed space-y-4">
            {article.summary && <p className="lead">{article.summary}</p>}
            {article.original_url ? (
              <p>
                This piece was published externally.{' '}
                <a
                  href={article.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Read it at the original publication →
                </a>
              </p>
            ) : (
              <p className="text-muted">The full text of this article is not available.</p>
            )}
            {article.archived_url && (
              <p>
                <a
                  href={article.archived_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  View archived copy →
                </a>
              </p>
            )}
          </div>
        )}

        <section className="mt-16 pt-8 border-t border-hairline">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-none bg-manila flex-shrink-0" />
            <div>
              <p className="font-bold">{profile?.journalist_name || 'ProDo Reporter'}</p>
              <p className="text-sm text-muted">
                {profile?.positioning_line || 'Professional journalist'}
              </p>
            </div>
          </div>
        </section>

        {continueReading.length > 0 && (
          <section className="mt-16 pt-8 border-t border-hairline">
            <h2 className="text-xl font-bold mb-4">Continue Reading</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {continueReading.map((item) => (
                <Link key={item.id} href={`/archive/${item.slug}`} className="card p-4">
                  {item.published_at && (
                    <time className="font-mono text-xs text-muted">{formatDate(item.published_at)}</time>
                  )}
                  <h3 className="font-bold mt-1">{item.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-hairline bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-muted text-sm">
          <p>© {new Date().getFullYear()} ProDo Reporter. All rights reserved.</p>
        </div>
      </footer>
    </article>
  );
}
