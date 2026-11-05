import Link from 'next/link';
import { Metadata } from 'next';
import NewsletterForm from '@/components/NewsletterForm';
import {
  ArticleSummary,
  CaseFileSummary,
  formatDate,
  formatPeriod,
  getArticles,
  getCaseFiles,
  getProfile,
} from '@/lib/server-api';

export const metadata: Metadata = {
  title: 'ProDo Reporter',
  description: 'Professional journalist portfolio and publishing platform',
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [articlesResponse, caseFiles, profile] = await Promise.all([
    getArticles({ per_page: 6 }),
    getCaseFiles(),
    getProfile(),
  ]);

  const articles = articlesResponse.data;
  const featuredCaseFiles = caseFiles.slice(0, 4);
  const journalistName = profile?.journalist_name || 'ProDo Reporter';
  const positioningLine = profile?.positioning_line || "The byline's permanent home";
  const bio = profile?.bio;
  const newsletterCopy =
    profile?.newsletter_copy || 'Get new investigations and original writing delivered to your inbox.';

  return (
    <main className="min-h-screen bg-paper text-ink font-serif">
      <header className="border-b border-hairline">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{journalistName}</h1>
          <p className="mt-2 text-muted">{positioningLine}</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <section className="mb-16">
          <div className="flex items-baseline justify-between border-b border-hairline pb-2 mb-6">
            <h2 className="text-2xl font-bold">Latest Work</h2>
            <Link href="/archive" className="text-sm text-accent hover:underline">
              View archive →
            </Link>
          </div>

          {articles.length === 0 ? (
            <p className="text-muted">No published work yet.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 border-b border-hairline pb-2">Case Files</h2>

          {featuredCaseFiles.length === 0 ? (
            <p className="text-muted">No published case files yet.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {featuredCaseFiles.map((caseFile) => (
                <CaseFileCard key={caseFile.id} caseFile={caseFile} />
              ))}
            </div>
          )}
        </section>

        <section className="border-t border-hairline pt-12">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="text-lg font-bold mb-3">About</h3>
              <p className="text-muted">
                {bio ||
                  'Award-winning journalist covering environment, labor rights, and governance.'}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-3">Newsletter</h3>
              <p className="text-muted mb-4">{newsletterCopy}</p>
              <NewsletterForm />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-3">Contact</h3>
              <p className="text-muted">For tips, corrections, or collaboration inquiries.</p>
              <Link href="/contact" className="text-accent hover:underline">
                Get in touch →
              </Link>
            </div>
          </div>
        </section>
      </div>

      <footer className="border-t border-hairline mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-muted text-sm">
          <p>© {new Date().getFullYear()} {journalistName}. All rights reserved.</p>
          <p className="mt-2">Published independently.</p>
        </div>
      </footer>
    </main>
  );
}

function ArticleCard({ article }: { article: ArticleSummary }) {
  return (
    <article className="border border-hairline p-6 hover:border-hairline/50 transition-colors">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted mb-3">
        <span className="px-2 py-0.5 border border-hairline rounded">
          {article.type === 'external' ? 'External' : 'Original'}
        </span>
        {article.publication && <span>{article.publication.name}</span>}
        {article.published_at && <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>}
      </div>
      <h3 className="text-xl font-bold mb-2">{article.title}</h3>
      {article.summary && <p className="text-muted mb-4">{article.summary}</p>}
      <Link href={`/archive/${article.slug}`} className="text-accent hover:underline font-medium">
        Read →
      </Link>
    </article>
  );
}

function CaseFileCard({ caseFile }: { caseFile: CaseFileSummary }) {
  const period = formatPeriod(caseFile.period_start, caseFile.period_end);
  const status = caseFile.case_status || 'ongoing';

  return (
    <article className="border border-hairline p-6 hover:border-hairline/50 transition-colors bg-manila">
      <div className="flex items-center justify-between mb-3">
        <span className="px-2 py-0.5 border border-hairline rounded text-xs">
          {status === 'complete' ? 'Complete' : 'Ongoing'}
        </span>
        {period && <time className="text-xs text-muted">{period}</time>}
      </div>
      <h3 className="text-xl font-bold mb-2">{caseFile.title}</h3>
      {caseFile.deck && <p className="text-muted mb-4">{caseFile.deck}</p>}
      <Link href={`/case-files/${caseFile.slug}`} className="text-accent hover:underline font-medium">
        View case file →
      </Link>
    </article>
  );
}
