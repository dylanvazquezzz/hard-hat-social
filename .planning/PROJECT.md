# Contractors Connect

## What This Is

A verified contractor directory for tradespeople — starting with welders. Only verified, credentialed contractors get in. B2B first: contractors finding subcontractors and referrals. B2C (homeowners finding contractors) comes later once the trusted network exists.

## Core Value

A contractor can find and contact a verified sub in their trade within 5 minutes — zero unverified people, no spam, no guesswork.

## Requirements

### Validated

- ✓ Contractor profiles (trade, location, certs, years experience, contact info) — MVP
- ✓ Search and filter by trade, state, text search — MVP
- ✓ Multi-step contractor application form with document upload — MVP
- ✓ Admin review queue with approve/reject + Resend email notifications — MVP
- ✓ Contact info gating (phone/email only visible to approved contractors, API-enforced) — MVP
- ✓ Posts system with social/qa/jobs categories — post-MVP
- ✓ Explore page (social + Q&A feed) — post-MVP
- ✓ Jobs board (subcontracting opportunity postings) — post-MVP
- ✓ User profile dashboard (3-tab: Profile, Posts, Settings) — post-MVP
- ✓ Public profile pages at /u/[username] — post-MVP
- ✓ Auth-aware NavBar with username dropdown — post-MVP
- ✓ Password reset flow — post-MVP
- ✓ Admin cert management (add/delete certs per contractor after approval) — post-MVP

### Active

- [ ] Homepage redesign — show directory value, teaser/placeholder profiles, clear value prop
- [ ] Production hardening — verify Vercel env vars, storage buckets, Resend domain all working
- [ ] Founding cohort onboarding — smooth application → approval flow for first 20-50 welders
- [ ] UX polish — loading skeletons, empty states, mobile nav improvements
- [ ] SEO/metadata — OpenGraph, structured data, unique titles per page

### Out of Scope

- In-platform messaging — post-network; contractors exchange contact info off-platform for now
- OpenClaw AI assistant — after real users exist
- Contract generation + e-signature — future feature
- Review/rating system — needs verified completed jobs, future
- Mobile app — web-first, validate before native
- Premium tier — after network has active users

## Context

- Stack: Next.js 14 App Router, Tailwind, Supabase (Postgres + RLS + Auth), Resend, Vercel, TypeScript
- 6 migrations deployed — full schema with RLS
- Deployed to Vercel but configuration may be incomplete (env vars, storage buckets, Resend domain)
- Founding cohort: 20-50 welders known personally by co-founder; will go through /apply like any contractor
- Homepage chicken-and-egg problem: use teaser/placeholder profiles until real approved contractors exist
- Tradespeople are on phones — mobile UX is not optional

## Constraints

- **Tech stack**: Next.js 14 + Supabase + Tailwind — no new dependencies without good reason
- **Verification**: Manual only — admin reviews documents, no automated checking
- **Auth**: Supabase Auth — no third-party auth additions
- **Tradespeople first**: Design decisions should feel right for a welder, not a tech worker

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Manual verification only | Keeps trust high, complexity low for MVP | — Pending |
| Contact info API-gated | RLS alone isn't enough; API endpoint enforces approved-only | ✓ Good |
| B2B before B2C | Build trusted contractor network first, homeowners second | — Pending |
| Placeholder profiles on homepage | Solve chicken-and-egg; show value before real cohort is onboarded | — Pending |

---
*Last updated: 2026-03-01 after initialization*
