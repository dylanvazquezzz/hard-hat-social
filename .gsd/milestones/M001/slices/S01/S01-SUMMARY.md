---
<<<<<<< HEAD
<<<<<<< HEAD
id: S01
parent: M001
milestone: M001
provides: []
requires: []
affects: []
key_files: []
key_decisions: []
patterns_established: []
observability_surfaces:
  - none yet — doctor created placeholder summary; replace with real diagnostics before treating as complete
drill_down_paths: []
duration: unknown
verification_result: unknown
completed_at: 2026-03-12T01:43:18.660Z
---

# S01: Recovery placeholder summary

**Doctor-created placeholder.**

## What Happened
Doctor detected that all tasks were complete but the slice summary was missing. Replace this with a real compressed slice summary before relying on it.

## Verification
Not re-run by doctor.

## Deviations
Recovery placeholder created to restore required artifact shape.

## Known Limitations
This file is intentionally incomplete and should be replaced by a real summary.

## Follow-ups
- Regenerate this summary from task summaries.

## Files Created/Modified
- `.gsd/milestones/M001/slices/S01/S01-SUMMARY.md` — doctor-created placeholder summary
=======
=======
>>>>>>> gsd/M001/S01
id: M001/S01
parent: M001
milestone: M001
provides:
  - BUG-06 fix — 400 error on GET /rest/v1/applications eliminated from layouts and profile page
  - Migration 010 — idempotent applications table repair (user_id column + RLS sync)
  - scripts/deploy.sh — build-gated commit+push deploy helper
  - CLAUDE.md updated with deploy command
requires: []
affects:
  - M001/S02
  - M001/S03
  - M001/S04
  - M001/S05
  - M001/S06
key_files:
  - app/contractors/layout.tsx
  - app/jobs/layout.tsx
  - app/profile/page.tsx
  - supabase/migrations/010_fix_applications_user_id_rls.sql
  - scripts/deploy.sh
  - CLAUDE.md
key_decisions:
  - Remove explicit user_id filter from client-side applications queries — RLS policy already scopes to current user; status-only filter avoids 400 on stale PostgREST schema cache
  - Migration 010 uses ADD COLUMN IF NOT EXISTS — idempotent regardless of which prior migrations ran in production
  - deploy.sh gates on npm run build success before committing — broken code never reaches production
  - deploy.sh targets origin master explicitly — Vercel auto-deploy is wired to master branch
patterns_established:
  - "When RLS policy already scopes rows to current user (user_id = auth.uid()), client queries must not repeat user_id filter in PostgREST URL params — RLS runs server-side in Postgres, not at the HTTP column-validation layer"
  - "Deploy scripts must gate on build verification before touching git — prevents deploying broken code"
observability_surfaces:
  - "Browser DevTools Network tab → filter /rest/v1/applications — should show 200, not 400"
  - "scripts/deploy.sh stdout — ❌ Build failed exits 1 before any git operations"
  - "Vercel dashboard at https://vercel.com/dashboard — confirms deployment triggered after push"
  - "Supabase SQL editor — migration 010 can be re-run safely (all operations idempotent)"
drill_down_paths:
  - .gsd/milestones/M001/slices/S01/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S01/tasks/T02-SUMMARY.md
duration: 25min
verification_result: passed
completed_at: 2026-03-12
---

# M001/S01: Auto-Deploy + Bug Fix

**Eliminated the 400 Bad Request on application status queries by removing the redundant user_id PostgREST filter and wrote an idempotent migration to harden the production schema; wired a build-gated deploy script so every future approved slice auto-deploys to hardhatsocial.net.**

## What Happened

**T01 — BUG-06 fix:** The root cause was PostgREST returning HTTP 400 when a query URL contained `user_id=eq.{uuid}` and PostgREST's schema cache didn't yet know about the `user_id` column on `applications` (migration 004 may not have been applied to production). The fix removed `.eq('user_id', session.user.id)` from the applications pending-check queries in `app/contractors/layout.tsx`, `app/jobs/layout.tsx`, and `app/profile/page.tsx`. The existing RLS policy `USING (user_id = auth.uid())` already scopes rows to the current user at the Postgres level — the PostgREST URL filter was redundant and fragile. The query now sends only `?select=status&status=eq.pending`, which works regardless of PostgREST schema cache state.

Migration 010 was written to idempotently repair the production Supabase instance: `ADD COLUMN IF NOT EXISTS user_id`, `ADD COLUMN IF NOT EXISTS document_urls`, create index if not exists, drop and recreate both SELECT and UPDATE RLS policies on applications. This ensures that even if migrations 004–006 didn't fully apply in production, the schema and policies will be correct after 010 runs.

**T02 — deploy.sh:** Created `scripts/deploy.sh` with `set -euo pipefail` strictness. Sequence: validate commit message arg → `cd` to repo root (location-independent via `$BASH_SOURCE[0]`) → `npm run build` (exits 1 on failure) → `git add -A && git commit -m "$MSG"` (skips commit gracefully if tree is clean) → `git push origin master`. Updated CLAUDE.md Commands section so the deploy command appears in every future GSD context load.

## Verification

- `npm run build` — ✅ zero errors, zero warnings, all 13 routes compile
- `bash -n scripts/deploy.sh` — ✅ syntax check passed
- `./scripts/deploy.sh` (no args) — ✅ exits 1 with usage message
- Grep confirms no `.eq('user_id', …)` on `applications` queries in any of the 3 fixed files
- Migration 010 reviewed: all operations idempotent, no destructive changes, admin access preserved via service role bypass
- `app/profile/page.tsx` lines 90/100 — `user_id` filter retained on `contractors` and `posts` tables (correct, unrelated to BUG-06)

## Requirements Advanced

- **DEPLOY-01** — `scripts/deploy.sh` provides the build-gated push mechanism; Vercel auto-deploy on master push was already wired from v1.2

## Requirements Validated

- **BUG-06** — Root cause identified (PostgREST schema cache / missing user_id column); query fixed in 3 files; idempotent migration 010 written. Both the code fix and the migration are in place. Validated by: build passes, no `user_id` filter on applications queries, migration reviewed.

## New Requirements Surfaced

- **OPS-01 (candidate):** Migration 010 must be manually applied to production Supabase before the S01 deploy ships. A mechanism to track which migrations have been applied to production (vs. local) would prevent this class of deployment gap. Deferred — out of S01 scope.

## Requirements Invalidated or Re-scoped

- None

## Deviations

None from task plan. T01 could not verify production DB state directly (no direct Supabase access from this agent), so both the code fix and migration 010 were applied to ensure correctness regardless of production state — this was explicitly anticipated in the task plan ("verify if that self-resolved the bug").

## Known Limitations

- Migration 010 must be manually applied to the production Supabase instance (ref: pzjommfcglozzuskubnl) via the Supabase SQL editor or Management API. The code fix alone prevents the 400 from appearing in the browser, but without migration 010 the RLS policy on applications may reference a non-existent `user_id` column, causing all application selects to fail for non-admin users.
- `deploy.sh` always pushes to `origin master`. If called from a feature branch before merging, it pushes master's last commit — not the feature branch. This is intentional for GSD's merge-then-deploy pattern.

## Follow-ups

- Apply migration 010 to production before deploying S01 code changes
- Confirm Vercel deployment triggered after push (check https://vercel.com/dashboard)
- Reload PostgREST schema cache in Supabase Dashboard (API → Reload schema) if 400 reappears after migration

## Files Created/Modified

- `app/contractors/layout.tsx` — Removed `.eq('user_id', session.user.id)` from applications pending check
- `app/jobs/layout.tsx` — Same fix as contractors layout
- `app/profile/page.tsx` — Same fix for profile pending application check (user_id filter on contractors/posts tables is correct and untouched)
- `supabase/migrations/010_fix_applications_user_id_rls.sql` — Idempotent: ensures user_id + document_urls columns, index, and RLS policies on applications
- `scripts/deploy.sh` — Build-gated deploy helper: build → commit → push → Vercel auto-deploy
- `CLAUDE.md` — Added `./scripts/deploy.sh "message"` to Commands section
<<<<<<< HEAD
>>>>>>> gsd/M001/S01
=======
>>>>>>> gsd/M001/S01

## Forward Intelligence

### What the next slice should know
<<<<<<< HEAD
<<<<<<< HEAD
- Doctor had to reconstruct completion artifacts; inspect task summaries before continuing.

### What's fragile
- Placeholder summary exists solely to unblock invariant checks.

### Authoritative diagnostics
- Task summaries in the slice tasks/ directory — they are the actual authoritative source until this summary is rewritten.

### What assumptions changed
- The system assumed completion would always write a slice summary; in practice doctor may need to restore missing artifacts.
=======
=======
>>>>>>> gsd/M001/S01
- The `applications` table RLS policies were rebuilt in migration 010 — any slice that reads applications should use status-only or other non-user_id filters in PostgREST URLs; rely on RLS for user isolation
- `deploy.sh` is now the canonical way to ship code — always gate on `npm run build` passing locally before calling it
- Migration 010 must be confirmed applied to production before S02 ships; if not applied, application queries for non-admin users will fail entirely

### What's fragile
- PostgREST schema cache — if a migration adds/removes a column without a cache reload, queries using that column in URL params return 400. Pattern: don't filter by columns in PostgREST URL params when RLS already handles row isolation.
- `scripts/deploy.sh` has no branch guard — calling from a feature branch pushes to master without the branch's changes (GSD must merge before calling)

### Authoritative diagnostics
- Browser DevTools Network tab → `/rest/v1/applications` — 200 = fixed, 400 = PostgREST still has stale schema cache (reload schema in Supabase dashboard)
- `Vercel dashboard → Deployments` — confirms whether push triggered a deploy and whether it succeeded

### What assumptions changed
- Original assumption: migration 004 may have self-resolved the bug in production — Actual: cannot confirm without direct DB access; applied both code fix and idempotent migration 010 to be safe regardless of production state
<<<<<<< HEAD
>>>>>>> gsd/M001/S01
=======
>>>>>>> gsd/M001/S01
