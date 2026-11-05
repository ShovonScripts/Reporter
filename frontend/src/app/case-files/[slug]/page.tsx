import { cache } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatDate, formatPeriod, getCaseFile } from '@/lib/server-api';

interface CaseFilePageProps {
  params: Promise<{ slug: string }>;
}

const getCachedCaseFile = cache(getCaseFile);

export async function generateMetadata({ params }: CaseFilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const caseFile = await getCachedCaseFile(slug);

  if (!caseFile) {
    return { title: 'Case file not found | ProDo Reporter' };
  }

  return {
    title: caseFile.seo_title || `${caseFile.title} | ProDo Reporter`,
    description: caseFile.seo_description || caseFile.deck || undefined,
    openGraph: {
      title: caseFile.seo_title || caseFile.title,
      description: caseFile.seo_description || caseFile.deck || undefined,
      type: 'article',
      images: caseFile.og_image
        ? [{ url: caseFile.og_image.url, alt: caseFile.og_image.alt_text || caseFile.title }]
        : undefined,
    },
  };
}

export default async function CaseFilePage({ params }: CaseFilePageProps) {
  const { slug } = await params;
  const caseFile = await getCachedCaseFile(slug);

  if (!caseFile) notFound();

  const period = formatPeriod(caseFile.period_start, caseFile.period_end);
  const isComplete = caseFile.case_status === 'complete';
  const hasTimeline = caseFile.timeline.length > 0;
  const hasDocuments = caseFile.documents.length > 0;

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-manila border-b border-hairline py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/archive" className="text-sm text-muted hover:text-ink">
            ← Archive
          </Link>

          <div className="flex items-center gap-4 mt-4 mb-4">
            <span className={`badge ${isComplete ? 'badge-casefile-complete' : 'badge-casefile-ongoing'}`}>
              {isComplete ? 'Case Complete' : 'Ongoing Investigation'}
            </span>
            {period && <span className="font-mono text-sm text-muted">{period}</span>}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{caseFile.title}</h1>
          {caseFile.deck && <p className="text-xl text-muted font-serif measure-65">{caseFile.deck}</p>}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12 grid md:grid-cols-[200px,1fr] gap-12">
        <nav className="sticky top-8 self-start hidden md:block">
          <ul className="space-y-4 font-sans text-sm font-medium">
            {caseFile.overview_html && (
              <li><a href="#overview" className="hover:text-accent">Overview</a></li>
            )}
            {caseFile.parts.length > 0 && (
              <li><a href="#series" className="hover:text-accent">The Series</a></li>
            )}
            {hasTimeline && <li><a href="#timeline" className="hover:text-accent">Timeline</a></li>}
            {hasDocuments && <li><a href="#documents" className="hover:text-accent">Documents</a></li>}
            {caseFile.methods_html && (
              <li><a href="#methods" className="hover:text-accent">Methods</a></li>
            )}
            {caseFile.impact_html && <li><a href="#impact" className="hover:text-accent">Impact</a></li>}
          </ul>
        </nav>

        <main className="font-serif">
          {caseFile.overview_html && (
            <section id="overview" className="mb-16">
              <h2 className="text-xl font-bold font-sans mb-6 border-b border-hairline pb-2">Overview</h2>
              <div
                className="text-ink leading-relaxed"
                dangerouslySetInnerHTML={{ __html: caseFile.overview_html }}
              />
            </section>
          )}

          {caseFile.parts.length > 0 && (
            <section id="series" className="mb-16">
              <h2 className="text-xl font-bold font-sans mb-6 border-b border-hairline pb-2">The Series</h2>
              <div className="space-y-4">
                {caseFile.parts.map((part, index) => (
                  <div key={part.id} className="card p-4">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-mono text-muted text-sm">{index + 1}.</span>
                      {part.article ? (
                        <Link href={`/archive/${part.article.slug}`} className="font-bold text-lg hover:underline">
                          {part.article.title}
                        </Link>
                      ) : (
                        <span className="font-bold text-lg">Part {index + 1}</span>
                      )}
                    </div>
                    {(part.note || part.article?.summary) && (
                      <p className="text-muted text-sm ml-10">{part.note || part.article?.summary}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {hasTimeline && (
            <section id="timeline" className="mb-16">
              <h2 className="text-xl font-bold font-sans mb-6 border-b border-hairline pb-2">Timeline</h2>
              <div className="space-y-6">
                {caseFile.timeline.map((event) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="font-mono text-sm text-accent w-28 flex-shrink-0">
                      {formatDate(event.date)}
                    </div>
                    <p className="text-ink leading-relaxed">{event.text}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {hasDocuments && (
            <section id="documents" className="mb-16">
              <h2 className="text-xl font-bold font-sans mb-6 border-b border-hairline pb-2">Documents</h2>
              <ul className="space-y-2">
                {caseFile.documents.map((document) => {
                  const url = document.url || document.media?.url;
                  return (
                    <li
                      key={document.id}
                      className="flex justify-between items-center py-2 border-b border-hairline border-dashed"
                    >
                      <span className="font-medium">{document.title}</span>
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-mono text-accent hover:underline"
                        >
                          Download
                        </a>
                      ) : (
                        <span className="text-sm font-mono text-muted">Unavailable</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {caseFile.methods_html && (
            <section id="methods" className="mb-16">
              <h2 className="text-xl font-bold font-sans mb-6 border-b border-hairline pb-2">Methods Note</h2>
              <div
                className="text-muted leading-relaxed"
                dangerouslySetInnerHTML={{ __html: caseFile.methods_html }}
              />
            </section>
          )}

          {caseFile.impact_html && (
            <section id="impact">
              <h2 className="text-xl font-bold font-sans mb-6 border-b border-hairline pb-2">Impact</h2>
              <div
                className="text-ink leading-relaxed"
                dangerouslySetInnerHTML={{ __html: caseFile.impact_html }}
              />
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
