---
phase: 05-founding-cohort-onboarding
plan: 04
subsystem: infra
tags: [runbook, onboarding, vercel, resend, email, operations]

# Dependency graph
requires:
  - phase: 05-founding-cohort-onboarding
    provides: context and decisions for cohort launch ops (CONTEXT.md, RESEARCH.md)
provides:
  - Operational runbook for founding cohort onboarding (RUNBOOK.md)
  - Step-by-step Vercel env var setup checklist in dependency order
  - 8-step end-to-end test for full application-to-profile flow
  - Two copy-paste outreach message templates with production /apply URL
  - Post-approval admin workflow for cert record management
affects: [co-founder operations, founding welder onboarding]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Env var dependency order: NEXT_PUBLIC_APP_URL must be set and redeployed before NEXT_PUBLIC_CONTACT_EMAIL — email links read APP_URL at send time"

key-files:
  created:
    - .planning/phases/05-founding-cohort-onboarding/RUNBOOK.md
  modified: []

key-decisions:
  - "NEXT_PUBLIC_APP_URL set in Vercel dashboard as Step 1 — all email links read from this var; localhost bug already hit one real signup"
  - "End-to-end test (8 explicit steps) required before any real outreach — stops localhost URL bug from affecting cohort"
  - "Document gathering takes 1-3 weeks — outreach templates mention required docs upfront to set expectations"
  - "Runbook delivered as committed markdown in planning dir — not a user-facing page, co-founder reference artifact"

patterns-established:
  - "Operational runbook pattern: checklist in strict dependency order, smoke test gate before outreach, copy-paste templates"

requirements-completed: []

# Metrics
duration: 1min
completed: 2026-03-05
---

# Phase 5 Plan 04: Founding Cohort Operational Runbook Summary

**Sequential co-founder runbook: Vercel env vars in dependency order, 8-step end-to-end smoke test, and two copy-paste outreach templates for welders with docs checklist**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-05T01:48:54Z
- **Completed:** 2026-03-05T01:50:15Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- RUNBOOK.md created with all five sections in correct dependency order
- Pre-flight checklist puts `NEXT_PUBLIC_APP_URL` first (before `NEXT_PUBLIC_CONTACT_EMAIL`) with explicit redeploy instructions after each step
- 8-step end-to-end test mirrors exact welder experience: sign up → apply → admin approves → email arrives → click link → sign in → welcome banner → upload photo → search directory
- Two outreach templates (direct DM + group chat) with production `/apply` URL and upfront document requirements (AWS cert, state license, insurance)
- Notes section addresses document timing (1-3 weeks), free tier, contact info privacy, and admin access management

## Task Commits

Each task was committed atomically:

1. **Task 1: Write founding cohort operational runbook** - `cccc267` (docs)

**Plan metadata:** _(final commit below)_

## Files Created/Modified

- `.planning/phases/05-founding-cohort-onboarding/RUNBOOK.md` — operational runbook: Vercel env var setup, 8-step E2E test, outreach templates, post-approval workflow, notes

## Decisions Made

- NEXT_PUBLIC_APP_URL is listed as Step 1 (before NEXT_PUBLIC_CONTACT_EMAIL) because email links read from APP_URL at send time — setting it wrong caused the confirmed localhost bug on the first real signup
- End-to-end test is gated before any outreach, with explicit instruction to inspect the approval email href — this is the primary failure mode
- Document timing note (1-3 weeks) included in both the outreach templates and the Notes section — welders not expecting to gather docs are the primary drop-off source
- Runbook delivered as a committed planning artifact, not a user-facing page — co-founder follows it once, then relies on muscle memory

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — the runbook itself is the artifact that guides the co-founder through Vercel setup. No additional configuration required from this plan.

## Next Phase Readiness

- All founding cohort onboarding plans (05-01 through 05-04) are complete
- Co-founder has: approval email URL fix (05-01), first-sign-in redirect + welcome banner (05-02), inline cert editing (05-03), and now the operational runbook (05-04)
- Runbook is actionable immediately: set env vars, run test, start outreach
- Concern: `NEXT_PUBLIC_APP_URL` in production Vercel must still be set manually by the co-founder — this is an operational step, not a code step

---
*Phase: 05-founding-cohort-onboarding*
*Completed: 2026-03-05*
