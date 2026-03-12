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

## Admin

- Admin access controlled by `NEXT_PUBLIC_ADMIN_EMAILS` env var (comma-separated)
- Current admins: dylan@mediaflooding.com, admin@hardhatsocial.net
- Vercel project ID: prj_NzOPBEhplUq7MzdFVXZdqxhMSnYR
- Supabase project ref: pzjommfcglozzuskubnl
