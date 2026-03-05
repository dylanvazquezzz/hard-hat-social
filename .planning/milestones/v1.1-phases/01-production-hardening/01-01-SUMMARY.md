---
phase: 01-production-hardening
plan: 01
subsystem: infra
tags: [server-only, next.js, supabase, resend, security, build-guard]

# Dependency graph
requires: []
provides:
  - "Build-time guard preventing accidental client import of service role Supabase client"
  - "Build-time guard preventing accidental client import of Resend API key"
  - "server-only package installed in project"
affects:
  - "02-production-hardening"
  - "Any future plan adding new server-only lib files"

# Tech tracking
tech-stack:
  added: ["server-only@0.0.1"]
  patterns:
    - "All server-only lib files begin with `import 'server-only'` as the first line"
    - "Next.js App Router build graph enforces server-only boundary at compile time"

key-files:
  created: []
  modified:
    - "lib/supabase-admin.ts"
    - "lib/email.ts"
    - "package.json"

key-decisions:
  - "Use `server-only` package (not just comments) to enforce server boundary — build fails hard instead of silently leaking secrets"
  - "Place `import 'server-only'` before all other imports in each guarded file — required for side-effect import to register in module graph"

patterns-established:
  - "Server-only pattern: Add `import 'server-only'` as first line of any lib file holding secrets or service-role clients"

requirements-completed: [PROD-04]

# Metrics
duration: 1min
completed: 2026-03-02
---

# Phase 1 Plan 01: Server-Only Import Guards Summary

**`server-only` package installed and build-time import guards added to `lib/supabase-admin.ts` and `lib/email.ts` — service role key and Resend API key cannot leak into client bundles via accidental import**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-03-02T00:31:46Z
- **Completed:** 2026-03-02T00:32:46Z
- **Tasks:** 1
- **Files modified:** 4

## Accomplishments

- Installed `server-only` npm package (v0.0.1)
- Added `import 'server-only'` as the first line of `lib/supabase-admin.ts`
- Added `import 'server-only'` as the first line of `lib/email.ts`
- Verified `npm run build` exits 0 — no existing client component accidentally imports either file

## Task Commits

Each task was committed atomically:

1. **Task 1: Install server-only package and add import guards** - `078c943` (chore)

**Plan metadata:** _(docs commit follows)_

## Files Created/Modified

- `lib/supabase-admin.ts` - Added `import 'server-only'` as first line; service role Supabase client now build-time guarded
- `lib/email.ts` - Added `import 'server-only'` as first line; Resend API key now build-time guarded
- `package.json` - Added `"server-only": "^0.0.1"` to dependencies
- `package-lock.json` - Lock file updated for new package

## Decisions Made

- Used `server-only` package rather than relying on the existing comment ("SERVER ONLY — never import this in client components") — comments are advisory and can be ignored; the package causes an immediate build error if violated
- Import placed as the absolute first line (before comments and other imports) per Next.js official guidance on side-effect imports

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None — build passed on first attempt. No client component was accidentally importing either guarded file.

## User Setup Required

None — no external service configuration required for this plan.

## Next Phase Readiness

- Server-only guards are in place; `lib/supabase-admin.ts` and `lib/email.ts` are fully secured
- Any future lib file holding secrets should follow this same pattern: `import 'server-only'` as first line
- Phase 1 plans can proceed in any order — this plan has no dependencies on others

---
*Phase: 01-production-hardening*
*Completed: 2026-03-02*

## Self-Check: PASSED

- FOUND: lib/supabase-admin.ts
- FOUND: lib/email.ts
- FOUND: 01-01-SUMMARY.md
- FOUND: commit 078c943
- First line of lib/supabase-admin.ts: `import 'server-only'`
- First line of lib/email.ts: `import 'server-only'`
