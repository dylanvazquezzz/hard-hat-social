---
estimated_steps: 4
estimated_files: 2
---

# T03: Add server-side rate limiting to the apply form

**Slice:** S01 — Foundation Cleanup
**Milestone:** M002

## Description

The apply form's `handleSubmit` in `app/apply/page.tsx` directly calls `supabase.from('applications').insert()` from the browser client with no server-side rate check. There is nothing preventing the same email from submitting 10 applications in 60 seconds.

This task creates `app/apply/actions.ts` with a `checkApplyRateLimit(email)` server action that uses the admin client to count recent applications for that email. The client calls this action before proceeding with auth signup and doc upload. If the limit is hit, the error is displayed using the existing error state — the DB insert and Storage upload remain client-side as before.

Scope constraint: do NOT move the `supabase.auth.signUp()` call, the `supabase.from('applications').insert()`, or the Storage upload to the server action. Only the rate check moves. This preserves the complex multi-step flow and minimizes regression risk.

## Steps

1. Create `app/apply/actions.ts`:
   ```ts
   'use server'

   import { getSupabaseAdmin } from '@/lib/supabase-admin'

   export async function checkApplyRateLimit(
     email: string
   ): Promise<{ allowed: boolean; error?: string }> {
     const admin = getSupabaseAdmin()
     const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
     const { count, error } = await admin
       .from('applications')
       .select('id', { count: 'exact', head: true })
       .eq('email', email)
       .gte('submitted_at', cutoff)
     if (error) {
       // Log but don't block — if the rate check fails, allow submission to proceed
       console.error('[apply] rate limit check failed:', error.message)
       return { allowed: true }
     }
     if ((count ?? 0) >= 3) {
       return {
         allowed: false,
         error:
           'You have submitted 3 applications in the last 24 hours. Please wait before submitting again.',
       }
     }
     return { allowed: true }
   }
   ```

2. In `app/apply/page.tsx`: add `import { checkApplyRateLimit } from './actions'` near the top of the file (with other imports).

3. In `app/apply/page.tsx`, inside `handleSubmit`, after the password validation checks and before `setLoading(true)`, add:
   ```ts
   const rateCheck = await checkApplyRateLimit(form.email)
   if (!rateCheck.allowed) {
     setError(rateCheck.error ?? 'Too many submissions. Please try again later.')
     return
   }
   ```

4. Run `npm run build` to confirm zero TypeScript errors. Verify the insert line in `handleSubmit` is unchanged (still `supabase.from('applications').insert(...)`).

## Must-Haves

- [ ] `app/apply/actions.ts` exists with `'use server'` and exports `checkApplyRateLimit(email)`
- [ ] Rate check uses `getSupabaseAdmin()`, filters on `submitted_at >= cutoff`, counts rows with `{ count: 'exact', head: true }`
- [ ] Rate check failure (DB error) is non-blocking — logs and returns `{ allowed: true }` rather than rejecting
- [ ] `app/apply/page.tsx` imports and calls `checkApplyRateLimit` before `setLoading(true)` in `handleSubmit`
- [ ] The `supabase.from('applications').insert()` line in `handleSubmit` is **unchanged** — insert stays client-side
- [ ] `npm run build` passes with zero TypeScript errors

## Verification

- `cat app/apply/actions.ts` — confirm file exists and contains `checkApplyRateLimit`
- `grep -n "checkApplyRateLimit" app/apply/page.tsx` — shows import and call
- `grep -n "supabase.from.*applications.*insert" app/apply/page.tsx` — confirms insert is still in client handleSubmit
- `grep -n "submitted_at" app/apply/actions.ts` — confirms the correct column is used (not `created_at`)
- `npm run build` — zero errors

## Observability Impact

- Signals added/changed: Rate limit check failure logs `console.error('[apply] rate limit check failed:', ...)` server-side — visible in Vercel function logs
- How a future agent inspects this: Vercel function logs for `/apply` route will show rate limit check errors; user-facing error message is the success path signal
- Failure state exposed: If the admin client query fails, it fails open (allows submission) with a server-side log — prevents blocking legitimate users due to transient DB issues

## Inputs

- `app/apply/page.tsx` — current `handleSubmit` function; the rate check must be inserted before `setLoading(true)` (line ~131 in current file), after password validation
- `lib/supabase-admin.ts` — `getSupabaseAdmin()` function to use in the server action
- S01-RESEARCH.md — confirmed `submitted_at` (not `created_at`) is the timestamp column on `applications`

## Expected Output

- `app/apply/actions.ts` — new server action file with rate-limit check
- `app/apply/page.tsx` — imports and calls `checkApplyRateLimit` before loading state; insert unchanged
