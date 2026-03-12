---
id: M001/S04
parent: M001
milestone: M001
provides:
  - Recent Contacts section in SubSelectorModal — up to 5 previously hired contractors shown first
  - Full contractor search preserved below Recent Contacts
  - No section rendered when GC has no hire history
requires:
  - slice: M001/S01
    provides: deploy script
key_files:
  - components/SubSelectorModal.tsx
key_decisions:
  - Recent contacts resolved via two-step query: jobs table → hired_contractor_ids, then contractors table IN — PostgREST doesn't support joins with dedup/DISTINCT ON
  - Over-fetch 20 jobs then deduplicate in JS to get 5 distinct contractor IDs — avoids multiple round-trips per contractor
  - Re-sort contractor results by hired_at recency after IN fetch — Supabase IN doesn't preserve order
  - ContractorButton extracted as inner component — avoids JSX duplication between Recent Contacts and All Contractors lists
  - max-h-60 on search list (was max-h-72) — reduced to keep modal height reasonable when Recent Contacts section is present
patterns_established:
  - "Dedup + re-sort pattern: over-fetch ordered IDs, deduplicate in JS, fetch details by IN, re-sort to match original order"
observability_surfaces:
  - "Modal opens: Recent Contacts section visible above search input when GC has prior hires"
  - "No history: section is absent entirely — no empty state header"
duration: 20min
verification_result: passed
completed_at: 2026-03-12
---

# M001/S04: GC Recent Contacts

**Added a Recent Contacts section to the Mark Hired modal — up to 5 previously hired contractors appear at the top for 2-click repeat hiring, with full search unchanged below.**

## What Happened

**T01 — Recent contacts query:** On modal open, after fetching the current user's contractor record, queries `jobs` for all rows where `gc_contractor_id = currentGcId AND hired_contractor_id IS NOT NULL`, ordered by `hired_at DESC`, limit 20. Over-fetches to allow JS deduplication down to 5 distinct `hired_contractor_id` values. Then fetches contractor details (`id, full_name, trade, location_city, location_state`) via `.in('id', distinctIds)` and re-sorts the results to match hired_at recency order (Supabase IN doesn't guarantee order).

**T02 — Render Recent Contacts:** When `recentContacts.length > 0`, renders a labeled "Recent Contacts" section above the search input with each contact as a selectable button. A horizontal rule and "All Contractors" label divide the sections. When no prior hires exist, the section is absent — no empty state noise. `ContractorButton` is extracted as a shared inner component used by both lists to avoid JSX duplication. The search list's `max-h` was trimmed from `max-h-72` to `max-h-60` so the modal fits in viewport when the Recent Contacts section is present.

No DB migration needed — queries entirely on existing `jobs` and `contractors` tables.

## Verification

- `npm run build` — ✅ zero errors
- `deploy.sh` — ✅ build passed, committed, pushed to origin master

## Requirements Advanced

- **JOBS-08** — Recent Contacts (up to 5) shown at top of Mark Hired modal
- **JOBS-09** — Full contractor search preserved below Recent Contacts

## Requirements Validated

- **JOBS-08** — Implemented: over-fetch → dedup → re-sort → render; empty case skips section entirely
- **JOBS-09** — Search input and full contractor list unchanged below the divider

## New Requirements Surfaced

- None

## Requirements Invalidated or Re-scoped

- None

## Deviations

None from plan.

## Known Limitations

- Recent Contacts only appears for GCs who have used the Mark Hired flow — contractors hired outside the platform won't appear. This is expected and correct.
- If a previously hired contractor's account is deactivated/rejected, they'll be filtered out by `.eq('status', 'approved')` on the contractor fetch and won't appear. Correct behavior.

## Follow-ups

- Live smoke test: hire a contractor on a job, open Mark Hired on a second job — confirm that contractor appears under Recent Contacts

## Files Created/Modified

- `components/SubSelectorModal.tsx` — Recent Contacts section added; ContractorButton inner component; modal layout adjusted

## Forward Intelligence

### What the next slice should know
- SubSelectorModal is complete for S04/S05 scope — S05 (Drywall) doesn't touch this file
- The dedup + re-sort pattern (over-fetch → JS dedup → IN fetch → re-sort) is the standard approach for "ordered distinct by FK" queries in PostgREST

### What's fragile
- Recent Contacts depends on `hired_at` being populated on jobs rows — if `markHired` ever fails to set `hired_at`, the ordering is undefined but functionality still works
