import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Archive',
  description: 'Browse all articles, investigations, and case files.',
};

export default function ArchivePage() {
  // Mock data - will be replaced with API calls
  const articles = [
    {
      id: '1',
      type: 'external',
      title: 'Investigation: Climate Adaptation in Coastal Bangladesh',
      summary: 'A three-part series examining how communities are adapting to rising sea levels in the Bay of Bengal.',
      publishedAt: '2026-10-15',
      publication: 'The Daily Star',
      slug: 'climate-adaptation-coastal-bangladesh',
    },
    {
      id: '2',
      type: 'external',
      title: 'The Hidden Cost of Fast Fashion',
      summary: 'An investigation into labor conditions in garment factories supplying major international brands.',
      publishedAt: '2026-09-22',
      publication: 'The Daily Star',
      slug: 'hidden-cost-fast-fashion',
    },
    {
      id: '3',
      type: 'internal',
      title: 'Why Local Journalism Matters More Than Ever',
      summary: 'A personal reflection on the role of community reporting in an age of algorithmic news feeds.',
      publishedAt: '2026-08-10',
      publication: 'Original',
      slug: 'why-local-journalism-matters',
    },
    {
      id: '4',
      type: 'external',
      title: 'Dhaka\'s Air Quality Crisis: A Public Health Emergency',
      summary: 'Data-driven investigation into the sources and impacts of hazardous air pollution in the capital.',
      publishedAt: '2026-07-03',
      publication: 'The Daily Star',
      slug: 'dhaka-air-quality-crisis',
    },
    {
      id: '5',
      type: 'internal',
      title: 'Notes from the Field: Reporting During Monsoon Season',
      summary: 'Behind-the-scenes look at the challenges of investigative reporting during Bangladesh\'s monsoon.',
      publishedAt: '2026-06-18',
      publication: 'Original',
      slug: 'notes-from-field-monsoon',
    },
  ];

  const caseFiles = [
    {
      id: '1',
      title: 'The Sundarbans Report',
      deck: 'A year-long investigation into illegal logging and wildlife trafficking in the world\'s largest mangrove forest.',
      status: 'complete',
      period: '2025–2026',
      parts: 5,
      slug: 'sundarbans-report',
    },
    {
      id: '2',
      title: 'Dhaka Water Crisis',
      deck: 'An ongoing examination of groundwater depletion and municipal water management failures.',
      status: 'ongoing',
      period: '2024–Present',
      parts: 3,
      slug: 'dhaka-water-crisis',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Archive</h1>
        <p className="text-muted text-lg measure-65">
          A complete, searchable record of every published piece — external articles, original writing, and case files.
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8 border-b border-hairline pb-6">
        <div className="flex flex-wrap gap-2">
          <FilterButton active>All</FilterButton>
          <FilterButton>On this site</FilterButton>
          <FilterButton>External</FilterButton>
          <FilterButton>Case files</FilterButton>
        </div>
        <div className="flex flex-wrap gap-2 ml-auto">
          <select className="input px-3 py-2 text-sm" defaultValue="all">
            <option value="all">All topics</option>
            <option value="environment">Environment</option>
            <option value="labor">Labor rights</option>
            <option value="governance">Governance</option>
            <option value="health">Public health</option>
          </select>
          <select className="input px-3 py-2 text-sm" defaultValue="all">
            <option value="all">All years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
          <select className="input px-3 py-2 text-sm" defaultValue="all">
            <option value="all">All publications</option>
            <option value="daily-star">The Daily Star</option>
            <option value="original">Original</option>
          </select>
        </div>
      </div>

      {/* Articles List */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 border-b border-hairline pb-2">Articles</h2>
        <div className="space-y-4">
          {articles.map((article) => (
            <ArticleRow key={article.id} article={article} />
          ))}
        </div>
      </section>

      {/* Case Files List */}
      <section>
        <h2 className="text-2xl font-bold mb-6 border-b border-hairline pb-2">Case Files</h2>
        <div className="space-y-4">
          {caseFiles.map((cf) => (
            <CaseFileRow key={cf.id} caseFile={cf} />
          ))}
        </div>
      </section>
    </div>
  );
}

function FilterButton({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button
      className={`px-4 py-2 text-sm font-medium rounded-none transition-colors ${
        active
          ? 'bg-ink text-white'
          : 'bg-white text-ink border border-hairline hover:bg-manila'
      }`}
    >
      {children}
    </button>
  );
}

function ArticleRow({ article }: { article: any }) {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="card flex flex-col md:flex-row gap-4 md:items-center p-4">
      <time className="font-mono text-sm text-muted whitespace-nowrap md:w-40 flex-shrink-0">
        {formattedDate}
      </time>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`badge ${article.type === 'external' ? 'badge-external' : 'badge-internal'}`}>
            {article.type === 'external' ? 'External' : 'Original'}
          </span>
          <span className="font-mono text-xs text-muted">{article.publication}</span>
        </div>
        <Link href={`/archive/${article.slug}`} className="text-xl font-bold hover:underline">
          {article.title}
        </Link>
        <p className="text-muted mt-1 measure-65">{article.summary}</p>
      </div>
      <Link
        href={`/archive/${article.slug}`}
        className="text-accent hover:underline font-medium whitespace-nowrap md:ml-4 flex-shrink-0"
      >
        Read →
      </Link>
    </article>
  );
}

function CaseFileRow({ caseFile }: { caseFile: any }) {
  return (
    <article className="card card-manila flex flex-col md:flex-row gap-4 md:items-center p-4">
      <div className="flex items-center gap-2 mb-2 md:mb-0">
        <span className={`badge ${
          caseFile.status === 'complete' ? 'badge-casefile-complete' : 'badge-casefile-ongoing'
        }`}>
          {caseFile.status === 'complete' ? 'Complete' : 'Ongoing'}
        </span>
        <time className="font-mono text-xs text-muted">{caseFile.period}</time>
      </div>
      <div className="flex-1 min-w-0">
        <Link href={`/case-files/${caseFile.slug}`} className="text-xl font-bold hover:underline">
          {caseFile.title}
        </Link>
        <p className="text-muted mt-1 measure-65">{caseFile.deck}</p>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted md:ml-4">
        <span>{caseFile.parts} parts</span>
        <Link
          href={`/case-files/${caseFile.slug}`}
          className="text-accent hover:underline font-medium"
        >
          View case file →
        </Link>
      </div>
    </article>
  );
}