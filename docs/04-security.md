# Security

Status: Draft for approval · Last updated: 2026-11-05

A journalist's site is a plausible target for account takeover, defacement, harassment and data theft. The goal is a sensible baseline, not a fortress: small attack surface, strong authentication, safe defaults, tested backups.

## 1. Assets and threats

| Asset | Main threats |
|---|---|
| Admin account | Phishing, password reuse, brute force, session theft |
| Published content | Defacement, malicious edits, injected scripts |
| Subscriber list | Data theft, misuse, spam signups |
| Contact messages | Exposure of sensitive tips or personal details |
| Server | Unpatched software, exposed services, leaked secrets |
| Domain and email accounts | Registrar or mail takeover (often the weakest link) |
| Journalist's reputation | Impersonation, fake pages, content tampering |

## 2. Authentication and sessions

- Single admin account; no registration, no password reset by email alone.
- Strong password (long passphrase) plus **mandatory TOTP two-factor authentication**; recovery codes stored offline.
- Login rate limiting, progressive lockout, and an email alert on new logins.
- Session cookie: HttpOnly, Secure, SameSite=Lax; short idle timeout; sessions invalidated on password or 2FA change.
- CSRF protection on all state-changing requests.
- Admin routes are never cached and send `noindex`.
- Account recovery is an out-of-band process documented in the runbook, not a public form.

## 3. Application security

- **Input and output:** validate on the server with Laravel form requests; Eloquent query builder only (no raw SQL with user input).
- **Rich text:** sanitise HTML on the server with a strict allow-list before saving; never trust client-side output.
- **XSS:** React escaping by default; avoid `dangerouslySetInnerHTML` except for sanitised article HTML; strict Content Security Policy.
- **Uploads:** allow-list of types, size limits, re-encode images, strip EXIF and GPS, random filenames, no execution permissions in the upload directory.
- **External links:** `rel="noopener noreferrer"`; external article URLs validated as http or https.
- **Forms:** honeypot, per-IP rate limits and optional privacy-friendly CAPTCHA on newsletter and contact forms.
- **Webhooks:** the revalidation endpoint between Laravel and Next.js requires a shared secret and is not reachable from outside.
- **Dependencies:** `composer audit` and `npm audit` monthly; lock files committed; minimal packages.

## 4. Server hardening

- SSH keys only, root login disabled, non-standard user, `fail2ban`.
- Firewall (ufw): allow only 22 (restricted if possible), 80, 443. MySQL and Node listen on localhost only.
- Automatic security updates; reboot window planned.
- Services run as separate unprivileged users; `.env` readable only by the app user.
- TLS everywhere with automatic renewal; HSTS; modern cipher settings.
- Security headers: CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, frame protection.
- Nginx rate limiting on `/api/admin/*` and form endpoints.

## 5. Secrets

- Secrets live in `.env` or a secrets manager, never in the repository.
- A password manager holds server, registrar, email and provider credentials with a documented emergency-access plan.
- Rotate secrets after any suspected exposure and when access changes.

## 6. Data protection and privacy

- **Newsletter:** double opt-in, record of consent text version and timestamp, one-click unsubscribe, tokens stored hashed, export and deletion on request.
- **Contact messages:** collect the minimum; define a retention period (proposal: delete after 12 months unless the journalist keeps a message); do not log message bodies in application logs.
- **Analytics:** no cookies, no raw IP storage, daily-rotating salted hash for unique counts, no third-party trackers.
- **Third parties:** minimise. Self-host fonts; avoid embeds that load external trackers.
- **Backups:** encrypted, off-server, access-controlled; deletions propagate by retention expiry.
- A short privacy notice explains what is collected and why. Applicable Bangladeshi and other relevant data-protection requirements should be checked before launch; this document is not legal advice.

## 7. Journalist-specific considerations

- **Sources and tips:** decide whether to publish a secure contact option (for example Signal number or PGP key) and the wording around it. The site must not promise anonymity it cannot guarantee; a plain contact form is not a secure channel and should say so.
- **Domain and email:** registrar account with 2FA and registrar lock; email provider account with 2FA; these protect against takeover that bypasses the site.
- **Impersonation:** consistent domain, HTTPS, verified social links; consider DMARC, SPF and DKIM so newsletter and contact email cannot be spoofed easily.
- **Harassment:** no public comments, no public subscriber list, no personal details beyond what the journalist chooses to publish.

## 8. Monitoring and incident response

- Alerts for downtime, 5xx spikes, repeated failed logins, disk and certificate issues.
- Logs kept for a limited period, without sensitive content.
- Incident steps: contain (take the admin offline or restrict access), preserve logs, rotate credentials, restore from a known-good backup if content integrity is in doubt, tell the journalist, notify subscribers if their data was exposed, record a short post-mortem.

## 9. Launch security checklist

- [ ] 2FA enabled and recovery codes stored offline
- [ ] Debug mode off; production `.env` reviewed
- [ ] Only ports 22, 80, 443 open; MySQL and Node bound to localhost
- [ ] HTTPS, HSTS and security headers verified
- [ ] CSP tested with the real site
- [ ] Upload tests (malicious filenames, wrong types, oversize, EXIF stripping)
- [ ] Rate limits tested on login, newsletter, contact and analytics endpoints
- [ ] Newsletter double opt-in and unsubscribe tested end to end
- [ ] Backup restore tested on a clean server
- [ ] Registrar and email accounts protected with 2FA
- [ ] SPF, DKIM and DMARC configured
- [ ] Dependency audit clean or risks documented
- [ ] Privacy notice published

## 10. Open decisions

1. Secure-contact channel for sources (Signal, PGP, none)
2. Contact message retention period
3. CAPTCHA: none, or a privacy-friendly option
4. Who holds emergency access if the journalist or developer is unavailable
