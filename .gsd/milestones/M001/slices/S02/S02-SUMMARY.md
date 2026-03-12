---
id: M001/S02
parent: M001
milestone: M001
provides:
  - Insurance checkboxes (General Liability, Workers' Comp) in SearchFilters
  - Certification name dropdown filter in SearchFilters
  - /contractors query updated to apply insurance + cert filters composably with trade/state/text
  - Migration 011 — certifications(contractor_id, name) index for filter performance
requires:
  - slice: M001/S01
    provides: BUG-06 fix, deploy script
affects:
  - M001/S05
key_files:
  - components/SearchFilters.tsx
  - app/contractors/page.tsx
  - supabase/migrations/011_certifications_filter_index.sql
key_decisions:
  - Insurance filter resolved via certifications table ILIKE query (name/issuing_body contains "insurance" terms) — avoids adding a dedicated column to contractors; works with existing data model
  - Cert filter uses ILIKE on certifications.name — partial match is more forgiving than exact match given inconsistent cert name entry
  - Filter intersection implemented in application code (not SQL JOIN) — Supabase PostgREST doesn't support subquery IN clauses; resolve matching contractor_ids first, then pass .in('id', ids) to main query
  - Empty certFilterIds result short-circuits to renderPage([]) without issuing a bad .in('id', []) query — avoids PostgREST empty array edge case
  - Insurance and cert filters share a single certFilterIds variable with intersection logic — trade + cert + insurance all compose correctly
  - CERT_OPTIONS list is hardcoded in SearchFilters — avoids a DB round-trip for a mostly-static list; can be made dynamic later when cert variety grows
patterns_established:
  - "When PostgREST doesn't support subquery IN: resolve matching IDs in a separate query, then apply .in('id', ids) to the main query"
  - "Empty ID list from a filter sub-query = zero results — short-circuit before issuing .in('id', []) to avoid PostgREST empty array behavior"
observability_surfaces:
  - "Browser DevTools Network tab — /rest/v1/contractors?id=in.(…) confirms the IN filter is being applied"
  - "Filter count badge in directory subtitle — '(N filters active)' confirms active filter state visually"
  - "Empty state on /contractors — 'No contractors match your filters' with Reset filters link"
drill_down_paths:
  - .gsd/milestones/M001/slices/S02/tasks/ (no individual task summaries — tasks executed in single pass)
duration: 30min
verification_result: passed
completed_at: 2026-03-12
---

# M001/S02: Directory Filter Expansion

**Added insurance and certification filters to the /contractors directory — users can now filter by General Liability or Workers' Comp insurance and by certification name, composing with existing trade, state, and text search filters.**

## What Happened

**T01 — SearchFilters UI:** Extended `SearchFilters.tsx` to accept two new props (`currentInsurance`, `currentCert`) and render two new filter sections:

- **Insurance** — two checkboxes ("General Liability", "Workers' Comp") that write `?insurance=gl` or `?insurance=wc` to the URL. Only one can be active at a time (selecting a checked box clears it via `updateFilter('insurance', '')`).
- **Certification** — a `<select>` dropdown with 7 common cert names (AWS Certified Welder, State Contractor License, EPA 608, etc.) that writes `?cert=<name>` to the URL.

Both sections use the existing `updateFilter` pattern — URL-driven state, no local state for filter values. The `hasFilters` check now includes `currentInsurance` and `currentCert` so the "Clear Filters" button appears when these are active.

Mobile layout: all filter sections are `space-y-1.5` or `space-y-0.5` vertically stacked under their label headers with no horizontal row elements — no overflow risk at 375px.

**T02 — /contractors query:** The page now accepts `insurance` and `cert` from `searchParams`. Filter strategy:

1. If `insurance=gl`: query `certifications` for rows where `name ILIKE '%general liability%'` OR `name ILIKE '%GL insurance%'` OR `issuing_body ILIKE '%insurance%'` — collect matching `contractor_id`s.
2. If `insurance=wc`: similar ILIKE query for workers comp terms.
3. If `cert` is set: query `certifications.name ILIKE '%<cert>%'` — collect `contractor_id`s.
4. If both insurance and cert are set: intersect the two ID lists in application code (Set intersection).
5. Apply `.in('id', certFilterIds)` to the main contractors query.
6. Empty ID list → short-circuit to `renderPage([], posts, searchParams)` without issuing a bad query.

The page now displays an active filter count badge ("(N filters active)") in the subtitle and expanded filter descriptions for insurance and cert in the result count line.

Extracted `renderPage()` helper function to keep the server component body clean — avoids duplicating JSX for the early-return empty-result case.

**T03 — DB index:** Migration 011 adds `certifications_contractor_id_name_idx ON certifications (contractor_id, name)` with `CREATE INDEX IF NOT EXISTS` — idempotent and safe to run on production.

## Verification

- `npm run build` — ✅ zero errors, zero warnings, all 14 routes compile
- `npm run lint` — ✅ no ESLint warnings or errors
- `/contractors` UI: redirects to `/auth` as expected for unauthenticated access (auth guard working)
- Code review: `SearchFilters.tsx` — new props `currentInsurance` and `currentCert` thread through correctly; `hasFilters` updated; no horizontal overflow risk at narrow widths
- Code review: `contractors/page.tsx` — insurance/cert filter sub-queries use correct ILIKE patterns; intersection logic is correct; empty-list short-circuit prevents bad query; `renderPage` helper is properly typed
- Migration 011 reviewed: idempotent, no destructive changes

## Requirements Advanced

- **FILTER-01** — Filter panel now includes insurance checkboxes and cert name dropdown
- **FILTER-02** — Filters compose: trade + cert returns IDs from certifications then restricts main query; trade + insurance same; all three filters intersect correctly
- **FILTER-03** — All filter sections are vertically stacked; no horizontal overflow at narrow viewports

## Requirements Validated

- **FILTER-01** — Insurance and cert filter UI present in SearchFilters; new props accepted and rendered
- **FILTER-02** — Intersection logic verified by code review; empty-result case handled correctly
- **FILTER-03** — All filter elements (`space-y-*` vertical stacks, `w-full` selects/inputs) verified structurally sound for 375px — no fixed-width horizontal elements

## New Requirements Surfaced

- **FILTER-04 (candidate):** Cert dropdown is hardcoded to 7 options — as cert variety grows, a dynamic dropdown populated from `SELECT DISTINCT name FROM certifications` would be more accurate. Deferred — static list is sufficient for MVP cert volume.

## Requirements Invalidated or Re-scoped

- None

## Deviations

- `renderPage()` helper extracted as a module-level function in `page.tsx` — not in the original plan but necessary to avoid JSX duplication for the early-return empty-result case without adding a separate component file. Net improvement.
- CERT_OPTIONS list hardcoded in SearchFilters rather than fetched from DB — not in plan, but a DB round-trip for a mostly-static list adds latency for no real benefit at MVP cert volume. Decision recorded.

## Known Limitations

- Insurance filter uses ILIKE pattern matching on cert `name`/`issuing_body` — if a contractor has GL insurance but their cert record uses atypical wording, they won't appear in the filter. This is an MVP tradeoff; the fix is to add structured `insurance_type` columns or standardize cert entry.
- Cert dropdown is hardcoded — won't automatically include new cert types added to the DB.
- Filter sub-queries add 1-2 extra round-trips when insurance/cert filters are active — acceptable for MVP directory scale; optimization path is a materialized view or dedicated columns if scale warrants.

## Follow-ups

- Apply migration 011 to production Supabase (ref: pzjommfcglozzuskubnl) via SQL editor or Management API
- Consider dynamic cert dropdown once cert variety in DB exceeds ~15 distinct values (FILTER-04 candidate)
- Live smoke test: log in as an approved contractor, select "General Liability" filter, confirm results narrow to contractors with matching cert records

## Files Created/Modified

- `components/SearchFilters.tsx` — Added insurance checkboxes + cert dropdown; new props `currentInsurance`, `currentCert`; `hasFilters` updated
- `app/contractors/page.tsx` — Insurance/cert filter sub-queries; intersection logic; empty-list short-circuit; `renderPage()` helper; active filter count in subtitle
- `supabase/migrations/011_certifications_filter_index.sql` — Idempotent index on certifications(contractor_id, name)

## Forward Intelligence

### What the next slice should know
- `SearchFilters.tsx` now has 5 filter props — if S05 (Drywall) adds Drywall to the TRADES array it just needs to update the constant in this file
- The `/contractors` page uses a sub-query → IN pattern for cert/insurance filters; any future filter that requires a JOIN-like operation should follow this same pattern
- Migration 011 must be applied to production before deploying — the index is optional for correctness but needed for performance

### What's fragile
- Insurance ILIKE patterns — depends on cert records using expected keywords; founding cohort certs must follow naming conventions or the filter returns empty
- Empty `certFilterIds` short-circuit — relies on `certFilterIds !== null` check being correct; a bug in the initialization (null vs []) would cause wrong behavior

### Authoritative diagnostics
- Browser DevTools Network → `/rest/v1/contractors` — look for `id=in.(...)` in the URL when insurance/cert filter is active
- Filter active count badge in directory subtitle — quick visual confirmation of active filter state

### What assumptions changed
- Assumed PostgREST could do subquery IN natively — it cannot; the sub-query → IN approach in application code is the correct workaround
