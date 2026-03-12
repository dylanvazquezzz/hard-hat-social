---
gsd_state_version: 1.0
milestone: v1.3
milestone_name: UX & Trade Expansion
status: planning
stopped_at: v1.2 complete — planning v1.3 phases 10-15
last_updated: "2026-03-12T01:20:00.000Z"
last_activity: 2026-03-12 — v1.2 complete, all migrations applied, admin@hardhatsocial.net configured, v1.3 roadmap written
progress:
  total_phases: 15
  completed_phases: 9
  total_plans: 6
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md
See: .planning/milestones/v1.3-phases/v1.3-REQUIREMENTS.md

**Core value:** A contractor can find and contact a verified sub in their trade within 5 minutes — zero unverified people, no spam, no guesswork.
**Current focus:** v1.3 — Phases 10-15

## Current Position

Phase: Starting Phase 10 (Auto-Deploy + Bug Fix)
Status: Ready to begin — v1.2 fully complete and deployed to hardhatsocial.net
Last activity: 2026-03-12 — all 9 migrations applied, admin account created, Phase 9 code pushed to production

Progress: v1.3 not yet started

## v1.3 Phase Overview

| # | Phase | Requirements | Status |
|---|-------|-------------|--------|
| 10 | Auto-Deploy + Bug Fix | DEPLOY-01, BUG-06 | Pending |
| 11 | Directory Filter Expansion | FILTER-01/02/03 | Pending |
| 12 | Job Posting UX Overhaul | JOBS-05/06/07 | Pending |
| 13 | GC Recent Contacts | JOBS-08/09 | Pending |
| 14 | Drywall Trade | TRADE-01/02/03/04 | Pending |
| 15 | Homepage Hero Redesign | HOME-01/02/03/04 | Pending |

## Accumulated Context

### From v1.1

- Use `server-only` package on lib/supabase-admin.ts and lib/email.ts — build fails hard vs silently leaking
- Storage migration must DROP old permissive policies before creating strict replacements
- approveApplication() maps document_urls to certifications rows with verified=true
- Query applications table (not contractors) for pending check — pending users have no contractors row yet
- NEXT_PUBLIC_APP_URL must be set in Vercel before NEXT_PUBLIC_CONTACT_EMAIL — email links read from APP_URL

### From v1.2

- NEXT_PUBLIC_ADMIN_EMAILS is baked at build time — env var changes require a real git push + rebuild, not just Vercel redeploy from cache
- Vercel token: stored in session (do not log)
- Supabase Management API endpoint: `https://api.supabase.com/v1/projects/{ref}/database/query`
- Supabase Auth Admin API: `https://{ref}.supabase.co/auth/v1/admin/users`
- Migration filenames use 001-009 format (not timestamps) — CLI migration tracking not used; apply via Management API
- Cast Supabase dual-FK query result as `unknown as Job[]` — TS infers joined arrays as `T[]` not `T`
- Browser supabase client (not admin) in client components — server-only modules cause build failure
- GC gate enforced in jobs page (viewerIsGC check) not inside CreateJobForm
- markHired calls revalidatePath('/jobs') server-side for automatic re-render

### Phase 10 Notes (BUG-06)

- The 400 error is on: `GET /rest/v1/applications?select=status&user_id=eq.{id}&status=eq.pending`
- Likely cause: RLS SELECT policy on applications uses `user_id = auth.uid()` but the query may be running as anon role, OR the `user_id` column was added in migration 004 which was missing until 2026-03-12
- Migration 004 was applied on 2026-03-12 — the bug may be self-resolved; verify before writing fix code
- Fix must not regress admin's ability to see all applications

### Deployment Context

- Vercel project: `contractors-connect` (prj_NzOPBEhplUq7MzdFVXZdqxhMSnYR)
- Production domain: hardhatsocial.net
- GitHub repo: dylanvazquezzz/hard-hat-social (branch: master)
- Auto-deploy: Vercel auto-deploys on every push to master — Phase 10 should wire this into GSD completion flow

### Admin Accounts

- dylan@mediaflooding.com — original admin
- admin@hardhatsocial.net — added 2026-03-12, password test1234

## Session Continuity

Last session: 2026-03-12T01:20:00.000Z
Stopped at: v1.3 planning complete — roadmap and requirements written
Next action: Begin Phase 10 — auto-deploy wiring + BUG-06 diagnosis
Resume file: None
