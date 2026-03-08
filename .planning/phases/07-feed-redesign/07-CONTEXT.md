# Phase 7: Feed Redesign - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Restructure the Explore page from a narrow single-column feed to a two-column layout — wider post feed (flex-1) on the left, a sticky right sidebar (`FeedSidebar` server component) showing "Recently Verified" and "Suggested People" widgets. No new database schema required. Covers FEED-01 and FEED-02 only.

</domain>

<decisions>
## Implementation Decisions

### Sidebar entry format
- Each entry: circular avatar (initial fallback if no avatar_url) + full name + trade label
- Compact row layout — no location shown
- Links to `/contractors/[id]` (not `/u/[username]`)
- 5 entries per widget (not 8)
- Each widget has a "View all" link at the bottom pointing to `/contractors`
- No count shown in widget headers (e.g., just "Recently Verified", not "Recently Verified (5)")

### Suggested People fallback logic
- Viewer not logged in → show Recently Verified list in place of Suggested People widget
- Viewer logged in but no trade on their contractor profile → fall back to Recently Verified
- Sparse trade (fewer than 5 same-trade approved contractors) → show same-trade matches first, then pad with most-recently-verified from any trade up to 5 total
- Exclude the currently logged-in user's own contractor row from Suggested People results

### Layout and responsive behavior
- Desktop (`lg` and up): two-column flex layout — feed takes `flex-1`, sidebar is fixed 240px wide
- Mobile (below `lg`): sidebar hidden entirely (`hidden lg:block`), feed takes full width
- Sidebar is sticky on desktop (`sticky top-[X]` so it stays visible while the feed scrolls)
- Outer container widens from current `max-w-2xl` to accommodate the two-column layout

### Claude's Discretion
- Exact outer container width (`max-w-4xl`, `max-w-5xl`, etc.) — pick what looks right with 240px sidebar
- Sticky top offset value (accounting for NavBar height)
- Visual styling of sidebar widget headers and "View all" links — match existing design language (slate/amber palette)
- Whether to wrap sidebar queries in a try/catch or let errors bubble to Next.js error boundary

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `PostCard` (`components/PostCard.tsx`): renders posts at any width — no changes needed, just remove the narrow container constraint
- `ContractorCard` (`components/ContractorCard.tsx`): too large for a 240px sidebar — **do not reuse**; create a new compact `SidebarContractorEntry` or inline JSX within `FeedSidebar`
- `getSupabaseAdmin()` (`lib/supabase-admin.ts`): already used in `app/explore/page.tsx` — use the same pattern for sidebar contractor queries

### Established Patterns
- Explore page is a server component (`async function`) with `export const dynamic = 'force-dynamic'` — sidebar data should be fetched in the same server render, no client-side fetch
- Data fetching: `admin.from('contractors').select(...).eq('status', 'approved').order(...).limit(5)`
- Profiles are fetched separately and merged via `profileMap` — sidebar only needs contractor data (no profile join needed unless showing avatar from `profile_photo_url` on contractors table)
- Tailwind brand tokens: `bg-brand-blue`, `text-brand-yellow`, `bg-brand-surface`, `text-brand-muted` — use these for consistency with Phase 6 rebrand

### Integration Points
- `app/explore/page.tsx`: replace `<div className="mx-auto max-w-2xl ...">` with a two-column flex wrapper; render `<FeedSidebar />` alongside the feed column
- New component: `components/FeedSidebar.tsx` — server component, accepts `recentlyVerified` and `suggestedPeople` arrays as props (data fetched in the page)
- Viewer trade detection: needs the logged-in user's contractor row — requires reading current session in a server component via `getSupabaseAdmin()` + `supabase.auth.getUser()` or passing via cookies

</code_context>

<specifics>
## Specific Ideas

- Two-column layout: `flex gap-6` with `<main className="flex-1 min-w-0">` for the feed and `<aside className="hidden lg:block w-60 shrink-0 sticky top-20">` for the sidebar
- Each sidebar widget: a titled card (e.g., `<div className="rounded-lg border border-slate-800 bg-slate-900 p-4">`) with the list of entries and a "View all →" link

</specifics>

<deferred>
## Deferred Ideas

- FEED-03 (posts visible on public profile `/u/[username]`) — explicitly deferred to v1.3 per REQUIREMENTS.md
- Horizontal scrolling sidebar strip on mobile — not needed; sidebar hides entirely on mobile
- Post interactions (likes, replies) — separate phase

</deferred>

---

*Phase: 07-feed-redesign*
*Context gathered: 2026-03-08*
