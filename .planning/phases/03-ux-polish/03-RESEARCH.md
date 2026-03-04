# Phase 3: UX Polish - Research

**Researched:** 2026-03-04
**Domain:** Next.js App Router loading UI, Tailwind CSS skeleton animation, React mobile navigation patterns
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Mobile navigation:**
- Pattern: hamburger icon in top-right of navbar, opens a dropdown panel (not a slide-in drawer)
- Hamburger shows at mobile breakpoint only; desktop nav links remain as-is
- Mobile dropdown contains same links as desktop: Directory, Explore, Apply, and auth state (Sign In or username/dropdown)
- Hamburger icon must be ≥44px tap target (per UX-03 success criteria)
- Existing `NavBar.tsx` is modified — no new component created

**Empty state:**
- Shows: SVG icon + brief message + "Reset filters" button
- Message: something like "No contractors match your filters"
- "Reset filters" clears ALL active filters at once — navigates to `/contractors` with no search params
- No per-filter dismiss chips (scope creep — keep it simple)
- Empty state lives inside `app/contractors/page.tsx` where the grid is rendered (already has a basic empty state that needs upgrading)

**Loading skeletons:**
- Fidelity: exact card shape matching `ContractorCard` layout — photo area, name line, trade badge, location, bio excerpt — with shimmer/pulse animation
- Count: 9 skeleton cards (3 rows of 3), matching the xl:grid-cols-3 grid layout
- Scope: contractor card grid only — the page header, filters sidebar, and job posts feed do NOT show skeletons
- Implementation approach: `app/contractors/loading.tsx` (Next.js streaming Suspense) — simplest approach for a server component; Claude decides exact implementation

### Claude's Discretion
- Whether to use Tailwind's `animate-pulse` for shimmer or a custom CSS animation
- How to wire up Suspense for the server component (loading.tsx vs Suspense boundary)
- Exact copy for empty state message
- Hamburger icon (SVG inline or Heroicons)

### Deferred Ideas (OUT OF SCOPE)
- Per-filter dismiss chips (e.g., "Welding x") — too complex for this phase; bulk reset is sufficient
- Bottom tab bar navigation — user preferred hamburger; bottom bar could be a future refinement
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| UX-01 | `/contractors` directory shows card-shaped loading skeletons while data is fetching (instead of blank or spinner) | Next.js `loading.tsx` convention + Tailwind `animate-pulse` covers this with no new deps |
| UX-02 | `/contractors` shows a clear empty state with a "reset filters" action when no contractors match the active search/filters | Plain React + `useRouter`/`router.push('/contractors')` pattern covers this; upgrade existing empty state block in `page.tsx` |
| UX-03 | Mobile navigation is usable at 375px viewport — larger tap targets, collapsed menu accessible without tiny icons | Tailwind responsive prefix `md:hidden` / `md:flex` pattern + existing NavBar `useState` covers this with no new deps |
</phase_requirements>

---

## Summary

This phase is entirely contained within the existing stack (Next.js 14 App Router + Tailwind CSS 3 + React 18) and requires zero new npm packages. All three requirements map to well-established patterns that are natively supported.

**UX-01 (Skeletons):** Next.js App Router automatically shows `app/contractors/loading.tsx` while the adjacent `page.tsx` awaits its async data. Because `page.tsx` uses `export const dynamic = 'force-dynamic'` and is a server component, Next.js will stream the loading UI instantly and replace it when the DB fetch resolves. Tailwind's built-in `animate-pulse` produces the grey shimmer without any additional animation library.

**UX-02 (Empty state):** The existing empty state block in `page.tsx` (lines 76–80) is a minimal placeholder. Upgrading it to include an SVG icon and a "Reset filters" button that calls `router.push('/contractors')` is a pure UI change within the server component. The button requires a small client component wrapper because `router.push` is client-side, but the rest of the empty state can remain in the server component.

**UX-03 (Mobile nav):** NavBar.tsx is already a client component with `useState` and `useRef`. Adding a `menuOpen` boolean state and a `md:hidden` hamburger button is an additive change. The existing account dropdown pattern (absolute-positioned div, click-outside `useRef`) is the exact same pattern needed for the mobile menu dropdown.

**Primary recommendation:** Use `app/contractors/loading.tsx` for skeletons, upgrade the inline empty state in `page.tsx` with a tiny client component for the reset button, and add hamburger state to the existing `NavBar.tsx`. No new files except `loading.tsx` and one small inline client component for the reset button.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | ^14.2.18 (installed) | `loading.tsx` file convention for streaming UI | Built-in; zero config required |
| Tailwind CSS | ^3.4.14 (installed) | `animate-pulse`, responsive prefixes (`md:hidden`, `sm:grid-cols-2`) | All existing components use it |
| React | ^18.3.1 (installed) | `useState` for hamburger open/close toggle | Already used in NavBar.tsx |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Heroicons (inline SVG) | n/a — copy SVG paths | Empty state icon, hamburger icon | Inline SVG avoids a new dependency; consistent with existing SVG usage in NavBar.tsx chevron |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `animate-pulse` | Custom CSS keyframe shimmer | Custom gives a left-to-right gradient shimmer vs. opacity pulse; `animate-pulse` is simpler and already available in Tailwind |
| `loading.tsx` | Suspense boundary inside page.tsx | Both work; `loading.tsx` is the convention-over-configuration path that requires no changes to `page.tsx` — preferred per CONTEXT.md |
| Inline SVG hamburger | Heroicons npm package | Inline SVG avoids adding a dependency (CLAUDE.md: "Ask before adding any new npm package") |

**Installation:** No new packages needed.

---

## Architecture Patterns

### Recommended Project Structure
```
app/contractors/
├── loading.tsx          # NEW — skeleton grid shown during page.tsx data fetch
├── layout.tsx           # existing auth guard (no changes)
└── page.tsx             # existing server component — upgrade empty state block only

components/
└── NavBar.tsx           # existing — add menuOpen state + hamburger button + mobile dropdown
```

### Pattern 1: Next.js loading.tsx (Route Segment Loading UI)

**What:** A `loading.tsx` file placed alongside a `page.tsx` automatically wraps the page in a React Suspense boundary. Next.js streams the `loading.tsx` content immediately while the server component fetches data.

**When to use:** Server components that perform async data fetching. `app/contractors/page.tsx` is `async` with `force-dynamic`, making it a textbook case.

**Key behavior confirmed from Next.js 14 docs:**
- `loading.tsx` is shown for the full route segment (the entire page area below the layout)
- It does NOT affect the layout — `NavBar.tsx` in `app/layout.tsx` renders immediately
- Since `app/contractors/layout.tsx` is a client component (auth guard), it renders first, then the loading UI is shown inside it while `page.tsx` fetches
- When the page data resolves, React replaces the loading UI with the actual content (no flash, smooth transition)

**Example:**
```typescript
// app/contractors/loading.tsx
// Source: Next.js 14 official docs — loading.js convention

export default function ContractorsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page header skeleton */}
      <div className="mb-8">
        <div className="h-9 w-56 rounded-md bg-slate-800 animate-pulse" />
        <div className="mt-2 h-4 w-48 rounded bg-slate-800 animate-pulse" />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar placeholder — static, no skeleton needed per CONTEXT.md */}
        <div className="w-full shrink-0 lg:w-56" />

        {/* 9-card skeleton grid */}
        <div className="flex-1">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-5 animate-pulse">
      <div className="flex items-start gap-4">
        {/* Avatar circle */}
        <div className="h-12 w-12 shrink-0 rounded-full bg-slate-800" />
        <div className="flex-1 space-y-2">
          {/* Name + verified badge row */}
          <div className="flex items-center justify-between gap-2">
            <div className="h-4 w-32 rounded bg-slate-800" />
            <div className="h-4 w-14 rounded-full bg-slate-800" />
          </div>
          {/* Trade */}
          <div className="h-3 w-20 rounded bg-slate-800" />
          {/* Location · yrs */}
          <div className="h-3 w-36 rounded bg-slate-800" />
          {/* Specialty tags */}
          <div className="mt-2 flex gap-1">
            <div className="h-4 w-16 rounded bg-slate-800" />
            <div className="h-4 w-12 rounded bg-slate-800" />
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Pattern 2: Upgraded Empty State with Client Reset Button

**What:** The existing empty state block in `page.tsx` (lines 76–80) is upgraded in-place. The "Reset filters" button needs `router.push()` which requires a client component. The minimal approach is a small `'use client'` component for just the button.

**When to use:** Server component pages with a conditional empty state that need a navigation action.

**Key constraint:** `app/contractors/page.tsx` is a server component (no `'use client'` directive). `router.push` from `next/navigation` requires a client component. Options:
1. Inline `'use client'` wrapper component defined at top of same file — not allowed (entire file becomes client)
2. Extract just the reset button as a tiny client component in the same file or a separate file
3. Use a plain `<a href="/contractors">` anchor tag instead of `router.push` — functionally identical, zero complexity

**Recommendation (Claude's discretion):** Use `<a href="/contractors">` styled as a button. This avoids adding a client component entirely, requires no file changes beyond `page.tsx`, and produces identical behavior. `router.push('/contractors')` and `<a href="/contractors">` are functionally the same for a full navigation.

**Example:**
```typescript
// Inside app/contractors/page.tsx — upgrade the existing empty state block
// Source: direct code analysis of existing file

{contractors.length === 0 ? (
  <div className="flex flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-900 py-24 text-center">
    {/* Search/filter icon */}
    <svg
      className="mb-4 h-12 w-12 text-slate-700"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
    <p className="text-slate-300 font-medium">No contractors match your filters</p>
    <p className="mt-1 text-sm text-slate-500">Try broadening your search or clearing all filters.</p>
    <a
      href="/contractors"
      className="mt-6 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors"
    >
      Reset filters
    </a>
  </div>
) : (
  // ... existing grid
)}
```

### Pattern 3: Hamburger Mobile Nav in Existing NavBar

**What:** Add a `menuOpen` boolean state and a hamburger `<button>` that toggles it. Show/hide is controlled by Tailwind responsive prefixes. The mobile dropdown reuses the exact same absolute-positioned div pattern as the existing account dropdown.

**When to use:** Single-file navbar component already using useState — additive change, no restructuring.

**Key implementation details:**
- Hamburger button: `md:hidden` — only visible below `md` breakpoint (768px). At 375px this is shown.
- Desktop nav links: currently inside `<div className="flex items-center gap-6">` — add `hidden md:flex` to hide on mobile
- Minimum tap target: button must have `min-h-[44px] min-w-[44px]` or `p-3` padding to meet 44px WCAG standard
- Click-outside behavior: reuse the existing `dropdownRef` pattern OR add a second ref for the menu; simpler to close both menus when clicking outside

**Important:** The existing `dropdownRef` only covers the account dropdown. The hamburger menu needs its own ref OR the hamburger menu should close when the account dropdown ref's click-outside fires (since they can't both be open at once on mobile). Simplest: close hamburger on any outside click by attaching to `document` listener alongside the existing one, or widen the ref to cover the whole nav.

**Example:**
```typescript
// components/NavBar.tsx — additions only
// Source: direct code analysis of existing NavBar.tsx

// Add to existing state declarations:
const [menuOpen, setMenuOpen] = useState(false)
const menuRef = useRef<HTMLDivElement>(null)

// Add to existing click-outside useEffect:
function handleClickOutside(e: MouseEvent) {
  if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
    setDropdownOpen(false)
  }
  if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
    setMenuOpen(false)
  }
}

// In JSX — hamburger button (inside the nav, replacing gap-6 div structure):
<div className="flex items-center">
  {/* Desktop nav links — hidden on mobile */}
  <div className="hidden md:flex items-center gap-6">
    {/* ...existing nav links and auth section... */}
  </div>

  {/* Hamburger button — visible on mobile only */}
  <div className="relative md:hidden" ref={menuRef}>
    <button
      onClick={() => setMenuOpen((o) => !o)}
      className="flex items-center justify-center rounded-md p-3 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
      aria-label="Open navigation menu"
      aria-expanded={menuOpen}
    >
      {/* Hamburger / X icon */}
      {menuOpen ? (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )}
    </button>

    {/* Mobile dropdown panel */}
    {menuOpen && (
      <div className="absolute right-0 mt-2 w-56 rounded-md border border-slate-700 bg-slate-800 shadow-lg">
        <a href="/contractors" onClick={() => setMenuOpen(false)}
          className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors rounded-t-md">
          Directory
        </a>
        <a href="/explore" onClick={() => setMenuOpen(false)}
          className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors">
          Explore
        </a>
        <a href="/jobs" onClick={() => setMenuOpen(false)}
          className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors">
          Jobs
        </a>
        {!session && (
          <a href="/apply" onClick={() => setMenuOpen(false)}
            className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors">
            Apply
          </a>
        )}
        {session ? (
          <>
            <a href="/profile" onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors">
              {username ? `@${username}` : 'Profile'}
            </a>
            <button onClick={() => { setMenuOpen(false); handleSignOut() }}
              className="block w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors rounded-b-md">
              Sign Out
            </button>
          </>
        ) : (
          <a href="/auth" onClick={() => setMenuOpen(false)}
            className="block px-4 py-3 text-sm text-amber-400 font-semibold hover:bg-slate-700 transition-colors rounded-b-md">
            Sign In
          </a>
        )}
      </div>
    )}
  </div>
</div>
```

### Anti-Patterns to Avoid

- **Skeleton in layout.tsx:** The layout.tsx for `/contractors` is a client component auth guard. Do NOT put skeleton UI there — `loading.tsx` handles the route segment below the layout automatically.
- **`'use client'` on page.tsx for the reset button:** Converting the whole server component to a client component to get `router.push` would break the existing data-fetching pattern. Use `<a href="/contractors">` instead.
- **Custom CSS animations when `animate-pulse` works:** Adding a `globals.css` shimmer keyframe is unnecessary complexity when Tailwind's built-in `animate-pulse` produces an acceptable effect.
- **Conditional `loading.tsx` based on search params:** `loading.tsx` runs on every navigation to the route segment (including filter changes), which is the correct behavior — filter changes trigger a new server fetch, so the skeleton should show each time.
- **44px tap target via height alone:** On the hamburger button, padding (`p-3` = 12px × 2 + 20px icon = 44px total) is more reliable than a fixed `h-11` that depends on line-height. Use `p-3` on the button element.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Loading UI during server fetch | Custom loading state with `useState` + `useEffect` in a client component | `app/contractors/loading.tsx` (Next.js built-in convention) | Next.js handles Suspense boundary automatically; client-side approach requires converting the server component to client, losing streaming benefits |
| Skeleton shimmer animation | Custom CSS `@keyframes` gradient animation | `animate-pulse` from Tailwind CSS | Already installed; acceptable visual quality; zero maintenance |
| Mobile breakpoint detection | `window.innerWidth` check in JS | `md:hidden` / `hidden md:flex` Tailwind responsive classes | CSS-based, no hydration mismatch, no JS overhead |
| Click-outside for hamburger | Third-party library (`@headlessui`, `react-outside-click`) | Duplicate the existing `useRef` + `document.addEventListener` pattern already in NavBar.tsx | Pattern is already proven in the codebase; no new dependency justified for 8 lines of code |

**Key insight:** This phase is entirely CSS and native Next.js conventions. Adding any new package for skeleton loaders, mobile menus, or animation would be premature for the scope described.

---

## Common Pitfalls

### Pitfall 1: loading.tsx Scope Mismatch

**What goes wrong:** Developer expects `loading.tsx` to show the full page skeleton including the sidebar and header, but it shows a blank sidebar area because the skeleton div doesn't include the sidebar layout structure.

**Why it happens:** `loading.tsx` replaces the entire `page.tsx` output, not just the grid. If the skeleton doesn't replicate the outer layout structure (`max-w-7xl`, `flex-col gap-8 lg:flex-row`, `aside` placeholder), the page will visually shift when real content loads.

**How to avoid:** Mirror the exact outer layout structure of `page.tsx` in `loading.tsx` — same `mx-auto max-w-7xl`, same `flex flex-col gap-8 lg:flex-row` wrapper, same `w-full shrink-0 lg:w-56` aside placeholder (can be an empty div — sidebar is excluded from skeletons per CONTEXT.md, but the space must be reserved).

**Warning signs:** Page layout "jumps" or width changes when loading state transitions to loaded state.

### Pitfall 2: Hamburger and Account Dropdown Conflicting Click-Outside

**What goes wrong:** When both `menuOpen` and `dropdownOpen` are managed with separate refs, clicking the hamburger while the account dropdown is open (or vice versa) can leave both open simultaneously, or cause the click-outside to fire for one but not the other.

**Why it happens:** Two independent `useEffect` listeners fire on the same `mousedown` event. Each only checks its own ref.

**How to avoid:** In the click-outside handler, close BOTH menus when clicking outside either ref. Or: ensure the hamburger button click handler always closes the account dropdown (`setDropdownOpen(false)`) before toggling `menuOpen`. Since the hamburger is `md:hidden` and the account dropdown is inside the desktop nav (`hidden md:flex`), they cannot both be visible simultaneously on a real device, but the state can still be inconsistent.

**Warning signs:** On viewport resize (e.g., in browser DevTools responsive mode), a menu that was open at one breakpoint remains open at another.

### Pitfall 3: searchParams in loading.tsx Not Available

**What goes wrong:** Developer tries to show "Loading results for Welding..." in the skeleton by reading `searchParams`, but `loading.tsx` does not receive `searchParams` or `params` props.

**Why it happens:** `loading.tsx` is a simple UI component with no access to route parameters or search params. It is rendered before the page component runs.

**How to avoid:** Keep `loading.tsx` entirely generic. Do not attempt to reflect the active filters in the skeleton. The existing page header ("X verified contractors in Y") only appears after data loads.

**Warning signs:** TypeScript errors trying to type `loading.tsx` with `searchParams` props.

### Pitfall 4: Mobile Dropdown Positioned Off-Screen at 375px

**What goes wrong:** The hamburger dropdown appears with `right-0` but the parent button is near the right edge, causing the dropdown to clip outside the viewport on very narrow screens.

**Why it happens:** `absolute right-0` positions relative to the parent. If the parent button is within `px-4` of the right edge and the dropdown is `w-56` (224px), the dropdown starts from the right edge of the button and extends left — this is correct. But if `right-0` is mistakenly set to `left-0`, the dropdown extends rightward off-screen.

**How to avoid:** Use `right-0` on the dropdown (aligns right edge of dropdown to right edge of button). With `w-56` at a 375px viewport, the dropdown occupies 224px of 375px — fully visible. Verify in browser DevTools at 375px width.

**Warning signs:** Dropdown partially hidden behind browser edge on iPhone SE viewport.

### Pitfall 5: `force-dynamic` and loading.tsx Interaction

**What goes wrong:** Developer assumes that because `page.tsx` has `export const dynamic = 'force-dynamic'`, the loading.tsx won't work (since the page isn't statically generated).

**Why it happens:** Misconception about what `force-dynamic` does. It opts the page out of static generation, not out of Suspense streaming.

**How to avoid:** `loading.tsx` works with both static and dynamic routes. `force-dynamic` means the page always fetches fresh data on each request — the loading UI still displays during that fetch.

**Warning signs:** None — this is a false concern, but worth documenting to prevent it from being raised during implementation.

---

## Code Examples

Verified patterns from official Next.js documentation and direct codebase analysis:

### loading.tsx Convention (Next.js 14)
```typescript
// Source: https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming
// app/contractors/loading.tsx — automatically used by Next.js as Suspense fallback

export default function Loading() {
  // This is rendered immediately while page.tsx fetches data
  // Has access to the route layout (NavBar renders above this)
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* ... skeleton content */}
    </div>
  )
}
```

### Tailwind animate-pulse (built-in, no config needed)
```typescript
// Tailwind CSS v3 — animate-pulse is a built-in utility class
// Source: https://tailwindcss.com/docs/animation#pulse
// Applies: animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite

<div className="h-4 w-32 rounded bg-slate-800 animate-pulse" />

// For the skeleton card container, apply animate-pulse to the wrapper
// so all child placeholders animate together:
<div className="rounded-lg border border-slate-800 bg-slate-900 p-5 animate-pulse">
  {/* child divs inherit the animation context */}
</div>
```

### Responsive Visibility with Tailwind Breakpoints
```typescript
// Source: https://tailwindcss.com/docs/responsive-design
// md breakpoint = 768px — hamburger shows below 768px, desktop nav above

// Desktop links — hide on mobile
<div className="hidden md:flex items-center gap-6">...</div>

// Hamburger — hide on desktop
<button className="flex md:hidden ...">...</button>
```

### 44px Minimum Tap Target (WCAG 2.5.5)
```typescript
// p-3 = 12px padding on all sides
// Icon is h-5 w-5 = 20px
// Total: 20px icon + 12px top + 12px bottom = 44px height
// Meets WCAG 2.5.5 minimum 44×44px touch target

<button
  className="flex items-center justify-center rounded-md p-3 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
  aria-label="Open navigation menu"
>
  <svg className="h-5 w-5" .../>
</button>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom `isLoading` boolean in client component | `loading.tsx` file convention (server-side Suspense) | Next.js 13 App Router (2022) | Server components can stream; no client state needed for loading |
| CSS `visibility: hidden` for mobile nav | Tailwind `hidden md:flex` responsive classes | Tailwind v1+ | Declarative, no JS, no hydration mismatch |
| Third-party skeleton libraries (react-loading-skeleton) | Tailwind `animate-pulse` on divs | Tailwind v2+ | Zero extra dependency; acceptable quality for MVP |

**Deprecated/outdated:**
- `getStaticProps` / `getServerSideProps` loading patterns: irrelevant — this project uses App Router exclusively
- `next/router` from pages directory: irrelevant — project uses `next/navigation` (App Router)

---

## Open Questions

1. **animate-pulse vs. custom shimmer**
   - What we know: `animate-pulse` produces an opacity fade (1 → 0.5 → 1). A custom shimmer produces a left-to-right gradient sweep (like Facebook/LinkedIn skeletons).
   - What's unclear: Which visual quality the user prefers.
   - Recommendation: Use `animate-pulse` (Claude's discretion per CONTEXT.md). It's simpler, requires no new CSS, and is sufficient for MVP. A shimmer upgrade can be done later if requested.

2. **Whether to show skeletons on filter changes (not just initial page load)**
   - What we know: With `loading.tsx`, Next.js shows the skeleton on every navigation to the route, including when search params change (filter selections). This is because each filter change is a new server render.
   - What's unclear: Whether this is desirable — some UX patterns prefer the old results to persist while new ones load (optimistic UI).
   - Recommendation: Accept the default `loading.tsx` behavior (show skeleton on every navigation). It clearly communicates "data is refreshing" and is the correct tradeoff for MVP simplicity.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — no jest.config, vitest.config, pytest.ini, or test directories found |
| Config file | None — Wave 0 would need framework selection |
| Quick run command | `npm run build` (build check only) |
| Full suite command | `npm run lint && npm run build` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UX-01 | `/contractors` shows skeletons while loading | manual-only | View at 375px on throttled connection in DevTools | N/A |
| UX-02 | Empty state appears with reset button when no results | manual-only | Apply filters that match no contractors, verify message and button appear | N/A |
| UX-03 | Hamburger opens at 375px with ≥44px tap targets | manual-only | Open DevTools at 375px, verify hamburger visible and tappable | N/A |

**Justification for manual-only:** All three requirements are visual/interaction behaviors that require a rendered browser. There is no existing test framework, and adding one is out of scope for this phase. Build success (`npm run build`) verifies TypeScript correctness and no import errors.

### Sampling Rate
- **Per task commit:** `npm run build` to catch TypeScript errors
- **Per wave merge:** `npm run lint && npm run build`
- **Phase gate:** Manual browser verification at 375px viewport before `/gsd:verify-work`

### Wave 0 Gaps
- No automated test framework exists — all UX-01/UX-02/UX-03 validation is manual browser testing
- Manual test checklist:
  - [ ] Open `/contractors` on throttled connection (DevTools Network → Slow 3G) — skeletons appear
  - [ ] Apply trade + state filter with no matching contractors — empty state + reset button appear
  - [ ] Navigate to `/contractors` at 375px viewport — desktop nav hidden, hamburger visible, dropdown opens on tap

*(If a test framework is ever added to the project, UX-01 could be covered with a Playwright/Cypress visual snapshot test)*

---

## Sources

### Primary (HIGH confidence)
- Next.js 14 App Router docs — `loading.js` and Streaming/Suspense — verified behavior of `loading.tsx` convention with `force-dynamic` pages
- Direct codebase analysis — `NavBar.tsx`, `ContractorCard.tsx`, `app/contractors/page.tsx`, `app/contractors/layout.tsx`, `tailwind.config.ts`, `package.json` — all patterns confirmed by reading source

### Secondary (MEDIUM confidence)
- Tailwind CSS v3 docs — `animate-pulse` utility — confirmed as built-in animation class, no configuration required
- WCAG 2.5.5 — 44×44px minimum touch target size — verified that `p-3` padding on a 20px SVG icon meets the requirement

### Tertiary (LOW confidence)
- None — all claims in this research are backed by direct code reading or official documentation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all three requirements use currently-installed packages (Next.js, Tailwind, React)
- Architecture: HIGH — patterns derived from direct code reading of existing files
- Pitfalls: HIGH — derived from analysis of the actual code structure (force-dynamic, client vs. server component boundaries, ref management)

**Research date:** 2026-03-04
**Valid until:** 2026-09-04 (stable APIs — Next.js 14 App Router, Tailwind CSS 3 conventions are not changing rapidly)
