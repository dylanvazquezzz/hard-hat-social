# Hard Hat Social

**Type:** Web application
**Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase (Postgres + Auth + Storage), Resend, Vercel
**Repo:** https://github.com/dylanvazquezzz/hard-hat-social
**Production:** https://hardhatsocial.net

## What It Is

A verified contractor directory and social platform. Only verified, credentialed contractors are allowed in — this is the core differentiator from Angi/Thumbtack. B2B (contractor-to-contractor) is primary focus; B2C (homeowner-finding-contractor) is secondary.

## Current State — v1.3 Complete (M001 done)

All 6 slices of M001 shipped to production:
- Directory filters by insurance type and certification name
- Job posting form has structured pay rate, duration, trade dropdown, state dropdown
- JobCard shows pay/duration metadata badges
- GC users land on Posts/Jobs tab by default on /profile
- Mark Hired modal shows up to 5 recently hired contractors first
- Drywall is a fully supported trade across apply, directory, homepage
- Homepage hero has full-bleed B&W trade photo collage with dark overlay
- Browse by Trade is a separated section with divider, 6-column grid, SVG icons
- Migrations 010–012 applied and verified in production
- migrate.sh script handles all DB migrations autonomously

## Core Value

A contractor can find and contact a verified sub in their trade within 5 minutes — zero unverified people, no spam, no guesswork.

## Project Structure

```
contractors-connect/
├── app/
│   ├── page.tsx                        # Homepage — hero + Browse by Trade + How it works
│   ├── layout.tsx                      # Root layout with NavBar
│   ├── contractors/page.tsx            # Directory with search/filter (trade, state, text, insurance, cert)
│   ├── contractors/[id]/page.tsx       # Individual contractor profile
│   ├── apply/page.tsx                  # Multi-step application form (6 trades incl. Drywall)
│   ├── auth/page.tsx                   # Sign in / Sign up
│   ├── profile/page.tsx                # 3-tab dashboard; GC defaults to Posts/Jobs tab
│   ├── u/[username]/page.tsx           # Public profile page
│   ├── explore/page.tsx                # Social + Q&A feed
│   ├── jobs/page.tsx                   # Jobs/subcontracting board
│   ├── admin/layout.tsx                # Admin email guard
│   ├── admin/page.tsx                  # Application review queue
│   └── admin/actions.ts               # approveApplication, rejectApplication
├── components/
│   ├── NavBar.tsx
│   ├── ContractorCard.tsx
│   ├── SearchFilters.tsx               # trade, state, text, insurance, cert filters
│   ├── ProfileHeader.tsx
│   ├── CertificationBadge.tsx
│   ├── PostCard.tsx
│   ├── ContactSection.tsx
│   ├── JobCard.tsx                     # renders pay_rate + duration badges
│   ├── CreateJobForm.tsx               # structured fields; defaultOpen prop
│   └── SubSelectorModal.tsx           # Recent Contacts section at top
├── lib/
│   ├── types.ts
│   ├── supabase.ts                     # Browser client (use everywhere)
│   └── supabase-admin.ts              # Server-only admin client
├── scripts/
│   ├── deploy.sh                       # build → commit → push → Vercel auto-deploy
│   └── migrate.sh                      # apply SQL file or inline SQL to production Supabase + verify
└── supabase/migrations/               # 001-012 applied to production
```

## Key Decisions

- `NEXT_PUBLIC_ADMIN_EMAILS` is baked at build time — env var changes need a real git push + rebuild
- Browser supabase client in client components — server-only modules cause build failure
- Migrations applied via `./scripts/migrate.sh <file.sql>` — hits Management API directly, no dashboard access needed
- Always verify migrations with a follow-up SELECT query — HTTP 201 alone is not sufficient proof
- Every migration must be idempotent (IF NOT EXISTS, CREATE OR REPLACE)
- Vercel auto-deploys on every push to master branch
- Deploy via `./scripts/deploy.sh "message"` — gates on build success before committing and pushing
- Admin emails: dylan@mediaflooding.com, admin@hardhatsocial.net
- BUG-06 fix: applications queries use status-only filter; RLS handles user isolation (no user_id in PostgREST URL params)
- GC detection: contractor.trade === 'General Contractor' exact string match
- Sub-query → IN pattern for PostgREST JOIN-like operations (cert/insurance filters, recent contacts)
- Hero background: CSS background-image with Unsplash CDN URLs + grayscale/brightness Tailwind classes — no next/image config needed for decorative backgrounds
- TRADES constant defined in 4 places: apply/page.tsx, SearchFilters.tsx, page.tsx, CreateJobForm.tsx — must update all when adding a new trade
