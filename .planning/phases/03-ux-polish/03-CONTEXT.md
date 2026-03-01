# Phase 3: UX Polish - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the contractor directory feel complete and usable on mobile. Three discrete improvements: loading skeletons on the contractor grid, an actionable empty state when filters return no results, and a hamburger menu for mobile navigation. No new pages or user-facing features.

</domain>

<decisions>
## Implementation Decisions

### Mobile navigation
- Pattern: hamburger icon in top-right of navbar, opens a dropdown panel (not a slide-in drawer)
- Hamburger shows at mobile breakpoint only; desktop nav links remain as-is
- Mobile dropdown contains same links as desktop: Directory, Explore, Apply, and auth state (Sign In or username/dropdown)
- Hamburger icon must be ≥44px tap target (per UX-03 success criteria)
- Existing `NavBar.tsx` is modified — no new component created

### Empty state
- Shows: SVG icon + brief message + "Reset filters" button
- Message: something like "No contractors match your filters"
- "Reset filters" clears ALL active filters at once — navigates to `/contractors` with no search params
- No per-filter dismiss chips (scope creep — keep it simple)
- Empty state lives inside `app/contractors/page.tsx` where the grid is rendered (already has a basic empty state that needs upgrading)

### Loading skeletons
- Fidelity: exact card shape matching `ContractorCard` layout — photo area, name line, trade badge, location, bio excerpt — with shimmer/pulse animation
- Count: 9 skeleton cards (3 rows of 3), matching the xl:grid-cols-3 grid layout
- Scope: contractor card grid only — the page header, filters sidebar, and job posts feed do NOT show skeletons
- Implementation approach: `app/contractors/loading.tsx` (Next.js streaming Suspense) — simplest approach for a server component; Claude decides exact implementation

### Claude's Discretion
- Whether to use Tailwind's `animate-pulse` for shimmer or a custom CSS animation
- How to wire up Suspense for the server component (loading.tsx vs Suspense boundary)
- Exact copy for empty state message
- Hamburger icon (SVG inline or Heroicons)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/NavBar.tsx`: client component with `useState` and `useRef` already in use — can add `menuOpen` state for hamburger without restructuring
- `components/ContractorCard.tsx`: existing card layout to match for skeleton fidelity
- `app/contractors/page.tsx`: already has a basic empty state at line ~57 — upgrade this rather than adding elsewhere

### Established Patterns
- `app/contractors/page.tsx` uses `export const dynamic = 'force-dynamic'` — server component with no loading UI today
- Tailwind CSS with `animate-pulse` is available for skeleton shimmer (no additional deps needed)
- `useRouter` and client-side navigation available in NavBar (already imported)

### Integration Points
- `app/contractors/loading.tsx` (new file) — Next.js automatically shows this during server component data fetch; no changes needed to page.tsx for the skeleton
- `SearchFilters.tsx` renders alongside the grid — the empty state and skeleton only affect the grid area, not the filter sidebar

</code_context>

<specifics>
## Specific Ideas

- Hamburger dropdown should feel consistent with the existing dropdown pattern already used for the user account menu in NavBar
- Skeleton cards should use the same border and rounded corner styling as real `ContractorCard` components so the transition feels seamless

</specifics>

<deferred>
## Deferred Ideas

- Per-filter dismiss chips (e.g., "Welding x") — too complex for this phase; bulk reset is sufficient
- Bottom tab bar navigation — user preferred hamburger; bottom bar could be a future refinement

</deferred>

---

*Phase: 03-ux-polish*
*Context gathered: 2026-03-01*
