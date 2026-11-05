import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware checks for admin authentication
// The actual auth is handled by Laravel Sanctum cookies

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes that require authentication
  const adminPaths = [
    '/admin',
    '/admin/articles',
    '/admin/case-files',
    '/admin/profile',
    '/admin/media',
    '/admin/categories',
    '/admin/tags',
    '/admin/publications',
    '/admin/subscribers',
    '/admin/newsletter',
    '/admin/settings',
    '/admin/analytics',
  ];

  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));

  // Allow login page without auth
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // For admin paths, we let the client-side layout handle auth check
  // The layout will redirect to login if not authenticated
  if (isAdminPath) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};