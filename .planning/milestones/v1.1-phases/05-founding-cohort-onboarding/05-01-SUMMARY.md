---
phase: 05-founding-cohort-onboarding
plan: 01
subsystem: auth
tags: [supabase-auth, resend, email, next.js, suspense, useSearchParams]

# Dependency graph
requires:
  - phase: 01-production-hardening
    provides: email.ts with Resend approval email and APP_URL env var
  - phase: 01-production-hardening
    provides: app/auth/page.tsx with sign-in flow
provides:
  - Approval email CTA links to production URL with ?redirect=/profile
  - Auth page reads ?redirect= param and routes after sign-in dynamically
  - /apply page shows invite-only banner when NEXT_PUBLIC_CONTACT_EMAIL is set
affects: [founding-cohort-onboarding, auth-flow, apply-flow]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Suspense wrapper pattern for useSearchParams in Next.js 14 App Router client components
    - NEXT_PUBLIC env var conditional rendering (build-time guard, no undefined leakage)

key-files:
  created: []
  modified:
    - lib/email.ts
    - app/auth/page.tsx
    - app/apply/page.tsx

key-decisions:
  - "Rename current AuthPage to AuthPageInner, wrap in Suspense shell as default export — satisfies Next.js 14 useSearchParams requirement cleanly"
  - "Both sign-in links in approval email updated to ?redirect=/profile for consistency between list item and CTA button"
  - "Banner in /apply guarded by process.env.NEXT_PUBLIC_CONTACT_EMAIL truthy check — no visible output if env var absent at build time"

patterns-established:
  - "useSearchParams pattern: rename component to Inner, export Suspense wrapper as default"
  - "NEXT_PUBLIC env var guard: {process.env.NEXT_PUBLIC_VAR && (...)} prevents undefined rendering in client components"

requirements-completed: []

# Metrics
duration: 2min
completed: 2026-03-05
---

# Phase 5 Plan 1: Founding Cohort Onboarding Fixes Summary

**Fixed production-blocking approval email localhost bug, dynamic post-signin redirect via ?redirect= param, and invite-only banner on /apply using NEXT_PUBLIC_CONTACT_EMAIL env var**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-05T01:48:37Z
- **Completed:** 2026-03-05T01:49:57Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Fixed approval email "Sign In Now" CTA and list-item link from `/auth` to `/auth?redirect=/profile` — welders now land on their profile after clicking the email link
- Updated auth page to read `?redirect=` query param and route to it after successful sign-in, with Suspense wrapper satisfying Next.js 14's useSearchParams requirement
- Added conditional invite-only banner to `/apply` page — renders with correct mailto link when `NEXT_PUBLIC_CONTACT_EMAIL` is set, completely absent (no error, no "undefined") when not set

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix approval email CTA and update auth redirect logic** - `8c4ca47` (fix)
2. **Task 2: Add invite-only banner to /apply page** - `84b73e7` (feat)

## Files Created/Modified

- `/Users/dylanvazquez/Desktop/contractors-connect/lib/email.ts` — Both sign-in links updated to include `?redirect=/profile`
- `/Users/dylanvazquez/Desktop/contractors-connect/app/auth/page.tsx` — Added useSearchParams, Suspense wrapper, dynamic redirectTo routing after sign-in
- `/Users/dylanvazquez/Desktop/contractors-connect/app/apply/page.tsx` — Added invite-only banner as first child in return JSX, guarded by NEXT_PUBLIC_CONTACT_EMAIL env var

## Decisions Made

- Renamed `AuthPage` to `AuthPageInner` and exported a new `AuthPage` default that wraps it in `<Suspense fallback={null}>` — the cleanest pattern for satisfying Next.js 14's requirement that `useSearchParams` be inside a Suspense boundary
- Both the bulleted list sign-in link and the CTA button in `email.ts` updated to `?redirect=/profile` for consistency — the list item said "sign in at..." and now both point the same place
- Banner in `/apply` uses build-time `process.env.NEXT_PUBLIC_CONTACT_EMAIL` conditional — no runtime check, no risk of "undefined" appearing as visible text

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Next.js `.next` cache corruption caused an intermittent `ENOENT pages-manifest.json` error on second consecutive build. Resolved by deleting `.next` directory and rebuilding clean. Not related to code changes — known Next.js build cache edge case.

## User Setup Required

None - no external service configuration required beyond what was already planned.

To see the invite-only banner on `/apply`, set `NEXT_PUBLIC_CONTACT_EMAIL` in Vercel environment variables (e.g., `hello@contractorsconnect.com`). If left unset, the banner is simply absent — no error.

## Next Phase Readiness

- Email CTA bug is fixed — safe to approve real welding applicants without sending them a localhost link
- Auth page redirect is dynamic — future email flows can use `?redirect=` for any destination
- No blockers for founding cohort onboarding

---
*Phase: 05-founding-cohort-onboarding*
*Completed: 2026-03-05*
