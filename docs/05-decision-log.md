# Decision Log

Record of approved decisions and open items. Newest decisions are added at the end of each section. Last updated: 2026-11-05

## Approved decisions

| ID | Date | Decision | Notes |
|---|---|---|---|
| D-001 | 2026-11-04 | **Core philosophy:** The Daily Star is the publisher; this site is the byline's permanent home | Guides scope, archive design and tone |
| D-002 | 2026-11-04 | **Architecture (Option A):** Laravel dedicated backend and REST API; MySQL; Next.js frontend containing both the public site and the protected admin | Keep the API small, clean and well structured |
| D-003 | 2026-11-04 | **Documentation:** five living documents only: Product Brief, Design Direction, Architecture and Data Model, Security, Decision Log | Add a document only when it provides genuine value |
| D-004 | 2026-11-04 | **Audience hierarchy:** primary = editors, fellowship committees, recruiters, journalism professionals, peers; secondary = general readers, researchers; supporting = sources, collaborators, professional contacts | Homepage serves primary; archive and articles serve readers |
| D-005 | 2026-11-04 | **Content stance:** design for a small, excellent collection while the architecture scales; Product Brief separates Confirmed, Missing and Future content | Nothing about the journalist is invented |
| D-006 | 2026-11-04 | **Content and copyright policy:** external articles show headline, independently written description, publication, original date and URL; full text never reproduced; images only with confirmed rights; credit fields; typographic fallback; optional archived URL; per-article image switch | Employer permission not yet checked; build conservatively; project does not depend on it |
| D-007 | 2026-11-04 | **Pre-launch checklist** includes employer permission, branding, copyright and image-rights verification | See Product Brief |
| D-008 | 2026-11-04 | **Hosting (in principle):** single VPS running Laravel, Next.js, MySQL, Nginx, automated SSL, automated off-site backups, basic uptime and error monitoring | Subject to final VPS sizing and cost estimate. Developer handles deployment and maintenance; journalist manages no infrastructure |
| D-009 | 2026-11-05 | **Design direction (leading, not final):** hybrid of Broadsheet (foundation), Case File (reserved for substantial investigations), Long Read (reading experience) | Visual studies produced; final approval pending review |

## Working agreements

- No code until planning is complete and the design direction is approved.
- No invented facts about the journalist, their work, employment, achievements or content.
- Important decisions are discussed before they are finalised, and recorded here.
- Scope stays lean; features are added only when they serve the audiences in D-004.

## Proposed, awaiting approval

| ID | Proposal | Where described |
|---|---|---|
| P-001 | Provisional palette and type: paper `#F6F2EA`, ink `#16130F`, indigo accent `#26356B`; Source Serif 4, Public Sans, IBM Plex Mono | Design Direction |
| P-002 | Case file sections: overview, series, timeline, documents, methods, impact; empty sections hidden | Design Direction, Product Brief |
| P-003 | Single domain with Nginx routing `/api/*` to Laravel and everything else to Next.js; cookie-based Sanctum session | Architecture |
| P-004 | Mandatory TOTP two-factor authentication for the admin | Security |
| P-005 | First-party, cookie-free analytics counter instead of a third-party tool | Architecture |
| P-006 | TipTap as the rich text editor, with a restricted block set | Architecture |
| P-007 | MySQL FULLTEXT search in v1 | Architecture |
| P-008 | Database queue and cache, no Redis in v1 | Architecture |

## Open items

| # | Item | Needed for |
|---|---|---|
| O-1 | Journalist's name, beat, positioning line | Product Brief, design |
| O-2 | Content inventory (articles, outlets, investigations) | Archive and case file design |
| O-3 | Portrait and photography availability and rights | Design, content |
| O-4 | CV and verified recognition items | About page |
| O-5 | Original writing plan at launch | Admin priorities |
| O-6 | Employer permission and branding rules | Pre-launch |
| O-7 | VPS tier, provider and budget | Architecture |
| O-8 | Newsletter name, frequency, email provider | Architecture, Security |
| O-9 | Secure-contact channel for sources | Security |
| O-10 | Domain name and any existing identity | Design, launch |
| O-11 | Review of visual studies and final design direction | Design Direction |

## Phases

1. **Discovery and Foundations** (in progress): audience, content, copyright, hosting and design direction decided; documents drafted; visual studies awaiting review.
2. **Design approval:** react to the studies, refine, approve the direction, then define the design system and admin dashboard design.
3. **Technical specification:** finalise data model, API contract and security details.
4. **Implementation planning:** milestones, build order, testing approach.
5. **Build, content entry, launch checklist, launch.**

## Change history

- 2026-11-04: project started; D-001 to D-008 approved during discovery.
- 2026-11-05: visual studies produced; D-009 recorded as leading direction; documents drafted.
