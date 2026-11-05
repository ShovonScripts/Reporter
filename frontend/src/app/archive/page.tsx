import Link from 'next/link';
import { Metadata } from 'next';
import {
  CaseFileSummary,
  formatDate,
  formatPeriod,
  getArticles,
  getCaseFiles,
  getCategories,
  getPublications,
} from '@/lib/server-api';

export const metadata: Metadata = {
  title: 'Archive | ProDo Reporter',
  description: 'Browse published investigations, features, and external writing.',
};

export const dynamic = 'force-dynamic';

type SearchParams = Record<string, string | string[] | undefined>;

interface ArchivePageProps {
  searchParams: Promise<SearchParams>;
}

function single(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function buildQuery(params: SearchParams, overrides: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    const normalized = single(value);
    if (normalized) search.set(key, normalized);
  });

  search.delete('page');

  Object.entries(overrides).forEach(([key, value]) => {
    if (value === undefined || value === '') {
      search.delete(key);
    } else {
      search.set(key, String(value));
    }
  });

  const query = search.toString();
  return query ? `/archive?${query}` : '/archive';
}

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const params = await searchParams;
  const type = single(params.type);
  const category = single(params.category);
  const publication = single(params.publication);
  const year = single(params.year);
  const query = single(params.q);
  const page = Number(single(params.page)) || 1;

  const [articlesResponse, caseFiles, categories, publications] = await Promise.all([
    getArticles({
      type: type || undefined,
      category: category || undefined,
      publication: publication || undefined,
      year: year || undefined,
      q: query || undefined,
      page,
      per_page: 12,
    }),
    getCaseFiles(),
    getCategories(),
    getPublications(),
  ]);

  const articles = articlesResponse.data;
  const years = Array.from({ length: 6 }, (_, index) => new Date().getFullYear() - index);
  const visibleCaseFiles =
    type === 'external' || category || publication || year
      ? []
      : caseFiles.filter((caseFile) => {
          if (!query) return true;
          const needle = query.toLowerCase();
          return (
            caseFile.title.toLowerCase().includes(needle) ||
            (caseFile.deck ?? '').toLowerCase().includes(needle)
          );
        });

  return (
    <main className="min-h-screen bg-paper text-ink font-serif">
      <header className="border-b border-hairline">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link href="/" className="text-sm text-muted hover:text-ink">
            ← Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-2">Archive</h1>
          <p className="text-muted mt-2">Every published piece, collected in one place.</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <form method="get" className="grid gap-3 md:grid-cols-[2fr,1fr,1fr,1fr,1fr,auto] mb-8">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search titles and summaries"
            className="px-3 py-2 border border-hairline bg-white focus:outline-none focus:border-ink"
          />
          <select name="type" defaultValue={type} className="px-3 py-2 border border-hairline bg-white">
            <option value="">All types</option>
            <option value="internal">Original</option>
            <option value="external">External</option>
          </select>
          <select name="category" defaultValue={category} className="px-3 py-2 border border-hairline bg-white">
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
          <select name="publication" defaultValue={publication} className="px-3 py-2 border border-hairline bg-white">
            <option value="">All publications</option>
            {publications.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
          <select name="year" defaultValue={year} className="px-3 py-2 border border-hairline bg-white">
            <option value="">All years</option>
            {years.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <button type="submit" className="px-4 py-2 bg-ink text-white hover:bg-muted transition-colors">
            Filter
          </button>
        </form>

        {(type || category || publication || year || query) && (
          <div className="mb-6">
            <Link href="/archive" className="text-sm text-accent hover:underline">
              Clear filters
            </Link>
          </div>
        )}

        {visibleCaseFiles.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 border-b border-hairline pb-2">Case Files</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {visibleCaseFiles.map((caseFile) => (
                <CaseFileCard key={caseFile.id} caseFile={caseFile} />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-2xl font-bold mb-4 border-b border-hairline pb-2">
            Articles <span className="text-sm font-normal text-muted">({articlesResponse.total})</span>
          </h2>

          {articles.length === 0 ? (
            <p className="text-muted">No articles match these filters.</p>
          ) : (
            <div className="divide-y divide-hairline">
              {articles.map((article) => (
                <article key={article.id} className="py-6 flex flex-col md:flex-row md:items-baseline gap-3">
                  <div className="md:w-48 flex-shrink-0 text-sm text-muted">
                    {article.published_at ? formatDate(article.published_at) : ''}
                    {article.publication && (
                      <div className="mt-1 text-xs uppercase tracking-wide">{article.publication.name}</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 border border-hairline rounded">
                        {article.type === 'external' ? 'External' : 'Original'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold">
                      <Link href={`/archive/${article.slug}`} className="hover:underline">
                        {article.title}
                      </Link>
                    </h3>
                    {article.summary && <p className="text-muted mt-1">{article.summary}</p>}
                  </div>
                </article>
              ))}
            </div>
          )}

          {articlesResponse.last_page > 1 && (
            <nav className="flex items-center justify-between mt-8 text-sm">
              {page > 1 ? (
                <Link href={buildQuery(params, { page: page - 1 })} className="text-accent hover:underline">
                  ← Newer
                </Link>
              ) : (
                <span />
              )}
              <span className="text-muted">
                Page {articlesResponse.current_page} of {articlesResponse.last_page}
              </span>
              {page < articlesResponse.last_page ? (
                <Link href={buildQuery(params, { page: page + 1 })} className="text-accent hover:underline">
                  Older →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}

function CaseFileCard({ caseFile }: { caseFile: CaseFileSummary }) {
  const period = formatPeriod(caseFile.period_start, caseFile.period_end);

  return (
    <Link
      href={`/case-files/${caseFile.slug}`}
      className="block border border-hairline bg-manila p-5 hover:border-ink transition-colors"
    >
      <div className="flex items-center justify-between mb-2 text-xs text-muted">
        <span>{caseFile.case_status === 'complete' ? 'Complete' : 'Ongoing'}</span>
        {period && <span>{period}</span>}
      </div>
      <h3 className="text-lg font-bold mb-1">{caseFile.title}</h3>
      {caseFile.deck && <p className="text-muted text-sm">{caseFile.deck}</p>}
    </Link>
  );
}
