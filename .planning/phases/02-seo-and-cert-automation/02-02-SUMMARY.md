---
phase: 02-seo-and-cert-automation
plan: "02"
subsystem: auth
tags: [supabase, nextjs, rls, applications, pending-gate]

# Dependency graph
requires:
  - phase: 01-production-hardening
    provides: Deployed Supabase schema with applications table and status field
provides:
  - Pending applicant access control gate on /contractors, /jobs, /profile
  - PendingReviewMessage component pattern (inline in layout/page)
  - Auth-aware routing that distinguishes no-application users from pending users
affects: [any future routes that should be gated, explore page remains open]

# Tech tracking
tech-stack:
  added: []
  patterns: [client layout wrapping server page for auth gates, maybeSingle() for safe no-row queries]

key-files:
  created:
    - app/jobs/layout.tsx
  modified:
    - app/contractors/layout.tsx
    - app/profile/page.tsx

key-decisions:
  - "Query applications table (not contractors) for pending check — pending users have no contractors row yet"
  - "Use maybeSingle() not single() to avoid errors when no pending application row exists"
  - "No-application users get full access — only active pending rows trigger the gate"
  - "Jobs page is a server component so pending gate lives in app/jobs/layout.tsx (client component wrapper)"
  - "isPending check in profile fires before any data loads — avoids unnecessary DB queries for pending users"

patterns-established:
  - "Pending gate pattern: query applications WHERE user_id = X AND status = 'pending' MAYBYSINGLE — used in all three locations"
  - "Client layout wrapping server page: create layout.tsx alongside server page.tsx to inject client-side auth logic"

requirements-completed: [AUTH-01]

# Metrics
duration: 8min
completed: 2026-03-04
---

# Phase 2 Plan 02: Pending Applicant Access Control Summary

**Client-side pending gate blocks /contractors, /jobs, and /profile for applicants awaiting review — with /explore remaining fully open — using maybeSingle() applications query in three layouts/pages**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-04T00:53:40Z
- **Completed:** 2026-03-04T01:01:40Z
- **Tasks:** 2
- **Files modified:** 3 (1 created, 2 modified)

## Accomplishments

- Extended `app/contractors/layout.tsx` to check for a pending application row after session verification, blocking directory access for pending users
- Created new `app/jobs/layout.tsx` as a client component wrapper that applies the same pending gate to the server-rendered jobs page
- Added `isPending` state to `app/profile/page.tsx` with early return before any profile data loads, preventing dashboard access for pending users

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend contractors layout with pending check** - `3942c5e` (feat)
2. **Task 2: Create jobs layout and add pending check to profile page** - `a46e68d` (feat)

**Plan metadata:** (final commit — see below)

## Files Created/Modified

- `app/contractors/layout.tsx` - Extended with PendingReviewMessage and applications table check; replaced boolean checked state with loading/pending/ok status enum
- `app/jobs/layout.tsx` - New client layout component wrapping server jobs page; blocks pending users, redirects unauthenticated users to /auth
- `app/profile/page.tsx` - Added isPending state; pending check fires after session check, before profile/contractor/posts data loads

## Decisions Made

- Query `applications` table (not `contractors`) — pending users have submitted an application but have no `contractors` row yet (that's created on approval)
- Use `.maybeSingle()` not `.single()` — avoids PostgREST error when no pending row exists (users with approved, rejected, or no application at all return null safely)
- Jobs page (`app/jobs/page.tsx`) is a server component with `export const dynamic = 'force-dynamic'` — cannot add client auth checks directly, so the gate lives in a new `app/jobs/layout.tsx` client component
- `/explore` page deliberately not touched — plan spec explicitly keeps it accessible to pending users as a safe landing space

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

First `npm run build` attempt hit a stale `.next/server/next-font-manifest.json` error (pre-existing artifact from prior session). Cleared `.next` cache with `rm -rf .next` and rebuilt cleanly. TypeScript compilation passed on both attempts — the font manifest error was a cache artifact, not a code issue.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- AUTH-01 requirement fully satisfied: pending applicants are gated from contractor directory, jobs board, and profile dashboard
- /explore remains a safe landing page for pending users to engage with community content
- Gate is based purely on applications table status — works immediately without any migration or config change
- No blockers for remaining plans in this phase

## Self-Check: PASSED

- app/contractors/layout.tsx: FOUND
- app/jobs/layout.tsx: FOUND
- app/profile/page.tsx: FOUND
- 02-02-SUMMARY.md: FOUND
- Commit 3942c5e: FOUND
- Commit a46e68d: FOUND
