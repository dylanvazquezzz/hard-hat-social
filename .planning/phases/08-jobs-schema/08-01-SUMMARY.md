---
phase: 08-jobs-schema
plan: 01
subsystem: database
tags: [postgres, supabase, rls, typescript, migrations]

# Dependency graph
requires:
  - phase: 01-initial
    provides: contractors table (referenced by jobs FK and is_gc() helper)
provides:
  - supabase/migrations/008_jobs_table.sql — jobs table DDL, is_gc() helper, BEFORE UPDATE trigger, RLS policies, 4 indexes
  - lib/types.ts — JobStatus union type and Job interface for Phase 9 queries
affects:
  - 09-jobs-ui (reads Job type and jobs table directly)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "text + CHECK for enum-like columns (consistent with contractors.status, posts.category)"
    - "BEFORE UPDATE trigger for database-layer state machine enforcement (prevents bypassing via app layer)"
    - "security definer helper function for RLS policy logic (consistent with is_approved_contractor())"
    - "USING + WITH CHECK on UPDATE policy prevents column reassignment attacks"

key-files:
  created:
    - supabase/migrations/008_jobs_table.sql
  modified:
    - lib/types.ts

key-decisions:
  - "Used text + CHECK for status (not Postgres ENUM) — consistent with project convention from 001_initial.sql"
  - "BEFORE UPDATE trigger (not AFTER) — only BEFORE can prevent the write from landing"
  - "hired_contractor_id is nullable — set only on open->hired transition; NULL on open jobs"
  - "Two SELECT policies (public open + GC own) instead of one combined — explicit and auditable"
  - "is_gc() uses security definer to prevent privilege escalation in RLS"

patterns-established:
  - "State machine in DB: status column + CHECK constraint + BEFORE UPDATE trigger = three-layer enforcement"
  - "Trigger blocks: completed->any, hired->open, hired with null hired_contractor_id"

requirements-completed: []

# Metrics
duration: 1min
completed: 2026-03-09
---

# Phase 8 Plan 01: Jobs Schema Summary

**`jobs` table migration with BEFORE UPDATE trigger enforcing state transitions (open/hired/completed) and RLS policies scoped to open-job visibility and GC-only mutations**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-03-09T01:04:35Z
- **Completed:** 2026-03-09T01:05:38Z
- **Tasks:** 2 of 3 complete (Task 3 is a human-verify checkpoint)
- **Files modified:** 2

## Accomplishments
- Supabase migration 008_jobs_table.sql written with all 6 sections: is_gc() helper, jobs table, trigger function, trigger, RLS policies, indexes
- JobStatus union type and Job interface added to lib/types.ts — ready for Phase 9 import
- npm run build and npm run lint both pass with no errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Write 008_jobs_table.sql migration** - `6ddb605` (feat)
2. **Task 2: Add JobStatus and Job interface to lib/types.ts** - `8642b74` (feat)
3. **Task 3: Verify migration applies and trigger enforces state transitions** - Pending human verification

## Files Created/Modified
- `supabase/migrations/008_jobs_table.sql` - Complete jobs table DDL with is_gc() helper, BEFORE UPDATE trigger, RLS policies, and 4 indexes
- `lib/types.ts` - Appended JobStatus union and Job interface; no existing types modified

## Decisions Made
- Used text + CHECK for status (not Postgres ENUM) — consistent with existing project convention from 001_initial.sql
- BEFORE UPDATE trigger (not AFTER) — only BEFORE can block the write
- hired_contractor_id nullable — only populated on open->hired transition
- Two SELECT RLS policies instead of one combined — public open + GC own are separate, auditable policies
- is_gc() uses security definer — prevents privilege escalation in RLS context

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
Task 3 requires manual verification against local Supabase. See checkpoint instructions below.

**Verification steps:**
1. Apply migration: `npx supabase db reset` locally, or paste 008_jobs_table.sql into Supabase dashboard SQL editor
2. Insert a test job using a real gc_contractor_id (trade = 'General Contractor')
3. Test trigger blocks hired->open (expect: ERROR: Cannot revert a hired job to open)
4. Test trigger blocks completed->any (expect: ERROR: Job status cannot change after completion)
5. Test anon SELECT returns only status='open' rows

## Next Phase Readiness
- Phase 9 (Jobs UI) can import `Job` and `JobStatus` from `lib/types.ts` immediately
- Migration needs to be applied to local/production Supabase before Phase 9 queries run
- All Phase 9 JOBS-01 through JOBS-04 requirements are unblocked once Task 3 is verified

---
*Phase: 08-jobs-schema*
*Completed: 2026-03-09*
