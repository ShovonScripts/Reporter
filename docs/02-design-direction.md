# Design Direction

Status: **Leading direction, not approved.** The design system is not final. Visual studies exist and are awaiting review. Last updated: 2026-11-05

Visual studies: https://claude.ai/artifact/GitUFooZyXWT99mhkSysna (private until shared)

## 1. Intent

A distinctive, understated, premium editorial identity. It should feel like a trusted professional publication built around one journalist: authoritative, sophisticated, minimal, contemporary and timeless, credible without being corporate or cold.

Priorities: originality, editorial quality, readability, professional credibility.

## 2. What to avoid

- Generic portfolio templates and SaaS landing-page aesthetics
- Heavy gradients, glassmorphism, decorative effects
- Overused animation
- Dark, neon-heavy personal branding
- Any imitation of The Daily Star's logo, typography or visual branding
- A detective or intelligence-platform look for case files

## 3. Direction (hybrid)

| Source concept | What we take | Where it applies |
|---|---|---|
| **A. The Broadsheet** (foundation) | Seriousness, column structure, hairline rules, refined type, restrained colour | Whole site, especially the homepage |
| **B. The Case File** (selective) | Investigations as curated records, not article cards | Only genuinely substantial investigations and special projects |
| **C. The Long Read** (selective) | Long-form typography, comfortable widths, pull quotes, thoughtful image placement, subtle reading progress | Article reading experience |

It must work with 10 or 200 articles, with or without photography. Large photographs are never required.

## 4. Provisional visual language (not final)

### Colour
| Token | Value | Use |
|---|---|---|
| Paper | `#F6F2EA` | Page background |
| Manila | `#EBE3D1` | Case file bands and panels |
| Ink | `#16130F` | Text, rules |
| Muted | `#5C554B` | Secondary text |
| Hairline | `#D9D2C5` | Dividers |
| Accent (indigo) | `#26356B` | Links, kickers, progress, active states |

Rules: one accent only. Contrast must meet WCAG AA in every pairing. Dark mode is optional later and must never compromise the reading experience.

### Typography
- **Serif (headlines and body):** Source Serif 4 (open licence, self-hosted)
- **Sans (interface and metadata):** Public Sans
- **Mono (labels only):** IBM Plex Mono, used sparingly for case file and metadata labels

Body text: about 21px on desktop, 19px on mobile, line height about 1.6, measure about 65 characters.

### Structure
Double-rule masthead, hairline dividers, generous whitespace, square corners, no shadows. Motion limited to subtle state changes and the reading progress bar.

## 5. Page patterns

### Homepage
Masthead with the journalist's name as the nameplate, then: positioning line, lead selected story with a column of selected items, case files band, unified Latest feed, About and credentials, newsletter band, footer. Built to establish credibility quickly for the primary audience.

### Archive
Filter by type (all, on this site, external, case files), year, topic, publication, plus search. Rows show date, headline, description and a tag. External rows carry "Archived copy" links. Case files appear in the same list with a small label.

### Article
Centred header, optional lead image with caption and credit, sticky "In this piece" rail, 680px text column, margin notes (inline on mobile), drop cap on features, pull quotes allowed to break out, sources and notes, author block, continue reading.

### Case file
Manila header band with a facts panel, sticky section rail, then: overview, the series (with links to originals and archived copies), timeline, documents and sources (public material only), methods note, impact (documented only). Sections with no content are hidden.

### Typographic fallback
When an image cannot be used, entries stay fully designed using type alone. This is a first-class pattern, not an empty state.

## 6. Mobile

Single column that keeps the rules and hierarchy. Menu button, 44px minimum tap targets, filters collapse into a compact bar, case file sections become a horizontally scrolling section index. Body text stays comfortable at phone width.

## 7. Accessibility

Real buttons, links and form labels; AA contrast; visible focus states; reading progress exposed as a progress indicator; images require alt text in the admin; reduced-motion respected.

## 8. Identity

There is no existing logo or visual identity. The identity will be developed independently of The Daily Star: a typographic nameplate first, with an optional restrained monogram only if the journalist wants one.

## 9. Open design questions

1. Does the studies' balance (Broadsheet homepage, restrained case files) feel right?
2. Is the dark newsletter band acceptable, or should it be light?
3. Is the indigo accent right, or should alternatives be explored?
4. Does the journalist want a monogram or a purely typographic identity?
5. Admin dashboard design: to be specified after the public design is approved.
