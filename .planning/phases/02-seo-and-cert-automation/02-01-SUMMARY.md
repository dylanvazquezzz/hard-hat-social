---
phase: 02-seo-and-cert-automation
plan: 01
subsystem: seo-metadata
tags: [seo, opengraph, json-ld, metadata, structured-data]
dependency_graph:
  requires: []
  provides: [metadataBase, og-tags-contractor-profile, og-tags-public-profile, json-ld-person-schema]
  affects: [app/layout.tsx, app/contractors/[id]/page.tsx, app/u/[username]/page.tsx]
tech_stack:
  added: []
  patterns: [Next.js generateMetadata, JSON-LD structured data, OpenGraph protocol, Twitter Card]
key_files:
  created:
    - public/og-default.png
    - .planning/phases/02-seo-and-cert-automation/02-01-SUMMARY.md
  modified:
    - app/layout.tsx
    - app/contractors/[id]/page.tsx
    - app/u/[username]/page.tsx
decisions:
  - Use Person schema (not LocalBusiness) for contractor JSON-LD — matches plan spec
  - Exclude phone/email from all metadata and JSON-LD — access-gated fields stay gated
  - Two DB queries per request on contractor profile (generateMetadata + page component) — acceptable for MVP, no caching complexity
  - Generate OG fallback PNG from raw PNG bytes using Node.js built-ins — no extra packages needed
metrics:
  duration: ~2 min
  tasks_completed: 3
  tasks_total: 3
  files_modified: 3
  files_created: 2
  completed_date: "2026-03-04"
---

# Phase 2 Plan 1: OpenGraph Metadata and JSON-LD Structured Data Summary

OpenGraph metadata and JSON-LD Person schema added to contractor profile and public user profile pages, with metadataBase enabling absolute URL resolution from the root layout.

## What Was Built

**Task 1 — metadataBase + OG fallback image**
- Added `metadataBase: new URL('https://contractors-connect.vercel.app')` to `app/layout.tsx` metadata export
- Created `public/og-default.png` — a valid 1200x630 PNG with dark navy (`#0f172a`) background, generated from raw PNG bytes using Node.js built-ins (no new packages)
- metadataBase means all relative paths like `/og-default.png` in any page's generateMetadata automatically resolve to absolute URLs for crawlers

**Task 2 — /contractors/[id] generateMetadata + JSON-LD**
- Added `export const dynamic = 'force-dynamic'` to prevent static generation conflicts with admin client fetches
- Added `generateMetadata` function: contractor-specific title (`Full Name — Trade | Contractors Connect`), 155-char description (bio slice or fallback), OG image (profile_photo_url or fallback), Twitter card
- Added JSON-LD `<script type="application/ld+json">` with Person schema: name, jobTitle, PostalAddress (city/state/US), url
- No phone/email in metadata or JSON-LD — access-gated fields remain protected

**Task 3 — /u/[username] generateMetadata + JSON-LD**
- Added `generateMetadata` function: username-specific title (`@username | Contractors Connect`), description, OG image (avatar_url or fallback), Twitter card
- Added JSON-LD Person schema with name, url, and optional jobTitle (included when contractor record exists)
- No phone/email in metadata or JSON-LD

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 | `5536164` | feat(02-01): add metadataBase to root layout and create OG fallback image |
| 2 | `e4a4390` | feat(02-01): add generateMetadata and JSON-LD Person schema to /contractors/[id] |
| 3 | `3abf54f` | feat(02-01): add generateMetadata and JSON-LD Person schema to /u/[username] |

## Success Criteria Verification

- SEO-01: `app/layout.tsx` exports `metadataBase: new URL('https://contractors-connect.vercel.app')` — PASS
- SEO-02: `/contractors/[id]` has contractor-specific `<title>`, `og:title`, `og:description`, `og:image` — PASS
- SEO-03: `/u/[username]` has user-specific `<title>`, `og:title`, `og:description`, `og:image` — PASS
- SEO-04: `/contractors/[id]` contains `<script type="application/ld+json">` with `"@type":"Person"` and no contact fields — PASS
- `npm run build` passes with no TypeScript errors — PASS (verified after each task)

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

All files exist and all commits verified:
- app/layout.tsx — FOUND
- app/contractors/[id]/page.tsx — FOUND
- app/u/[username]/page.tsx — FOUND
- public/og-default.png — FOUND
- 02-01-SUMMARY.md — FOUND
- Commit 5536164 — FOUND
- Commit e4a4390 — FOUND
- Commit 3abf54f — FOUND
