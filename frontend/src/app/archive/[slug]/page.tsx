import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  // In production, fetch from API
  return {
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    description: 'Read the full article on ProDo Reporter.',
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  // Mock data - replace with API call
  const article = getMockArticle(slug);
  if (!article) notFound();

  return (
    <article className="min-h-screen bg-paper">
      {/* Header with publication info */}
      <header className="border-b border-hairline bg-white">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted mb-4">
            <span className={`badge ${article.type === 'external' ? 'badge-external' : 'badge-internal'}`}>
              {article.type === 'external' ? 'External Publication' : 'Original Article'}
            </span>
            <span className="font-mono">{article.publication}</span>
            <time dateTime={article.publishedAt}>
              {format(new Date(article.publishedAt), 'MMMM d, yyyy')}
            </time>
            {article.originalUrl && (
              <a href={article.originalUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-mono text-xs">
                Original →
              </a>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
            {article.title}
          </h1>

          {article.summary && (
            <p className="text-lg text-muted measure-65 mb-6 font-serif">
              {article.summary}
            </p>
          )}

          {/* Featured image */}
          {article.featuredImage && (
            <figure className="mb-8">
              <img
                src={article.featuredImage.url}
                alt={article.featuredImage.altText || article.title}
                className="w-full max-w-3xl mx-auto rounded-none"
              />
              {(article.featuredImage.caption || article.featuredImage.credit) && (
                <figcaption className="text-sm text-muted mt-2 text-center">
                  {article.featuredImage.caption}
                  {article.featuredImage.caption && article.featuredImage.credit && ' — '}
                  {article.featuredImage.credit}
                </figcaption>
              )}
            </figure>
          )}

          {/* Meta tags */}
          <div className="flex flex-wrap gap-4 text-sm text-muted border-t border-hairline pt-4">
            {article.categories.map((cat: any) => (
              <Link key={cat.id} href={`/archive?category=${cat.slug}`} className="text-accent hover:underline">
                {cat.name}
              </Link>
            ))}
            {article.tags.map((tag: any) => (
              <span key={tag.id} className="font-mono text-xs px-2 py-0.5 border border-hairline">
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Article body */}
      <main className="max-w-3xl mx-auto px-4 py-12 article-column">
        <div
          className="font-serif text-ink leading-relaxed"
          dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
        />

        {/* Sources and notes */}
        {article.sources && article.sources.length > 0 && (
          <section className="mt-16 pt-8 border-t border-double-rule">
            <h2 className="text-xl font-bold mb-4">Sources & Notes</h2>
            <ol className="space-y-2 text-sm text-muted">
              {article.sources.map((source: any, i: number) => (
                <li key={i} className="font-mono">{source}</li>
              ))}
            </ol>
          </section>
        )}

        {/* Author block */}
        <section className="mt-16 pt-8 border-t border-hairline">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-none bg-manila flex-shrink-0" />
            <div>
              <p className="font-bold">ProDo Reporter</p>
              <p className="text-sm text-muted">Professional journalist at The Daily Star, Bangladesh.</p>
            </div>
          </div>
        </section>

        {/* Continue reading */}
        <section className="mt-16 pt-8 border-t border-hairline">
          <h2 className="text-xl font-bold mb-4">Continue Reading</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/archive/climate-adaptation-coastal-bangladesh" className="card p-4">
              <time className="font-mono text-xs text-muted">October 15, 2026</time>
              <h3 className="font-bold mt-1">Investigation: Climate Adaptation in Coastal Bangladesh</h3>
            </Link>
            <Link href="/archive/hidden-cost-fast-fashion" className="card p-4">
              <time className="font-mono text-xs text-muted">September 22, 2026</time>
              <h3 className="font-bold mt-1">The Hidden Cost of Fast Fashion</h3>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-hairline bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-muted text-sm">
          <p>© 2026 ProDo Reporter. All rights reserved.</p>
        </div>
      </footer>
    </article>
  );
}

function getMockArticle(slug: string) {
  const articles: Record<string, any> = {
    'climate-adaptation-coastal-bangladesh': {
      type: 'external',
      title: 'Investigation: Climate Adaptation in Coastal Bangladesh',
      summary: 'A three-part series examining how communities are adapting to rising sea levels in the Bay of Bengal.',
      publishedAt: '2026-10-15',
      publication: 'The Daily Star',
      originalUrl: 'https://www.thedailystar.net/climate-adaptation-coastal-bangladesh',
      featuredImage: {
        url: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=1200',
        altText: 'Coastal village in Bangladesh during monsoon season',
        caption: 'A coastal village in Khulna district during high tide.',
        credit: 'ProDo Reporter',
      },
      bodyHtml: `
        <p class="lead">The Bay of Bengal is rising. For the millions who call its coastline home, this is not a future projection — it is a daily reality.</p>
        <p>In the villages of Khulna and Satkhira districts, saltwater intrusion has transformed once-fertile rice paddies into brackish wetlands. Farmers who grew rice for generations now raise shrimp in the same fields, a shift that brings cash income but degrades the soil further.</p>
        <h2>The Science of Survival</h2>
        <p>Dr. Ainun Nishat, Bangladesh\'s leading climate scientist, explains: "The combination of sea-level rise, reduced upstream freshwater flow, and land subsidence creates a perfect storm for coastal Bangladesh."</p>
        <p>Communities are adapting through:</p>
        <ul>
          <li>Raised homesteads on earthen platforms</li>
          <li>Rainwater harvesting systems</li>
          <li>Salt-tolerant crop varieties developed by BRRI</li>
          <li>Community-based early warning systems for cyclones</li>
        </ul>
        <h2>The Human Cost</h2>
        <p>Fatima Begum, 52, from Gabura Union, lost her home to Cyclone Amphan in 2020. "We rebuilt three times. Each time the water comes higher," she says. Her son migrated to Dhaka for garment work, sending remittances that fund the family\'s adaptation.</p>
        <p>Migration is the ultimate adaptation strategy — and its most painful one.</p>
        <blockquote>
          "We are not waiting for the world to save us. We are adapting because we have no choice. But adaptation has limits."
          <footer>— Dr. Saleemul Huq, Director, ICCCAD</footer>
        </blockquote>
      `,
      sources: [
        'Interview with Dr. Ainun Nishat, October 2026',
        'Bangladesh Rice Research Institute (BRRI) salt-tolerant variety trials, 2023-2025',
        'ICCCAD community adaptation case studies, Gabura Union, 2024',
        'Bangladesh Meteorological Department cyclone tracks, 2020-2026',
      ],
      categories: [
        { id: '1', name: 'Environment', slug: 'environment' },
        { id: '2', name: 'Climate Change', slug: 'climate-change' },
      ],
      tags: [
        { id: '1', name: 'Bangladesh', slug: 'bangladesh' },
        { id: '2', name: 'Adaptation', slug: 'adaptation' },
        { id: '3', name: 'Sea Level Rise', slug: 'sea-level-rise' },
      ],
    },
    'why-local-journalism-matters': {
      type: 'internal',
      title: 'Why Local Journalism Matters More Than Ever',
      summary: 'A personal reflection on the role of community reporting in an age of algorithmic news feeds.',
      publishedAt: '2026-08-10',
      publication: 'Original',
      featuredImage: {
        url: 'https://images.unsplash.com/photo-1495592822108-9e6261896da8?w=1200',
        altText: 'Journalist taking notes at a community meeting',
        caption: 'Reporting from a union parishad meeting in rural Bangladesh.',
        credit: 'ProDo Reporter',
      },
      bodyHtml: `
        <p class="lead">The algorithm does not know your union parishad chairman\'s name. It does not know which canal flooded last monsoon, or which school lacks a roof.</p>
        <p>I\'ve been a journalist for fifteen years. Ten at The Daily Star. In that time, I\'ve watched newsrooms shrink, foreign bureaus close, and the definition of "news" narrow to what trends.</p>
        <h2>The Hollowed-Out Newsroom</h2>
        <p>When I started, our district correspondents numbered forty. Today: twelve. Each covers three upazilas. They file stories by phone, often without ever visiting the scene. The economics are brutal — but the cost is paid in missed stories.</p>
        <p>The Rana Plaza collapse. The Nimtoli fire. The recurring ferry disasters. Each was covered. But the follow-ups — the compensation that never arrived, the safety regulations never enforced, the families still waiting — those require presence. They require a reporter who knows the beat, who drinks tea with the local officials, who notices when the file moves.</p>
        <h2>What Algorithms Miss</h2>
        <p>Social media amplifies outrage. It does not amplify accountability. The story that changes a policy is rarely the one that goes viral. It\'s the one that lands on the right desk at the right time, backed by documents, sources, and the credibility that comes from showing up.</p>
        <p>Local journalism is not "community news" in the dismissive sense. It is the immune system of democracy. When it fails, corruption metastasizes quietly.</p>
        <blockquote>
          "The death of local news is not a media problem. It is a civic problem."
          <footer>— Penelope Abernathy, Knight Chair in Journalism</footer>
        </blockquote>
        <h2>What We Can Do</h2>
        <ol>
          <li>Subscribe to local outlets. Pay for the product.</li>
          <li>Support nonprofit news models.</li>
          <li>Demand transparency from platforms that mediate news distribution.</li>
          <li>Be a source. Tip off reporters. Show up at meetings.</li>
        </ol>
      `,
      sources: [
        'Abernathy, P. (2023). News Deserts and Ghost Newspapers. UNC Hussman School.',
        'Personal reporting notes, 2014-2026.',
      ],
      categories: [
        { id: '3', name: 'Media', slug: 'media' },
        { id: '4', name: 'Opinion', slug: 'opinion' },
      ],
      tags: [
        { id: '4', name: 'Journalism', slug: 'journalism' },
        { id: '5', name: 'Local News', slug: 'local-news' },
      ],
    },
  };

  return articles[slug];
}