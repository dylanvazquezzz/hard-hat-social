# S01: Foundation Cleanup — Research

**Date:** 2026-03-12

## Summary

S01 has four distinct work items: (1) TRADES constant consolidation, (2) apply form server-side rate limiting, (3) admin server action security audit/fix, and (4) error boundaries on Directory and Explore. All four are low-risk, no new dependencies, no migrations required. The codebase is clean and patterns are consistent — this slice is about fixing existing gaps, not building new systems.

The biggest risk is the admin security gap: `app/admin/actions.ts` and `app/admin/contractors/[id]/actions.ts` use the service-role admin client with **no auth check** server-side. The admin layout (`app/admin/layout.tsx`) is a `'use client'` component that redirects non-admins away at the UI level, but it does not protect the server actions. Any authenticated user who directly calls `approveApplication()` or `rejectApplication()` bypasses the admin guard entirely. This must be fixed.

The TRADES consolidation is purely mechanical — 4 files define the same array with one notable divergence: `CreateJobForm.tsx` includes an extra `'Other'` entry. This needs a decision before execution. The cleanest approach is to export two constants from `lib/constants.ts`: `TRADES` (canonical 6-trade list) and `TRADES_WITH_OTHER` (extends TRADES), so each consumer gets the right list.

Apply form rate limiting currently doesn't exist. The form is a client component — the simplest compliant approach is to convert the `handleSubmit` insert into a server action that performs the rate-check query before inserting. Alternatively, the rate check can be a Postgres function called via RPC. A server action is the idiomatic Next.js 14 pattern for this codebase and avoids adding an API route.

## Recommendation

**TRADES:** Create `lib/constants.ts` exporting `TRADES` (6 items) and `TRADES_WITH_OTHER` (7 items, adds `'Other'`). Update the 4 imports. No structural changes to consumers.

**Rate limiting:** Convert apply form submission to call a new `submitApplication` server action in `app/apply/actions.ts`. The action uses `getSupabaseAdmin()` to count applications with the submitted email in the last 24h and throws if count ≥ 3. The apply page client component calls this action instead of calling Supabase directly. This keeps the form client-side while moving the privileged check server-side.

**Admin security:** Add an `assertIsAdmin()` helper that calls `supabase.auth.getUser()` (browser client, from request headers) or—simpler for server actions—creates a scoped Supabase client from the request cookies to get the session, then verifies the email against `NEXT_PUBLIC_ADMIN_EMAILS`. Add this check at the top of every function in `app/admin/actions.ts` and `app/admin/contractors/[id]/actions.ts`. If check fails, throw. Record findings in DECISIONS.md.

**Error boundaries:** Add `app/contractors/error.tsx` and `app/explore/error.tsx`. These are Next.js 13+ App Router error boundaries — they must be `'use client'` components exporting a default function with `(error, reset)` props. The loading skeleton already exists for `/contractors` (`contractors/loading.tsx`). No `loading.tsx` exists for `/explore` — add one with a simple skeleton.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Error boundaries in App Router | `error.tsx` file convention | Next.js wraps the segment in React's ErrorBoundary automatically — no manual `<ErrorBoundary>` component needed |
| Loading states | `loading.tsx` file convention | Same pattern — contractors already has one; just add for explore |
| Server-side auth in server actions | `createServerClient` or checking cookies via `@supabase/ssr` | But: codebase doesn't use `@supabase/ssr` — use `getSupabaseAdmin().auth.getUser(token)` with the cookie token, same pattern as `app/explore/page.tsx` |

## Existing Code and Patterns

- `app/explore/page.tsx` lines 62–77 — cookie-based token extraction and `admin.auth.getUser(token)` call — this is the existing pattern for server-side identity; replicate in admin action guard
- `app/contractors/loading.tsx` — full skeleton implementation; replicate structure for `app/explore/loading.tsx`
- `app/api/contact/[id]/route.ts` — shows the correct pattern for server-side auth checks using bearer token; admin actions should do the same via cookie token
- `app/jobs/actions.ts` — shows the current "no auth check" pattern for server actions (createJob, markHired, markCompleted also lack auth checks); note this for future but out of S01 scope
- `app/admin/layout.tsx` — client-side admin guard only; this is the gap we're auditing. The layout redirects in `useEffect` (post-hydration), meaning direct fetch calls to server actions bypass it entirely
- `app/admin/actions.ts` — `approveApplication` and `rejectApplication` use `getSupabaseAdmin()` (service role) with no auth check. `approveApplication` is particularly dangerous — it inserts a contractor row, creates certifications, and upserts a profile
- `app/apply/page.tsx` line 143 — `handleSubmit` directly calls `supabase.from('applications').insert()`. The client Supabase client respects RLS; the `'Anyone can submit an application'` INSERT policy has `with check (true)`. Rate limiting must be enforced before or alongside the insert.
- `components/CreateJobForm.tsx` line 6 — only file where `TRADES` includes `'Other'` — this divergence must be preserved with `TRADES_WITH_OTHER`

## Constraints

- No new npm packages. All server action patterns must use existing `@supabase/supabase-js` and `server-only` patterns.
- `NEXT_PUBLIC_ADMIN_EMAILS` is baked at build time — it's available in server action scope via `process.env.NEXT_PUBLIC_ADMIN_EMAILS`.
- `lib/constants.ts` does not exist yet — must create it. The roadmap mandates it lives at `lib/constants.ts`.
- Error boundary files must be `'use client'` components — App Router requires this.
- Apply form is currently a client component. Converting the entire form to a Server Component is out of scope and high-risk. The target is a `submitApplication` server action the client calls.
- `submitted_at` is the timestamp column on `applications` (not `created_at`). Rate-limit query must filter on `submitted_at`.
- The apply form already handles `user_already_exists` auth error (line ~135) — the server action must preserve this behavior.

## Common Pitfalls

- **Admin action auth check pattern** — `process.env.NEXT_PUBLIC_ADMIN_EMAILS` is a comma-separated string; split and trim before comparing. The existing `app/admin/layout.tsx` already shows the correct parsing: `.split(',').map(e => e.trim().toLowerCase()).filter(Boolean)`.
- **Rate limit query with `submitted_at`** — The column is `submitted_at` (not `created_at`) on the `applications` table. Filter: `submitted_at > now() - interval '24 hours'` AND `email = $1`.
- **Service role for rate check** — The rate-limit count query in the server action should use `getSupabaseAdmin()` (service role) because anonymous users don't have SELECT rights on others' applications. The INSERT RLS policy allows anyone to insert, but SELECT is restricted to the applicant's own rows.
- **TRADES_WITH_OTHER naming** — If we name it `JOB_TRADES` instead, it's more semantic and makes the intent clearer in CreateJobForm. Consider which name is more future-proof given M002's notification features will need to match trades.
- **Error.tsx `reset` button** — The reset prop is `() => void` in App Router error boundaries. Call it to retry the render — don't `router.push` because that breaks the error boundary contract.
- **Explore page error boundary** — `app/explore/page.tsx` uses `cookies()` from `next/headers` and `getSupabaseAdmin()`. If Supabase is down or the admin client fails, the page throws. The error boundary will catch this but the loading skeleton should be added too.
- **Client-side document upload in apply** — The current `handleSubmit` does doc uploads after the insert. If we move submission to a server action, doc uploads (which use the browser Supabase client for Storage) must stay client-side. The pattern: server action handles rate-check + DB insert, client-side code handles Storage upload afterward (same as current flow, just with the DB insert moved).

## Open Risks

- **Admin action guard implementation choice** — The codebase has no middleware and no `@supabase/ssr` (which provides `createServerClient` with cookie access in server actions). Getting the current user's session inside a server action requires extracting the token from cookies manually (same pattern as `explore/page.tsx` lines 62–77) or via `headers()`. This is workable but slightly awkward. The explore page already demonstrates the cookie extraction pattern — use that.
- **apply form refactor scope** — Moving the insert to a server action touches the most complex form in the codebase (multi-step, doc upload, auth signup). Risk is accidentally breaking the existing flow. Scope carefully: only move the applications table INSERT to the server action; leave auth signup and Storage upload client-side.
- **CreateJobForm 'Other' trade** — S02+ features (comments, notifications) may reference trade values. If 'Other' leaks into notification fan-out logic it could cause mismatches. Keeping it in a separate `TRADES_WITH_OTHER` or `JOB_TRADES` constant prevents contamination of the canonical list.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| Next.js App Router | (built-in knowledge) | none found / not needed |
| Supabase | (built-in knowledge) | none found / not needed |

## Sources

- Code audit: `app/admin/actions.ts`, `app/admin/layout.tsx` — confirmed no server-side auth check in actions
- Code audit: `app/apply/page.tsx` — confirmed no rate limiting, client-side insert
- Code audit: `components/CreateJobForm.tsx` — confirmed 'Other' divergence in TRADES
- Code audit: `app/explore/page.tsx` lines 62–77 — cookie token extraction pattern for server-side identity
- Code audit: `app/contractors/loading.tsx` — confirmed loading skeleton exists for contractors, not explore
- Migration audit: `supabase/migrations/001_initial.sql` — `applications.submitted_at` column confirmed
