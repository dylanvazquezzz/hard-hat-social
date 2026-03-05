# Phase 4: Homepage Redesign - Research

**Researched:** 2026-03-04
**Domain:** Next.js App Router server components, Supabase aggregate queries, Tailwind CSS responsive layout
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Primary audience: contractors wanting to join the network (B2B first)
- Primary CTA: "Apply as a Contractor" — amber filled button, most visually prominent
- Secondary CTA: "Browse Directory" — outlined/ghost button, stays in the hero above the fold
- Both CTAs remain visible above the fold; Apply leads visually
- Show 3 live stats: approved contractor count, distinct trades represented, total applications reviewed
- Stats placement: below the CTA buttons in the hero section, still above the fold on most screens
- Query the DB at page load (server component — no loading state needed)
- Display real numbers regardless of how small they are — no minimums, no hiding
- No fake or placeholder numbers under any circumstances
- Targeted improvements only — keep the 4-section structure (hero, browse by trade, how it works, bottom CTA)
- "How it works" copy updated to be contractor-focused: steps speak to a tradesperson joining (submit credentials → get verified → find and connect with subs)
- Browse by Trade section: leave as-is
- Bottom CTA section: leave as-is

### Claude's Discretion
- Exact headline and subhead copy (contractor-first framing)
- How to display the 3-stat row (label formatting, separator style)
- Whether DB queries are in the page component or extracted to a data-fetching helper
- Mobile layout verification for the CTA buttons (HOME-03)

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HOME-01 | Homepage hero prominently frames "verified only" value prop with a single clear CTA (apply or browse) | CTA order swap (Apply first), headline rewrite to contractor-first framing, amber badge retained |
| HOME-02 | Homepage displays social proof via real stats/numbers (e.g. trades represented, applications reviewed) — no fake placeholder profiles | Supabase aggregate queries against contractors and applications tables; server component pattern confirmed |
| HOME-03 | Homepage layout is mobile-responsive with tap-friendly buttons for tradespeople viewing on phones | Existing `w-full sm:w-auto` pattern on CTAs covers 375px; stat row needs stacking review |
</phase_requirements>

---

## Summary

Phase 4 is a targeted, surgical edit to a single file: `app/page.tsx`. The page is currently a static server component with four sections (hero, browse by trade, how it works, bottom CTA). Three changes are needed: (1) swap the CTA button order so Apply is amber/primary and Browse is ghost/secondary, (2) add a live stats row below the CTAs that queries the DB at render time, and (3) rewrite the hero headline and "How it works" copy to speak directly to tradespeople joining rather than generic visitors.

The existing codebase already has all required infrastructure. `getSupabaseAdmin()` is imported server-side in multiple pages (explore, admin). Supabase supports `count` via `.select('*', { count: 'exact', head: true })` and `distinct` via `.select('trade')` with JS deduplication. The page does not need `dynamic = 'force-dynamic'` because the stats are global (not user-specific), meaning Next.js can cache them normally at build/revalidation time unless you want them always fresh.

**Primary recommendation:** Convert `app/page.tsx` to an async server component, call `getSupabaseAdmin()` at the top, run three parallel DB queries (Promise.all), render the stat row inline below the CTAs, and swap CTA order. One file changed, no new dependencies, no new pages.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 14 (in use) | Async server components with data fetching at render | Already in project — `async function Page()` pattern |
| Supabase JS | in use | DB queries from server component | `getSupabaseAdmin()` already imported in explore/admin |
| Tailwind CSS | in use | Responsive layout, button styles | All existing class patterns are Tailwind |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `server-only` | in use | Enforces server boundary on admin client | Already applied in `lib/supabase-admin.ts` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline DB calls in page component | Separate `lib/homepage-stats.ts` helper | Helper is cleaner if queries grow; inline is fine for 3 simple aggregates |
| No cache directive (default) | `export const revalidate = 3600` | Hourly revalidation gives fresh-enough stats without per-request latency |

**Installation:**
No new packages needed.

---

## Architecture Patterns

### Current File Structure (unchanged)
```
app/
└── page.tsx    # The only file being modified in this phase
```

### Pattern 1: Async Server Component with Parallel DB Queries
**What:** Convert the default export to `async function`, call `getSupabaseAdmin()`, run queries with `Promise.all`, pass results as props to JSX.
**When to use:** Any server component that needs DB data at render time without client interaction.
**Example:**
```typescript
// Established pattern from app/explore/page.tsx and app/admin/page.tsx
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export default async function HomePage() {
  const admin = getSupabaseAdmin()

  const [
    { count: approvedCount },
    { data: tradesData },
    { count: applicationsCount },
  ] = await Promise.all([
    admin
      .from('contractors')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved'),
    admin
      .from('contractors')
      .select('trade')
      .eq('status', 'approved'),
    admin
      .from('applications')
      .select('*', { count: 'exact', head: true }),
  ])

  const distinctTrades = new Set((tradesData ?? []).map((r) => r.trade)).size

  // ... render
}
```

### Pattern 2: Supabase Count Query
**What:** Use `{ count: 'exact', head: true }` to get row count without fetching data.
**When to use:** Whenever you need a count — no need to fetch and count in JS.
**Example:**
```typescript
// Source: Supabase JS docs — count option
const { count } = await admin
  .from('contractors')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'approved')
// count is number | null
```

### Pattern 3: Distinct Trade Count via JS Set
**What:** Fetch `trade` column for approved contractors, deduplicate with `Set`.
**When to use:** Supabase JS client does not expose a `DISTINCT COUNT` shorthand; JS Set dedup on a small dataset is clean and readable.
**Example:**
```typescript
const { data } = await admin
  .from('contractors')
  .select('trade')
  .eq('status', 'approved')

const distinctTrades = new Set((data ?? []).map((r) => r.trade)).size
```

### Pattern 4: ISR Revalidation for Global Stats
**What:** Export `revalidate` constant so stats update on a schedule rather than per-request.
**When to use:** Stats that change infrequently (contractor approvals happen occasionally, not per-second). Avoids a Supabase round-trip on every homepage visit.
**Example:**
```typescript
// At top of page.tsx — revalidate every hour
export const revalidate = 3600
```

### Pattern 5: CTA Button Order (Apply Primary, Browse Secondary)
**What:** Swap the existing button order. Apply gets amber fill; Browse gets ghost/outline.
**Existing patterns to follow:**
```typescript
// Primary (amber fill) — matches bottom CTA and existing amber button pattern
<Link
  href="/apply"
  className="w-full rounded-md bg-amber-500 px-6 py-3 text-base font-semibold text-slate-950 hover:bg-amber-400 transition-colors sm:w-auto"
>
  Apply as a Contractor
</Link>

// Secondary (ghost/outline) — matches existing Browse button (just swap roles)
<Link
  href="/contractors"
  className="w-full rounded-md border border-slate-700 px-6 py-3 text-base font-semibold text-slate-100 hover:border-slate-500 transition-colors sm:w-auto"
>
  Browse Directory
</Link>
```

### Pattern 6: Stat Row Display
**What:** A compact inline row of 3 numbers below the CTAs. Understated — small text, separator dots or middot, no large number treatment.
**Example:**
```typescript
<p className="mt-6 text-sm text-slate-500">
  {approvedCount ?? 0} verified contractors
  {' · '}
  {distinctTrades} trades
  {' · '}
  {applicationsCount ?? 0} applications reviewed
</p>
```

### Anti-Patterns to Avoid
- **`dynamic = 'force-dynamic'`:** Not needed here — stats are global, not user-specific. Adding it disables ISR and causes per-request Supabase calls unnecessarily.
- **Client component for stats:** No reason to use `'use client'` — all data is available at server render time.
- **Fabricated numbers:** Never hardcode or pad stat numbers. Show real counts including zero.
- **Separate loading state for stats:** The page is a server component — no Suspense/skeleton needed for the stat row. Stats render with the page.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Row count | JS fetch-all then `.length` | `select('*', { count: 'exact', head: true })` | Returns count in response header, no data transferred |
| Distinct values | SQL window function or raw query | JS `Set` on a small column fetch | Dataset is tiny (few hundred contractors max); Set is readable and correct |
| Stats refresh | WebSocket or polling client | ISR `revalidate` constant | Stats update hourly automatically; zero client JS needed |

**Key insight:** Every problem in this phase has a built-in solution in the existing stack. No new libraries, no client-side state, no API routes needed.

---

## Common Pitfalls

### Pitfall 1: `count` Returns `null` Not `0`
**What goes wrong:** `count` from Supabase is typed as `number | null`. Rendering it directly as `{count}` outputs nothing when null (e.g., if the table is empty or RLS blocks the query).
**Why it happens:** Supabase returns null on empty result or error rather than 0.
**How to avoid:** Always fallback: `{approvedCount ?? 0}`.
**Warning signs:** Stats row appears blank in early seeding when counts are 0.

### Pitfall 2: `server-only` Import Cascade
**What goes wrong:** If a helper file imports `getSupabaseAdmin()` and that helper is ever accidentally imported in a client component, the build fails with a cryptic error.
**Why it happens:** `server-only` throws at import time. The error message points to the wrong place.
**How to avoid:** Keep DB queries inline in the page component OR put them in a clearly-named `lib/homepage-stats.server.ts` file that also imports `server-only`.
**Warning signs:** Build error mentioning `server-only` when you haven't changed the admin client.

### Pitfall 3: Above-the-Fold Stats on Small Screens
**What goes wrong:** Hero section with badge + headline + subhead + two CTAs + stat row may push the stat row below the fold on very small viewports (375px × 667px — iPhone SE).
**Why it happens:** The hero uses `py-24` (96px top/bottom padding). With all elements stacked, total height can exceed 600px.
**How to avoid:** Reduce hero padding on mobile: `py-16 sm:py-24`. Verify in browser at 375×667 that stat row is visible without scrolling.
**Warning signs:** Stat row is not visible in mobile preview without scrolling.

### Pitfall 4: CTA Tap Target at 375px
**What goes wrong:** Buttons at `px-6 py-3` are fine on desktop but on mobile with `w-full` they're wide enough — the existing `w-full sm:w-auto` pattern already handles this correctly.
**Why it happens:** This is already handled correctly in the existing code for the stacked mobile layout. HOME-03 is satisfied by preserving `w-full` on mobile.
**How to avoid:** Do not remove `w-full` from the mobile CTA classes. Keep the `flex-col sm:flex-row` layout.
**Warning signs:** Buttons side-by-side on mobile with `sm:w-auto` applied at wrong breakpoint.

### Pitfall 5: "How it Works" Copy Tone
**What goes wrong:** Generic contractor-finding copy ("Find the right contractor for your project") mixes contractor-first framing with homeowner framing, confusing the primary audience.
**Why it happens:** Existing steps 01-03 are written from a homeowner perspective ("find & connect" implies searching, not joining).
**How to avoid:** Each step must speak to a tradesperson applying: "Submit your credentials → Get verified by our team → Find and connect with subs." The actor in every step is the tradesperson reading it.
**Warning signs:** Any step that implies "you" are looking for a contractor to hire (rather than joining as one).

---

## Code Examples

Verified patterns from the existing codebase:

### Full Async Page with Stats
```typescript
// app/page.tsx — after changes
import Link from 'next/link'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const revalidate = 3600  // revalidate stats hourly

const TRADES = ['Welding', 'HVAC', 'Electrical', 'Plumbing', 'General Contractor']

export default async function HomePage() {
  const admin = getSupabaseAdmin()

  const [
    { count: approvedCount },
    { data: tradesData },
    { count: applicationsCount },
  ] = await Promise.all([
    admin
      .from('contractors')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved'),
    admin
      .from('contractors')
      .select('trade')
      .eq('status', 'approved'),
    admin
      .from('applications')
      .select('*', { count: 'exact', head: true }),
  ])

  const distinctTrades = new Set((tradesData ?? []).map((r) => r.trade)).size

  return (
    <div>
      {/* Hero */}
      <section className="bg-slate-900 px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm text-amber-400">
            Verified contractors only — no spam, no unqualified applicants
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl lg:text-6xl">
            {/* Claude's discretion — contractor-first headline */}
            The verified network for{' '}
            <span className="text-amber-500">serious tradespeople</span>
          </h1>
          <p className="mt-6 text-lg text-slate-400">
            {/* Claude's discretion — subhead */}
            Apply, get verified, and connect with credentialed subs in your trade.
            No spam. No unqualified people. Just vetted professionals.
          </p>

          {/* CTAs — Apply is primary */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/apply"
              className="w-full rounded-md bg-amber-500 px-6 py-3 text-base font-semibold text-slate-950 hover:bg-amber-400 transition-colors sm:w-auto"
            >
              Apply as a Contractor
            </Link>
            <Link
              href="/contractors"
              className="w-full rounded-md border border-slate-700 px-6 py-3 text-base font-semibold text-slate-100 hover:border-slate-500 transition-colors sm:w-auto"
            >
              Browse Directory
            </Link>
          </div>

          {/* Live stats row */}
          <p className="mt-6 text-sm text-slate-500">
            {approvedCount ?? 0} verified contractors
            {' · '}
            {distinctTrades} trades
            {' · '}
            {applicationsCount ?? 0} applications reviewed
          </p>
        </div>
      </section>

      {/* Browse by Trade — leave as-is */}
      {/* How it Works — copy updated, structure unchanged */}
      {/* Bottom CTA — leave as-is */}
    </div>
  )
}
```

### "How it Works" Updated Copy (contractor-first)
```
01 — Submit your credentials
     Upload your trade certifications, license, and proof of insurance for manual review.

02 — Get verified
     Our team reviews your documents. Qualified tradespeople get approved. No shortcuts.

03 — Find subs and connect
     Browse the directory, filter by trade and location, and reach out directly to credentialed subs.
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static homepage (no data) | Async server component with DB queries | This phase | Stats render with the page, no client JS needed |
| "Browse Directory" as primary CTA | "Apply as a Contractor" as primary CTA | This phase | Aligns with B2B-first mission |
| Generic visitor copy | Contractor-first copy | This phase | Speaks to tradespeople, not homeowners |

**Deprecated/outdated:**
- Hardcoded or placeholder stat numbers: replaced by real DB counts regardless of size.

---

## Open Questions

1. **`revalidate` vs `force-dynamic` for stats**
   - What we know: `revalidate = 3600` gives hourly fresh stats with ISR. `force-dynamic` gives per-request fresh stats at higher latency cost.
   - What's unclear: How frequently will stats change in early operation? During founding cohort seeding, changes happen daily not hourly.
   - Recommendation: Use `revalidate = 3600` (hourly). Stats do not need to be real-time. If faster updates are ever needed, change to a shorter interval.

2. **Total applications count: all statuses or submitted-only?**
   - What we know: Applications have `status` of `pending | approved | rejected`. The CONTEXT.md says "total applications reviewed" which implies all statuses.
   - What's unclear: Whether "reviewed" means submitted-only or all-statuses.
   - Recommendation: Count all applications (all statuses). Every submitted application was reviewed. This gives the highest honest number and is accurate.

3. **Mobile above-the-fold for stats**
   - What we know: Hero has `py-24` padding. On 375×667 (iPhone SE), the full hero content may push stats below the fold.
   - What's unclear: Exact pixel height with all content rendered.
   - Recommendation: Reduce to `py-16 sm:py-24`. Planner should include a verification step to confirm stat row is visible at 375px without scrolling.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — no jest.config, vitest.config, or test files found |
| Config file | None — Wave 0 gap |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HOME-01 | Hero contains "Apply as a Contractor" as primary amber CTA above "Browse Directory" | manual-only | Visual inspection at `/` | N/A |
| HOME-02 | Stats row shows real numbers (not zeros from a broken query) | manual-only | Check DB and compare rendered numbers | N/A |
| HOME-03 | CTA buttons are full-width and tappable at 375px viewport | manual-only | Browser DevTools responsive mode at 375×667 | N/A |

**Justification for manual-only:** This project has no test infrastructure. All three requirements are UI/visual in nature — they are best verified by visual inspection and DevTools responsive mode. Setting up a test framework (jest-dom, playwright) for three UI assertions would add disproportionate overhead for a single-file change.

### Sampling Rate
- **Per task commit:** Visual check in `npm run dev` at 375px and desktop
- **Per wave merge:** Full homepage review (all 4 sections visible, stats populated, CTAs correct)
- **Phase gate:** All three HOME requirements verified before `/gsd:verify-work`

### Wave 0 Gaps
- No test framework installed — all validation is manual inspection for this phase
- Recommend: `npm run build` passes (no TypeScript errors) as the automated gate

---

## Sources

### Primary (HIGH confidence)
- Direct codebase reading of `app/page.tsx`, `lib/supabase-admin.ts`, `app/explore/page.tsx`, `app/admin/actions.ts`, `lib/types.ts`
- Existing patterns confirmed from multiple files in the same project
- CONTEXT.md decisions reviewed verbatim

### Secondary (MEDIUM confidence)
- Supabase JS count API (`select('*', { count: 'exact', head: true })`) — established pattern in Supabase JS client documentation, consistent with Supabase v2

### Tertiary (LOW confidence)
- None — all findings derived from direct codebase inspection and established project patterns

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in use, no new dependencies
- Architecture: HIGH — async server component pattern confirmed in explore/page.tsx and admin pages
- Pitfalls: HIGH — derived from direct code reading and established project patterns (null count, server-only, mobile padding)

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (stable stack — Next.js 14 + Supabase JS patterns are stable)
