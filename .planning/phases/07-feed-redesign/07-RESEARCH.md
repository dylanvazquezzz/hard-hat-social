# Phase 7: Feed Redesign — Research

**Researched:** 2026-03-08
**Domain:** Next.js 14 App Router server components, Tailwind CSS two-column layouts, Supabase server-side data fetching
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Sidebar entry format**
- Each entry: circular avatar (initial fallback if no avatar_url) + full name + trade label
- Compact row layout — no location shown
- Links to `/contractors/[id]` (not `/u/[username]`)
- 5 entries per widget (not 8)
- Each widget has a "View all" link at the bottom pointing to `/contractors`
- No count shown in widget headers (e.g., just "Recently Verified", not "Recently Verified (5)")

**Suggested People fallback logic**
- Viewer not logged in → show Recently Verified list in place of Suggested People widget
- Viewer logged in but no trade on their contractor profile → fall back to Recently Verified
- Sparse trade (fewer than 5 same-trade approved contractors) → show same-trade matches first, then pad with most-recently-verified from any trade up to 5 total
- Exclude the currently logged-in user's own contractor row from Suggested People results

**Layout and responsive behavior**
- Desktop (`lg` and up): two-column flex layout — feed takes `flex-1`, sidebar is fixed 240px wide
- Mobile (below `lg`): sidebar hidden entirely (`hidden lg:block`), feed takes full width
- Sidebar is sticky on desktop (`sticky top-[X]` so it stays visible while the feed scrolls)
- Outer container widens from current `max-w-2xl` to accommodate the two-column layout

### Claude's Discretion
- Exact outer container width (`max-w-4xl`, `max-w-5xl`, etc.) — pick what looks right with 240px sidebar
- Sticky top offset value (accounting for NavBar height)
- Visual styling of sidebar widget headers and "View all" links — match existing design language (slate/amber palette)
- Whether to wrap sidebar queries in a try/catch or let errors bubble to Next.js error boundary

### Deferred Ideas (OUT OF SCOPE)
- FEED-03 (posts visible on public profile `/u/[username]`) — explicitly deferred to v1.3 per REQUIREMENTS.md
- Horizontal scrolling sidebar strip on mobile — not needed; sidebar hides entirely on mobile
- Post interactions (likes, replies) — separate phase
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FEED-01 | Explore page posts fill the full content column width — no excessive side margins | Remove `max-w-2xl` constraint from the feed column; use `flex-1 min-w-0` on the feed `<main>` inside a wider outer container |
| FEED-02 | Explore page has a right sidebar with "Recently Verified" and "Suggested People (same trade)" widgets | New `FeedSidebar` server component; data fetched in `ExplorePage` using `getSupabaseAdmin()` and passed as props; no client-side fetch |
</phase_requirements>

---

## Summary

Phase 7 is a pure UI/layout change — no new database schema, no new routes, no new API endpoints. The entire scope is restructuring `app/explore/page.tsx` from a single-column `max-w-2xl` layout to a two-column flex layout with a 240px sticky right sidebar, and adding a new `FeedSidebar` server component.

The codebase already has every primitive needed: `getSupabaseAdmin()` in `app/explore/page.tsx` for data fetching, Tailwind's brand tokens for styling, `PostCard` that renders cleanly at any width, and `export const dynamic = 'force-dynamic'` ensuring fresh data on every request. Nothing new needs to be installed.

The only architectural decision with any subtlety is viewer-trade detection for "Suggested People" — the current Explore page fetches no session data, so reading the viewer's contractor trade requires one additional query via `getSupabaseAdmin()` using the cookie-based session available to server components.

**Primary recommendation:** Fetch all sidebar data (recently verified, viewer's trade, suggested people) inside `ExplorePage` before rendering, pass arrays as props to `FeedSidebar`, and render the entire page in a single server pass with zero client-side data fetching.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 14 (already installed) | Server component rendering, `cookies()` API for session | Already in project |
| Tailwind CSS | Already installed | Two-column flex layout, responsive breakpoints, sticky positioning | Already in project |
| Supabase JS (`@supabase/supabase-js`) | Already installed | Contractor queries for sidebar data | Already in project via `getSupabaseAdmin()` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `server-only` | Already installed | Guard `FeedSidebar` if it imports from `lib/supabase-admin` | Add if `FeedSidebar` does its own import; not needed if data is passed as props |
| Next.js `cookies()` | Built-in (Next.js 14) | Read auth session in a server component without a client round-trip | Use to get viewer user ID in `ExplorePage` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Props-passed data (data fetched in page, passed to sidebar) | `FeedSidebar` fetches its own data | Props pattern keeps all fetches in one place, easier to reason about, avoids duplicate admin client instantiation |
| `cookies()` + `getSupabaseAdmin()` for session | `createServerComponentClient` from `@supabase/auth-helpers-nextjs` | Project does not use auth-helpers; stick with the admin client pattern already established in the codebase |
| CSS `sticky` on sidebar | `position: fixed` | Sticky is correct — fixed would take it out of document flow and overlap content |

**Installation:** No new packages required.

---

## Architecture Patterns

### Recommended Project Structure

No new directories. New file added to existing `components/`:

```
app/
└── explore/
    └── page.tsx          # Modified: wider container, sidebar queries, two-column JSX
components/
├── PostCard.tsx           # Unchanged
└── FeedSidebar.tsx        # New: server component, props-driven
```

### Pattern 1: Two-Column Flex Layout with Sticky Sidebar

**What:** Outer page wrapper becomes a wide `flex gap-6` row. Feed column takes remaining space with `flex-1 min-w-0`. Sidebar is `hidden lg:block w-60 shrink-0`.

**When to use:** Any page where primary content scrolls and secondary metadata should stay visible.

**Example:**
```tsx
// Source: Tailwind CSS docs — sticky positioning
<div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
  {/* Page header stays above the two-column area */}
  <div className="mb-8 ...">...</div>

  <div className="flex gap-6 items-start">
    {/* Feed column — takes all remaining width */}
    <main className="flex-1 min-w-0">
      {/* tabs + posts */}
    </main>

    {/* Sidebar — hidden on mobile, sticky on desktop */}
    <aside className="hidden lg:block w-60 shrink-0 sticky top-20 self-start">
      <FeedSidebar
        recentlyVerified={recentlyVerified}
        suggestedPeople={suggestedPeople}
      />
    </aside>
  </div>
</div>
```

**Key details:**
- `items-start` on the flex row is required — without it, `sticky` on the aside has no effect because flex stretch makes the sidebar as tall as the feed.
- `self-start` on the aside reinforces this.
- `min-w-0` on the feed column prevents flex blowout when post content is wide.
- `top-20` corresponds to the 64px (h-16) NavBar height plus a small gap. The NavBar renders with `h-16` (64px = 4rem). `top-16` (4rem) is the minimum; `top-20` (5rem) adds 16px breathing room.

### Pattern 2: Server Component Data Fetching for Sidebar

**What:** All three queries (posts, recently verified, suggested people) run in `ExplorePage` — a single async server component. Arrays are passed as props to `FeedSidebar`.

**When to use:** Whenever sidebar data is derived from the same data layer as the main content and can be fetched without client interaction.

**Example:**
```tsx
// Source: Established pattern in app/explore/page.tsx
export const dynamic = 'force-dynamic'

export default async function ExplorePage({ searchParams }: PageProps) {
  const admin = getSupabaseAdmin()

  // Existing posts query (unchanged)
  const { data: postsData } = await admin.from('posts')...

  // New: recently verified (5, ordered by created_at desc)
  const { data: recentlyVerifiedData } = await admin
    .from('contractors')
    .select('id, full_name, trade, profile_photo_url')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(5)

  // New: viewer session for trade detection
  // Use Supabase admin client with cookies-based session read
  // (see Pattern 3 for details)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex gap-6 items-start">
        <main className="flex-1 min-w-0">...</main>
        <aside className="hidden lg:block w-60 shrink-0 sticky top-20 self-start">
          <FeedSidebar
            recentlyVerified={recentlyVerifiedData ?? []}
            suggestedPeople={suggestedPeople}
          />
        </aside>
      </div>
    </div>
  )
}
```

### Pattern 3: Reading Viewer Session in an App Router Server Component

**What:** Next.js 14 App Router server components can read cookies directly using `cookies()` from `next/headers`. Pass the cookie store to a Supabase client to get the current user without a client round-trip.

**When to use:** Any server component that needs to know who is logged in without a `'use client'` directive.

**The established approach in this project** is `getSupabaseAdmin()` (service role). For reading the viewer's session, the correct pattern is:

```tsx
// Source: Next.js 14 App Router docs — cookies() in server components
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
```

**However**, this project does NOT use `@supabase/auth-helpers-nextjs`. The simpler approach consistent with existing patterns:

```tsx
// Pattern used by this project (no auth-helpers dependency)
import { cookies } from 'next/headers'

// In ExplorePage (server component):
const cookieStore = cookies()
const { data: { user } } = await admin.auth.getUser(
  cookieStore.get('sb-access-token')?.value ?? ''  // will return null if no token
)
// If user is null → viewer not logged in
```

**Important:** `admin.auth.getUser(token)` validates the JWT. Passing an empty string returns `{ user: null, error: ... }` safely — no throw. This is the correct way to read session server-side without the auth-helpers package.

**Alternative approach** if cookie name varies: use `createClient` from `@supabase/ssr` — but that requires adding a new package. Stick with the admin client + `cookies()` pattern.

**Practical note on cookie names:** Supabase stores the access token in a cookie named `sb-<project-ref>-auth-token`. The exact name varies by project. A safer pattern is to parse all cookies for the Supabase auth cookie:

```tsx
// Safe viewer detection without hardcoding cookie name
const allCookies = cookies().getAll()
const authCookie = allCookies.find(c => c.name.includes('-auth-token'))
const token = authCookie ? JSON.parse(authCookie.value)?.[0] : null
const { data: { user } } = await admin.auth.getUser(token ?? '')
```

Or, even simpler and more robust: create a lightweight Supabase server client using `@supabase/ssr` `createServerClient`. But since the project hasn't introduced that package, use the cookie-parsing approach.

**Recommendation (Claude's discretion):** Use the cookie-parsing approach above. It's self-contained, adds no new packages, and matches the project's "no new packages without reason" constraint.

### Pattern 4: FeedSidebar Widget Structure

**What:** Each widget is a bordered card with a title, a list of compact contractor entries, and a "View all" link.

```tsx
// Source: Derived from PostCard.tsx pattern (border-slate-800 bg-slate-900 rounded-lg)
function SidebarWidget({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-muted">
        {title}
      </h2>
      {children}
      <a
        href="/contractors"
        className="mt-3 block text-xs text-brand-yellow hover:underline"
      >
        View all →
      </a>
    </div>
  )
}

// Compact contractor entry (no ContractorCard — too large for 240px)
function SidebarEntry({ contractor }: { contractor: SidebarContractor }) {
  const initial = contractor.full_name.charAt(0).toUpperCase()
  return (
    <a
      href={`/contractors/${contractor.id}`}
      className="flex items-center gap-2 py-1.5 hover:opacity-80 transition-opacity"
    >
      <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-slate-700">
        {contractor.profile_photo_url ? (
          <Image src={contractor.profile_photo_url} alt={contractor.full_name} fill className="object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xs font-bold text-amber-500">
            {initial}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-slate-100">{contractor.full_name}</p>
        <p className="truncate text-xs text-brand-muted">{contractor.trade}</p>
      </div>
    </a>
  )
}
```

### Pattern 5: Suggested People Fallback Logic

**What:** Three-tier fallback: same-trade results first, pad to 5 with recently verified if sparse, show recently verified if no trade or not logged in.

```tsx
// In ExplorePage, after viewer trade detection:
async function getSuggestedPeople(
  admin: SupabaseClient,
  viewerContractorId: string | null,
  viewerTrade: string | null,
  recentlyVerified: SidebarContractor[]
): Promise<SidebarContractor[]> {
  if (!viewerTrade) return recentlyVerified  // not logged in or no trade

  const { data: sameTrade } = await admin
    .from('contractors')
    .select('id, full_name, trade, profile_photo_url')
    .eq('status', 'approved')
    .eq('trade', viewerTrade)
    .neq('id', viewerContractorId ?? '')  // exclude self
    .order('created_at', { ascending: false })
    .limit(5)

  const results = sameTrade ?? []
  if (results.length >= 5) return results

  // Pad with recently verified from any trade (exclude already shown + self)
  const excludeIds = new Set([
    ...(results.map(c => c.id)),
    viewerContractorId ?? '',
  ])
  const pad = recentlyVerified
    .filter(c => !excludeIds.has(c.id))
    .slice(0, 5 - results.length)

  return [...results, ...pad]
}
```

### Anti-Patterns to Avoid

- **Using ContractorCard in the sidebar:** It renders full card UI designed for ~300px+ wide grid cells. At 240px it will break the layout. Create a compact `SidebarEntry` instead.
- **Client-side fetch in FeedSidebar:** Adding `'use client'` and `useEffect` to fetch sidebar data creates hydration flash (sidebar appears empty, then fills in). All data must come from the server render.
- **`position: fixed` for the sidebar:** Fixed removes it from document flow — the main layout column fills the full width and the sidebar overlaps it. Use `sticky` with `self-start` and `items-start` on the parent flex container.
- **Forgetting `items-start` on the flex row:** Without it, the sidebar stretches to match the feed height, making `sticky` non-functional (the sidebar is already as tall as its scroll container).
- **Hardcoding a Supabase cookie name:** Cookie names include the project ref. Use `.find(c => c.name.includes('-auth-token'))` rather than a literal name.
- **Fetching posts with `export const dynamic = 'force-dynamic'` then also fetching sidebar data statically:** All fetches run at the same time in the same server render. No special handling needed — `force-dynamic` applies to the whole page.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sticky sidebar | Custom JS scroll listener to pin sidebar | CSS `sticky` + `items-start` on flex parent | CSS handles this natively; JS adds unnecessary complexity and layout shift |
| Avatar display with fallback | Custom avatar component | Inline conditional in `SidebarEntry` | The pattern is simple enough (3 lines) — no separate component needed |
| Session reading in server component | Cookie parsing library | `cookies()` from `next/headers` + `admin.auth.getUser()` | Built into Next.js 14 App Router |
| Supabase query builder | Raw SQL strings | `.from().select().eq().order().limit()` chaining | Already established pattern throughout the codebase |

**Key insight:** This phase adds no new problem domains. Every problem (sticky layouts, server-side auth, Supabase queries, avatar display) is solved by tools already in the project.

---

## Common Pitfalls

### Pitfall 1: Sticky Not Working on the Sidebar

**What goes wrong:** Sidebar scrolls away with the feed instead of sticking in place.

**Why it happens:** Two causes:
1. The parent flex container uses `items-stretch` (default), which makes the sidebar as tall as the feed. A sticky element only sticks within its scroll container — if the sidebar IS as tall as the container, it has nowhere to stick.
2. The outer container has `overflow: hidden` or `overflow: auto`, which creates a new stacking context that traps the sticky element.

**How to avoid:**
- Add `items-start` to the flex row parent.
- Add `self-start` to the `<aside>` element.
- Ensure no ancestor has `overflow: hidden/auto/scroll` between the sidebar and the viewport.

**Warning signs:** Sidebar does not stay visible during feed scroll. Inspect: if sidebar height equals feed height, `items-start` is missing.

### Pitfall 2: Hydration Flash from Missing Sidebar Data

**What goes wrong:** Page loads with no sidebar, then sidebar appears ~500ms later as a client fetch completes.

**Why it happens:** Sidebar data was fetched client-side in a `useEffect` rather than server-side in the page component.

**How to avoid:** Fetch all data in `ExplorePage` (the server component) before returning JSX. Pass arrays as props to `FeedSidebar`. Never add `'use client'` to `FeedSidebar`.

**Warning signs:** Brief layout shift after page load; React hydration warnings in console.

### Pitfall 3: Feed Column Width Blowout

**What goes wrong:** Feed column overflows its half of the layout, pushing sidebar off-screen or wrapping incorrectly.

**Why it happens:** `flex-1` expands to fill available space, but if an inner element (long URL, wide code block, wide image) exceeds the column width, the column grows past `flex-1` unless `min-w-0` is set.

**How to avoid:** Always add `min-w-0` to the `flex-1` column. This tells flex to allow the column to shrink below its content's natural width.

**Warning signs:** Sidebar disappears horizontally on wide post content. PostCard stretches beyond expected width.

### Pitfall 4: Wrong Outer Container Width

**What goes wrong:** Container is too narrow (sidebar squished) or too wide (content swims in whitespace).

**Why it happens:** The old `max-w-2xl` (672px) was sized for a single column. Adding a 240px sidebar + 24px gap requires at least 936px of content space. `max-w-4xl` = 896px (too tight). `max-w-5xl` = 1024px is the right call.

**How to avoid:** Use `max-w-5xl` (1024px). At `lg` breakpoint (1024px), the two-column layout kicks in with exactly enough room. Below `lg`, sidebar hides and feed fills full width — so `max-w-5xl` won't over-expand narrow screens.

### Pitfall 5: Viewer Trade Detection Failing Silently

**What goes wrong:** Suggested People always shows Recently Verified even for logged-in users who have a trade.

**Why it happens:** Session cookie not found (wrong cookie name), or user is logged in but has no `contractors` row (applied but not approved, or never applied).

**How to avoid:** After getting the user ID from session:
1. Query `contractors` table for a row with `user_id = viewer_id AND status = 'approved'`.
2. If no row found → fall back to Recently Verified (correct behavior for unapproved users).
3. If row found but `trade` is empty → fall back to Recently Verified.
4. Log the fallback reason in development (a `console.log` is fine for now).

**Warning signs:** In test: log in as an approved welding contractor, confirm Suggested People shows welders, not the same list as Recently Verified.

---

## Code Examples

Verified patterns from existing codebase:

### Recently Verified Query

```typescript
// Source: Matches pattern in app/explore/page.tsx — getSupabaseAdmin() + .from().select()
const { data: recentlyVerified } = await admin
  .from('contractors')
  .select('id, full_name, trade, profile_photo_url')
  .eq('status', 'approved')
  .order('created_at', { ascending: false })
  .limit(5)
```

### Viewer Contractor Lookup (for trade detection)

```typescript
// After getting user from session:
const { data: viewerContractor } = await admin
  .from('contractors')
  .select('id, trade')
  .eq('user_id', viewerUserId)
  .eq('status', 'approved')
  .maybeSingle()
// viewerContractor?.trade is null if no approved contractor row
```

### Two-Column Layout Wrapper

```tsx
// Outer container — expands to max-w-5xl to fit feed + 240px sidebar
<div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
  {/* Page header stays outside the two-column area */}
  <div className="mb-8 flex items-start justify-between gap-4">...</div>

  {/* Two-column flex row */}
  <div className="flex gap-6 items-start">
    <main className="flex-1 min-w-0">
      {/* Tabs and posts */}
    </main>
    <aside className="hidden lg:block w-60 shrink-0 sticky top-20 self-start">
      <FeedSidebar
        recentlyVerified={recentlyVerified ?? []}
        suggestedPeople={suggestedPeople}
      />
    </aside>
  </div>
</div>
```

### FeedSidebar Component Signature

```typescript
// components/FeedSidebar.tsx — server component (no 'use client')
interface SidebarContractor {
  id: string
  full_name: string
  trade: string
  profile_photo_url: string | null
}

interface FeedSidebarProps {
  recentlyVerified: SidebarContractor[]
  suggestedPeople: SidebarContractor[]  // may be same as recentlyVerified on fallback
}

export default function FeedSidebar({ recentlyVerified, suggestedPeople }: FeedSidebarProps) {
  // ...
}
```

### Sticky Top Offset

The NavBar renders at `h-16` (64px = 4rem = `top-16`). Add `top-20` (80px) to include a 16px breathing gap. This is correct for a non-sticky NavBar. If the NavBar were `position: sticky` itself, the sidebar's `top` value would account for the NavBar height stacking.

```
NavBar: h-16 = 64px
Gap:    16px
Sidebar top: top-20 (80px)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side fetch in `useEffect` for sidebar widgets | Server component data fetching, props-driven | Next.js 13+ App Router | No hydration flash, better TTFB, simpler code |
| CSS `position: fixed` for persistent sidebars | CSS `sticky` with flex `items-start` | CSS3 | No JS required, flows correctly with document layout |
| Separate layout route file for page-level structure | Inline two-column flex in page component | N/A for this project | Keep the layout in the page since only `/explore` uses it |

**No deprecated patterns in scope for this phase.**

---

## Open Questions

1. **Supabase auth cookie name in production**
   - What we know: Cookie is set by Supabase Auth; name includes the project ref
   - What's unclear: Exact cookie name on the production Supabase project
   - Recommendation: Use `cookies().getAll().find(c => c.name.includes('-auth-token'))` — works regardless of project ref. Test locally first.

2. **Self-start + sticky behavior across browsers on iOS Safari**
   - What we know: `position: sticky` is broadly supported since iOS 13
   - What's unclear: Whether older iOS devices on the site behave correctly
   - Recommendation: This is LOW risk — the sidebar is `hidden` below `lg` anyway, and `lg` breakpoint (1024px) is never hit on phones. Desktop Safari fully supports sticky.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None — no test framework installed |
| Config file | None |
| Quick run command | `npm run build` (build-time type check) |
| Full suite command | `npm run lint && npm run build` |

No test files or test infrastructure exist in this project. The project has no Jest, Vitest, or Playwright configuration. Validation for this phase is build-level (TypeScript type-check catches prop type mismatches) plus manual visual verification.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FEED-01 | Post cards fill full content column width | Manual visual | `npm run build` (catches TS errors) | N/A — no test files |
| FEED-02 | Right sidebar shows Recently Verified and Suggested People without client fetch | Manual visual + build | `npm run build` | N/A — no test files |

### Sampling Rate

- **Per task commit:** `npm run lint`
- **Per wave merge:** `npm run lint && npm run build`
- **Phase gate:** Full build green + manual visual check on desktop viewport before `/gsd:verify-work`

### Wave 0 Gaps

No test framework exists. Adding one is out of scope for this phase. Manual verification is the quality gate.

- No test files need to be created for this phase — the changes are UI layout only, verified visually.
- Build (`npm run build`) will catch TypeScript prop type errors on `FeedSidebar`.

*(No Wave 0 test gaps to fill — existing infrastructure (TypeScript + lint) covers the automated checks available in this project.)*

---

## Sources

### Primary (HIGH confidence)

- Direct code inspection: `app/explore/page.tsx` — confirmed server component pattern, `getSupabaseAdmin()` usage, `export const dynamic = 'force-dynamic'`
- Direct code inspection: `components/NavBar.tsx` — confirmed `h-16` NavBar height, established brand token usage
- Direct code inspection: `lib/types.ts` — confirmed `Contractor` interface shape for sidebar query
- Direct code inspection: `lib/supabase-admin.ts` — confirmed admin client pattern
- Direct code inspection: `tailwind.config.ts` — confirmed `brand.*` token names
- Direct code inspection: `app/layout.tsx` — confirmed no sticky NavBar; NavBar is static in the flow

### Secondary (MEDIUM confidence)

- Tailwind CSS docs (CSS sticky + flex items-start pattern) — standard, well-established behavior
- Next.js 14 App Router docs — `cookies()` from `next/headers` in server components, confirmed in project's Next.js version

### Tertiary (LOW confidence)

- None — all critical findings verified via direct code inspection or official documentation.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — everything verified from existing codebase files
- Architecture: HIGH — two-column flex + sticky sidebar is standard CSS; data fetching pattern already used in the file being modified
- Pitfalls: HIGH — sticky layout pitfalls (items-start, min-w-0) are well-documented CSS behavior
- Viewer session detection: MEDIUM — `admin.auth.getUser(token)` pattern correct, but exact cookie name parsing needs local verification

**Research date:** 2026-03-08
**Valid until:** 2026-04-08 (Next.js 14 and Tailwind CSS stable; no fast-moving dependencies)
