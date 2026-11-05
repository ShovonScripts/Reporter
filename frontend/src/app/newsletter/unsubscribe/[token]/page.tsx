import Link from 'next/link';
import { Metadata } from 'next';
import { unsubscribeNewsletter } from '@/lib/server-api';

export const metadata: Metadata = {
  title: 'Unsubscribe | ProDo Reporter',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function NewsletterUnsubscribePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await unsubscribeNewsletter(token);

  return (
    <main className="min-h-screen bg-paper text-ink font-serif flex items-center justify-center px-4">
      <div className="max-w-md w-full border border-hairline bg-white p-8 text-center">
        <h1 className="text-2xl font-bold mb-3">
          {result.ok ? 'Unsubscribed' : 'Unable to unsubscribe'}
        </h1>
        <p className={result.ok ? 'text-muted' : 'text-red-600'} role="status">
          {result.message}
        </p>
        <Link href="/" className="inline-block mt-6 text-accent hover:underline">
          Go to homepage →
        </Link>
      </div>
    </main>
  );
}
