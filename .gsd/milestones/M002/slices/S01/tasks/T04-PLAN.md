---
estimated_steps: 4
estimated_files: 3
---

# T04: Add error boundaries and loading skeleton for /explore

**Slice:** S01 — Foundation Cleanup
**Milestone:** M002

## Description

`/contractors` has `loading.tsx` but no `error.tsx`. `/explore` has neither. If `getSupabaseAdmin()` throws (Supabase down, misconfigured env var, query timeout), both pages crash with Next.js's raw error screen. This task adds `error.tsx` boundaries for both routes and a `loading.tsx` for `/explore`.

All three files are purely presentational — no data fetching, no new business logic. They use Next.js App Router file conventions which Next.js wires automatically; no component registration needed.

## Steps

1. Create `app/contractors/error.tsx`:
   ```tsx
   'use client'

   export default function ContractorsError({
     error,
     reset,
   }: {
     error: Error & { digest?: string }
     reset: () => void
   }) {
     return (
       <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
         <p className="text-slate-400 text-sm mb-4">
           Unable to load the contractor directory. Please try again.
         </p>
         <button
           onClick={reset}
           className="rounded bg-amber-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-amber-400"
         >
           Try again
         </button>
       </div>
     )
   }
   ```

2. Create `app/explore/error.tsx` with identical structure, function name `ExploreError`, and message "Unable to load the feed. Please try again."

3. Create `app/explore/loading.tsx` (does NOT need `'use client'`):
   Mirror the skeleton card structure from `app/contractors/loading.tsx`. Use 6 post-shaped skeleton cards — each a `rounded-lg border border-slate-800 bg-slate-900 p-5 animate-pulse` block with:
   - A small circle avatar placeholder (h-8 w-8 rounded-full bg-slate-800)
   - A name line (h-3 w-24 rounded bg-slate-800)
   - A content block (h-4 w-full rounded bg-slate-800 mt-2, h-3 w-3/4 rounded bg-slate-800 mt-1)
   Wrap the 6 cards in a single-column `space-y-4` container matching the explore page layout.

4. Run `npm run build` — confirm zero errors. Run `ls app/contractors/error.tsx app/explore/error.tsx app/explore/loading.tsx` to confirm all three files exist.

## Must-Haves

- [ ] `app/contractors/error.tsx` exists, has `'use client'` directive, default-exports a component with `(error, reset)` props, and renders a "Try again" button that calls `reset()`
- [ ] `app/explore/error.tsx` exists, has `'use client'` directive, default-exports a component with `(error, reset)` props, and renders a "Try again" button that calls `reset()`
- [ ] `app/explore/loading.tsx` exists and exports a default function with a skeleton UI
- [ ] No `router.push` calls in error components — `reset()` is called directly (App Router contract)
- [ ] `npm run build` passes with zero TypeScript errors

## Verification

- `ls app/contractors/error.tsx app/explore/error.tsx app/explore/loading.tsx` — all three exist
- `grep "'use client'" app/contractors/error.tsx app/explore/error.tsx` — both lines present
- `grep "reset()" app/contractors/error.tsx app/explore/error.tsx` — reset is wired
- `npm run build` — zero errors

## Observability Impact

- Signals added/changed: Error boundaries surface thrown errors to users with a retry option instead of showing a raw crash screen — improves failure visibility for end users
- How a future agent inspects this: if `/contractors` or `/explore` shows the error boundary UI, it means the page component threw; check Vercel function logs or Supabase health for the root cause
- Failure state exposed: the error boundary catches and renders the error — `error.digest` is available for correlation with server logs (Next.js injects it automatically)

## Inputs

- `app/contractors/loading.tsx` — skeleton card pattern to replicate for explore loading state
- Next.js App Router `error.tsx` convention — must be `'use client'`, receives `{ error: Error, reset: () => void }` props

## Expected Output

- `app/contractors/error.tsx` — new error boundary for /contractors route segment
- `app/explore/error.tsx` — new error boundary for /explore route segment
- `app/explore/loading.tsx` — new loading skeleton for /explore route segment
