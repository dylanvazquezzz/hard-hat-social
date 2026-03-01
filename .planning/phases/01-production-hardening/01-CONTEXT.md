# Phase 1: Production Hardening - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Configure the production deployment so emails land in inboxes, auth links work, storage uploads succeed, and the service role key cannot leak into client bundles. This phase is code changes and configuration only — no new user-facing features.

</domain>

<decisions>
## Implementation Decisions

### Deployment scope
- Phase 1 produces code-level changes and a deployment checklist — user handles Vercel project manually
- App is already live at https://contractors-connect.vercel.app/ — Vercel project exists, repo is connected
- All required env vars are already set in the Vercel dashboard — no gap audit needed
- No production domain purchased yet — use https://contractors-connect.vercel.app/ as the canonical URL for all configs

### Storage policies
- Implement via SQL migration: `007_storage_policies.sql` — committed to repo, repeatable per environment
- `application-docs` bucket: strict per-user path restriction — authenticated users may only upload to paths starting with `{auth.uid()}/`
- `avatars` and `post-images` buckets: authenticated users can upload (no path restriction)
- All buckets: public read (images must be viewable without auth)
- Assume `application-docs` bucket already exists (created in migration 006) — do not re-create

### Auth redirect URLs
- Claude's discretion — configure both prod and localhost:
  - Supabase Auth Site URL: `https://contractors-connect.vercel.app`
  - Additional Redirect URLs: `http://localhost:3000` (preserves local dev auth flows)
- Document as a manual Supabase dashboard step in the deployment checklist (cannot be set via migration)

### Claude's Discretion
- Whether `server-only` npm package needs to be installed or is already available
- Exact RLS policy syntax for Supabase storage.objects table
- Whether to audit for other files that should have `server-only` beyond the two specified

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/supabase-admin.ts`: Has "SERVER ONLY" comment but no actual `import 'server-only'` — needs the import added
- `lib/email.ts`: Same — "SERVER ONLY" comment without the enforcing import
- `supabase/migrations/`: 6 existing migrations (001–006) — new storage policy migration would be `007_storage_policies.sql`

### Established Patterns
- Migrations use plain SQL files in `supabase/migrations/` — no migration framework, just numbered SQL files
- Admin operations use service role client from `lib/supabase-admin.ts` (bypasses RLS)

### Integration Points
- `server-only` guard on `lib/supabase-admin.ts` and `lib/email.ts` prevents import in any `'use client'` component
- Storage policies apply to Supabase's `storage.objects` table via RLS — same pattern as existing table policies

</code_context>

<specifics>
## Specific Ideas

- Production URL is https://contractors-connect.vercel.app/ — use exactly this in all configurations
- The `application-docs` path structure should be `{user_id}/{filename}` to match how the existing application form uploads files (verify against `app/apply/page.tsx` during planning)

</specifics>

<deferred>
## Deferred Ideas

- "Forgot password?" link on the sign-in page — the reset pages (`/auth/reset`, `/auth/update-password`) are fully implemented but the auth page doesn't link to them. User chose not to include in Phase 1.

</deferred>

---

*Phase: 01-production-hardening*
*Context gathered: 2026-03-01*
