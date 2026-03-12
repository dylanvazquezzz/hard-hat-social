# M002: Social Layer — Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

## Project Description

Hard Hat Social is a verified contractor directory and social platform. M001 shipped the directory, jobs board, and a basic posts feed. The platform is live at hardhatsocial.net with ~9 verified contractors.

## Why This Milestone

The Explore feed is write-only — no replies, no reactions, no reason to return. Without notifications, contractors who post or list jobs have no way to know if anyone responded. Without a social graph (follows), the feed has no personalization. Without DMs, B2B conversation leaves the platform the moment contact info is exchanged. M002 turns the platform from a directory with a bulletin board into an actual social network.

## User-Visible Outcome

### When this milestone is complete, the user can:

- Reply to posts on the Explore feed and see reply counts on PostCards
- Receive a bell notification and/or email when someone comments on their post, posts a job in their trade, or their application is approved
- Follow another contractor and see a "Following" tab on the Explore feed
- DM another contractor directly within the platform
- Find the platform via Google by searching their name or trade+location
- Complete a guided onboarding flow after being approved

### Entry point / environment

- Entry point: https://hardhatsocial.net (production) + http://localhost:3000 (dev)
- Environment: browser (desktop + mobile)
- Live dependencies: Supabase (Postgres + RLS + Storage + Auth), Resend (email), Vercel (hosting)

## Completion Class

- Contract complete means: migrations applied, TypeScript types correct, components render in dev
- Integration complete means: full flows exercised in browser — post → comment → notification → DM → follow
- Operational complete means: deployed to production with all migrations verified

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- A contractor can comment on a post, and the post author receives an in-app notification + email
- A contractor can follow another and see only followed users' posts in the Following feed tab
- A contractor can send and receive a DM without leaving the platform
- Public profiles appear in Google search results (OpenGraph + structured data present)
- A newly approved contractor sees the onboarding flow on first login

## Risks and Unknowns

- Real-time DMs — Supabase Realtime subscriptions may need careful RLS setup; polling fallback is acceptable for MVP
- Notification fan-out — high-volume events (new job posted) could notify many users; batch or async email delivery needed
- SEO indexability — Next.js App Router server components with Supabase data need generateMetadata() wired correctly

## Existing Codebase / Prior Art

- `components/PostCard.tsx` — card component for posts, will need comment count + thread toggle
- `app/explore/page.tsx` — server component feed, will need comments query + following filter
- `components/NavBar.tsx` — will receive notification bell with unread count
- `lib/types.ts` — Post, Profile, Contractor types; will add Comment, Notification, Message, Follow
- `lib/email.ts` — Resend integration already wired for approval/rejection emails
- `app/admin/actions.ts` — server actions pattern to follow for comment/DM server actions
- `supabase/migrations/` — 12 migrations applied; M002 will add 013–018+
- `app/u/[username]/page.tsx` — public profile, will get SEO metadata + follow button
- `lib/constants.ts` — does not exist yet; TRADES currently duplicated in 4 files

## Scope

### In Scope

- Comments + replies on posts
- In-app notifications (bell icon, unread count, notifications page)
- Email notifications via Resend (comment on post, job posted in trade, application approved)
- Follow / unfollow system with Following feed tab on Explore
- Direct messaging (thread per user pair, no real-time required for v1)
- SEO: generateMetadata(), OpenGraph, LocalBusiness JSON-LD on public profiles
- Post-approval onboarding flow (/welcome page)
- Homepage polish (remove/replace contractor count)
- TRADES constant consolidation into lib/constants.ts
- Error boundaries + loading skeletons on Directory and Explore
- Apply form rate limiting (server-side, max 3 submissions per email per 24h)
- Admin security audit (confirm server actions are RLS-protected, not client-gated only)

### Out of Scope / Non-Goals

- Real-time DM push (polling is fine for v1)
- Read receipts on DMs
- Message attachments / media in DMs
- Notification preferences / opt-out settings
- Paid/premium features
- Mobile app

## Technical Constraints

- No new npm packages without explicit approval
- Browser Supabase client in client components only; supabase-admin in server-only modules
- Every migration must be idempotent (IF NOT EXISTS, CREATE OR REPLACE)
- Migrations applied via ./scripts/migrate.sh — verify with SELECT after each
- Deploy via ./scripts/deploy.sh — gates on build success
- NEXT_PUBLIC_ADMIN_EMAILS is baked at build time

## Integration Points

- Supabase — new tables: comments, notifications, follows, messages; new RLS policies per table
- Resend — new email templates for comment notifications, job alerts, trade digests
- Vercel — auto-deploys on push to master; env vars must be set before first deploy needing them

## Open Questions

- Notification delivery timing for job alerts — immediate per-job or batched daily digest? → Start with immediate, add digest later
- Follow visibility — should follows be public (visible on profile) or private? → Public, shown on /u/[username]
- DM entry point — from public profile? from directory? both? → Both (profile page + contractor detail page)
