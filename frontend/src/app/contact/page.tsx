import Link from 'next/link';
import { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import { getProfile } from '@/lib/server-api';

export const metadata: Metadata = {
  title: 'Contact | ProDo Reporter',
  description: 'Send a tip, correction, or collaboration inquiry.',
};

export const dynamic = 'force-dynamic';

function readDetail(details: Record<string, unknown>, key: string): string {
  const value = details[key];
  return typeof value === 'string' ? value : '';
}

export default async function ContactPage() {
  const profile = await getProfile();
  const details = profile?.contact_details ?? {};
  const email = readDetail(details, 'email');
  const phone = readDetail(details, 'phone');
  const location = readDetail(details, 'location');

  return (
    <main className="min-h-screen bg-paper text-ink font-serif">
      <header className="border-b border-hairline">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Link href="/" className="text-sm text-muted hover:text-ink">
            ← Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-2">Contact</h1>
          <p className="text-muted mt-2">
            For tips, corrections, or collaboration inquiries. Confidential tips are welcome.
          </p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10 grid gap-10 md:grid-cols-[1fr,280px]">
        <section>
          <ContactForm />
        </section>

        <aside className="text-sm space-y-4">
          <h2 className="text-lg font-bold">Direct</h2>
          {email ? (
            <p>
              <span className="text-muted block">Email</span>
              <a href={`mailto:${email}`} className="text-accent hover:underline">{email}</a>
            </p>
          ) : (
            <p className="text-muted">Use the form to get in touch.</p>
          )}
          {phone && (
            <p>
              <span className="text-muted block">Phone</span>
              {phone}
            </p>
          )}
          {location && (
            <p>
              <span className="text-muted block">Based in</span>
              {location}
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}
