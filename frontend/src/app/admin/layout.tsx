'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: 'layout-dashboard' },
  { name: 'Articles', href: '/admin/articles', icon: 'file-text' },
  { name: 'Case Files', href: '/admin/case-files', icon: 'folder-open' },
  { name: 'Profile', href: '/admin/profile', icon: 'user' },
  { name: 'Media', href: '/admin/media', icon: 'image' },
  { name: 'Categories', href: '/admin/categories', icon: 'tag' },
  { name: 'Tags', href: '/admin/tags', icon: 'tags' },
  { name: 'Publications', href: '/admin/publications', icon: 'newspaper' },
  { name: 'Subscribers', href: '/admin/subscribers', icon: 'users' },
  { name: 'Newsletter', href: '/admin/newsletter', icon: 'mail' },
  { name: 'Settings', href: '/admin/settings', icon: 'settings' },
  { name: 'Analytics', href: '/admin/analytics', icon: 'bar-chart' },
];

interface AdminUser {
  id: number;
  name: string;
  email: string;
  two_factor_enabled: boolean;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    // Check auth on mount / navigation
    setLoading(true);
    api.getUser()
      .then((response) => setUser(response.data))
      .catch(() => {
        setUser(null);
        router.push('/admin/login');
      })
      .finally(() => setLoading(false));
  }, [isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const handleLogout = async () => {
    try {
      await api.logout();
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-paper font-serif">
      <header className="border-b border-hairline bg-white sticky top-0 z-40">
        <div className="flex items-center justify-between h-16 px-4 md:px-8">
          <Link href="/admin" className="text-xl font-bold text-ink">
            ProDo Reporter Admin
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted hidden md:block">
              {user.name}
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-secondary text-sm py-2 px-3"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile nav tabs */}
        <nav className="md:hidden border-t border-hairline overflow-x-auto">
          <ul className="flex gap-1 px-4 py-2" role="tablist">
            {navigation.map((item) => (
              <li key={item.name} role="presentation">
                <Link
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium whitespace-nowrap rounded-none transition-colors ${
                    pathname === item.href
                      ? 'bg-ink text-white'
                      : 'text-muted hover:bg-manila hover:text-ink'
                  }`}
                  role="tab"
                  aria-selected={pathname === item.href}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 border-r border-hairline bg-white min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-1" aria-label="Admin navigation">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-none transition-colors ${
                  pathname === item.href
                    ? 'bg-ink text-white'
                    : 'text-muted hover:bg-manila hover:text-ink'
                }`}
              >
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}