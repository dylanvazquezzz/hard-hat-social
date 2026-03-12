---
id: M001/S05
parent: M001
milestone: M001
provides:
  - Drywall in apply form trade dropdown + specialties + credential notes
  - Drywall in /contractors trade filter
  - Drywall in homepage Browse by Trade
requires:
  - slice: M001/S01
    provides: deploy script
affects:
  - M001/S06
key_files:
  - app/apply/page.tsx
  - components/SearchFilters.tsx
  - app/page.tsx
key_decisions:
  - No DB migration needed — trade is a free text field; adding Drywall is purely a UI constants change
  - lib/types.ts trade field is string not a union type — no type change needed
  - Drywall specialties: New Construction, Remodeling, Commercial, Residential, Taping & Finishing, Texture, Acoustic Ceilings
  - Drywall verification: state contractor license + proof of general liability insurance (consistent with TRADE-04 spec)
patterns_established: []
observability_surfaces:
  - "apply/page.tsx — Drywall in TRADES array, SPECIALTIES_BY_TRADE, and CREDENTIAL_NOTES"
  - "SearchFilters.tsx — Drywall in TRADES array"
  - "page.tsx — Drywall in TRADES array (Browse by Trade grid)"
duration: 10min
verification_result: passed
completed_at: 2026-03-12
---

# M001/S05: Drywall Trade

**Added Drywall as a fully supported trade across the apply form, directory filter, and homepage Browse by Trade — no DB migration required.**

## What Happened

Single task — updated the TRADES constant in three files and added Drywall entries to SPECIALTIES_BY_TRADE and CREDENTIAL_NOTES in the apply form.

- `app/apply/page.tsx` — Drywall added to TRADES dropdown; specialties list (7 options); credential notes (state license + GL insurance per TRADE-04)
- `components/SearchFilters.tsx` — Drywall added to TRADES filter list
- `app/page.tsx` — Drywall added to TRADES Browse by Trade grid (now 6 cards, grid adjusts via `lg:grid-cols-5` — Drywall wraps on a 6th cell)

No DB migration needed — `trade` is stored as free text.

## Verification

- `npm run build` — ✅ zero errors
- `grep Drywall` across all 3 files — ✅ present in TRADES, SPECIALTIES_BY_TRADE, CREDENTIAL_NOTES
- `deploy.sh` — ✅ pushed to production

## Requirements Advanced

- **TRADE-01** — Drywall selectable on application form
- **TRADE-02** — Drywall in /contractors trade filter
- **TRADE-03** — Drywall in Browse by Trade on homepage
- **TRADE-04** — Drywall verification requirements: state contractor license + GL insurance

## Requirements Validated

- **TRADE-01 through TRADE-04** — All validated by code presence and build pass

## New Requirements Surfaced

- None

## Requirements Invalidated or Re-scoped

- None

## Deviations

- Browse by Trade grid is `lg:grid-cols-5` — with 6 trades, Drywall wraps to a second row on large screens. Could change to `lg:grid-cols-6` but current layout is acceptable and S06 will redesign the homepage anyway.

## Known Limitations

- Homepage Browse by Trade grid layout: 5-column grid means Drywall wraps. S06 hero redesign should address this.

## Follow-ups

- S06 may want to adjust the Browse by Trade grid columns now that there are 6 trades

## Files Created/Modified

- `app/apply/page.tsx` — Drywall in TRADES, SPECIALTIES_BY_TRADE, CREDENTIAL_NOTES
- `components/SearchFilters.tsx` — Drywall in TRADES
- `app/page.tsx` — Drywall in TRADES (Browse by Trade)

## Forward Intelligence

### What the next slice should know
- There are now 6 trades — the Browse by Trade grid in page.tsx is still lg:grid-cols-5; S06 should switch to lg:grid-cols-6 or 3+3 layout when redesigning the homepage
- CreateJobForm also has a TRADES constant (already includes Drywall from S03)
