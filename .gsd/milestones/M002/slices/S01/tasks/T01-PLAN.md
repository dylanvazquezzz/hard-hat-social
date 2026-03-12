---
estimated_steps: 4
estimated_files: 5
---

# T01: Create lib/constants.ts and replace all inline TRADES definitions

**Slice:** S01 — Foundation Cleanup
**Milestone:** M002

## Description

Four files each define their own `const TRADES = [...]`. `CreateJobForm.tsx` diverges by including `'Other'`. This task creates a single source of truth at `lib/constants.ts` exporting both `TRADES` (canonical 6-item list) and `TRADES_WITH_OTHER` (extends TRADES with `'Other'`), then updates all four consumer files to import from it.

No logic changes in any consumer — purely a consolidation. The end state is zero inline TRADES definitions in `app/` or `components/`.

## Steps

1. Create `lib/constants.ts`:
   ```ts
   export const TRADES = [
     'Welding',
     'HVAC',
     'Electrical',
     'Plumbing',
     'General Contractor',
     'Drywall',
   ] as const

   export const TRADES_WITH_OTHER = [...TRADES, 'Other'] as const
   ```

2. In `app/apply/page.tsx`: delete line `const TRADES = ['Welding', ...]` and add `import { TRADES } from '@/lib/constants'` at the top (near other imports).

3. In `app/page.tsx`: delete `const TRADES = ['Welding', ...]` and add `import { TRADES } from '@/lib/constants'`.

4. In `components/SearchFilters.tsx`: delete `const TRADES = ['Welding', ...]` and add `import { TRADES } from '@/lib/constants'`.

5. In `components/CreateJobForm.tsx`: delete `const TRADES = ['Welding', ..., 'Other']` and add `import { TRADES_WITH_OTHER as TRADES } from '@/lib/constants'` — aliasing preserves the existing `TRADES` references in the JSX without changing them.

## Must-Haves

- [ ] `lib/constants.ts` exists with `TRADES` (6 items, `as const`) and `TRADES_WITH_OTHER` (7 items, `as const`)
- [ ] Zero occurrences of `const TRADES =` in `app/` or `components/` directories
- [ ] All 4 consumer files import from `@/lib/constants`
- [ ] `CreateJobForm.tsx` still renders 7 options (including 'Other') — no regression
- [ ] `npm run build` passes with zero TypeScript errors

## Verification

- `rg "^const TRADES" --include="*.tsx" --include="*.ts" app/ components/` — must return zero results
- `grep -rn "from '@/lib/constants'" app/ components/` — must return ≥4 lines
- `npm run build` — zero errors

## Observability Impact

- Signals added/changed: None — this is a pure refactor with no runtime behavior change
- How a future agent inspects this: `rg "TRADES" lib/constants.ts` to see the single definition; `rg "lib/constants" app/ components/` to see all consumers
- Failure state exposed: If any consumer file still has an inline definition, the `rg` verification command catches it before the task is marked done

## Inputs

- `app/apply/page.tsx` — line 6: `const TRADES = ['Welding', 'HVAC', 'Electrical', 'Plumbing', 'General Contractor', 'Drywall']`
- `app/page.tsx` — line 4: same definition
- `components/SearchFilters.tsx` — line 6: same definition
- `components/CreateJobForm.tsx` — line 6: `const TRADES = [..., 'Drywall', 'Other']` (diverges with 'Other')

## Expected Output

- `lib/constants.ts` — new file, single source of truth for TRADES
- `app/apply/page.tsx` — inline TRADES removed, import added
- `app/page.tsx` — inline TRADES removed, import added
- `components/SearchFilters.tsx` — inline TRADES removed, import added
- `components/CreateJobForm.tsx` — inline TRADES removed, imports TRADES_WITH_OTHER as TRADES
