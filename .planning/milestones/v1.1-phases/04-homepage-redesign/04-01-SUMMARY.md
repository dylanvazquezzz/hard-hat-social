---
phase: 04-homepage-redesign
plan: 01
subsystem: ui
tags: [next.js, supabase, tailwind, server-component, isr]

# Dependency graph
requires:
  - phase: 01-production-hardening
    provides: getSupabaseAdmin — server-only admin client used for live DB count queries
provides:
  - Async server component homepage with live contractor stats and contractor-first CTA hierarchy
affects: [homepage, app/page.tsx, landing-page conversion]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ISR revalidate=3600 on homepage to cache live DB stats with hourly freshness"
    - "Promise.all for parallel Supabase count queries at page render time"
    - "null-safe fallbacks (count ?? 0) on all Supabase count responses"

key-files:
  created: []
  modified:
    - app/page.tsx

key-decisions:
  - "Tasks 1 and 2 combined in single file write — both hero overhaul and How it Works copy updated atomically in one commit"
  - "py-16 sm:py-24 on hero section reduces mobile padding so stats row stays above fold on 375px iPhone SE"
  - "distinctTrades computed client-side via Set from trade column data — avoids needing a DB-specific distinct query"
  - "Hero h1 changed from 'serious tradespeople' to 'all tradespeople' after user approved mobile layout — more inclusive and cleaner at small viewports"

patterns-established:
  - "Homepage async pattern: getSupabaseAdmin + Promise.all + revalidate = 3600 for live-but-cached stats"

requirements-completed: [HOME-01, HOME-02, HOME-03]

# Metrics
duration: ~15min
completed: 2026-03-05
---

# Phase 4 Plan 01: Homepage Redesign Summary

**Contractor-first homepage with live DB stats (approvedCount, distinctTrades, applicationsCount), amber Apply CTA promoted to primary, and tradesperson-focused How it Works copy — all in one async server component with ISR**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-05T00:00:59Z
- **Completed:** 2026-03-05T00:15:00Z
- **Tasks:** 3 of 3 (complete)
- **Files modified:** 1

## Accomplishments

- Converted `app/page.tsx` from a static sync function to an async server component with `revalidate = 3600` ISR
- Added 3 parallel Supabase admin queries (approvedCount, distinctTrades via Set, applicationsCount) displayed as live social proof below CTAs
- Swapped CTA hierarchy: "Apply as a Contractor" now gets amber fill (primary), "Browse Directory" gets ghost border (secondary)
- Reduced hero mobile padding from `py-24` to `py-16 sm:py-24` so the stats row stays above fold at 375px
- Updated all three How it Works steps to contractor-first framing: "Submit your credentials", "Get verified", "Find subs and connect"
- Updated h1 copy from "serious tradespeople" to "all tradespeople" per user feedback after mobile review

## Task Commits

Each task was committed atomically:

1. **Task 1 + Task 2: Hero overhaul + How it Works copy** - `cb5067f` (feat)
2. **Task 3: Update h1 copy — 'serious' to 'all' tradespeople** - `5940411` (fix)

**Plan metadata:** (docs commit — pending)

## Files Created/Modified

- `app/page.tsx` - Async server component with live stats, contractor-first CTA order, updated How it Works copy, h1 "all tradespeople"

## Decisions Made

- Tasks 1 and 2 were implemented in a single file write since both modify `app/page.tsx` — committed together as one atomic commit
- `distinctTrades` computed via JavaScript `Set` from a `select('trade')` query rather than a SQL DISTINCT count — simpler, no raw SQL needed
- `py-16 sm:py-24` mobile padding reduction ensures the stats row (proof of active network) is visible above the fold on iPhone SE 375x667
- h1 changed from "serious tradespeople" to "all tradespeople" after user reviewed mobile layout — user noted it "looks clean" and requested the copy tweak

## Deviations from Plan

### User-requested copy tweak at checkpoint

**Task 3 human-verify: user approved with a copy change request**
- **Found during:** Task 3 (checkpoint:human-verify)
- **Issue:** User requested "serious" changed to "all" in the h1 span — more inclusive and reads cleaner on mobile
- **Fix:** Updated span text in hero h1 from `serious tradespeople` to `all tradespeople`
- **Files modified:** app/page.tsx
- **Verification:** `npm run build` passes with zero TypeScript errors
- **Committed in:** 5940411

---

**Total deviations:** 1 user-requested copy tweak (not an auto-fix rule — user approval with explicit change instruction)
**Impact on plan:** Minor copy improvement. No structural changes. No scope creep.

## Issues Encountered

None — plan executed cleanly. DB queries include null-safe fallbacks for empty dev databases.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Homepage is now contractor-first with live social proof from real DB counts
- ISR ensures stats update every hour without per-request overhead
- Ready for seeding phase — once founding cohort profiles exist, stats will auto-populate
- No blockers

---
*Phase: 04-homepage-redesign*
*Completed: 2026-03-05*
