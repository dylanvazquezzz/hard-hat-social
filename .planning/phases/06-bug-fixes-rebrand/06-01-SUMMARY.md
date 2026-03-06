---
phase: 06-bug-fixes-rebrand
plan: 01
subsystem: ui, api
tags: [next.js, supabase, resend, revalidatePath, navbar, email]

# Dependency graph
requires: []
provides:
  - "revalidatePath('/contractors') and revalidatePath('/') on admin approve/reject actions"
  - "Admin nav link in both desktop dropdown and mobile hamburger menus"
  - "email.ts fallback domain updated to hardhatsocial.net with Hard Hat Social brand text"
affects: [06-02-rebrand, future admin work, email-sending flows]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Admin check uses NEXT_PUBLIC_ADMIN_EMAILS env var (client-safe) in NavBar client component"
    - "revalidatePath covers all affected routes (/admin, /contractors, /) after mutations"

key-files:
  created: []
  modified:
    - app/admin/actions.ts
    - components/NavBar.tsx
    - lib/email.ts

key-decisions:
  - "BUG-05 documented as data gap (not code bug) — cert display code is correct, pre-Phase-2 contractors need manual cert entry via admin"
  - "email.ts brand text updated in same pass as domain fallback (simpler than revisiting in 06-02)"

patterns-established:
  - "Admin route access via NEXT_PUBLIC_ADMIN_EMAILS env var — same pattern as admin/layout.tsx"

requirements-completed: [BUG-01, BUG-02, BUG-03, BUG-04, BUG-05]

# Metrics
duration: 2min
completed: 2026-03-05
---

# Phase 06 Plan 01: Bug Fixes (Admin Nav, Email Domain, Cache Revalidation) Summary

**revalidatePath added to admin actions for /contractors and /, admin link added to NavBar for admin emails, email.ts fallback domain updated to hardhatsocial.net with Hard Hat Social brand text**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-05T23:56:17Z
- **Completed:** 2026-03-05T23:58:14Z
- **Tasks:** 4 (3 code + 1 human-verify checkpoint — approved by user)
- **Files modified:** 3

## Accomplishments
- revalidatePath('/contractors') and revalidatePath('/') added to both approveApplication() and rejectApplication() — approved contractors now appear in directory and homepage count updates immediately after admin action (BUG-03, BUG-04)
- isAdmin state added to NavBar with conditional Admin link in both desktop dropdown and mobile hamburger menus (BUG-01)
- email.ts FROM and APP_URL fallback constants updated from contractorsconnect.com to hardhatsocial.net, all brand text in email subjects and bodies updated to "Hard Hat Social" (BUG-02)

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix revalidatePath coverage in admin actions** - `0246cda` (fix)
2. **Task 2: Add admin link to NavBar dropdown (desktop and mobile)** - `875dfa7` (feat)
3. **Task 3: Fix email.ts domain fallbacks and brand text** - `f41e05b` (fix)

## Files Created/Modified
- `app/admin/actions.ts` - Added revalidatePath('/contractors') and revalidatePath('/') after revalidatePath('/admin') in both approveApplication() and rejectApplication()
- `components/NavBar.tsx` - Added isAdmin state, admin email check in getSession and onAuthStateChange, conditional Admin link in desktop dropdown and mobile hamburger
- `lib/email.ts` - Updated FROM/APP_URL fallback constants to hardhatsocial.net; updated all "Contractors Connect" brand text to "Hard Hat Social" in email subjects and bodies

## Decisions Made
- BUG-05 documented as a data gap, not a code bug — the certifications section renders correctly when cert rows exist; pre-Phase-2 contractor profiles that show no certs need manual cert record entry via the admin interface
- email.ts brand text updated in the same pass as the domain fallback fix (plan specified this explicitly rather than deferring to 06-02)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required by this plan.

## Next Phase Readiness
- All 5 critical bugs addressed (BUG-01 through BUG-05)
- BUG-05 (certifications not visible) confirmed as data gap — no code change needed; admin should manually enter cert records for contractors approved before Phase 2
- email.ts brand text is now Hard Hat Social — plan 06-02 (rebrand) can skip email.ts since it was updated here
- Human verification checkpoint at Task 4 passed — user confirmed all checks: admin link visible in nav, directory updates immediately after approval, email fallbacks confirmed

---
*Phase: 06-bug-fixes-rebrand*
*Completed: 2026-03-05*
