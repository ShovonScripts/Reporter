# Product Brief

Status: Draft for approval · Last updated: 2026-11-05

## 1. Purpose

A premium personal website and publishing platform for a professional journalist at The Daily Star, Bangladesh.

**Core philosophy (approved):** *The Daily Star is the publisher; this site is the byline's permanent home.*

The site does two jobs:

1. **Credibility instrument.** Within seconds, an editor, fellowship committee or recruiter should see that this is a serious professional.
2. **Durable home for the work.** Newspaper URLs break and archives change. The site keeps a reliable, owned record of everything the journalist has published, plus original writing.

## 2. Audiences (approved hierarchy)

| Priority | Audience | What they need |
|---|---|---|
| Primary | Editors, fellowship committees, recruiters, journalism professionals, peers | Fast, credible overview: identity, background, selected work, investigations, recognition |
| Secondary | General readers, researchers, people interested in the work | Pleasant reading, a browsable archive, a newsletter |
| Supporting | Potential sources, collaborators, professional contacts | A trustworthy, careful way to get in touch |

Rule that follows: the **homepage is built for the primary audience**; the **archive and article pages are built for readers**. Readers must never feel secondary when browsing articles.

## 3. Content status

Nothing about the journalist, their work or their credentials may be invented. This section separates what is known from what is not.

### Confirmed
- The journalist works at The Daily Star, Bangladesh, and has published work there.
- The site is English-only, with a single administrator (the journalist) and no public comments.

### Missing (must be collected and verified before design is finalised or launch)
- Journalist's name, preferred byline, beat or focus, and one-line positioning
- Verified CV: career history, education, recognition (only documented items)
- Publication inventory: URLs of all articles to list, including any outside The Daily Star
- Which pieces qualify as investigations or special coverage, and any supporting documents, data or photos
- Professional portrait and any photography the journalist owns or has permission to use
- Whether the journalist will write original articles at launch, and how often
- Employer permission, branding rules and image rights (see pre-launch checklist)
- Domain name and any existing visual identity
- Contact preferences, including whether a secure channel (for example Signal or PGP) should be offered

### Future possibilities (not in v1)
- Dark mode
- Multi-role admin access
- Advanced media library
- Automated import of new publications from newspaper feeds
- Paid or members-only content
- Bangla-language version

## 4. Scope

### In v1
- Homepage, About, Archive, Article pages, Case file pages, Career and credentials, Contact, Newsletter signup
- Two article types: **external publications** and **internal articles** (see section 5)
- **Case files**: curated presentations of substantial investigations and special coverage
- Custom admin dashboard: articles, case files, profile entries, media, subscribers, analytics
- Categories and tags, SEO controls, drafts and scheduled publishing
- Newsletter: double opt-in subscription, subscriber management, sending
- Simple analytics: site and per-article views
- Responsive design, strong performance, security baseline

### Out of v1 (deliberately)
- Public comments, accounts or logins for readers
- Multiple administrators or roles
- E-commerce, memberships, donations
- Social feeds or embedded timelines
- Heavy animation or interactive data-visualisation tooling
- Anything speculative that does not serve the audiences above

## 5. Content types

### External publication
An article published in The Daily Star or another outlet.

Stored and shown: headline, **independently written** short description, publication name, original publication date, original URL. Optional: featured image (only with confirmed rights), image credit, **archived reference URL**, categories and tags.

Never stored or shown: the full text of the external article.

### Internal article
An original piece written on the site in a rich text editor. Supports drafts, scheduling, categories, tags, SEO fields, optional lead image with caption and credit, side notes, pull quotes, sources and notes.

### Case file
A curated presentation of a substantial investigation or special project. Reserved for genuinely substantial work. Contains: title, deck, status, period, overview, the series of linked parts (external or internal), timeline, documents and sources (only what the journalist may share publicly), optional methods note, and impact notes **only when documented**. Sections with no content are hidden.

### Profile entries
Career, education and recognition items, each marked verified or not. Unverified items are never shown publicly.

## 6. Content and copyright policy (approved)

Employer permission has not yet been checked, so the site is built conservatively:

1. External articles show: headline, independently written short description, publication name, original date and original URL.
2. The full text of externally published articles is never reproduced.
3. Featured images are used only when ownership or permission is confirmed.
4. Optional image credit and attribution fields exist.
5. A typographic fallback appears whenever an image cannot be used.
6. An optional archived reference URL is available for each external publication.
7. Image visibility is a per-article switch in the admin, so permissions can be tightened or loosened without rework.

Employer permission, branding, copyright and image rights verification are on the pre-launch checklist. **Planning and development do not depend on them.**

## 7. Pre-launch checklist

- [ ] Journalist confirms the Daily Star's policy on personal websites and featuring headlines, summaries and images
- [ ] Branding check: nothing on the site imitates The Daily Star's identity
- [ ] Image rights verified for every image shown; credits filled in
- [ ] All CV and recognition items verified with documents
- [ ] Every external article has an independently written description
- [ ] Privacy notice and newsletter consent wording reviewed
- [ ] Contact and secure-contact options decided
- [ ] Backups running and a restore test completed
- [ ] Security launch checklist completed (see Security document)
- [ ] Accessibility and performance checks passed on desktop and mobile

## 8. Success criteria

- An editor reaches a clear sense of who the journalist is and what they have done within the first screen of the homepage.
- Every published piece is reachable in two clicks from the archive and has a stable, permanent URL.
- The site looks and works equally well with 10 articles or 200, with or without photography.
- The journalist can publish, schedule and manage everything without developer help.
- The site meets good Core Web Vitals on a mid-range mobile phone.

## 9. Open questions

1. Journalist's name, beat and positioning line
2. Content inventory (article count, outlets, investigations)
3. Photography and portrait availability
4. Original writing: launch plan and frequency
5. Domain, existing branding, budget
6. Newsletter: name, frequency, sending provider
7. Secure-contact channel for sources
