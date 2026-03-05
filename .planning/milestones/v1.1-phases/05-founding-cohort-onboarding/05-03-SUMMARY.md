---
phase: 05-founding-cohort-onboarding
plan: "03"
subsystem: ui
tags: [react, nextjs, supabase, typescript, admin]

# Dependency graph
requires:
  - phase: 05-founding-cohort-onboarding
    provides: admin cert management page at /admin/contractors/[id]
provides:
  - Inline cert editing via CertRow client component
  - updateCertification server action for partial cert updates
  - Admin can correct auto-created cert records without leaving the page
affects:
  - admin cert management page
  - public contractor profiles (revalidated on cert update)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server component page with 'use client' row-level component for per-item edit state
    - useTransition for async server action calls with pending UI state
    - Import server actions from 'use server' file into client component for form actions

key-files:
  created:
    - app/admin/contractors/[id]/CertRow.tsx
  modified:
    - app/admin/contractors/[id]/actions.ts
    - app/admin/contractors/[id]/page.tsx

key-decisions:
  - "CertRow is a client component — only cert rows opt into client, page.tsx stays server"
  - "Cancel handler resets local state to original cert prop values — no extra fetch needed"
  - "deleteCertification imported from actions.ts in CertRow — calling server action import from client component form action is valid in Next.js 14"

patterns-established:
  - "Pattern: Server-component page + client-component rows for per-item edit state without full-page client boundary"

requirements-completed: []

# Metrics
duration: 8min
completed: 2026-03-04
---

# Phase 5 Plan 03: Inline Cert Editing Summary

**Inline cert edit form in admin via CertRow client component — admin can update name, issuing body, cert number, expiry date, and verified flag without leaving the page**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-04T00:00:00Z
- **Completed:** 2026-03-04T00:08:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added `updateCertification` server action to actions.ts with same pattern as existing add/delete actions
- Created CertRow.tsx as a 'use client' component with per-row toggle between display and edit state
- Inline edit form pre-fills all cert fields; Save calls updateCertification and collapses row; Cancel resets state
- page.tsx updated to map certs to CertRow — page remains a server component, only rows are client

## Task Commits

Each task was committed atomically:

1. **Task 1: Add updateCertification server action** - `c3680dd` (feat)
2. **Task 2: Create CertRow client component and update page to use it** - `0701583` (feat)

**Plan metadata:** (pending docs commit)

## Files Created/Modified
- `app/admin/contractors/[id]/CertRow.tsx` - New 'use client' component; displays cert row with Edit/Remove buttons; expands to inline edit form on Edit click
- `app/admin/contractors/[id]/actions.ts` - Added `updateCertification(certId, fields, contractorId)` server action
- `app/admin/contractors/[id]/page.tsx` - Removed inline cert render and deleteCertification import; now maps certs to `<CertRow>` components

## Decisions Made
- CertRow remains a purely client component — only cert rows opt into client-side state, keeping the page server-rendered for performance
- Cancel handler resets all local state to original `cert` prop values without any extra database fetch
- Calling imported server action (`deleteCertification`) from a client component form action is valid in Next.js 14 App Router

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Next.js 14 build produced a `pages-manifest.json ENOENT` error after "Compiled successfully" — this is a known race condition in the Next.js build process unrelated to our changes. TypeScript compilation and ESLint both passed cleanly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Admin can now correct auto-created cert records (wrong name, missing cert number, etc.) without leaving the page or using Supabase dashboard
- Remove button continues to work as before
- Public contractor profiles revalidated on cert update via revalidatePath

## Self-Check: PASSED

- FOUND: app/admin/contractors/[id]/CertRow.tsx
- FOUND: app/admin/contractors/[id]/actions.ts
- FOUND: app/admin/contractors/[id]/page.tsx
- FOUND commit c3680dd (feat(05-03): add updateCertification server action)
- FOUND commit 0701583 (feat(05-03): add inline cert editing via CertRow client component)

---
*Phase: 05-founding-cohort-onboarding*
*Completed: 2026-03-04*
