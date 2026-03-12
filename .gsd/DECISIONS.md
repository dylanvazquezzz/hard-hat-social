# Decisions Register

## From v1.2

- `NEXT_PUBLIC_ADMIN_EMAILS` is baked at build time — env var changes require a real git push + rebuild, not just Vercel redeploy from cache
- Browser supabase client (not admin) must be used in client components — server-only modules cause build failure
- Migrations applied via Supabase Management API (`https://api.supabase.com/v1/projects/{ref}/database/query`) — no Docker/CLI required
- Vercel auto-deploys on every push to master — no manual trigger needed
- Migration filenames use 001-009 format (not timestamps) — CLI migration tracking not used
- Cast Supabase dual-FK query result as `unknown as Job[]` — TS infers joined arrays as `T[]` not `T`, requires intermediate cast
- GC gate enforced in jobs page (viewerIsGC check) not inside CreateJobForm — keeps form dumb and reusable
- `markHired` calls `revalidatePath('/jobs')` server-side for automatic re-render after hire

## v1.3 S01

- BUG-06 fix: Remove explicit `user_id` filter from the applications pending check in layouts and profile page — the RLS policy `user_id = auth.uid()` scopes the result to the current user, so `.eq('status', 'pending')` alone is sufficient and avoids the 400 that PostgREST returns when the `user_id` column is absent from its schema cache
- Migration 010 written idempotently (ADD COLUMN IF NOT EXISTS) to ensure `user_id` and `document_urls` columns exist on applications and RLS policies are in sync regardless of which prior migrations landed in production
- Deploy script gates on `npm run build` before any git operations — broken code never reaches production; script exits 1 and aborts before `git add` if build fails
- Pattern: when RLS policy already scopes rows to the current user (user_id = auth.uid()), client queries must NOT include user_id in PostgREST URL params — RLS executes server-side in Postgres at the row level, not at PostgREST's HTTP column-validation layer; including a column that may be absent in PostgREST's schema cache causes HTTP 400

## Operational (permanent)

- **Migration workflow:** Write SQL in `supabase/migrations/NNN_name.sql` → apply via `./scripts/migrate.sh <file>` → verify with `./scripts/migrate.sh "SELECT ..."` against pg_indexes/information_schema → commit file. Never ask the user to apply migrations manually.
- **Every migration must be idempotent** — use `IF NOT EXISTS`, `CREATE OR REPLACE`, `DROP POLICY IF EXISTS` etc. so re-runs are safe
- **Verification query must confirm the specific object landed** — check pg_indexes for indexes, information_schema.columns for columns, pg_policies for RLS policies. HTTP 201 from the API alone is not sufficient proof.
- **Deploy workflow:** `./scripts/deploy.sh "message"` — gates on `npm run build`, then commits and pushes to origin master. Never push without a passing build.
- Supabase project ref: `pzjommfcglozzuskubnl` (in NEXT_PUBLIC_SUPABASE_URL)
- Management API endpoint: `https://api.supabase.com/v1/projects/{ref}/database/query` — auth via `SUPABASE_ACCESS_TOKEN` in .env.local

## v1.3 S04

- Recent contacts: over-fetch 20 jobs ordered by hired_at DESC, deduplicate in JS to 5 distinct contractor IDs, fetch details via IN, re-sort to match original order — PostgREST has no DISTINCT ON support
- Pattern: "ordered distinct by FK" requires over-fetch → JS dedup → IN fetch → re-sort

## v1.3 S03

- GC detection by `contractor.trade === 'General Contractor'` exact string match — consistent across jobs/page.tsx and profile/page.tsx; any trade value normalization must update both locations
- "Post a Job" tab available to all approved contractors (not GC-only) — any contractor can post subcontracting work; GC-specific behavior is only the auto-default on /profile load
- `defaultOpen` prop on CreateJobForm — caller controls initial expanded state; GC via /profile defaults open, /jobs standalone button stays collapsed
- Trade and State changed from freetext to dropdowns in CreateJobForm — enforces consistent values; Drywall added proactively for S05

## v1.3 S02

- Insurance/cert filters resolved via certifications table ILIKE sub-query → `.in('id', ids)` on main contractors query — PostgREST does not support SQL subquery IN natively; resolve matching IDs in a separate query first, then apply as an IN filter
- Empty certFilterIds list short-circuits to renderPage([], ...) before issuing `.in('id', [])` — avoids PostgREST empty array edge case which can return unexpected results
- Insurance filter uses ILIKE on cert name/issuing_body rather than a dedicated boolean column — avoids schema change; tradeoff is dependence on cert naming conventions
- CERT_OPTIONS hardcoded in SearchFilters — avoids a DB round-trip for a mostly-static list at MVP cert volume; make dynamic when distinct cert count exceeds ~15
- `renderPage()` helper extracted as module-level function in contractors/page.tsx — avoids JSX duplication for early-return empty-result path without adding a separate component file
- Pattern: sub-query → IN filter is the standard approach for any filter requiring a JOIN-like operation in PostgREST (applies to future cert-type, tag, or category filters)

## Admin

- Admin access controlled by `NEXT_PUBLIC_ADMIN_EMAILS` env var (comma-separated)
- Current admins: dylan@mediaflooding.com, admin@hardhatsocial.net
- Vercel project ID: prj_NzOPBEhplUq7MzdFVXZdqxhMSnYR
- Supabase project ref: pzjommfcglozzuskubnl
