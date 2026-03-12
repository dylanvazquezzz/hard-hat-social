---
estimated_steps: 5
estimated_files: 3
---

# T02: Add assertIsAdmin() guard to all admin server actions

**Slice:** S01 — Foundation Cleanup
**Milestone:** M002

## Description

`app/admin/actions.ts` and `app/admin/contractors/[id]/actions.ts` both use the service-role admin client with no server-side auth check. The `app/admin/layout.tsx` guard is a `'use client'` component that redirects non-admins via `useEffect` — this runs after hydration and provides zero protection against direct server action invocations. Any authenticated user who knows the action name can call `approveApplication()` and insert a contractor row, certifications, and a profile row into the database.

This task creates a `lib/admin-guard.ts` helper that verifies the calling user's session and email, then adds `await assertIsAdmin()` as the first line of every exported function in both action files.

## Steps

1. Create `lib/admin-guard.ts` with `import 'server-only'` at the top:
   ```ts
   import 'server-only'
   import { cookies } from 'next/headers'
   import { getSupabaseAdmin } from '@/lib/supabase-admin'

   export async function assertIsAdmin(): Promise<void> {
     const cookieStore = cookies()
     // Extract the Supabase access token from cookies (same pattern as app/explore/page.tsx)
     const allCookies = cookieStore.getAll()
     const tokenCookie = allCookies.find(
       (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
     )
     let userEmail: string | null = null
     if (tokenCookie?.value) {
       try {
         const parsed = JSON.parse(tokenCookie.value)
         const accessToken = Array.isArray(parsed) ? parsed[0] : parsed?.access_token
         if (accessToken) {
           const admin = getSupabaseAdmin()
           const { data } = await admin.auth.getUser(accessToken)
           userEmail = data?.user?.email ?? null
         }
       } catch {
         // token parse failed — treat as unauthenticated
       }
     }
     const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
       .split(',')
       .map((e) => e.trim().toLowerCase())
       .filter(Boolean)
     if (!userEmail || !adminEmails.includes(userEmail.toLowerCase())) {
       throw new Error('403 Forbidden: admin access required')
     }
   }
   ```

2. In `app/admin/actions.ts`: add `import { assertIsAdmin } from '@/lib/admin-guard'`. Add `await assertIsAdmin()` as the first line inside `approveApplication()` and `rejectApplication()`.

3. In `app/admin/contractors/[id]/actions.ts`: add `import { assertIsAdmin } from '@/lib/admin-guard'`. Add `await assertIsAdmin()` as the first line inside `addCertification()`, `deleteCertification()`, and `updateCertification()`.

4. Verify the guard logic is correct: the cookie extraction pattern follows `app/explore/page.tsx` lines 62–77 exactly. Confirm the token parsing handles both the JSON array format (Supabase v1 cookie) and the object format with `access_token` key (Supabase v2).

5. Run `npm run build` — confirm zero TypeScript errors. No functional change to action logic after the guard line.

## Must-Haves

- [ ] `lib/admin-guard.ts` exists, has `import 'server-only'`, and exports `assertIsAdmin()`
- [ ] `assertIsAdmin()` throws `Error('403 Forbidden: admin access required')` when the calling user is not in `NEXT_PUBLIC_ADMIN_EMAILS`
- [ ] `approveApplication` and `rejectApplication` in `app/admin/actions.ts` each call `await assertIsAdmin()` as their first statement
- [ ] `addCertification`, `deleteCertification`, `updateCertification` in `app/admin/contractors/[id]/actions.ts` each call `await assertIsAdmin()` as their first statement
- [ ] No changes to action logic after the guard call
- [ ] `npm run build` passes with zero TypeScript errors

## Verification

- `grep -n "assertIsAdmin" app/admin/actions.ts` — must show ≥2 lines (one per exported function)
- `grep -n "assertIsAdmin" "app/admin/contractors/[id]/actions.ts"` — must show ≥3 lines
- `grep "import 'server-only'" lib/admin-guard.ts` — must match
- `npm run build` — zero errors

## Observability Impact

- Signals added/changed: `assertIsAdmin()` throws with `'403 Forbidden: admin access required'` on unauthorized calls — surfaced as a Next.js server action error in dev overlay and as HTTP 500 in prod (better than silent success)
- How a future agent inspects this: check server logs or browser network tab for 500 on admin action calls; the error message is the signal
- Failure state exposed: unauthorized call throws immediately before any DB mutation — no partial state possible

## Inputs

- `app/explore/page.tsx` lines 62–77 — cookie extraction + `admin.auth.getUser(token)` pattern to replicate
- `app/admin/layout.tsx` — ADMIN_EMAILS parsing pattern: `.split(',').map(e => e.trim().toLowerCase()).filter(Boolean)`
- `app/admin/actions.ts` — current action functions that need the guard added
- `app/admin/contractors/[id]/actions.ts` — current action functions that need the guard added

## Expected Output

- `lib/admin-guard.ts` — new server-only helper with `assertIsAdmin()`
- `app/admin/actions.ts` — `assertIsAdmin()` called at top of both exported functions
- `app/admin/contractors/[id]/actions.ts` — `assertIsAdmin()` called at top of all three exported functions
