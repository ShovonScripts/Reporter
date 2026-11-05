# ProDo Reporter

A premium personal website and publishing platform for a professional journalist at The Daily Star, Bangladesh.

## Architecture

- **Backend**: Laravel 11 (REST API) with MySQL/SQLite
- **Frontend**: Next.js 15 (App Router) with React 19, TypeScript, Tailwind CSS v4
- **Authentication**: Laravel Sanctum (cookie-based sessions with mandatory TOTP 2FA)
- **Hosting**: Single VPS with Nginx reverse proxy

## Project Structure

```
ProDo Reporter/
├── backend/                 # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── Api/         # Public API controllers
│   │   │   └── Admin/       # Admin dashboard controllers
│   │   ├── Models/          # Eloquent models (15)
│   │   └── Jobs/            # Queue jobs
│   ├── database/migrations/ # 19 migrations
│   ├── routes/api.php       # API routes
│   └── config/
├── frontend/                # Next.js app
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   ├── admin/       # Admin dashboard
│   │   │   ├── archive/     # Public archive
│   │   │   └── case-files/  # Public case files
│   │   ├── lib/api.ts       # API client
│   │   └── middleware.ts    # Auth middleware
│   └── public/
└── docs/                    # Project documentation
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `users` | Single admin with 2FA |
| `publications` | News outlets (The Daily Star, etc.) |
| `articles` | External publications + internal articles |
| `categories`, `tags` | Taxonomy |
| `article_category`, `article_tag` | Pivot tables |
| `media` | Uploaded files with rights tracking |
| `case_files` | Investigative case files |
| `case_file_parts` | Articles within a case file |
| `case_file_timeline` | Timeline events |
| `case_file_documents` | Supporting documents |
| `profile_entries` | Career, education, recognition |
| `site_settings` | Key-value site configuration |
| `subscribers` | Newsletter double opt-in |
| `newsletter_issues` | Newsletter campaigns |
| `contact_messages` | Contact form submissions |
| `page_views_daily`, `referrers_daily` | First-party analytics |
| `redirects` | URL redirects for permanent links |

## Features

### Public Site
- Homepage with featured content, case files, newsletter signup
- Article archive with filters (type, category, tag, publication, year)
- Full article pages with SEO, Open Graph, reading progress
- Case file pages with overview, series, timeline, documents
- Search (MySQL FULLTEXT)
- Newsletter double opt-in subscription
- Contact form with honeypot & rate limiting
- Privacy-friendly analytics (no cookies)

### Admin Dashboard
- Secure login with mandatory TOTP 2FA + recovery codes
- Article CRUD (external/internal, draft/scheduled/published)
- Case file management (parts, timeline, documents)
- Media library with WebP/AVIF generation, rights management
- Profile entries (career, education, recognition)
- Taxonomy management (categories, tags, publications)
- Subscriber management with CSV export
- Newsletter composer with scheduling & test sends
- Site settings editor
- Analytics dashboard (views, referrers, top articles)

## Getting Started

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 20+
- MySQL 8+ (or SQLite for development)

### Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Configure .env for database
php artisan migrate
php artisan serve --port=8000
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local  # Configure API URL
npm run dev
```

### Development URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/v1
- Admin: http://localhost:3000/admin

## API Endpoints

### Public (no auth)
```
GET  /api/v1/profile
GET  /api/v1/articles
GET  /api/v1/articles/{slug}
GET  /api/v1/case-files
GET  /api/v1/case-files/{slug}
GET  /api/v1/categories
GET  /api/v1/tags
GET  /api/v1/publications
GET  /api/v1/search?q=
POST /api/v1/newsletter/subscribe
GET  /api/v1/newsletter/confirm/{token}
GET  /api/v1/newsletter/unsubscribe/{token}
POST /api/v1/contact
POST /api/v1/events
```

### Admin (requires Sanctum auth)
```
POST   /api/v1/admin/auth/login
POST   /api/v1/admin/auth/logout
GET    /api/v1/admin/auth/user
POST   /api/v1/admin/auth/two-factor
DELETE /api/v1/admin/auth/two-factor
POST   /api/v1/admin/auth/two-factor/recovery

GET    /api/v1/admin/articles
POST   /api/v1/admin/articles
GET    /api/v1/admin/articles/{id}
PUT    /api/v1/admin/articles/{id}
DELETE /api/v1/admin/articles/{id}
POST   /api/v1/admin/articles/{id}/publish
POST   /api/v1/admin/articles/{id}/schedule
POST   /api/v1/admin/articles/{id}/feature

GET    /api/v1/admin/case-files
POST   /api/v1/admin/case-files
GET    /api/v1/admin/case-files/{id}
PUT    /api/v1/admin/case-files/{id}
DELETE /api/v1/admin/case-files/{id}
... (parts, timeline, documents endpoints)

GET    /api/v1/admin/profile-entries
POST   /api/v1/admin/profile-entries
PUT    /api/v1/admin/profile-entries/{id}
DELETE /api/v1/admin/profile-entries/{id}
POST   /api/v1/admin/profile-entries/reorder

GET    /api/v1/admin/media
POST   /api/v1/admin/media
PUT    /api/v1/admin/media/{id}
DELETE /api/v1/admin/media/{id}
POST   /api/v1/admin/media/{id}/confirm-rights

GET    /api/v1/admin/categories
POST   /api/v1/admin/categories
...

GET    /api/v1/admin/subscribers
DELETE /api/v1/admin/subscribers/{id}
GET    /api/v1/admin/subscribers/export

GET    /api/v1/admin/newsletter-issues
POST   /api/v1/admin/newsletter-issues
POST   /api/v1/admin/newsletter-issues/{id}/send
POST   /api/v1/admin/newsletter-issues/{id}/schedule
POST   /api/v1/admin/newsletter-issues/{id}/test-send

GET    /api/v1/admin/settings
PUT    /api/v1/admin/settings

GET    /api/v1/admin/analytics/summary
GET    /api/v1/admin/analytics/articles
```

## Design System

Based on the approved design direction:
- **Fonts**: Source Serif 4 (body), Public Sans (UI), IBM Plex Mono (labels)
- **Colors**: Paper `#F6F2EA`, Manila `#EBE3D1`, Ink `#16130F`, Muted `#5C554B`, Hairline `#D9D2C5`, Accent Indigo `#26356B`
- **Components**: Double-rule masthead, hairline dividers, generous whitespace, square corners
- **Article width**: 680px column

## Security

- Mandatory TOTP 2FA for admin
- Rate limiting on login, forms, API
- CSRF protection on all state-changing requests
- Secure headers (CSP, HSTS, etc.)
- File upload validation, EXIF stripping
- Encrypted off-site backups
- Double opt-in newsletter

## License

Proprietary - All rights reserved.