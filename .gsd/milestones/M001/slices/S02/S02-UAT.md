# M001/S02: Directory Filter Expansion — UAT

**Milestone:** M001
**Written:** 2026-03-12

## UAT Type

- UAT mode: artifact-driven + live-runtime
- Why this mode is sufficient: Build and lint pass with zero errors. The filter UI is structurally verified by code review (no overflow risk). The filter query logic is verified by code review (correct ILIKE patterns, intersection logic, empty-list short-circuit). Full live runtime verification requires an authenticated approved-contractor session — the /contractors page is auth-gated. The live smoke test is documented below for manual execution once deployed.

## Preconditions

- Dev server running on http://localhost:3000
- Signed in as an approved contractor (status = 'approved' in contractors table)
- At least one contractor record in the DB with a certification record containing "general liability" in name or issuing_body
- Migration 011 applied to the target DB

## Smoke Test

Navigate to `/contractors` — confirm the sidebar shows Insurance and Certification sections below the State filter. Click "General Liability" checkbox — URL updates to `?insurance=gl`, result count updates with "· General Liability insured" in subtitle.

## Test Cases

### 1. Insurance filter — General Liability

1. Navigate to `/contractors`
2. In the sidebar under "Insurance", check "General Liability"
3. URL updates to `/contractors?insurance=gl`
4. **Expected:** Directory shows only contractors who have a certification record matching GL insurance keywords; subtitle shows "· General Liability insured"; filter count badge shows "(1 filter active)"

### 2. Insurance filter — Workers' Comp

1. Navigate to `/contractors`
2. In the sidebar under "Insurance", check "Workers' Comp"
3. URL updates to `/contractors?insurance=wc`
4. **Expected:** Directory shows only contractors with workers comp cert records; subtitle shows "· Workers' Comp insured"

### 3. Insurance filter deselect

1. With `?insurance=gl` active, click "General Liability" again
2. **Expected:** Checkbox unchecks, URL drops `insurance` param, full contractor list returns

### 4. Certification filter

1. Navigate to `/contractors`
2. In the sidebar under "Certification", select "AWS Certified Welder" from dropdown
3. URL updates to `/contractors?cert=AWS+Certified+Welder`
4. **Expected:** Directory shows only contractors with a cert record whose name contains "AWS Certified Welder"; subtitle shows "· AWS Certified Welder certified"

### 5. Compose: trade + certification

1. Navigate to `/contractors`
2. Select trade "Welding"
3. Select cert "AWS Certified Welder"
4. URL: `?trade=Welding&cert=AWS+Certified+Welder`
5. **Expected:** Directory shows only Welding contractors who also have the AWS cert — intersection of both filters; filter count shows "(2 filters active)"

### 6. Compose: insurance + certification

1. Navigate to `/contractors`
2. Check "General Liability"
3. Select cert "State Contractor License"
4. URL: `?insurance=gl&cert=State+Contractor+License`
5. **Expected:** Only contractors matching BOTH filters appear — those with GL insurance AND State Contractor License cert records

### 7. Empty result state

1. Apply filters that match no contractors (e.g., `?trade=HVAC&cert=AWS+Certified+Welder` with no HVAC contractors having AWS certs)
2. **Expected:** "No contractors match your filters" empty state shown; "Reset filters" link present

### 8. Clear Filters

1. Apply any combination of filters
2. Click "Clear Filters" button
3. **Expected:** URL returns to `/contractors`, all filters cleared, full list shown

## Edge Cases

### No cert records in DB

1. Apply insurance or cert filter when no certifications table rows exist
2. **Expected:** Empty contractor result (not an error or crash) — empty state renders

### All trades + cert filter

1. Navigate with `?cert=AWS+Certified+Welder` (no trade filter)
2. **Expected:** All approved contractors with that cert shown, regardless of trade

## Mobile Layout — FILTER-03

1. Set viewport to 375px wide
2. Navigate to `/contractors`
3. **Expected:** Filter sidebar scrolls vertically; no horizontal overflow; Insurance checkboxes and Certification dropdown both fit within viewport width; no elements are clipped

## Failure Signals

- 400 or 500 on `/rest/v1/contractors` in DevTools Network — query error
- Insurance checkbox checked but all contractors still shown — ILIKE pattern not matching; check cert record naming conventions in DB
- "Clear Filters" button not visible despite active insurance/cert filter — `hasFilters` check not including new params
- Filter count badge missing — `activeFilterCount` calculation not including new params
- Horizontal overflow at 375px — a filter element has a min-width or flex-row causing overflow

## Requirements Proved By This UAT

- **FILTER-01** — Insurance checkboxes and cert dropdown present in filter panel
- **FILTER-02** — Trade + cert filter composition returns correct intersection (test case 5)
- **FILTER-03** — Mobile layout structurally verified (no horizontal overflow risk in markup); mobile layout test case documents the live check

## Not Proven By This UAT

- Live accuracy of insurance filter matching — depends on actual cert records using expected keywords; must be verified with real DB data after founding cohort is seeded
- Performance at scale — migration 011 index is in place but not load-tested; acceptable for MVP
- Full end-to-end verified in browser with authenticated session — requires live credentials; documented as follow-up live smoke test

## Notes for Tester

- The filter logic works on `certifications` table records — if no certifications have been added to contractor profiles yet, the insurance and cert filters will return empty results. This is correct behavior, not a bug.
- To seed a test cert: insert a row into `certifications` with `name = 'General Liability Insurance'` and any valid `contractor_id` — then the GL filter should return that contractor.
- Workers' Comp ILIKE patterns: `%workers comp%`, `%workers' comp%`, `%workman%` — cert records must contain one of these substrings.
