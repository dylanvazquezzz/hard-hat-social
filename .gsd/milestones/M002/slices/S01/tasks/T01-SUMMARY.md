---
id: T01
parent: S01
milestone: M002
provides:
  - lib/constants.ts with TRADES (6-item as const) and TRADES_WITH_OTHER (7-item as const)
  - Zero inline TRADES definitions in app/ or components/
key_files:
  - lib/constants.ts
  - app/apply/page.tsx
  - app/page.tsx
  - components/SearchFilters.tsx
  - components/CreateJobForm.tsx
key_decisions:
  - TRADES_WITH_OTHER aliased as TRADES in CreateJobForm.tsx to preserve all existing JSX references unchanged
patterns_established:
  - All trade lists import from @/lib/constants — never defined inline
observability_surfaces:
  - none (pure refactor, no runtime behavior change)
duration: <5 min
verification_result: passed
completed_at: 2026-03-12
blocker_discovered: false
---

# T01: Create lib/constants.ts and replace all inline TRADES definitions

**Created single source of truth for TRADES at `lib/constants.ts`; updated all 4 consumer files to import from it.**

## What Happened

Found inline `const TRADES = [...]` in exactly the 4 files identified in the plan. Created `lib/constants.ts` exporting both `TRADES` (6 items, `as const`) and `TRADES_WITH_OTHER` (7 items, adds `'Other'`, `as const`). Removed inline definitions and added imports in each consumer. `CreateJobForm.tsx` imports `TRADES_WITH_OTHER as TRADES` so all existing JSX references work without modification.

## Verification

- `rg "^const TRADES" app/ components/` — returns zero results ✅
- `grep -rn "from '@/lib/constants'" app/ components/` — returns exactly 4 lines ✅
- `npm run build` — compiled successfully, zero TypeScript errors, 14 static pages generated ✅

## Diagnostics

- `rg "TRADES" lib/constants.ts` — shows the single definition
- `rg "lib/constants" app/ components/` — shows all 4 consumers

## Deviations

none

## Known Issues

none

## Files Created/Modified

- `lib/constants.ts` — new file; single source of truth for TRADES and TRADES_WITH_OTHER
- `app/apply/page.tsx` — removed inline TRADES, added import from @/lib/constants
- `app/page.tsx` — removed inline TRADES, added import from @/lib/constants
- `components/SearchFilters.tsx` — removed inline TRADES, added import from @/lib/constants
- `components/CreateJobForm.tsx` — removed inline TRADES (7-item variant), added import of TRADES_WITH_OTHER as TRADES
