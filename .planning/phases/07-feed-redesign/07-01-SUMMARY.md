---
phase: 07-feed-redesign
plan: 01
subsystem: ui
tags: [nextjs, tailwind, supabase, server-component, layout]

# Dependency graph
requires:
  - phase: 06-rebrand
    provides: Tailwind brand tokens (slate palette, amber-500), NavBar, established component patterns
provides:
  - Two-column Explore page layout with sticky right sidebar
  - FeedSidebar server component with Recently Verified and Suggested People widgets
  - Server-side sidebar data queries (no client fetches, no hydration flash)
affects: [08-profiles, any future feed or layout work]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Props-driven server component for sidebar (FeedSidebar) — receives data from page, no internal fetching
    - Auth cookie parsing in server component for viewer detection without client hydration
    - Sticky aside with self-start — sidebar stays in viewport while main feed scrolls

key-files:
  created:
    - components/FeedSidebar.tsx
  modified:
    - app/explore/page.tsx

key-decisions:
  - "Sidebar links go to /contractors/[id] not /u/[username] per locked project decision"
  - "No count shown in widget headers — just the title string"
  - "Suggested People falls back to Recently Verified list when viewer has no trade or is not logged in"
  - "Sidebar hidden entirely below lg breakpoint (hidden lg:block) — feed takes full width on mobile"

patterns-established:
  - "Props-driven sidebar: page fetches data server-side, passes to sidebar component as props — keeps FeedSidebar free of async/await and reusable"
  - "Auth cookie parsing pattern: cookies().getAll().find(c => c.name.includes('-auth-token')) for server-side user detection"

requirements-completed: [FEED-01, FEED-02]

# Metrics
duration: 2min
completed: 2026-03-08
---

# Phase 7 Plan 01: Feed Redesign Summary

**Two-column Explore page with sticky FeedSidebar showing Recently Verified and Suggested People, all data fetched server-side in a single render pass**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-08T23:31:41Z
- **Completed:** 2026-03-08T23:33:08Z
- **Tasks:** 2 of 3 (Task 3 is checkpoint:human-verify)
- **Files modified:** 2

## Accomplishments
- Created FeedSidebar server component with SidebarEntry (28px avatar row) and SidebarWidget (card with title, entries, View all link)
- Restructured Explore page from max-w-2xl single-column to max-w-5xl two-column flex layout
- Added server-side sidebar queries: Recently Verified (5 most recent approved) and Suggested People (same-trade contractors with fallback)
- Auth cookie parsed server-side for viewer detection — no client fetch, no hydration flash

## Task Commits

Each task was committed atomically:

1. **Task 1: Create FeedSidebar server component** - `b095cdd` (feat)
2. **Task 2: Restructure Explore page to two-column layout** - `414b865` (feat)

## Files Created/Modified
- `components/FeedSidebar.tsx` - Server component with SidebarEntry, SidebarWidget, and FeedSidebar default export; accepts recentlyVerified[] and suggestedPeople[] props
- `app/explore/page.tsx` - Expanded to max-w-5xl two-column layout; added sidebar data queries; FeedSidebar rendered in sticky aside

## Decisions Made
- Sidebar links point to `/contractors/[id]` (not `/u/[username]`) per locked project decision
- Widget headers show title only — no count
- Suggested People falls back to Recently Verified when viewer has no trade or is not a logged-in approved contractor
- Sidebar hidden entirely below lg breakpoint; feed goes full-width on mobile

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Two auto tasks complete and committed; build and lint pass cleanly
- Task 3 (checkpoint:human-verify) requires visual confirmation of layout, sticky sidebar, responsive behavior, and Suggested People logic on a running dev server at http://localhost:3000/explore

---
*Phase: 07-feed-redesign*
*Completed: 2026-03-08*
