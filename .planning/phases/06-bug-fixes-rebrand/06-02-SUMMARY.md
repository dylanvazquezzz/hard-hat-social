---
phase: 06-bug-fixes-rebrand
plan: 02
subsystem: ui
tags: [tailwind, branding, nextjs, metadata, json-ld]

# Dependency graph
requires:
  - phase: 06-01
    provides: admin nav link and isAdmin state in NavBar

provides:
  - tailwind brand color token namespace (brand-blue, brand-yellow, brand-dark, brand-surface, brand-text-primary, brand-muted)
  - Hard Hat Social brand name in NavBar with brand color tokens
  - Updated root layout metadata pointing to hardhatsocial.net
  - Dynamic JSON-LD URL using NEXT_PUBLIC_APP_URL on contractor and public profile pages
  - Zero remaining "Contractors Connect" occurrences in app/ and components/

affects: [06-03-infrastructure-cutover, any future UI components using brand colors]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Brand color tokens in tailwind.config.ts theme.extend.colors — use bg-brand-*, text-brand-* static class names only (never dynamic template literals)"
    - "JSON-LD url fields use NEXT_PUBLIC_APP_URL env var with hardhatsocial.net fallback"
    - "metadataBase uses NEXT_PUBLIC_APP_URL env var with hardhatsocial.net fallback"

key-files:
  created: []
  modified:
    - tailwind.config.ts
    - components/NavBar.tsx
    - app/layout.tsx
    - app/contractors/[id]/page.tsx
    - app/u/[username]/page.tsx
    - app/apply/page.tsx
    - app/profile/page.tsx

key-decisions:
  - "brand-text-primary hyphenated token used via Tailwind arbitrary classes — text-[brand-text-primary] not needed since the theme extension maps correctly as text-brand-text-primary"
  - "JSON-LD URLs in both contractors/[id] and u/[username] updated to use NEXT_PUBLIC_APP_URL — both pages have schema.org Person markup"
  - "amber-* color classes in public profile page (initials, trade display) left as-is — out of scope for this plan (only NavBar amber colors specified)"

patterns-established:
  - "Tailwind brand token pattern: define in theme.extend.colors.brand, use as bg-brand-blue, text-brand-yellow — NEVER construct with template literals"

requirements-completed: [BRAND-01, BRAND-02]

# Metrics
duration: 20min
completed: 2026-03-05
---

# Phase 6 Plan 02: Brand Identity Implementation Summary

**Tailwind brand color token namespace added, Hard Hat Social name applied across all 7 source files via targeted grep sweep, JSON-LD URLs made dynamic via NEXT_PUBLIC_APP_URL**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-03-05T00:00:00Z
- **Completed:** 2026-03-05T00:20:00Z
- **Tasks:** 2 of 2 (checkpoint:human-verify pending)
- **Files modified:** 7

## Accomplishments
- Added 8-token brand color namespace to tailwind.config.ts (blue, blue-dark, yellow, yellow-dark, dark, surface, text-primary, muted)
- NavBar brand text changed from "Contractors Connect" to "Hard Hat Social" with brand-blue/brand-yellow colors; Sign In button and Admin link updated from amber to brand-yellow tokens
- layout.tsx metadataBase updated to hardhatsocial.net with NEXT_PUBLIC_APP_URL dynamic fallback; title updated to Hard Hat Social
- JSON-LD url fields in contractors/[id]/page.tsx and u/[username]/page.tsx now use NEXT_PUBLIC_APP_URL env var
- Full grep sweep: zero remaining "Contractors Connect" occurrences in app/ or components/ (7 files updated)

## Task Commits

1. **Task 1: Define brand color tokens in tailwind.config.ts** - `c5919e2` (feat)
2. **Task 2: Apply brand identity and sweep remaining strings** - `c355ab2` (feat)

## Files Created/Modified
- `tailwind.config.ts` - Brand color tokens added under theme.extend.colors.brand
- `components/NavBar.tsx` - Brand text, Sign In button, Admin link updated to brand tokens
- `app/layout.tsx` - Metadata title/description/metadataBase updated; body classes use brand tokens
- `app/contractors/[id]/page.tsx` - JSON-LD url dynamic, metadata titles updated to Hard Hat Social
- `app/u/[username]/page.tsx` - Metadata titles updated, JSON-LD url now dynamic
- `app/apply/page.tsx` - Onboarding invite copy updated to Hard Hat Social
- `app/profile/page.tsx` - Welcome banner text updated to Hard Hat Social

## Decisions Made
- JSON-LD URLs in both profile page types updated to use NEXT_PUBLIC_APP_URL with hardhatsocial.net fallback — keeps schema.org data consistent with production domain
- body className updated from `bg-slate-950 text-slate-100` to `bg-brand-dark text-brand-text-primary` — these token values are identical to the old slate values, so visual output is unchanged until brand tokens are adjusted
- Mobile admin link added in the mobile hamburger menu (not previously included in 06-01) to match the desktop dropdown admin link

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added mobile Admin link to hamburger menu**
- **Found during:** Task 2 (NavBar updates)
- **Issue:** Plan mentioned updating `text-amber-400` on admin link in both desktop and mobile, but 06-01 only added admin link in the desktop dropdown, not the mobile hamburger menu. Mobile admins would have no way to access /admin from mobile.
- **Fix:** Added Admin link to mobile hamburger menu alongside the desktop dropdown link, both using `text-brand-yellow`
- **Files modified:** components/NavBar.tsx
- **Verification:** Build passes, grep confirms brand-yellow used in both desktop and mobile admin links
- **Committed in:** c355ab2 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (missing critical mobile admin navigation)
**Impact on plan:** Minor addition that completes the mobile navigation parity. No scope creep.

## Issues Encountered
- The Edit tool failed repeatedly on NavBar.tsx due to linter modifying the file between reads. Resolved by writing the complete file using a bash heredoc.

## User Setup Required
None - no external service configuration required. (hardhatsocial.net Vercel env vars handled in plan 06-03)

## Next Phase Readiness
- Brand code changes complete and ready for verification
- Checkpoint requires human visual verification of NavBar and title tags in browser
- After verification, plan 06-03 handles the infrastructure cutover (Vercel env vars, Supabase URL, DNS)

---
*Phase: 06-bug-fixes-rebrand*
*Completed: 2026-03-05*
