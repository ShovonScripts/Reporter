import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ProDo Reporter',
  description: 'Professional journalist portfolio and publishing platform',
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-paper text-ink font-serif">
      <header className="border-b border-hairline">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">ProDo Reporter</h1>
          <p className="mt-2 text-muted">The byline's permanent home</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 border-b border-hairline pb-2">Latest Work</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ArticleCard
              title="Investigation: Climate Adaptation in Coastal Bangladesh"
              summary="A three-part series examining how communities are adapting to rising sea levels in the Bay of Bengal."
              date="2026-10-15"
              type="external"
              publication="The Daily Star"
              slug="climate-adaptation-coastal-bangladesh"
            />
            <ArticleCard
              title="The Hidden Cost of Fast Fashion"
              summary="An investigation into labor conditions in garment factories supplying major international brands."
              date="2026-09-22"
              type="external"
              publication="The Daily Star"
              slug="hidden-cost-fast-fashion"
            />
            <ArticleCard
              title="Why Local Journalism Matters More Than Ever"
              summary="A personal reflection on the role of community reporting in an age of algorithmic news feeds."
              date="2026-08-10"
              type="internal"
              publication="Original"
              slug="why-local-journalism-matters"
            />
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 border-b border-hairline pb-2">Case Files</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <CaseFileCard
              title="The Sundarbans Report"
              deck="A year-long investigation into illegal logging and wildlife trafficking in the world's largest mangrove forest."
              status="complete"
              period="2025–2026"
              parts={5}
              slug="sundarbans-report"
            />
            <CaseFileCard
              title="Dhaka Water Crisis"
              deck="An ongoing examination of groundwater depletion and municipal water management failures."
              status="ongoing"
              period="2024–Present"
              parts={3}
              slug="dhaka-water-crisis"
            />
          </div>
        </section>

        <section className="border-t border-hairline pt-12">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="text-lg font-bold mb-3">About</h3>
              <p className="text-muted">Award-winning journalist at The Daily Star, Bangladesh. Covering environment, labor rights, and governance.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-3">Newsletter</h3>
              <p className="text-muted mb-4">Get new investigations and original writing delivered to your inbox.</p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-2 border border-hairline bg-white focus:outline-none focus:border-ink"
                />
                <button className="px-4 py-2 bg-ink text-white hover:bg-muted transition-colors">Subscribe</button>
              </form>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-3">Contact</h3>
              <p className="text-muted">For tips, corrections, or collaboration inquiries.</p>
              <a href="/contact" className="text-accent hover:underline">Get in touch →</a>
            </div>
          </div>
        </section>
      </div>

      <footer className="border-t border-hairline mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-muted text-sm">
          <p>© 2026 ProDo Reporter. All rights reserved.</p>
          <p className="mt-2">Published independently. Not affiliated with The Daily Star.</p>
        </div>
      </footer>
    </main>
  );
}

function ArticleCard({ title, summary, date, type, publication, slug }: {
  title: string;
  summary: string;
  date: string;
  type: 'external' | 'internal';
  publication: string;
  slug: string;
}) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="border border-hairline p-6 hover:border-hairline/50 transition-colors">
      <div className="flex items-center gap-2 text-xs text-muted mb-3">
        <span className="px-2 py-0.5 border border-hairline rounded">
          {type === 'external' ? 'External' : 'Original'}
        </span>
        <span>{publication}</span>
        <time>{formattedDate}</time>
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted mb-4">{summary}</p>
      <Link href={`/archive/${slug}`} className="text-accent hover:underline font-medium">
        Read →
      </Link>
    </article>
  );
}

function CaseFileCard({ title, deck, status, period, parts, slug }: {
  title: string;
  deck: string;
  status: 'complete' | 'ongoing';
  period: string;
  parts: number;
  slug: string;
}) {
  return (
    <article className="border border-hairline p-6 hover:border-hairline/50 transition-colors bg-manila">
      <div className="flex items-center justify-between mb-3">
        <span className="px-2 py-0.5 border border-hairline rounded text-xs">
          {status === 'complete' ? 'Complete' : 'Ongoing'}
        </span>
        <time className="text-xs text-muted">{period}</time>
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted mb-4">{deck}</p>
      <div className="flex items-center gap-4 text-sm text-muted">
        <span>{parts} parts</span>
        <Link href={`/case-files/${slug}`} className="text-accent hover:underline font-medium">
          View case file →
        </Link>
      </div>
    </article>
  );
}