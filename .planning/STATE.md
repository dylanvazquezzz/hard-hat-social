---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Rebrand & Growth
status: completed
stopped_at: Completed 09-02-PLAN.md — SubSelectorModal and hired flow complete
last_updated: "2026-03-10T01:08:13.055Z"
last_activity: 2026-03-10 — 09-01 complete; migration 009, server actions, components, page rebuilt
progress:
  total_phases: 9
  completed_phases: 3
  total_plans: 8
  completed_plans: 7
  percent: 75
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-04)

**Core value:** A contractor can find and contact a verified sub in their trade within 5 minutes — zero unverified people, no spam, no guesswork.
**Current focus:** v1.2 Phase 9 — Jobs UI

## Current Position

Phase: 9 of 9 (Jobs UI) — COMPLETE
Plan: 2 of 2 in current phase — all tasks complete
Status: 09-02 complete — SubSelectorModal and hired flow wired into JobCard
Last activity: 2026-03-10 — 09-02 complete; SubSelectorModal, JobCard modal wiring

Progress: [█████████░] 88% (v1.2 phases — 7/8 plans complete)

## Accumulated Context

### From v1.1

- Use `server-only` package on lib/supabase-admin.ts and lib/email.ts — build fails hard vs silently leaking
- Storage migration must DROP old permissive policies before creating strict replacements
- approveApplication() maps document_urls to certifications rows with verified=true
- Query applications table (not contractors) for pending check — pending users have no contractors row yet
- NEXT_PUBLIC_APP_URL must be set in Vercel before NEXT_PUBLIC_CONTACT_EMAIL — email links read from APP_URL

### Phase 6 Critical Notes

- Start Resend DNS for hardhatsocial.net BEFORE writing any code — 48-hour propagation
- Rebrand touches 4 systems atomically: Vercel env var + redeploy, Supabase Site URL + redirect allowlist, Resend domain DNS, email.ts fallback constant
- Send a real test approval email to personal Gmail BEFORE onboarding any real user
- BUG-02 and BRAND-04/05/06 share the same env var root cause — fix together, verify together

### Phase 6 Decisions (from execution)

- DNS records must be added to GoDaddy before Vercel can verify domain — 24-48 hour propagation window; project renames can be done immediately in parallel
- Resend domain hardhatsocial.net must be verified (SPF + DKIM) before approval emails land in inbox
- Keep old Supabase Auth redirect URLs in allowlist until hardhatsocial.net auth is confirmed working
- Supabase project rename is cosmetic only — project ref, URL, and API keys remain unchanged
- NEXT_PUBLIC_APP_URL = https://hardhatsocial.net must be set in Vercel before redeploying

### Phase 7 Decisions (from execution)

- Sidebar links go to /contractors/[id] not /u/[username] per locked project decision
- FeedSidebar is props-driven (no internal async) — page fetches data, passes as props; keeps component reusable
- Auth cookie parsed server-side for viewer detection — no client fetch, no hydration flash
- Suggested People falls back to Recently Verified when viewer has no trade or is not logged in
- Sidebar hidden entirely below lg breakpoint; feed takes full width on mobile

### Phase 9 Decisions (from execution)

- Cast Supabase dual-FK query result as `unknown as Job[]` — TS infers joined arrays as `T[]` not `T`, requires intermediate cast
- showModal state wired in JobCard for "Mark Hired" but SubSelectorModal deferred to plan 09-02
- GC gate enforced in jobs page (viewerIsGC check) not inside CreateJobForm component — keeps form dumb and reusable
- Browser supabase client (not admin) used in SubSelectorModal — client components cannot import server-only modules without build failure
- Modal is separate component (SubSelectorModal) not inline JSX — keeps JobCard single-responsibility
- No additional client state needed after hiring — markHired calls revalidatePath('/jobs') server-side causing automatic re-render

### Phase 8 Decisions (from execution)

- Used text + CHECK for jobs.status (not Postgres ENUM) — consistent with contractors.status and posts.category
- BEFORE UPDATE trigger (not AFTER) — only BEFORE can prevent the write from landing
- hired_contractor_id nullable — only set on open->hired transition; NULL for open jobs
- Two SELECT RLS policies (public open + GC own) instead of one combined — explicit and auditable
- is_gc() uses security definer to prevent privilege escalation in RLS context

### Pending Todos

- Complete infrastructure cutover: GoDaddy DNS, Vercel domain verify, NEXT_PUBLIC_APP_URL update, Supabase Auth URL update, Resend domain verify
- Test approval email from hardhatsocial.net to personal Gmail before onboarding any real user
- Phase 7 complete: /explore two-column layout visually verified by user (Task 3 checkpoint approved)

### Blockers/Concerns

- DNS propagation: 24-48 hours after GoDaddy records are added before Vercel can verify hardhatsocial.net

## Session Continuity

Last session: 2026-03-10T01:08:13.053Z
Stopped at: Completed 09-02-PLAN.md — SubSelectorModal and hired flow complete
Next action: Phase 9 complete — all plans done; jobs lifecycle (post, hire, complete) fully functional
Resume file: None
