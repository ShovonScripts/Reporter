# Architecture and Data Model

Status: Draft for approval. Hosting approved in principle, subject to VPS sizing and cost estimate. Last updated: 2026-11-05

## 1. Principles

- Keep it small: one admin, one author, modest traffic.
- Public pages are statically generated or cached, so the site stays fast on a small server.
- One source of truth: Laravel owns the data and the business rules.
- Add complexity only when a requirement forces it.

## 2. Stack (approved)

| Layer | Choice |
|---|---|
| Backend and API | Laravel (REST API), MySQL |
| Frontend | Next.js, React, TypeScript, Tailwind CSS v4 |
| Admin | Custom dashboard inside the same Next.js app (protected routes). No Filament, no Nova |
| Hosting | Single VPS |

## 3. Deployment topology

```
Visitor / Admin
      |
   Nginx (TLS, reverse proxy, caching headers)
      |-- /api/*  ---> PHP-FPM (Laravel)  ---> MySQL
      |-- /*      ---> Next.js (Node)     ---> calls Laravel at 127.0.0.1
      |-- /media/* --> static files on disk
```

- One domain. Nginx routes `/api/*` to Laravel and everything else to Next.js. Same origin means simple cookie sessions and no CORS.
- Next.js server components call Laravel over the loopback interface, never over the public internet.
- A scheduler runs inside Laravel every minute: publishes scheduled articles, sends queued email.
- A queue worker (database driver) handles newsletter sending and image processing. No Redis in v1.

### Rendering strategy
- Public pages: static generation with on-demand revalidation. When content is published or edited, Laravel calls a signed webhook on Next.js to revalidate the affected pages (article, archive, homepage, case file, sitemap).
- Admin pages: dynamic, behind authentication, never cached.
- SEO: server-rendered metadata, canonical URLs, Open Graph images, `sitemap.xml`, `robots.txt`, JSON-LD (`Article`, `Person`, `BreadcrumbList`). External articles link out with `rel="noopener"` and are marked as such in the markup.

## 4. VPS sizing (to be confirmed)

| Tier | Spec | Verdict |
|---|---|---|
| Lean | 2 vCPU, 2 GB RAM | Workable with discipline (static pages, small queue worker, tuned MySQL). Little headroom |
| Recommended | 2 vCPU, 4 GB RAM, 50+ GB SSD | Comfortable for Laravel, Next.js, MySQL and image processing |

Final choice and current prices are to be confirmed before approval. Add swap, tune PHP-FPM and MySQL (`innodb_buffer_pool_size` around 512 MB on 4 GB), and watch memory during image processing.

## 5. Authentication

- Single administrator account. No public registration.
- Laravel Sanctum cookie-based session (HttpOnly, Secure, SameSite=Lax) with CSRF protection.
- Mandatory TOTP two-factor authentication with recovery codes.
- Login rate limiting and lockout. Details in the Security document.

## 6. Data model

Types are indicative. Every table has `id`, `created_at`, `updated_at`.

### users
Single admin: `name`, `email`, `password`, `two_factor_secret`, `two_factor_recovery_codes`.

### publications
Outlets such as newspapers: `name`, `slug`, `website_url`.

### articles
One table for both types.

| Column | Notes |
|---|---|
| `type` | `external` or `internal` |
| `title`, `slug` | Slug is permanent once published |
| `summary` | Independently written description (external) or standfirst (internal) |
| `body_json`, `body_html` | Internal only. Editor JSON plus sanitised rendered HTML |
| `status` | `draft`, `scheduled`, `published`, `archived` |
| `published_at` | Original date for external; publish date for internal |
| `scheduled_for` | Nullable |
| `publication_id` | External only |
| `original_url` | External only, required |
| `archived_url` | Optional archived reference |
| `featured_media_id` | Nullable |
| `show_image` | Per-article image visibility switch |
| `is_featured`, `featured_order` | Homepage selection |
| `reading_minutes` | Internal only, computed |
| `seo_title`, `seo_description`, `og_media_id` | SEO overrides |
| `canonical_url` | For internal articles also published elsewhere |

Constraints: `original_url` required when `type = external`; `body_html` required when `type = internal` and publishing.

### categories, tags, article_category, article_tag
Standard taxonomy. One primary category per article; many tags.

### media
`path`, `mime`, `width`, `height`, `alt_text`, `credit`, `caption`, `rights_confirmed` (boolean), `rights_note`. Rule: an image cannot be shown publicly unless `rights_confirmed` is true.

### case_files
`title`, `slug`, `deck`, `status` (`draft`, `published`), `case_status` (for example complete or ongoing), `period_start`, `period_end`, `overview_html`, `methods_html`, `impact_html`, `featured_media_id`, `seo_*`.

### case_file_parts
`case_file_id`, `article_id`, `position`, `note`. Links a case file to its parts, which may be external or internal articles.

### case_file_timeline
`case_file_id`, `date`, `text`, `position`.

### case_file_documents
`case_file_id`, `title`, `type`, `media_id` or `url`, `is_public`, `position`. Only `is_public` items are served.

### profile_entries
`kind` (`career`, `education`, `recognition`), `title`, `organisation`, `start_date`, `end_date`, `description`, `url`, `verified` (boolean), `position`. Unverified entries are never shown publicly.

### site_settings
Key-value store: journalist name, positioning line, bio, social links, contact details, newsletter copy.

### subscribers
`email` (unique), `status` (`pending`, `confirmed`, `unsubscribed`, `bounced`), `confirm_token_hash`, `unsubscribe_token_hash`, `confirmed_at`, `source`, `consent_text_version`.

### newsletter_issues
`subject`, `preview_text`, `body_html`, `status` (`draft`, `scheduled`, `sending`, `sent`), `sent_at`, `recipient_count`. Sending is queued and uses a transactional email provider (to be chosen).

### contact_messages
`name`, `email`, `message`, `created_at`, `handled_at`. Retention limited (see Security).

### analytics (proposed)
Privacy-friendly first-party counting, no cookies:
- `page_views_daily`: `date`, `path`, `article_id` (nullable), `views`, `unique_visitors` (derived from a daily-rotating salted hash that is never stored raw)
- `referrers_daily`: `date`, `source`, `views`

Alternative: self-hosted Umami or Plausible. It adds a service to a small server, so the first-party counter is proposed. Decision pending.

### redirects
`from_path`, `to_path`, `status_code`. Protects permanent URLs if a slug ever changes.

## 7. REST API

Prefix `/api/v1`. JSON, resource-oriented, paginated, consistent error shape.

### Public (read-only unless noted)
| Method | Path | Purpose |
|---|---|---|
| GET | `/profile` | Site settings, bio, verified profile entries |
| GET | `/articles` | List with filters: `type`, `category`, `tag`, `publication`, `year`, `q`, pagination |
| GET | `/articles/{slug}` | Single article |
| GET | `/case-files` | List |
| GET | `/case-files/{slug}` | Case file with parts, timeline, public documents |
| GET | `/categories`, `/tags`, `/publications` | Taxonomy |
| GET | `/search?q=` | Search (MySQL FULLTEXT in v1) |
| POST | `/newsletter/subscribe` | Starts double opt-in |
| GET | `/newsletter/confirm/{token}` | Confirms |
| GET | `/newsletter/unsubscribe/{token}` | Unsubscribes |
| POST | `/contact` | Contact form (rate limited, spam protected) |
| POST | `/events` | Analytics beacon |

### Admin (authenticated, same resource names under `/admin`)
- `/admin/articles`, `/admin/case-files`, `/admin/profile-entries`, `/admin/media`, `/admin/categories`, `/admin/tags`, `/admin/publications`
- `/admin/subscribers` (list, export, remove), `/admin/newsletter-issues` (CRUD, send, schedule, test send)
- `/admin/settings`, `/admin/analytics/summary`, `/admin/analytics/articles`
- `/admin/auth/login`, `/admin/auth/logout`, `/admin/auth/two-factor/*`

Publishing, scheduling and image-rights rules live in Laravel, not in the frontend.

## 8. Rich text editor

Recommended: TipTap in the admin. Output stored as JSON plus sanitised HTML. Supported blocks: paragraphs, subheads, lists, blockquote, pull quote, side note, figure with caption and credit, link, divider. Nothing else. Pasted content is cleaned. Sanitisation happens on the server before `body_html` is saved.

## 9. Media

- Uploads validated by type and size; EXIF metadata (especially GPS) stripped.
- Server generates responsive WebP and AVIF variants.
- Files stored outside the code directory, served by Nginx with long cache headers.
- A file cannot be used publicly until `rights_confirmed` is true.

## 10. Operations

### Responsibilities
| Area | Owner |
|---|---|
| Server, deployment, updates, backups, monitoring | Developer |
| Content, newsletter, rights verification, subscriber requests | Journalist |
| Domain registrar and email provider accounts | Journalist owns accounts; developer manages DNS with access |

The journalist should not need to manage any infrastructure.

### Deployment
Git-based. Build Next.js, run Laravel migrations, restart the Node process (PM2 or systemd) and reload PHP-FPM. Staging is optional, but a pre-launch rehearsal on the VPS is required. Rollback: previous release directory kept and symlink switched back.

### Backups
- Nightly MySQL dump and media sync, encrypted, sent **off the server** to separate object storage.
- Retention: 14 daily, 8 weekly, 6 monthly.
- Restore test before launch and every quarter.
- Targets: recovery point 24 hours, recovery time about 4 hours.

### Recovery runbook (summary)
1. Provision a new VPS from the documented setup script.
2. Restore the latest backup (database, media, `.env` from the password manager).
3. Deploy the tagged release, run migrations, warm the cache.
4. Point DNS, verify TLS, run the smoke checklist, tell the journalist.

### Monitoring
External uptime check, error tracking (Laravel and Next.js), disk, memory and certificate expiry alerts, queue backlog alert.

### Routine maintenance
- Weekly: check alerts, backup status, subscriber bounces
- Monthly: OS and dependency updates, `composer audit`, `npm audit`
- Quarterly: restore test, review access and secrets
- Yearly: domain, certificate and provider renewals

### Costs to estimate before approval
VPS, off-site backup storage, domain, transactional email (volume-based), error tracking, uptime monitoring, any paid font or stock needs (none planned; fonts are open licence).

## 11. Performance targets

Good Core Web Vitals on a mid-range phone; no render-blocking third-party scripts; self-hosted fonts; responsive images; HTML cached at the edge of the server; JavaScript kept small on public pages.

## 12. Scaling path

If traffic grows: add a CDN in front, move MySQL to a managed instance, then split the frontend to its own host. None of this changes the application design.

## 13. Open decisions

1. VPS tier and provider
2. Transactional email provider and newsletter volume expectations
3. Analytics: first-party counter or self-hosted tool
4. Error tracking provider
5. Staging environment: yes or no
