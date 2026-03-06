---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Rebrand & Growth
status: executing
stopped_at: Completed 06-02 brand identity plan — human-verify checkpoint approved; Phase 6 plans all complete
last_updated: "2026-03-06T03:31:12.733Z"
last_activity: 2026-03-05 — 06-03 SUMMARY created; infrastructure cutover checklist ready
progress:
  total_phases: 9
  completed_phases: 1
  total_plans: 3
  completed_plans: 3
  percent: 38
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-04)

**Core value:** A contractor can find and contact a verified sub in their trade within 5 minutes — zero unverified people, no spam, no guesswork.
**Current focus:** v1.2 Phase 6 — Bug Fixes & Rebrand

## Current Position

Phase: 6 of 9 (Bug Fixes & Rebrand)
Plan: 3 of 3 in current phase (all plans documented — awaiting infrastructure actions)
Status: In progress — awaiting DNS propagation (24-48hr) and human dashboard actions
Last activity: 2026-03-05 — 06-03 SUMMARY created; infrastructure cutover checklist ready

Progress: [████░░░░░░] 38% (v1.2 phases — 3/8 plans complete)

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

### Pending Todos

- Complete infrastructure cutover: GoDaddy DNS, Vercel domain verify, NEXT_PUBLIC_APP_URL update, Supabase Auth URL update, Resend domain verify
- Test approval email from hardhatsocial.net to personal Gmail before onboarding any real user

### Blockers/Concerns

- DNS propagation: 24-48 hours after GoDaddy records are added before Vercel can verify hardhatsocial.net

## Session Continuity

Last session: 2026-03-06T03:12:46.863Z
Stopped at: Completed 06-02 brand identity plan — human-verify checkpoint approved; Phase 6 plans all complete
Next action: After all 4 infrastructure tasks complete, mark Phase 6 done and proceed to Phase 7
Resume file: None
