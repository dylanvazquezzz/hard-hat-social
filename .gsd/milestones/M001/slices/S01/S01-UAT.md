# M001/S01: Auto-Deploy + Bug Fix — UAT

**Milestone:** M001
**Written:** 2026-03-12

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: Both deliverables are infrastructure artifacts — a code fix verifiable by inspecting the changed files and a deploy script verifiable by syntax check and dry-run. The 400 fix cannot be live-tested until migration 010 is applied to production, but the code change is unambiguous and the browser-console signal will confirm it post-deploy. The deploy script's behavior is fully deterministic from the source.

## Preconditions

- `npm run build` passes locally (confirmed: zero errors)
- Migration 010 has been applied to the production Supabase instance (ref: pzjommfcglozzuskubnl)
- Vercel project is connected to GitHub repo with `master` as the production branch
- A logged-in user account with a pending application exists in Supabase (for BUG-06 live check)

## Smoke Test

Run `./scripts/deploy.sh "test: smoke"` from the repo root — it should print `✅ Build passed`, `✅ Committed` (or `ℹ️ Nothing to commit`), and `✅ Pushed`. Vercel dashboard should show a new deployment triggered within 30 seconds.

## Test Cases

### 1. BUG-06: No 400 on /apply for user with pending application

1. Log in to hardhatsocial.net as a user who has a pending application in Supabase
2. Navigate to `/apply`
3. Open DevTools → Network tab, filter by `applications`
4. **Expected:** No 400 response. Either a 200 response with `[{"status":"pending"}]` or no request at all if the pending redirect fires. No red entries in the Network panel for `/rest/v1/applications`.

### 2. deploy.sh — missing argument guard

1. Run `./scripts/deploy.sh` (no arguments)
2. **Expected:** Prints `❌  Usage: ./scripts/deploy.sh "commit message"` and exits with code 1. No build runs, no git operations occur.

### 3. deploy.sh — build failure gate

1. Temporarily introduce a TypeScript error in any `.tsx` file (e.g., add `const x: string = 123`)
2. Run `./scripts/deploy.sh "should not deploy"`
3. Revert the error
4. **Expected:** Prints `❌  Build failed. Fix errors before deploying.` and exits with code 1. No git commit or push occurs.

### 4. deploy.sh — successful deploy

1. Make a trivial change (e.g., add a comment to `CLAUDE.md`)
2. Run `./scripts/deploy.sh "test: deploy script verification"`
3. **Expected:** Build passes, commit is created, push succeeds, Vercel dashboard shows deployment in progress within ~30 seconds at https://vercel.com/dashboard.

### 5. Admin applications queue still works

1. Log in as `dylan@mediaflooding.com` or `admin@hardhatsocial.net`
2. Navigate to `/admin`
3. **Expected:** Pending applications are visible. Approve/reject actions work. No regressions from the RLS changes in migration 010.

## Edge Cases

### User with no applications navigates to /apply

1. Log in as a user with zero applications in Supabase
2. Navigate to `/apply`
3. **Expected:** Application form loads normally. No 400, no redirect to dashboard. Network tab shows `/rest/v1/applications` returns 200 with `null` or empty array.

### Working tree already clean when deploy.sh runs

1. Ensure no uncommitted changes exist (`git status` is clean)
2. Run `./scripts/deploy.sh "no-op commit"`
3. **Expected:** Build passes, prints `ℹ️   Nothing to commit — working tree is clean`, then pushes (re-triggers Vercel deploy from current HEAD). Exit code 0.

### Migration 010 applied a second time (idempotency)

1. Re-run migration 010 SQL in Supabase SQL editor
2. **Expected:** No errors. `ADD COLUMN IF NOT EXISTS` operations skip silently. Index creation skips. RLS policy drop+recreate succeeds cleanly.

## Failure Signals

- 400 responses on `/rest/v1/applications` in browser DevTools after deploy — indicates migration 010 was not applied or PostgREST schema cache needs reload
- `deploy.sh` exits with build error — TypeScript or Next.js error introduced in the codebase
- `/admin` queue empty or erroring after migration 010 — indicates RLS policy for admin (service role) broke, which should not happen since service role bypasses RLS
- Vercel deployment not triggered after push — indicates GitHub→Vercel auto-deploy integration is disconnected

## Requirements Proved By This UAT

- **BUG-06** — Test case 1 directly proves the 400 is eliminated from the applications pending check on `/apply`. Edge case "no applications" confirms the fix works for the zero-application state too.
- **DEPLOY-01** — Test case 4 directly proves that `./scripts/deploy.sh "message"` triggers a Vercel production deploy to hardhatsocial.net.

## Not Proven By This UAT

- That migration 010 was successfully applied to the production Supabase instance — this requires manual confirmation in the Supabase SQL editor or dashboard
- That hardhatsocial.net DNS is correctly pointed at Vercel — domain config is outside this slice's scope
- PostgREST schema cache reload behavior — confirming the cache was reloaded after migration 010 requires manual action in Supabase Dashboard (API → Reload schema)
- That future slices' deploys will succeed — deploy.sh correctness is proved here, but future build errors would still block the deploy as designed

## Notes for Tester

- Migration 010 MUST be applied before doing the live BUG-06 check (test case 1). Without it, the RLS policy on applications may reference a non-existent `user_id` column, causing all application selects to fail.
- After applying migration 010, reload the PostgREST schema cache in Supabase Dashboard → API section to ensure the cache reflects the current schema.
- Test case 3 (build failure gate) requires temporarily breaking the build — remember to revert before running any other test cases.
- The deploy script pushes to `origin master` — ensure your local master is up to date with origin before running test case 4 to avoid unexpected conflicts.
