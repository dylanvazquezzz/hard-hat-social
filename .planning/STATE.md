---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Rebrand & Growth
status: executing
stopped_at: "07-01 tasks 1+2 complete; checkpoint:human-verify pending for Task 3"
last_updated: "2026-03-08T23:34:03.566Z"
last_activity: 2026-03-05 — 06-03 SUMMARY created; infrastructure cutover checklist ready
progress:
  total_phases: 9
  completed_phases: 2
  total_plans: 4
  completed_plans: 4
  percent: 38
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-04)

**Core value:** A contractor can find and contact a verified sub in their trade within 5 minutes — zero unverified people, no spam, no guesswork.
**Current focus:** v1.2 Phase 7 — Feed Redesign

## Current Position

Phase: 7 of 9 (Feed Redesign)
Plan: 1 of 1 in current phase (07-01 tasks 1+2 complete; checkpoint:human-verify at Task 3)
Status: In progress — awaiting human visual verification of two-column Explore layout
Last activity: 2026-03-08 — 07-01 Tasks 1+2 committed; FeedSidebar + Explore page restructured

Progress: [██████████] 100% (v1.2 phases — 4/4 plans complete)

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

### Pending Todos

- Complete infrastructure cutover: GoDaddy DNS, Vercel domain verify, NEXT_PUBLIC_APP_URL update, Supabase Auth URL update, Resend domain verify
- Test approval email from hardhatsocial.net to personal Gmail before onboarding any real user
- Human visual verification of /explore two-column layout, sticky sidebar, responsive behavior (Task 3 checkpoint)

### Blockers/Concerns

- DNS propagation: 24-48 hours after GoDaddy records are added before Vercel can verify hardhatsocial.net

## Session Continuity

Last session: 2026-03-08T23:34:03.565Z
Stopped at: 07-01 tasks 1+2 complete; checkpoint:human-verify pending for Task 3
Next action: Human visits http://localhost:3000/explore to verify two-column layout, sticky sidebar, responsive behavior; then approve Task 3 checkpoint to complete plan 07-01
Resume file: .planning/phases/07-feed-redesign/07-01-PLAN.md (Task 3 checkpoint)
