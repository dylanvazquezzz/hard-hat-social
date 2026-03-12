# S01: Foundation Cleanup

**Goal:** Eliminate four pre-existing gaps that all downstream slices depend on: (1) TRADES defined in one place, (2) admin server actions guarded server-side, (3) apply form rate-limited server-side, (4) error boundaries on /contractors and /explore.
**Demo:** `npm run build` passes clean. `rg "^const TRADES" --include="*.tsx" app/ components/` returns zero results. Direct call to `approveApplication()` without admin credentials throws. A 4th apply submission with the same email within 24h returns an error. `/contractors` and `/explore` have `error.tsx` files that render a retry UI.

## Must-Haves

- `lib/constants.ts` exports `TRADES` (6 items) and `TRADES_WITH_OTHER` (7 items, adds `'Other'`)
- All 4 inline `TRADES` definitions removed and replaced with the import from `lib/constants.ts`
- `assertIsAdmin()` helper in `lib/admin-guard.ts` that verifies the calling user's email against `NEXT_PUBLIC_ADMIN_EMAILS`
- `approveApplication`, `rejectApplication` in `app/admin/actions.ts` call `assertIsAdmin()` at the top and throw if check fails
- `addCertification`, `deleteCertification`, `updateCertification` in `app/admin/contractors/[id]/actions.ts` call `assertIsAdmin()` at the top and throw if check fails
- `submitApplication` server action in `app/apply/actions.ts` that rate-checks (≤3 per email per 24h using `submitted_at`) via admin client before inserting; client apply form calls this action instead of directly inserting
- `app/contractors/error.tsx` — `'use client'` error boundary with retry button
- `app/explore/error.tsx` — `'use client'` error boundary with retry button
- `app/explore/loading.tsx` — skeleton loading state matching the contractors loading pattern
- `npm run build` produces zero TypeScript errors

## Proof Level

- This slice proves: contract + integration (server-side behavior is correct by construction; browser flow verified for error boundary rendering)
- Real runtime required: yes (dev server, `npm run build`)
- Human/UAT required: no (all verification is scriptable or via build output)

## Verification

- `npm run build` — zero TypeScript/build errors
- `rg "^const TRADES" --include="*.tsx" --include="*.ts" app/ components/` — returns zero results (all inline definitions removed)
- `grep -r "from '@/lib/constants'" app/ components/` — returns ≥4 matches (all consumers import from lib/constants)
- `grep -n "assertIsAdmin" app/admin/actions.ts app/admin/contractors/\[id\]/actions.ts` — every exported function has the call
- `grep -rn "submitApplication" app/apply/page.tsx` — confirm the client calls the server action, not `supabase.from('applications').insert()`
- `ls app/contractors/error.tsx app/explore/error.tsx app/explore/loading.tsx` — all three files exist
- `grep "'use client'" app/contractors/error.tsx app/explore/error.tsx` — both have the directive

## Observability / Diagnostics

- Runtime signals: `assertIsAdmin()` throws with a `403 Forbidden` message string — surfaced in Next.js server action error boundary; no silent failure
- Inspection surfaces: rate-limit rejection returns a user-facing string the client can display; `console.error` in apply server action for unexpected DB errors
- Failure visibility: if admin auth check fails mid-action (e.g., token extraction fails), the thrown error surfaces in the Next.js error overlay during dev and returns HTTP 500 in prod (not a silent no-op)
- Redaction constraints: no secrets or PII logged; email addresses used only for equality comparison and not echoed to client responses

## Integration Closure

- Upstream surfaces consumed: `lib/supabase-admin.ts` (admin client), `lib/supabase.ts` (browser client in apply form), `app/admin/actions.ts`, `app/admin/contractors/[id]/actions.ts`, `app/apply/page.tsx`, `components/SearchFilters.tsx`, `components/CreateJobForm.tsx`, `app/page.tsx`
- New wiring introduced in this slice: `lib/constants.ts` (consumed by 4 files), `lib/admin-guard.ts` (consumed by 2 action files), `app/apply/actions.ts` (consumed by apply page), error.tsx + loading.tsx files (consumed by Next.js App Router automatically)
- What remains before the milestone is truly usable end-to-end: S02 comments, S03 notifications, S04 follows, S05 SEO, S06 onboarding, S07 DMs

## Tasks

- [x] **T01: Create lib/constants.ts and replace all inline TRADES definitions** `est:30m`
  - Why: TRADES is defined in 4 files with one divergence (CreateJobForm has 'Other'). Downstream M002 slices (notifications, job matching) must reference a single canonical list to avoid drift.
  - Files: `lib/constants.ts` (new), `app/apply/page.tsx`, `app/page.tsx`, `components/SearchFilters.tsx`, `components/CreateJobForm.tsx`
  - Do: Create `lib/constants.ts` exporting `TRADES` as `['Welding', 'HVAC', 'Electrical', 'Plumbing', 'General Contractor', 'Drywall']` and `TRADES_WITH_OTHER` as `[...TRADES, 'Other']`. In each of the 4 consumer files: delete the inline `const TRADES = [...]` declaration, add `import { TRADES } from '@/lib/constants'` (or `TRADES_WITH_OTHER` for CreateJobForm.tsx). No logic changes in any consumer.
  - Verify: `rg "^const TRADES" --include="*.tsx" --include="*.ts" app/ components/` returns zero results. `npm run build` clean.
  - Done when: Zero inline TRADES definitions remain; all 4 consumers import from `lib/constants.ts`; build passes.

- [x] **T02: Add assertIsAdmin() guard to all admin server actions** `est:45m`
  - Why: `app/admin/actions.ts` and `app/admin/contractors/[id]/actions.ts` use the service-role admin client with no auth check. Any authenticated user can call `approveApplication()` directly and insert a contractor row + certifications. This is the highest-severity gap in S01.
  - Files: `lib/admin-guard.ts` (new), `app/admin/actions.ts`, `app/admin/contractors/[id]/actions.ts`
  - Do: Create `lib/admin-guard.ts` (with `import 'server-only'` at top). Export `async function assertIsAdmin(): Promise<void>`. Inside: call `cookies()` from `next/headers` to get the access token (key: `sb-<ref>-auth-token` or use `getSupabaseAdmin().auth.getUser(token)` pattern from `app/explore/page.tsx` lines 62–77). Parse `NEXT_PUBLIC_ADMIN_EMAILS` the same way `app/admin/layout.tsx` does: `.split(',').map(e => e.trim().toLowerCase()).filter(Boolean)`. If the resolved user email is not in the list, throw `new Error('403 Forbidden: admin access required')`. Add `await assertIsAdmin()` as the first line of every exported function in both action files. Note: `cookies()` in server actions returns the request cookies — use `getSupabaseAdmin().auth.getUser(token)` with the extracted bearer token to resolve the user, matching the explore page pattern.
  - Verify: `grep -n "assertIsAdmin" app/admin/actions.ts app/admin/contractors/\[id\]/actions.ts` — every exported function shows the call. `npm run build` clean.
  - Done when: Every exported function in both admin action files calls `assertIsAdmin()` first; build passes; no existing admin functionality broken (action logic unchanged after guard).

- [x] **T03: Add server-side rate limiting to the apply form** `est:45m`
  - Why: The apply form's `handleSubmit` directly calls `supabase.from('applications').insert()` from the client. There is no server-side check preventing >3 submissions per email per 24h. Any user can resubmit without restriction.
  - Files: `app/apply/actions.ts` (new), `app/apply/page.tsx`
  - Do: Create `app/apply/actions.ts` with `'use server'` directive. Export `async function checkApplyRateLimit(email: string): Promise<{ allowed: boolean; error?: string }>`. Inside: use `getSupabaseAdmin()` to count rows in `applications` where `email = email` AND `submitted_at > now() - interval '24 hours'`. If count ≥ 3, return `{ allowed: false, error: 'You have submitted 3 applications in the last 24 hours. Please wait before submitting again.' }`. Otherwise return `{ allowed: true }`. In `app/apply/page.tsx`: import `checkApplyRateLimit` from `./actions`. In `handleSubmit`, before the `supabase.auth.signUp` call, call `await checkApplyRateLimit(form.email)`. If `!result.allowed`, set the error state with `result.error` and return early (same pattern as the password mismatch check above it). The Storage upload and DB insert stay client-side — only the rate check moves to the server action.
  - Verify: `grep -n "checkApplyRateLimit" app/apply/page.tsx` confirms the import and call exist. `grep -n "supabase.from.*applications.*insert" app/apply/page.tsx` confirms the insert is still in the client (only rate check moved). `npm run build` clean.
  - Done when: `app/apply/actions.ts` exists with the rate-check logic; `app/apply/page.tsx` calls it before auth signup; build passes.

- [x] **T04: Add error boundaries and loading skeleton for /explore** `est:20m`
  - Why: `/contractors` already has `loading.tsx` but no `error.tsx`. `/explore` has neither. If Supabase goes down or throws, both pages crash with an unhandled Next.js error screen. Error boundaries catch thrown errors and give users a retry option.
  - Files: `app/contractors/error.tsx` (new), `app/explore/error.tsx` (new), `app/explore/loading.tsx` (new)
  - Do: Create `app/contractors/error.tsx`: `'use client'` directive, default export `ContractorsError({ error, reset }: { error: Error; reset: () => void })`. Render a centered container with a brief error message and a "Try again" `<button onClick={reset}>` — use the same dark slate color palette as the rest of the app. Create `app/explore/error.tsx` with the same structure (`ExploreError`). Create `app/explore/loading.tsx`: `'use client'` is NOT required for loading.tsx. Mirror the structure of `app/contractors/loading.tsx` — a grid of animated pulse skeleton cards. Keep it simple: 6 skeleton post cards (each is a rounded border-slate-800 bg-slate-900 block with two pulse placeholder lines).
  - Verify: `ls app/contractors/error.tsx app/explore/error.tsx app/explore/loading.tsx` — all three exist. `grep "'use client'" app/contractors/error.tsx app/explore/error.tsx` — both have the directive. `npm run build` clean.
  - Done when: All three files exist; error.tsx files have `'use client'`; build passes with zero errors.

## Files Likely Touched

- `lib/constants.ts` — new
- `lib/admin-guard.ts` — new
- `app/apply/actions.ts` — new
- `app/contractors/error.tsx` — new
- `app/explore/error.tsx` — new
- `app/explore/loading.tsx` — new
- `app/apply/page.tsx` — import TRADES + call checkApplyRateLimit
- `app/page.tsx` — import TRADES
- `components/SearchFilters.tsx` — import TRADES
- `components/CreateJobForm.tsx` — import TRADES_WITH_OTHER
- `app/admin/actions.ts` — add assertIsAdmin() calls
- `app/admin/contractors/[id]/actions.ts` — add assertIsAdmin() calls
