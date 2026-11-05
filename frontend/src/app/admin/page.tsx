'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminGetAnalyticsSummary(30)
      .then((response) => setStats(response.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Views (30d)', value: stats?.totals?.views?.toLocaleString() || '—', href: '/admin/analytics' },
    { label: 'Unique Visitors (30d)', value: stats?.totals?.unique_visitors?.toLocaleString() || '—', href: '/admin/analytics' },
    { label: 'Articles Published', value: '—', href: '/admin/articles?status=published' },
    { label: 'Case Files', value: '—', href: '/admin/case-files' },
    { label: 'Subscribers', value: '—', href: '/admin/subscribers' },
    { label: 'Newsletter Issues', value: '—', href: '/admin/newsletter' },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((_, i) => (
          <div key={i} className="card animate-pulse h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted mt-1">Overview of your site&apos;s content and performance.</p>
        </div>
        <Link href="/admin/articles/new" className="btn btn-primary">
          + New Article
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href} className="card hover:border-accent transition-colors">
            <p className="text-sm text-muted">{stat.label}</p>
            <p className="text-3xl font-bold mt-1">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card">
          <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/admin/articles/new" className="block p-3 border border-hairline hover:bg-manila transition-colors">
              Write a new article
            </Link>
            <Link href="/admin/case-files/new" className="block p-3 border border-hairline hover:bg-manila transition-colors">
              Create a case file
            </Link>
            <Link href="/admin/media" className="block p-3 border border-hairline hover:bg-manila transition-colors">
              Upload media
            </Link>
            <Link href="/admin/newsletter/new" className="block p-3 border border-hairline hover:bg-manila transition-colors">
              Compose newsletter
            </Link>
          </div>
        </section>

        <section className="card">
          <h2 className="text-lg font-bold mb-4">Recent Articles</h2>
          <p className="text-muted">Loading...</p>
        </section>
      </div>
    </div>
  );
}