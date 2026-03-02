# Phase 4: Homepage Redesign - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Targeted improvements to the existing homepage (`app/page.tsx`): fix CTA hierarchy to put Apply first, add a live social proof row with real DB counts, and update copy to speak contractor-first. Keep the existing 4-section structure. No new pages.

</domain>

<decisions>
## Implementation Decisions

### Audience and primary CTA
- Primary audience: **contractors wanting to join the network** (B2B is the primary focus)
- Primary CTA: **"Apply as a Contractor"** — amber filled button, most visually prominent
- Secondary CTA: **"Browse Directory"** — outlined/ghost button, stays in the hero above the fold
- Both CTAs remain visible above the fold; Apply leads visually

### Hero headline
- Claude's discretion — write a contractor-first headline that:
  - Speaks directly to tradespeople (welders, HVAC techs, etc.)
  - Foregrounds "verified only" as the differentiator vs Angi/Thumbtack
  - Makes the value clear without scrolling (HOME-01 success criteria)

### Social proof stats
- Show 3 live stats: approved contractor count, distinct trades represented, total applications reviewed
- Placement: below the CTA buttons in the hero section, still above the fold on most screens
- Query the DB at page load (server component — no loading state needed)
- Display real numbers regardless of how small they are — no minimums, no hiding
- No fake or placeholder numbers under any circumstances

### Redesign scope
- Targeted improvements only — keep the 4-section structure (hero, browse by trade, how it works, bottom CTA)
- "How it works" copy updated to be contractor-focused: steps speak to a tradesperson joining (submit credentials → get verified → find and connect with subs)
- Browse by Trade section: leave as-is
- Bottom CTA section: leave as-is

### Claude's Discretion
- Exact headline and subhead copy (contractor-first framing)
- How to display the 3-stat row (label formatting, separator style)
- Whether DB queries are in the page component or extracted to a data-fetching helper
- Mobile layout verification for the CTA buttons (HOME-03)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/page.tsx`: 4-section static page, no data fetching today — needs DB queries added
- `getSupabaseAdmin()` from `lib/supabase-admin.ts` — already used in other server components for data fetching

### Established Patterns
- Server components use `getSupabaseAdmin()` at the top of the component for data access
- CTA buttons use `className="rounded-md bg-amber-500..."` pattern — keep consistent
- Page is currently a static server component (no `dynamic = 'force-dynamic'` needed unless queries are user-specific — these stats are global)

### Integration Points
- `contractors` table: `status = 'approved'` count and `distinct trade` count
- `applications` table: total count (all statuses, or just submitted?)
- Stats row sits inside the existing hero `<section>` just below the CTA buttons

</code_context>

<specifics>
## Specific Ideas

- The current amber badge in the hero ("Verified contractors only — no spam, no unqualified applicants") is good — keep or build on it
- Stats should feel credible and understated, not boastful: "12 verified contractors · 4 trades · 30 applications reviewed" in small text rather than a big splashy number treatment
- "Tradespeople first" — design should feel right for a welder, not a tech startup

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-homepage-redesign*
*Context gathered: 2026-03-01*
