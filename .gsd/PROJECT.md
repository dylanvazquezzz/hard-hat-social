# Hard Hat Social

**Type:** Web application
**Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase (Postgres + Auth + Storage), Resend, Vercel
**Repo:** https://github.com/dylanvazquezzz/hard-hat-social
**Production:** https://hardhatsocial.net

## What It Is

A verified contractor directory and social platform. Only verified, credentialed contractors are allowed in — this is the core differentiator from Angi/Thumbtack. B2B (contractor-to-contractor) is primary focus; B2C (homeowner-finding-contractor) is secondary.

## Core Value

A contractor can find and contact a verified sub in their trade within 5 minutes — zero unverified people, no spam, no guesswork.

## Project Structure

```
contractors-connect/
├── app/
│   ├── page.tsx                        # Homepage / landing page
│   ├── layout.tsx                      # Root layout with NavBar
│   ├── contractors/page.tsx            # Directory with search/filter
│   ├── contractors/[id]/page.tsx       # Individual contractor profile
│   ├── apply/page.tsx                  # Multi-step application form
│   ├── auth/page.tsx                   # Sign in / Sign up
│   ├── profile/page.tsx                # 3-tab dashboard
│   ├── u/[username]/page.tsx           # Public profile page
│   ├── explore/page.tsx                # Social + Q&A feed
│   ├── jobs/page.tsx                   # Jobs/subcontracting board
│   ├── admin/layout.tsx                # Admin email guard
│   ├── admin/page.tsx                  # Application review queue
│   └── admin/actions.ts               # approveApplication, rejectApplication
├── components/
│   ├── NavBar.tsx
│   ├── ContractorCard.tsx
│   ├── SearchFilters.tsx
│   ├── ProfileHeader.tsx
│   ├── CertificationBadge.tsx
│   ├── PostCard.tsx
│   ├── ContactSection.tsx
│   ├── JobCard.tsx
│   ├── CreateJobForm.tsx
│   └── SubSelectorModal.tsx
├── lib/
│   ├── types.ts
│   ├── supabase.ts                     # Browser client (use everywhere)
│   └── supabase-admin.ts              # Server-only admin client
└── supabase/migrations/               # 001-009 applied to production
```

## Key Decisions

- `NEXT_PUBLIC_ADMIN_EMAILS` is baked at build time — env var changes need a real git push + rebuild
- Browser supabase client in client components — server-only modules cause build failure
- Migrations applied via Supabase Management API (not CLI — no Docker required)
- Vercel auto-deploys on every push to master branch
- Admin emails: dylan@mediaflooding.com, admin@hardhatsocial.net
- BUG-06 fix: applications queries use status-only filter; RLS handles user isolation (no user_id in PostgREST URL params)
- Deploy via `./scripts/deploy.sh "message"` — gates on build success before committing and pushing
