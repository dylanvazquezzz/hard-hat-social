---
phase: 01-production-hardening
plan: 03
subsystem: infra
tags: [resend, supabase, vercel, dns, deployment, checklist]

# Dependency graph
requires:
  - phase: 01-production-hardening
    provides: server-only guards (01-01) and storage RLS migration 007 (01-02) — both code-level work now complete
provides:
  - DEPLOYMENT-CHECKLIST.md with exact manual steps for Resend domain verification and Supabase Auth URL configuration
  - Documented migration 007 execution instructions for production Supabase
  - Human confirmation that Resend domain verification has been initiated
affects:
  - production email delivery (approval/rejection emails)
  - password reset and auth email redirect URLs
  - future phases deploying to production

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Deployment checklist: document all external-service steps that cannot be automated (DNS, dashboard-only settings) before any automated deployment"
    - "Resend domain verification must start first — 48-hour DNS propagation is the longest lead-time task"

key-files:
  created:
    - .planning/phases/01-production-hardening/DEPLOYMENT-CHECKLIST.md
  modified: []

key-decisions:
  - "Resend domain verification must be started before any other deployment step — up to 48-hour DNS propagation window"
  - "Supabase Auth Site URL is a dashboard-only setting (cannot be configured via SQL migration or env var) — must be set manually"
  - "DEPLOYMENT-CHECKLIST.md includes both manual dashboard steps (Resend, Supabase Auth) and code-level steps (migration 007 push) to give a single source of truth for production deployment"

patterns-established:
  - "Pattern: External service steps that cannot be automated are documented in a DEPLOYMENT-CHECKLIST.md before code deployment begins"

requirements-completed:
  - PROD-01
  - PROD-02

# Metrics
duration: ~5min
completed: 2026-03-03
---

# Phase 1 Plan 03: Production Deployment Checklist Summary

**DEPLOYMENT-CHECKLIST.md created with exact Resend SPF/DKIM DNS steps, Supabase Auth Site URL configuration path, and migration 007 push instructions; user confirmed checklist reviewed and Resend verification initiated**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-02T (initial planning session)
- **Completed:** 2026-03-03T02:01:44Z
- **Tasks:** 2 (1 auto + 1 checkpoint)
- **Files modified:** 1

## Accomplishments
- Created DEPLOYMENT-CHECKLIST.md with five ordered steps covering all Phase 1 manual actions: Resend domain verification (start first — 48h DNS propagation), Supabase Auth URL configuration, migration 007 execution against production database, env var spot-check, and code deployment push
- Documented SPF, DKIM, and DMARC DNS record types with exact navigation paths in Resend dashboard
- Documented Supabase Auth URL configuration path (Authentication > URL Configuration > Site URL) with production URL and localhost redirect preservation
- Human checkpoint passed — user confirmed checklist reviewed and Resend domain verification initiated

## Task Commits

Each task was committed atomically:

1. **Task 1: Create deployment checklist document** - `50a0f6f` (feat)
2. **Task 2: Checkpoint — checklist reviewed by user** - human confirmation (no code commit needed)

## Files Created/Modified
- `.planning/phases/01-production-hardening/DEPLOYMENT-CHECKLIST.md` - Five-step production deployment checklist: Resend domain verification, Supabase Auth URL config, migration 007 push, env var spot-check, git push to trigger Vercel build

## Decisions Made
- Start Resend domain verification before any other step — DNS propagation (up to 48 hours) is the longest lead-time item in the entire Phase 1 deployment
- Supabase Auth Site URL cannot be set via migration or env var — it is a dashboard-only setting; must be done manually before real users attempt password reset
- Checklist covers both manual external service steps and code-level steps (migration push) to provide a single source of truth instead of splitting instructions across multiple documents

## Deviations from Plan

None - plan executed exactly as written. Task 1 created DEPLOYMENT-CHECKLIST.md per spec; Task 2 checkpoint was approved by user with "checklist reviewed".

## Issues Encountered
None.

## User Setup Required

Manual configuration required. See [DEPLOYMENT-CHECKLIST.md](./../01-production-hardening/DEPLOYMENT-CHECKLIST.md) for:
- Step 1: Resend DNS records (SPF, DKIM, DMARC) — start immediately, 48h propagation
- Step 2: Supabase Auth URL configuration (Site URL to production, add localhost as redirect)
- Step 3: Run migration 007 against production Supabase (CLI or SQL editor)
- Step 4: Verify all Vercel environment variables
- Step 5: `git push origin main` to trigger Vercel deployment

## Next Phase Readiness
- Phase 1 (Production Hardening) is complete from a code perspective
- All three Phase 1 code tasks are done: server-only guards (01-01), storage RLS policies (01-02), deployment checklist (01-03)
- Remaining work is human-executed dashboard configuration per DEPLOYMENT-CHECKLIST.md
- Phase 2 can begin in parallel with DNS propagation (it does not depend on Resend being verified)

## Self-Check: PASSED

- FOUND: .planning/phases/01-production-hardening/DEPLOYMENT-CHECKLIST.md
- FOUND commit 50a0f6f (Task 1: create production deployment checklist)
- FOUND: .planning/phases/01-production-hardening/01-03-SUMMARY.md

---
*Phase: 01-production-hardening*
*Completed: 2026-03-03*
