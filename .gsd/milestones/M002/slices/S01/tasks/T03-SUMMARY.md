---
id: T03
parent: S01
milestone: M002
provides:
  - app/apply/actions.ts with checkApplyRateLimit(email) server action — limits to 3 submissions per email per 24h using admin client
  - app/apply/page.tsx calls checkApplyRateLimit before setLoading(true) in handleSubmit; DB insert unchanged client-side
key_files:
  - app/apply/actions.ts
  - app/apply/page.tsx
key_decisions:
  - Rate check failure (DB error) is non-blocking — logs server-side and returns { allowed: true } to avoid blocking legitimate users on transient DB issues
  - DB insert and Storage upload remain client-side; only the count check moves server-side to minimize regression risk
patterns_established:
  - Server actions in app/*/actions.ts for lightweight server-side validation that precedes client-side multi-step flows
observability_surfaces:
  - console.error('[apply] rate limit check failed:', error.message) — visible in Vercel function logs when admin client query fails
  - User-facing error string returned in rateCheck.error when limit is hit — displayed via existing setError() state
duration: ~10 minutes
verification_result: passed
completed_at: 2026-03-12
blocker_discovered: false
---

# T03: Add server-side rate limiting to the apply form

**Created `app/apply/actions.ts` with `checkApplyRateLimit(email)` server action; wired into `handleSubmit` before `setLoading(true)` — limits to 3 submissions per email per 24 hours using the admin client, with fail-open on DB errors.**

## What Happened

- Created `app/apply/actions.ts` with `'use server'` directive; exports `checkApplyRateLimit(email: string): Promise<{ allowed: boolean; error?: string }>`.
- The action uses `getSupabaseAdmin()` to count `applications` rows where `email = $1` and `submitted_at >= now() - 24h` using `{ count: 'exact', head: true }` (no data returned, just the count).
- On DB error: logs `console.error('[apply] rate limit check failed:', ...)` and returns `{ allowed: true }` — fail-open prevents blocking legitimate users on transient errors.
- On count >= 3: returns `{ allowed: false, error: 'You have submitted 3 applications...' }`.
- Added `import { checkApplyRateLimit } from './actions'` to `app/apply/page.tsx`.
- Inserted `const rateCheck = await checkApplyRateLimit(form.email)` + early return guard after password validation checks and before `setLoading(true)`.
- The `supabase.from('applications').insert([applicationPayload])` line is unchanged — the DB insert remains client-side.

## Verification

- `cat app/apply/actions.ts` — confirmed file exists with `'use server'`, `getSupabaseAdmin()`, `submitted_at` filter, `count: 'exact'`, and fail-open on DB error.
- `grep -n "checkApplyRateLimit" app/apply/page.tsx` — import at line 6, call at line 135.
- `grep -n "applications" app/apply/page.tsx` — insert at line 179, unchanged, using browser `supabase` client.
- `grep -n "submitted_at" app/apply/actions.ts` — line 14, correct column used.
- `npm run build` — exit code 0, zero TypeScript errors, `/apply` route builds as static (`○`).

## Diagnostics

- Server-side log: `[apply] rate limit check failed: <message>` — visible in Vercel function logs when the admin Supabase query fails; indicates a transient DB issue (submission still proceeds).
- User-facing signal: when rate limit is hit, `setError()` displays the returned error string — visible as the red error banner on the apply form.
- To inspect: check Vercel logs for `/apply` route for `[apply] rate limit check` entries.

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `app/apply/actions.ts` — new server action file with `checkApplyRateLimit(email)` rate limit check
- `app/apply/page.tsx` — added import and pre-load rate check call in `handleSubmit`; DB insert unchanged
