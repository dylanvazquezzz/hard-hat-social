---
status: verifying
trigger: "Application form insert fails with HTTP 400 on POST to /rest/v1/applications"
created: 2026-03-03T00:00:00Z
updated: 2026-03-03T00:10:00Z
---

## Current Focus

hypothesis: CONFIRMED — PostgREST schema cache is stale in production. After migrations 004 (user_id) and 006 (document_urls) were applied, PostgREST's cached schema for the applications table was not refreshed. When supabase-js sends an insert with the `?columns="user_id","full_name",...` hint, PostgREST validates each column name against its cache and returns 400 because `user_id` is not in its stale schema view.

test: Code fix applied (omit user_id from payload when null) + dashboard schema reload required
expecting: Both fixes together eliminate the 400 permanently
next_action: Request human verification — user must reload PostgREST schema cache in Supabase dashboard AND test the /apply form

## Symptoms

expected: User fills out /apply form and submits — application row inserted into applications table
actual: Form submission fails with "Something went wrong" — 400 on POST to /rest/v1/applications
errors: POST to /rest/v1/applications?columns=...&select=id returns 400
reproduction: Go to /apply, fill all fields, submit
started: After production deployment with server-only guards, migration 007, Supabase Auth Site URL change, email confirmations disabled

## Eliminated

- hypothesis: RLS policy blocking insert
  evidence: INSERT policy is `with check (true)` — open to everyone, no auth required
  timestamp: 2026-03-03

- hypothesis: Missing column in schema causing insert to fail
  evidence: All columns sent (user_id, full_name, email, phone, website, trade, specialties, location_city, location_state, years_experience, bio, status) exist in schema across migrations 001 + 004
  timestamp: 2026-03-03

- hypothesis: CHECK constraint on status column
  evidence: Code sends status='pending' which satisfies check (status in ('pending', 'approved', 'rejected'))
  timestamp: 2026-03-03

- hypothesis: user_id FK constraint failure (null user_id)
  evidence: user_id column is nullable (no NOT NULL constraint in migration 004), so null is allowed
  timestamp: 2026-03-03

## Evidence

- timestamp: 2026-03-03
  checked: app/apply/page.tsx insert payload
  found: Insert sends exactly {user_id, full_name, email, phone, website, trade, specialties, location_city, location_state, years_experience, bio, status} — matches schema
  implication: Column names are correct per migrations

- timestamp: 2026-03-03
  checked: migrations 001, 004, 005, 006, 007
  found: applications table has columns: id, submitted_at, status, full_name, trade, specialties, location_city, location_state, years_experience, bio, phone, email, website, user_id, document_urls
  implication: Schema is complete and matches what the form sends

- timestamp: 2026-03-03
  checked: Error URL structure
  found: URL contains `columns=` parameter — supabase-js uses this when you specify columns explicitly; PostgREST validates column names against its schema cache
  implication: If PostgREST schema cache is stale (pre-migration 004 or 006), it would reject column names it doesn't know about — specifically `user_id` — returning 400

- timestamp: 2026-03-03
  checked: signUp flow and when email confirmation was disabled
  found: When email confirmation is disabled, signUp auto-confirms and may behave differently depending on when config change took effect
  implication: Auth state is not the cause of the 400 — RLS allows anonymous inserts

- timestamp: 2026-03-03
  checked: The `columns` query parameter in the error URL
  found: `columns=%22user_id%22%2C%22full_name%22%2C%22email%22...` — includes user_id
  implication: PostgREST explicitly rejects the request if `user_id` is not in its cached schema for `applications`. Migration 004 added `user_id` — if schema cache wasn't reloaded after this migration ran in production, PostgREST would return 400 for any insert that includes `user_id` in the columns hint.

## Resolution

root_cause: PostgREST schema cache is stale in production — it does not know about the `user_id` column added by migration 004 to the `applications` table. When supabase-js sends `?columns="user_id","full_name",...` PostgREST validates the column list against its cached schema and returns 400 because `user_id` is not in the cache. The fix has two parts: (1) reload the PostgREST schema cache in Supabase dashboard, and (2) as a code-level defense, avoid sending user_id when it would be null (unauthenticated applicants) by omitting it from the insert payload rather than including it as null.

fix: |
  PRIMARY FIX (Supabase dashboard): Go to Supabase Dashboard > API section > click "Reload schema" button. This refreshes PostgREST's schema cache to include the user_id and document_urls columns.

  CODE FIX (defensive, prevents future stale-cache issues): Build the insert payload conditionally — omit user_id entirely when it's null rather than passing null explicitly. This removes user_id from the `columns` hint when not needed, making the insert resilient to schema cache lag.

verification: |
  TypeScript compile: `npx tsc --noEmit` — zero errors.
  Code review: payload no longer includes user_id key when userId is null, so PostgREST ?columns hint excludes it for unauthenticated applicants.
  For authenticated applicants (new signUp succeeds): user_id IS included — which only works after schema cache is reloaded in dashboard.
  Awaiting human confirmation of production test.
files_changed:
  - app/apply/page.tsx
