---
phase: 09-jobs-ui
plan: "01"
subsystem: ui
tags: [nextjs, supabase, rls, server-actions, tailwind, typescript]

# Dependency graph
requires:
  - phase: 08-jobs-schema
    provides: jobs table with status check constraint, RLS policies, status-transition trigger, FK to contractors
provides:
  - Jobs board page reading from jobs table with dual FK hint syntax
  - CreateJobForm client component for GC-only job posting
  - JobCard client component with status pill and conditional owner actions
  - createJob / markHired / markCompleted server actions
  - Migration 009 RLS policy for hired contractor SELECT access
affects: [10-jobs-hired, jobs board, contractor profiles]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Cookie auth pattern in server component (find -auth-token, parse JSON[0], admin.auth.getUser)
    - Dual FK hint syntax for Supabase joins to same table (contractors!jobs_gc_contractor_id_fkey)
    - cast jobsData as unknown as Job[] when Supabase infers joined relations as arrays

key-files:
  created:
    - supabase/migrations/009_jobs_hired_select.sql
    - app/jobs/actions.ts
    - components/JobCard.tsx
    - components/CreateJobForm.tsx
  modified:
    - app/jobs/page.tsx

key-decisions:
  - "Cast Supabase dual-FK query result as unknown as Job[] — TS infers joined arrays as T[] not T, requires intermediate unknown cast"
  - "showModal state in JobCard wired but modal deferred to plan 09-02 (SubSelectorModal)"
  - "CreateJobForm rendered only when viewerIsGC === true and viewerContractorId is set — enforced in page, not in form component"

patterns-established:
  - "Dual FK hint syntax: alias:table!foreign_key_name(fields) — required when two FKs point to the same table"
  - "Server action pattern: getSupabaseAdmin(), mutate, throw on error, revalidatePath"
  - "Cookie auth in server component: find -auth-token cookie, JSON.parse[0], admin.auth.getUser"

requirements-completed: [JOBS-01]

# Metrics
duration: 3min
completed: 2026-03-10
---

# Phase 9 Plan 01: Jobs UI Summary

**Jobs board rebuilt on jobs table with GC-only CreateJobForm, status-pill JobCard, and three server actions (createJob, markHired, markCompleted)**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-10T01:01:48Z
- **Completed:** 2026-03-10T01:04:01Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Replaced old posts-based jobs page with a server component reading from the `jobs` table using dual FK hint syntax
- GC detection via cookie auth pattern — CreateJobForm shown only to approved General Contractors
- JobCard displays status pill (emerald/amber/slate), relative date, GC name, and conditional owner action buttons
- Three server actions cover the full job lifecycle: create (open), mark hired, mark completed

## Task Commits

Each task was committed atomically:

1. **Task 1: Migration 009 and server actions** - `716db65` (feat)
2. **Task 2: JobCard and CreateJobForm components** - `738e90a` (feat)
3. **Task 3: Rebuild jobs page server component** - `f781835` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `supabase/migrations/009_jobs_hired_select.sql` - RLS SELECT policy for hired contractor access
- `app/jobs/actions.ts` - createJob, markHired, markCompleted server actions using getSupabaseAdmin
- `components/JobCard.tsx` - Client component with emerald/amber/slate status pills and owner action buttons
- `components/CreateJobForm.tsx` - Client form component posting to createJob server action
- `app/jobs/page.tsx` - Server component rebuilt to read from jobs table; old posts-based implementation removed

## Decisions Made
- Cast `jobsData as unknown as Job[]` rather than direct cast — TypeScript infers Supabase dual-FK joins as `T[]` (arrays), not `T`, so the intermediate `unknown` is required for type safety without suppression.
- `showModal` state wired in JobCard for the "Mark Hired" button but modal deferred to plan 09-02 — placeholder message renders when state is true to keep wiring intact.
- GC gate enforced in the page (`viewerIsGC && viewerContractorId`) rather than inside the form component — keeps the form dumb and reusable.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript type error on dual-FK query cast**
- **Found during:** Task 3 (Rebuild jobs page server component)
- **Issue:** `jobsData as Job[]` failed — Supabase infers `gc_contractor` as `{ full_name: any; trade: any; }[]` (array), incompatible with `Job.gc_contractor: { full_name: string; trade: string }` (single object)
- **Fix:** Changed cast to `jobsData as unknown as Job[]` per TypeScript's requirement for overlapping type conversions
- **Files modified:** app/jobs/page.tsx
- **Verification:** Build passed cleanly after fix
- **Committed in:** f781835 (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 type error)
**Impact on plan:** Required for TypeScript compilation. No scope creep. Runtime behavior unchanged — Supabase returns single objects for FK joins, not arrays.

## Issues Encountered
None beyond the type cast deviation above.

## User Setup Required
None - no external service configuration required. Migration 009 must be run against production Supabase when deploying.

## Next Phase Readiness
- Jobs board reads from `jobs` table and is live for all visitors
- GCs can post jobs immediately via CreateJobForm
- JobCard "Mark Hired" button is wired and waiting for SubSelectorModal (plan 09-02)
- Plan 09-02 can import `markHired` from `app/jobs/actions.ts` and build the contractor picker modal

---
*Phase: 09-jobs-ui*
*Completed: 2026-03-10*
