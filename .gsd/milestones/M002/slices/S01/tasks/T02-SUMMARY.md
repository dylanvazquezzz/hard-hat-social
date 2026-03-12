---
id: T02
parent: S01
milestone: M002
provides:
  - lib/admin-guard.ts with assertIsAdmin() — server-only helper that throws 403 if caller is not in NEXT_PUBLIC_ADMIN_EMAILS
  - All 5 exported admin server action functions guarded with await assertIsAdmin() as first statement
key_files:
  - lib/admin-guard.ts
  - app/admin/actions.ts
  - app/admin/contractors/[id]/actions.ts
key_decisions:
  - Cookie extraction handles both Supabase v1 (JSON array, parsed[0]) and v2 (object with access_token key) formats for forward compatibility
  - Guard uses getSupabaseAdmin().auth.getUser(token) to validate the token server-side — cannot be spoofed client-side
  - Error message is '403 Forbidden: admin access required' — surfaced in Next.js server action error boundary; no silent failure
patterns_established:
  - All admin server actions import assertIsAdmin from @/lib/admin-guard and call it as their first statement before any DB access
  - lib/admin-guard.ts uses import 'server-only' to prevent accidental client-side bundling
observability_surfaces:
  - assertIsAdmin() throws with '403 Forbidden: admin access required' — surfaced as Next.js error overlay in dev, HTTP 500 in prod
  - Unauthorized calls fail before any DB mutation — no partial state possible
  - Check: grep -n "assertIsAdmin" app/admin/actions.ts app/admin/contractors/[id]/actions.ts
duration: ~10 minutes
verification_result: passed
completed_at: 2026-03-12
blocker_discovered: false
---

# T02: Add assertIsAdmin() guard to all admin server actions

**Created `lib/admin-guard.ts` and added `await assertIsAdmin()` as the first statement in all 5 exported admin server action functions.**

## What Happened

Created `lib/admin-guard.ts` with `import 'server-only'` at the top. The `assertIsAdmin()` function extracts the Supabase auth token from cookies (finding the cookie matching `sb-*-auth-token`), parses it handling both v1 array format and v2 object format, calls `admin.auth.getUser(token)` to resolve the user server-side, then checks the email against `NEXT_PUBLIC_ADMIN_EMAILS`. Throws `Error('403 Forbidden: admin access required')` if not authorized.

Added `import { assertIsAdmin } from '@/lib/admin-guard'` and `await assertIsAdmin()` as the first line inside:
- `approveApplication()` and `rejectApplication()` in `app/admin/actions.ts`
- `addCertification()`, `deleteCertification()`, and `updateCertification()` in `app/admin/contractors/[id]/actions.ts`

No changes to any action logic after the guard call.

## Verification

```
grep "import 'server-only'" lib/admin-guard.ts         → matched
grep -n "assertIsAdmin" app/admin/actions.ts           → 3 lines (import + 2 calls)
grep -n "assertIsAdmin" app/admin/contractors/[id]/actions.ts → 4 lines (import + 3 calls)
npm run build                                          → zero TypeScript errors, all 14 pages compiled
```

## Diagnostics

- Unauthorized call to any admin server action throws immediately with `'403 Forbidden: admin access required'`
- In dev: Next.js error overlay shows the thrown error
- In prod: returns HTTP 500 (not a silent no-op)
- No DB mutation can occur if guard throws — all DB calls are after `await assertIsAdmin()`
- Inspect: `grep -n "assertIsAdmin" app/admin/actions.ts "app/admin/contractors/[id]/actions.ts"`

## Deviations

none

## Known Issues

none

## Files Created/Modified

- `lib/admin-guard.ts` — new server-only helper; exports assertIsAdmin()
- `app/admin/actions.ts` — added import + await assertIsAdmin() to approveApplication and rejectApplication
- `app/admin/contractors/[id]/actions.ts` — added import + await assertIsAdmin() to addCertification, deleteCertification, updateCertification
