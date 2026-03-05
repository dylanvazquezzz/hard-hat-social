---
phase: 05-founding-cohort-onboarding
plan: 02
subsystem: ui
tags: [next.js, tailwind, profile, onboarding, welcome]

# Dependency graph
requires: []
provides:
  - Welcome banner on /profile for approved contractors with no avatar
  - State-driven banner dismissal via avatar upload (no dismiss button)
affects: [05-founding-cohort-onboarding]

# Tech tracking
tech-stack:
  added: []
  patterns: [Conditional render gated on contractor status + missing avatar_url]

key-files:
  created: []
  modified:
    - app/profile/page.tsx

key-decisions:
  - "Banner condition contractor && !profile?.avatar_url leverages existing loadContractor filter (.eq('status', 'approved')) so pending users get null contractor and never see the banner"
  - "No dismiss button — avatar upload IS the dismiss action; handleAvatarUpload sets profile.avatar_url in state, React re-renders and hides banner instantly"

patterns-established:
  - "Onboarding nudges are state-driven (data presence = completion) rather than session/localStorage flags"

requirements-completed: []

# Metrics
duration: 3min
completed: 2026-03-04
---

# Phase 5 Plan 02: Welcome Banner Summary

**Welcome banner on /profile replaces generic checklist — amber-accented, warm copy, auto-dismisses on avatar upload via React state**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-04T00:00:00Z
- **Completed:** 2026-03-04T00:03:00Z
- **Tasks:** 1 of 1
- **Files modified:** 1

## Accomplishments
- Removed `onboardingItems` array and its conditional population logic from `app/profile/page.tsx`
- Added welcome banner with condition `contractor && !profile?.avatar_url`
- Banner uses "Welcome to Contractors Connect" headline with amber accent styling matching the existing dark slate design system
- Banner disappears automatically once avatar is uploaded — no dismiss button needed

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace onboarding checklist with welcome banner** - `b08ae92` (feat)

**Plan metadata:** (docs commit pending)

## Files Created/Modified
- `app/profile/page.tsx` - Replaced generic onboarding checklist banner with warm welcome banner for approved contractors missing an avatar

## Decisions Made
- Banner condition `contractor && !profile?.avatar_url` works because `loadContractor` already filters `.eq('status', 'approved')`, so pending users (who have no `contractors` row) get `null` — no extra status check needed in JSX
- No dismiss button: photo upload is the semantic completion action; `handleAvatarUpload` already updates `profile.avatar_url` in state, which hides the banner on re-render without any reload

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Build has pre-existing static export failures on `/apply` and `/` (Supabase env vars missing at build time) — unrelated to this change. TypeScript compilation passed clean (`✓ Compiled successfully`).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Welcome banner is live for approved contractors with no avatar
- Banner disappears on avatar upload — smooth first-run experience for founding cohort welders
- No blockers

---
*Phase: 05-founding-cohort-onboarding*
*Completed: 2026-03-04*
