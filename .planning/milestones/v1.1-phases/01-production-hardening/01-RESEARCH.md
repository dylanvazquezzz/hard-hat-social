# Phase 1: Production Hardening - Research

**Researched:** 2026-03-01
**Domain:** Deployment configuration, email deliverability (Resend), Supabase Auth/Storage, Next.js server-only module guard
**Confidence:** HIGH (all key findings verified against official docs or official source)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Phase 1 produces code-level changes and a deployment checklist — user handles Vercel project manually
- App is already live at https://contractors-connect.vercel.app/ — Vercel project exists, repo is connected
- All required env vars are already set in the Vercel dashboard — no gap audit needed
- No production domain purchased yet — use https://contractors-connect.vercel.app/ as the canonical URL for all configs
- Storage policies implemented via SQL migration: `007_storage_policies.sql` — committed to repo, repeatable per environment
- `application-docs` bucket: strict per-user path restriction — authenticated users may only upload to paths starting with `{auth.uid()}/`
- `avatars` and `post-images` buckets: authenticated users can upload (no path restriction)
- All buckets: public read (images must be viewable without auth)
- Assume `application-docs` bucket already exists (created in migration 006) — do not re-create
- Auth redirect config: configure both prod and localhost — Supabase Auth Site URL: `https://contractors-connect.vercel.app`, Additional Redirect URLs: `http://localhost:3000`
- Document auth redirect as a manual Supabase dashboard step in the deployment checklist

### Claude's Discretion
- Whether `server-only` npm package needs to be installed or is already available
- Exact RLS policy syntax for Supabase storage.objects table
- Whether to audit for other files that should have `server-only` beyond the two specified

### Deferred Ideas (OUT OF SCOPE)
- "Forgot password?" link on the sign-in page — the reset pages (`/auth/reset`, `/auth/update-password`) are fully implemented but the auth page doesn't link to them. User chose not to include in Phase 1.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PROD-01 | Resend domain is verified (SPF + DKIM DNS records set) so approval/rejection emails land in inbox, not spam | Resend docs confirm: add domain in dashboard, add SPF (TXT) + DKIM (TXT) DNS records; propagation up to 48h |
| PROD-02 | Supabase Auth Site URL is updated to production URL so password reset and approval email links work correctly | Supabase Auth docs confirm: set Site URL to `https://contractors-connect.vercel.app` in dashboard > Authentication > URL Configuration; add `http://localhost:3000` to Additional Redirect URLs |
| PROD-03 | Supabase storage bucket write policies are verified — authenticated users can upload to `avatars` and `post-images`; `application-docs` upload is restricted to the applicant's own folder | Supabase storage RLS docs confirm `storage.foldername(name)[1]` pattern; CRITICAL PATH MISMATCH documented below |
| PROD-04 | `lib/supabase-admin.ts` is protected with `server-only` to prevent service role key from leaking into client bundles | Next.js docs confirm `import 'server-only'` at top of file causes build-time error if client component imports it; package version `0.0.1`; NOT currently installed in this project |
</phase_requirements>

---

## Summary

Phase 1 covers four independent, non-feature production readiness tasks: (1) Resend email domain verification via DNS records, (2) Supabase Auth URL configuration for correct password reset and email link routing, (3) Supabase storage RLS policies for bucket access control, and (4) adding `server-only` import guard to server-side library files.

All four areas are well-understood and follow standard documented patterns. The research uncovered one critical discrepancy that the planner must resolve: the `application-docs` upload path in `app/apply/page.tsx` uses `appData.id` (the application row UUID) as the path prefix, but the locked decision in CONTEXT.md specifies path restriction to `{auth.uid()}/`. These two UUIDs are different, meaning a naive path-restriction policy based on `auth.uid()` would reject all document uploads from the existing apply form. The planner must decide whether to (a) change the upload path in `apply/page.tsx` to use `userId` instead of `appData.id`, or (b) change the restriction approach to allow any authenticated user to upload (less strict) rather than path-keying on `auth.uid()`.

The `server-only` package is not installed in this project — `npm install server-only` is required before the import can be added. The package is tiny (version `0.0.1`, essentially an empty module with a package.json field) and does not introduce meaningful dependencies.

**Primary recommendation:** Resolve the `application-docs` path mismatch before writing migration 007 — the upload path in `apply/page.tsx` should be changed to `${userId}/${...}` so the path-restriction policy based on `auth.uid()` functions correctly.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `server-only` | 0.0.1 | Cause build-time error when server module is imported in client component | Official Next.js recommended pattern; built into Next.js module graph resolution |
| Supabase Storage RLS (SQL) | — | Restrict file operations at database level | Same RLS system as data tables; enforced server-side, cannot be bypassed by client code |
| Resend | 6.9.3 (already installed) | Transactional email sending | Already in use; no change needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `client-only` | 0.0.1 | Mirror of server-only for client-only modules | Not needed for this phase |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `server-only` package | Custom runtime check `if (typeof window !== 'undefined') throw` | `server-only` catches at build time, not runtime; build-time is strictly better |
| SQL migration for storage RLS | Supabase dashboard manual policy creation | SQL migration is repeatable, version-controlled, preferred per project conventions |

**Installation:**
```bash
npm install server-only
```

---

## Architecture Patterns

### Pattern 1: `server-only` Import Guard

**What:** Adding `import 'server-only'` as the first import in a file causes Next.js (App Router) to throw a **build-time error** if that file is imported anywhere in the client bundle (i.e., from a `'use client'` component or any file transitively imported from one).

**When to use:** Any file that uses `process.env` secrets not prefixed with `NEXT_PUBLIC_`, creates database connections with privileged credentials, or calls server-side-only APIs.

**Files in this project that need it:**
- `lib/supabase-admin.ts` — uses `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS; catastrophic if leaked)
- `lib/email.ts` — uses `RESEND_API_KEY`

**Optional audit (Claude's discretion):** `app/admin/actions.ts` is a Server Action file (marked with `'use server'`). Server Actions already have server-only semantics enforced by Next.js, so adding `server-only` there is redundant but harmless.

**Example:**
```typescript
// Source: https://nextjs.org/docs/app/getting-started/server-and-client-components
// Add as FIRST import in lib/supabase-admin.ts and lib/email.ts
import 'server-only'

// ... rest of file unchanged
```

**Build error produced:** When a `'use client'` file (or any file transitively imported from one) imports a `server-only`-guarded module, `npm run build` fails with:
```
You're importing a component that needs "server-only" but none of your pages or components were
wrapped in <Suspense>. ...
```
The exact message may vary, but the build fails — it does not silently succeed.

**Key note from official docs:** "Next.js handles `server-only` and `client-only` imports internally to provide clearer error messages when a module is used in the wrong environment. The contents of these packages from NPM are not used by Next.js." The npm package is installed to satisfy `import` resolution; Next.js's own module graph enforces the actual error.

---

### Pattern 2: Supabase Storage RLS Policies

**What:** Storage access in Supabase is controlled by RLS policies on the `storage.objects` table. The `name` column contains the full file path (e.g., `{user_id}/file.jpg`). Helper functions extract path components.

**Key helper functions (verified from official Supabase docs):**

| Function | Returns | Example input | Example output |
|----------|---------|---------------|----------------|
| `storage.foldername(name)` | text[] of folder components | `'abc123/2024_file.jpg'` | `['abc123']` |
| `storage.filename(name)` | text filename | `'abc123/file.jpg'` | `'file.jpg'` |
| `storage.extension(name)` | text extension | `'abc123/file.jpg'` | `'jpg'` |

**Path restriction pattern (verified from official docs):**
```sql
-- Allow authenticated users to upload ONLY to their own user-ID-prefixed folder
CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'my-bucket'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );
```

Note: `auth.uid()` returns `uuid` type; cast to `text` with `::text` for string comparison.

**Public read pattern:**
```sql
-- Anyone (including unauthenticated) can read files
CREATE POLICY "Public read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'my-bucket');
```

**Creating buckets in SQL (verified from migration 006):**
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('bucket-id', 'bucket-name', true, 10485760, ARRAY['image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;
```
Setting `public = true` makes the bucket publicly readable at the CDN level but does NOT remove RLS for write operations.

---

### Pattern 3: Supabase Auth URL Configuration

**What:** The Site URL in Supabase Auth is the fallback redirect destination for all auth flows (email confirmation, password reset). If it still points to `localhost:3000`, all auth email links break in production.

**Dashboard path:** Supabase Dashboard > Project > Authentication > URL Configuration

**Configuration to set:**
- **Site URL:** `https://contractors-connect.vercel.app`
- **Additional Redirect URLs:** `http://localhost:3000` (preserves local dev auth flows)

**This cannot be done via SQL migration** — it is a Supabase project-level configuration stored in the Auth service, not in Postgres. It must be a documented manual step.

---

### Pattern 4: Resend Domain Verification

**What:** For emails from a custom `from:` address to land in inboxes (not spam), the sending domain's DNS must have SPF and DKIM records that Resend provides.

**Dashboard path:** Resend Dashboard > Domains > Add Domain

**Current `from` address in `lib/email.ts`:**
```typescript
const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@contractorsconnect.com'
```
The domain `contractorsconnect.com` must be added and verified in Resend. If using the Vercel `.vercel.app` URL as the app URL, the `from` address domain (`contractorsconnect.com`) is a separate concern — this is the email sending domain, not the app domain.

**DNS records to add (Resend provides exact values after domain is added):**
1. **SPF:** TXT record on the sending domain — Resend generates the value
2. **DKIM:** TXT record (subdomain like `resend._domainkey.yourdomain.com`) — Resend generates the value
3. **Optional DMARC:** TXT record — recommended but not required for basic deliverability

**Propagation time:** Up to 48 hours (Resend docs state up to 72 hours before failure status). Start this step first — it's the longest lead time of all Phase 1 tasks.

**Verification status:** Resend dashboard shows `pending` → `verified`. Interim status shows warnings (SPF/DKIM missing) that disappear once DNS propagates.

---

### Critical Discrepancy: `application-docs` Upload Path vs. Locked Decision

**This is the most important finding in this research.**

The CONTEXT.md locked decision states:
> `application-docs` bucket: strict per-user path restriction — authenticated users may only upload to paths starting with `{auth.uid()}/`

But the existing upload code in `app/apply/page.tsx` (line 172) uses:
```typescript
const path = `${appData.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
```

Here `appData.id` is the **application row UUID**, not the user's `auth.uid()`. These are different values.

**Impact:** An RLS policy of `(storage.foldername(name))[1] = (SELECT auth.uid()::text)` would BLOCK all document uploads from the existing apply form because the folder name is `appData.id`, not `auth.uid()`.

**Resolution options (planner must choose one):**

| Option | Change Required | Strictness |
|--------|----------------|------------|
| A. Change upload path in `apply/page.tsx` to use `userId` | Update line 172: `const path = \`${userId}/${...}\`` where `userId = signUpData?.user?.id` | Strict per-user isolation (matches locked decision) |
| B. Change policy to match current `appData.id` approach | Drop path restriction; policy only checks `bucket_id` and `authenticated` role | No per-user path isolation (weaker) |

**Recommendation:** Option A — change the upload path in `apply/page.tsx` to use `userId`. The `userId` is already available as `signUpData?.user?.id` at line 136 of `apply/page.tsx`. However, note that `userId` can be `null` if the user already exists (line 130 handles `user_already_exists` error). This edge case needs handling: if `signUpData?.user?.id` is null (existing user), get the authenticated session to retrieve `userId`.

**Secondary discrepancy in migration 006:** The `application-docs` bucket is created with `public: false`, but `apply/page.tsx` calls `supabase.storage.from('application-docs').getPublicUrl(path)` at line 178. A private bucket's "public URL" still functions for storage-level access if RLS SELECT policies allow it — but the intent is ambiguous. The CONTEXT.md says all buckets should be public-read. Migration 007 should either make `application-docs` public or add a signed-URL pattern. Per the locked decision ("All buckets: public read"), migration 007 should update `application-docs` to `public = true`.

---

### Anti-Patterns to Avoid

- **Modifying migration 006 instead of creating 007:** The project convention is append-only numbered migrations. Create `007_storage_policies.sql`, never edit deployed migrations.
- **Using `auth.role() = 'authenticated'` as the sole upload check:** Migration 006's existing `application-docs` INSERT policy only checks role, not path. This allows any authenticated user to upload to any path. Migration 007 must DROP the old policy and CREATE a strict replacement.
- **Setting Site URL via environment variable instead of dashboard:** The Supabase Auth Site URL is a dashboard setting, not an env var. Env vars do not affect it.
- **Assuming `server-only` is already installed:** It is not installed in this project (`node_modules/server-only` does not exist). `npm install server-only` must run first.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Server module isolation | Runtime `typeof window` checks | `server-only` package + Next.js build graph | Build-time enforcement; runtime checks can fail silently |
| Email authentication | Custom SMTP headers | Resend's managed SPF/DKIM | DNS setup is sufficient; Resend handles signing |
| Storage path validation | Application-layer path checks before upload | Supabase RLS on `storage.objects` | RLS enforced server-side; cannot be bypassed by client code |

---

## Common Pitfalls

### Pitfall 1: Existing `application-docs` policies not dropped before new ones are created

**What goes wrong:** Migration 007 creates new stricter policies, but the old permissive policies from migration 006 still exist. PostgreSQL evaluates all matching policies with OR logic — the old permissive policy allows the upload, bypassing the new strict one.

**Why it happens:** Migrations are additive; old policies persist unless explicitly dropped.

**How to avoid:** Migration 007 must `DROP POLICY IF EXISTS "Applicants can upload their own documents" ON storage.objects` and `DROP POLICY IF EXISTS "Applicants can read their own documents" ON storage.objects` before creating the new ones.

**Warning signs:** Uploads succeed even with wrong path — indicates old permissive policy is still active.

---

### Pitfall 2: `auth.uid()` type mismatch in storage policy

**What goes wrong:** `auth.uid()` returns `uuid` type; `storage.foldername(name)` returns `text[]`. Comparing `uuid` to `text` without casting causes a PostgreSQL type error, and the policy silently fails or errors.

**Why it happens:** PostgreSQL is strict about type comparisons.

**How to avoid:** Cast `auth.uid()` to text: `(storage.foldername(name))[1] = (SELECT auth.uid()::text)`

---

### Pitfall 3: Resend `from` domain vs. app domain confusion

**What goes wrong:** Verifying the Vercel app URL (`contractors-connect.vercel.app`) in Resend instead of the email `from` domain (`contractorsconnect.com`). The Vercel subdomain cannot be DNS-verified for email sending.

**Why it happens:** The app URL and the email from-address are different domains.

**How to avoid:** The domain to verify in Resend is the domain in the `from` field of emails — currently `contractorsconnect.com` per `lib/email.ts`. If `RESEND_FROM_EMAIL` env var is set to a different domain, verify that domain instead.

---

### Pitfall 4: `server-only` import position

**What goes wrong:** `import 'server-only'` placed after other imports may not work in all bundler configurations (though it typically does in Next.js).

**Why it happens:** Side-effect imports can interact with bundler tree-shaking.

**How to avoid:** Place `import 'server-only'` as the very first line in the file, before any other imports.

---

### Pitfall 5: `avatars` and `post-images` buckets have no policies and may not exist

**What goes wrong:** These two buckets are NOT created in any migration (only `application-docs` is in migration 006). They must have been created manually in the Supabase dashboard. If they have no RLS policies, ALL storage operations are denied by default.

**Why it happens:** Supabase storage RLS defaults to deny-all when no policies exist.

**How to avoid:** Migration 007 must create INSERT, UPDATE (for upsert), and SELECT policies for `avatars` and `post-images`. The `avatars` upload in `profile/page.tsx` uses `{ upsert: true }` — this requires both INSERT and UPDATE policies to exist.

---

## Code Examples

Verified patterns from official sources:

### Complete `007_storage_policies.sql` structure

```sql
-- Source: Supabase Storage docs (https://supabase.com/docs/guides/storage/security/access-control)
-- Source: Supabase Storage helpers (https://supabase.com/docs/guides/storage/schema/helper-functions)

-- ============================================================
-- DROP old permissive application-docs policies from migration 006
-- ============================================================
DROP POLICY IF EXISTS "Applicants can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Applicants can read their own documents" ON storage.objects;

-- ============================================================
-- avatars bucket — create if not exists, set public
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read
CREATE POLICY "avatars: public read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- Authenticated upload (no path restriction per locked decision)
CREATE POLICY "avatars: authenticated upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- Authenticated upsert requires UPDATE policy too
CREATE POLICY "avatars: authenticated update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars');

-- ============================================================
-- post-images bucket — create if not exists, set public
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "post-images: public read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'post-images');

CREATE POLICY "post-images: authenticated upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'post-images');

-- ============================================================
-- application-docs bucket — update to public, strict path RLS
-- ============================================================
-- NOTE: Bucket already exists from migration 006; update public flag
UPDATE storage.buckets
SET public = true
WHERE id = 'application-docs';

-- Public read (admins and applicants can view docs via URL)
CREATE POLICY "application-docs: public read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'application-docs');

-- STRICT: authenticated users can only upload to their own user-ID folder
-- DEPENDS ON: apply/page.tsx being updated to use userId (not appData.id) as path prefix
CREATE POLICY "application-docs: upload to own folder only"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'application-docs'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );
```

### `server-only` guard addition

```typescript
// Source: https://nextjs.org/docs/app/getting-started/server-and-client-components
// Add to lib/supabase-admin.ts — first line, before all other imports
import 'server-only'

// SERVER ONLY — never import this in client components.
// This client uses the service role key and bypasses Row Level Security.
import { createClient } from '@supabase/supabase-js'
// ... rest unchanged
```

```typescript
// Add to lib/email.ts — first line, before all other imports
import 'server-only'

// SERVER ONLY — never import this in client components.
import { Resend } from 'resend'
// ... rest unchanged
```

### Upload path fix in `app/apply/page.tsx`

```typescript
// Current (line 172) — uses application row ID, not user ID:
const path = `${appData.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

// Fixed — use userId for path restriction to match RLS policy:
// userId is available from signUpData?.user?.id (line 136)
// Handle null userId (existing user case) by getting session:
const { data: { session } } = await supabase.auth.getSession()
const uploadUserId = userId ?? session?.user?.id
if (!uploadUserId) {
  // skip upload or handle error — no authenticated user to key path on
}
const path = `${uploadUserId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `typeof window !== 'undefined'` guards | `import 'server-only'` | Next.js App Router (v13+) | Build-time vs. runtime; build-time is strictly safer |
| Manual Supabase policy creation in dashboard | SQL migration files | Project established practice | Repeatable, version-controlled |
| Permissive storage upload policy (any authenticated user) | Path-scoped RLS | Phase 1 improvement | Prevents cross-user document access |

**Deprecated/outdated:**
- `auth.role() = 'authenticated'` as sole storage upload guard: technically valid but insufficient for per-user isolation; being replaced by path-scoped policy in this phase.

---

## Open Questions

1. **`application-docs` path fix — where exactly?**
   - What we know: The upload path uses `appData.id`, but the locked decision calls for `{auth.uid()}/` restriction
   - What's unclear: The planner must decide whether to change `apply/page.tsx` upload path or relax the policy
   - Recommendation: Change the upload path in `apply/page.tsx` to use `userId` (Option A above); handle the `null userId` edge case for returning users

2. **`application-docs` public vs. private?**
   - What we know: Migration 006 sets `public: false`; `apply/page.tsx` calls `getPublicUrl()`; CONTEXT.md says all buckets should be public read
   - What's unclear: Whether admin document access flow relies on private + signed URL (more secure) or public read
   - Recommendation: Set `public = true` per locked decision. If admin needs restricted access to docs in the future, migrate to signed URLs then.

3. **Resend sending domain identity**
   - What we know: `lib/email.ts` defaults `from` to `noreply@contractorsconnect.com`; the `RESEND_FROM_EMAIL` env var may override this
   - What's unclear: What domain is actually set in `RESEND_FROM_EMAIL` in the Vercel dashboard
   - Recommendation: The deployment checklist should include "verify the `RESEND_FROM_EMAIL` env var domain matches the domain added in Resend dashboard." This is a runtime check the user makes manually.

---

## Sources

### Primary (HIGH confidence)
- `https://nextjs.org/docs/app/getting-started/server-and-client-components` — server-only package usage, build-time error behavior, official Next.js documentation (fetched 2026-03-01, lastUpdated: 2026-02-27)
- `https://supabase.com/docs/guides/storage/security/access-control` — Storage RLS INSERT/SELECT policy syntax, bucket_id check pattern
- `https://supabase.com/docs/guides/storage/schema/helper-functions` — `storage.foldername()`, `storage.filename()`, `storage.extension()` signatures and examples
- `https://supabase.com/docs/guides/auth/redirect-urls` — Site URL vs. Additional Redirect URLs, dashboard navigation path
- `https://resend.com/docs/dashboard/domains/introduction` — Domain add/verify flow, SPF+DKIM DNS records, propagation timeline

### Secondary (MEDIUM confidence)
- WebSearch: `server-only` package version 0.0.1 confirmed via `npm show server-only version`
- WebSearch: Resend DNS propagation up to 48–72 hours (consistent across multiple sources)
- Codebase inspection: `app/apply/page.tsx` lines 172–181 — upload path uses `appData.id`, not `auth.uid()`
- Codebase inspection: `supabase/migrations/006_application_documents.sql` — existing permissive policies identified for DROP

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — `server-only` and Supabase storage RLS verified against official docs; Resend DNS verified against official docs
- Architecture: HIGH — all SQL patterns verified against official Supabase storage docs; path-restriction syntax verified
- Pitfalls: HIGH — policy OR-logic behavior and type mismatch are documented PostgreSQL/Supabase behaviors; upload path discrepancy discovered from direct code inspection

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (stable APIs; Supabase storage RLS syntax is stable)
