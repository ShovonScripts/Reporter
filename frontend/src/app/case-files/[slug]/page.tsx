import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';

interface CaseFilePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CaseFilePageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    description: 'An investigative case file on ProDo Reporter.',
  };
}

export default async function CaseFilePage({ params }: CaseFilePageProps) {
  const { slug } = await params;
  const cf = getMockCaseFile(slug);
  if (!cf) notFound();

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="bg-manila border-b border-hairline py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <span className={`badge ${cf.status === 'complete' ? 'badge-casefile-complete' : 'badge-casefile-ongoing'}`}>
              {cf.status === 'complete' ? 'Case Complete' : 'Ongoing Investigation'}
            </span>
            <span className="font-mono text-sm text-muted">{cf.period}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{cf.title}</h1>
          <p className="text-xl text-muted font-serif measure-65">{cf.deck}</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12 grid md:grid-cols-[200px,1fr] gap-12">
        {/* Rail */}
        <nav className="sticky top-8 self-start hidden md:block">
          <ul className="space-y-4 font-sans text-sm font-medium">
            <li><a href="#overview" className="hover:text-accent">Overview</a></li>
            <li><a href="#series" className="hover:text-accent">The Series</a></li>
            <li><a href="#timeline" className="hover:text-accent">Timeline</a></li>
            <li><a href="#documents" className="hover:text-accent">Documents</a></li>
            <li><a href="#methods" className="hover:text-accent">Methods</a></li>
            <li><a href="#impact" className="hover:text-accent">Impact</a></li>
          </ul>
        </nav>

        {/* Content */}
        <main className="font-serif">
          <section id="overview" className="mb-16">
            <h2 className="text-xl font-bold font-sans mb-6 border-b border-hairline pb-2">Overview</h2>
            <div className="text-ink leading-relaxed" dangerouslySetInnerHTML={{ __html: cf.overviewHtml }} />
          </section>

          <section id="series" className="mb-16">
            <h2 className="text-xl font-bold font-sans mb-6 border-b border-hairline pb-2">The Series</h2>
            <div className="space-y-4">
              {cf.parts.map((part: any, i: number) => (
                <div key={i} className="card p-4">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="font-mono text-muted text-sm">{i + 1}.</span>
                    <Link href={`/archive/${part.slug}`} className="font-bold text-lg hover:underline">
                      {part.title}
                    </Link>
                  </div>
                  <p className="text-muted text-sm ml-10">{part.summary}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="timeline" className="mb-16">
            <h2 className="text-xl font-bold font-sans mb-6 border-b border-hairline pb-2">Timeline</h2>
            <div className="space-y-6">
              {cf.timeline.map((event: any, i: number) => (
                <div key={i} className="flex gap-4">
                  <div className="font-mono text-sm text-accent w-24 flex-shrink-0">{event.date}</div>
                  <p className="text-ink leading-relaxed">{event.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="documents" className="mb-16">
            <h2 className="text-xl font-bold font-sans mb-6 border-b border-hairline pb-2">Documents</h2>
            <ul className="space-y-2">
              {cf.documents.map((doc: any, i: number) => (
                <li key={i} className="flex justify-between items-center py-2 border-b border-hairline border-dashed">
                  <span className="font-medium">{doc.title}</span>
                  <a href={doc.url} target="_blank" className="text-sm font-mono text-accent hover:underline">Download</a>
                </li>
              ))}
            </ul>
          </section>

          <section id="methods" className="mb-16">
            <h2 className="text-xl font-bold font-sans mb-6 border-b border-hairline pb-2">Methods Note</h2>
            <div className="text-muted leading-relaxed" dangerouslySetInnerHTML={{ __html: cf.methodsHtml }} />
          </section>

          <section id="impact">
            <h2 className="text-xl font-bold font-sans mb-6 border-b border-hairline pb-2">Impact</h2>
            <div className="text-ink leading-relaxed" dangerouslySetInnerHTML={{ __html: cf.impactHtml }} />
          </section>
        </main>
      </div>
    </div>
  );
}

function getMockCaseFile(slug: string) {
  const caseFiles: Record<string, any> = {
    'sundarbans-report': {
      title: 'The Sundarbans Report',
      deck: 'A year-long investigation into illegal logging and wildlife trafficking in the world\'s largest mangrove forest.',
      status: 'complete',
      period: '2025–2026',
      overviewHtml: '<p>The Sundarbans, a UNESCO World Heritage site, is facing an existential crisis. Our investigation reveals a sophisticated network of illegal logging and poaching operations...</p>',
      methodsHtml: '<p>This investigation spanned 12 months, involved field visits, interviews with community leaders, and analysis of satellite imagery...</p>',
      impactHtml: '<p>Following publication, the Ministry of Environment increased patrol frequency and established three new monitoring stations...</p>',
      parts: [
        { title: 'The Silent Forest', summary: 'How logging is disappearing the mangrove boundary.', slug: 'silent-forest' },
        { title: 'Trafficking Chains', summary: 'Tracing the illegal wood and wildlife routes.', slug: 'trafficking-chains' },
      ],
      timeline: [
        { date: '2025-01-01', text: 'Investigation initiated following tips from local sources.' },
        { date: '2025-06-15', text: 'First field expedition to the Satkhira range.' },
        { date: '2026-03-20', text: 'Publication of The Silent Forest series.' },
      ],
      documents: [
        { title: 'Satellite Monitoring Data (2024)', url: '#' },
        { title: 'Ministry Patrol Records (Excerpt)', url: '#' },
      ]
    }
  };
  return caseFiles[slug];
}