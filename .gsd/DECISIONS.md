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

## Admin

- Admin access controlled by `NEXT_PUBLIC_ADMIN_EMAILS` env var (comma-separated)
- Current admins: dylan@mediaflooding.com, admin@hardhatsocial.net
- Vercel project ID: prj_NzOPBEhplUq7MzdFVXZdqxhMSnYR
- Supabase project ref: pzjommfcglozzuskubnl
