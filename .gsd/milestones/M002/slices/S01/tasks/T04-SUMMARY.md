---
id: T04
parent: S01
milestone: M002
provides:
  - app/contractors/error.tsx — error boundary for /contractors route segment
  - app/explore/error.tsx — error boundary for /explore route segment
  - app/explore/loading.tsx — loading skeleton for /explore route segment
key_files:
  - app/contractors/error.tsx
  - app/explore/error.tsx
  - app/explore/loading.tsx
key_decisions:
  - reset is wired via onClick={reset} (not reset()) — JSX passes the function reference; both are equivalent but the JSX form is idiomatic React
patterns_established:
  - App Router error boundaries use 'use client' directive and receive (error, reset) props; reset() called directly, no router.push
  - Loading skeletons mirror the visual structure of the page they cover — post-shaped cards for explore, contractor cards for contractors
observability_surfaces:
  - error.digest available on the caught Error object — Next.js injects it automatically for correlation with server-side logs
  - Error boundary UI visible to users when page component throws — signals a Supabase/env issue; check Vercel function logs for root cause
duration: ~5 minutes
verification_result: passed
completed_at: 2026-03-12
blocker_discovered: false
---

# T04: Add error boundaries and loading skeleton for /explore

**Added `error.tsx` to /contractors and /explore, and `loading.tsx` to /explore — all three are purely presentational Next.js App Router convention files.**

## What Happened

Created three new files following Next.js App Router conventions:

1. `app/contractors/error.tsx` — `'use client'` component with `(error, reset)` props; renders "Unable to load the contractor directory" message and a "Try again" button wired to `reset`.
2. `app/explore/error.tsx` — identical structure, function name `ExploreError`, message "Unable to load the feed".
3. `app/explore/loading.tsx` — server component (no `'use client'` needed) with 6 `SkeletonPostCard` items in a `space-y-4` container, each card showing an avatar circle, name line, and two content lines using `animate-pulse`.

No data fetching, no business logic, no new dependencies. Next.js wires these automatically via file-system conventions.

## Verification

- `ls app/contractors/error.tsx app/explore/error.tsx app/explore/loading.tsx` — all three exist ✅
- `grep "'use client'" app/contractors/error.tsx app/explore/error.tsx` — both directives present ✅
- `grep "onClick={reset}" app/contractors/error.tsx app/explore/error.tsx` — reset wired in both ✅
- `grep "router.push" app/contractors/error.tsx app/explore/error.tsx` — no matches (PASS) ✅
- `npm run build` — compiled successfully, exit code 0, zero TypeScript errors ✅

## Diagnostics

- If `/contractors` or `/explore` renders the error boundary UI, it means the page component threw — check Vercel function logs for that route, or check Supabase health/env vars.
- `error.digest` on the caught error object correlates with Next.js server-side log entries for the same request.

## Deviations

None — implementation matches the task plan exactly.

## Known Issues

None.

## Files Created/Modified

- `app/contractors/error.tsx` — new error boundary for /contractors route segment
- `app/explore/error.tsx` — new error boundary for /explore route segment
- `app/explore/loading.tsx` — new loading skeleton for /explore route segment
