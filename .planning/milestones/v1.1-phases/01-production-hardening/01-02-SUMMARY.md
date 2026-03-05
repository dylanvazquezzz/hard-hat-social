---
phase: 01-production-hardening
plan: 02
subsystem: database
tags: [supabase, storage, rls, postgres, file-upload]

# Dependency graph
requires:
  - phase: 01-production-hardening
    provides: migration 006 which created application-docs bucket with permissive policies
provides:
  - Storage RLS policies for avatars, post-images, and application-docs buckets
  - Strict per-user path restriction on application-docs INSERT
  - Corrected upload path in apply/page.tsx using authenticated user ID
affects:
  - apply/page.tsx document uploads
  - profile/page.tsx avatar uploads
  - any future post image uploads

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Storage RLS: use (storage.foldername(name))[1] = auth.uid()::text for per-user path restrictions"
    - "Bucket creation: INSERT INTO storage.buckets ON CONFLICT DO UPDATE SET public = true (idempotent)"
    - "Upload path keyed on auth.uid() (not DB row ID) to satisfy Supabase RLS policies"

key-files:
  created:
    - supabase/migrations/007_storage_policies.sql
  modified:
    - app/apply/page.tsx

key-decisions:
  - "Drop old permissive application-docs policies before creating strict replacements — PostgreSQL OR-evaluates all matching policies, old ones bypass new strict ones if left in place"
  - "application-docs uses strict per-user path: (storage.foldername(name))[1] = auth.uid()::text — only the user who owns the upload path may write"
  - "avatars and post-images have no path restriction — any authenticated user may upload (profile/post images not privacy-sensitive)"
  - "All three buckets set public=true — images must be viewable without auth (avatars, post images, application docs viewed by admin)"
  - "avatars bucket gets UPDATE policy (in addition to INSERT) because profile/page.tsx uses upsert: true which requires both"
  - "Upload path fallback: if userId is null (user_already_exists case), fall back to supabase.auth.getSession() to resolve the authenticated user; skip upload entirely only if session is also unavailable"

patterns-established:
  - "Pattern: Storage migration always DROPs old policies before creating replacements to avoid OR-logic bypass"
  - "Pattern: Storage path prefix = auth.uid()::text (not DB row IDs) for per-user RLS enforcement"

requirements-completed:
  - PROD-03

# Metrics
duration: 7min
completed: 2026-03-02
---

# Phase 1 Plan 02: Storage RLS Policies Summary

**Supabase Storage RLS policies for avatars, post-images, and application-docs buckets with strict per-user path restriction on credential document uploads**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-02T00:35:06Z
- **Completed:** 2026-03-02T00:42:19Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created migration 007 dropping old permissive application-docs policies and replacing with strict per-user path restriction (`(storage.foldername(name))[1] = auth.uid()::text`)
- Created avatars bucket (public=true) with public read, authenticated INSERT and UPDATE (UPDATE required for `upsert: true` used in profile page)
- Created post-images bucket (public=true) with public read and authenticated INSERT
- Fixed apply/page.tsx to use authenticated `userId` (not `appData.id`) as the upload path prefix, making uploads match the strict RLS policy
- Added session fallback for returning users where `signUpData.user.id` is null due to `user_already_exists` error

## Task Commits

Each task was committed atomically:

1. **Task 1: Create migration 007_storage_policies.sql** - `796e494` (chore)
2. **Task 2: Fix apply/page.tsx upload path to use userId** - `c33f4c5` (fix)

## Files Created/Modified
- `supabase/migrations/007_storage_policies.sql` - Storage RLS policies for all three buckets: public read, auth write, strict per-user path on application-docs
- `app/apply/page.tsx` - Upload path now uses `uploadUserId` (authenticated user's auth.uid()) instead of application row UUID

## Decisions Made
- Drop old permissive application-docs policies (from migration 006) before creating strict replacements — PostgreSQL evaluates all matching policies with OR logic, so leaving old ones in place would allow bypass of new restrictions
- avatars bucket gets both INSERT and UPDATE policies because `profile/page.tsx` calls `.upload()` with `{ upsert: true }`, which requires UPDATE permission in addition to INSERT
- For returning users (where `supabase.auth.signUp()` returns `user_already_exists`), `signUpData.user.id` is null — fall back to `supabase.auth.getSession()` to get the authenticated user ID for upload path keying; gracefully skip upload (with success state) only if session is also unavailable

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required. Migration 007 is ready to run against the Supabase project. Buckets `avatars` and `post-images` will be created by the migration if they don't exist (with `ON CONFLICT DO UPDATE`). The `application-docs` bucket already exists from migration 006.

## Next Phase Readiness
- Migration 007 is ready to apply to production Supabase
- Storage policies are complete for all three buckets
- apply/page.tsx will correctly upload documents to user-scoped paths matching RLS policy
- Next: remaining production hardening tasks (Vercel deployment, env vars, Resend DNS)

## Self-Check: PASSED

- FOUND: supabase/migrations/007_storage_policies.sql
- FOUND: app/apply/page.tsx (uploadUserId present, appData.id not used in storage path)
- FOUND: .planning/phases/01-production-hardening/01-02-SUMMARY.md
- FOUND commit 796e494 (Task 1: migration 007)
- FOUND commit c33f4c5 (Task 2: apply/page.tsx fix)

---
*Phase: 01-production-hardening*
*Completed: 2026-03-02*
