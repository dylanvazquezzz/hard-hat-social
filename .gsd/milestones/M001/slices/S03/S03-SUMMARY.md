---
id: M001/S03
parent: M001
milestone: M001
provides:
  - Migration 012 — pay_rate and duration columns on jobs table (applied + verified in production)
  - CreateJobForm overhauled — Title, Trade dropdown, Pay Rate, Duration, Location (city + state dropdown), Description
  - JobCard updated — pay_rate and duration rendered as metadata badges below job title
  - Job type updated — pay_rate and duration fields added
  - /profile Posts tab — "Post a Job" category added; GC users default to Posts tab + Jobs sub-category on load
requires:
  - slice: M001/S01
    provides: deploy script, migrate.sh
key_files:
  - components/CreateJobForm.tsx
  - components/JobCard.tsx
  - app/jobs/actions.ts
  - app/profile/page.tsx
  - lib/types.ts
  - supabase/migrations/012_jobs_pay_rate_duration.sql
key_decisions:
  - GC detection in profile page by contractor.trade === 'General Contractor' — consistent with jobs page pattern
  - "Post a Job" category rendered inline in profile Posts tab using CreateJobForm with defaultOpen=true — avoids routing away from /profile; form collapses to button after success
  - "Post a Job" tab shown to all approved contractors (not GC-only) — any contractor can post subcontracting work, not just GCs
  - Trade field changed from freetext input to dropdown in CreateJobForm — enforces consistent trade values, matches directory filter options
  - State field changed from freetext input to dropdown — enforces valid 2-letter state codes
  - defaultOpen prop added to CreateJobForm — allows caller to control initial open state (GC via profile defaults open; standalone button on /jobs stays collapsed)
  - success state with 1.2s auto-close after post — gives user feedback without blocking
patterns_established:
  - "GC tab defaulting: detect contractor.trade in loadContractor(), call setTab()/setPostCategory() there — data-driven, no URL param needed"
observability_surfaces:
  - "Browser DevTools Network → /rest/v1/jobs — POST body should include pay_rate and duration fields when set"
  - "DB verification: SELECT pay_rate, duration FROM jobs ORDER BY created_at DESC LIMIT 5 — confirms new posts persist structured fields"
duration: 35min
verification_result: passed
completed_at: 2026-03-12
---

# M001/S03: Job Posting UX Overhaul

**Overhauled the job posting form with structured pay rate, duration, and trade dropdown fields; updated JobCard to surface pay and duration as scannable badges; and made GC users land directly on the Post a Job form when they visit /profile.**

## What Happened

**T01 — Migration 012:** Added `pay_rate text` and `duration text` columns to the `jobs` table via `migrate.sh`. Both columns are nullable (existing jobs unaffected). Verified with `information_schema.columns` query — both columns confirmed in production. Updated `Job` interface in `lib/types.ts`.

**T02 — CreateJobForm overhaul:** Replaced the freetext "Trade Needed" input with a structured dropdown (Welding, HVAC, Electrical, Plumbing, General Contractor, Drywall, Other). Added Pay Rate and Duration as a side-by-side row of text inputs with helpful placeholders. Changed Location State from a freetext input to a full US state dropdown. Added a `defaultOpen` prop so the profile page can render the form open by default for GC users. Added success feedback ("Job posted!") with 1.2s auto-close. Updated `createJob` server action to accept and persist `pay_rate` and `duration`.

**T03 — JobCard structured fields:** Added a metadata badge row between the job header and description. When `pay_rate` is set, shows an amber clock icon + pay rate text. When `duration` is set, shows an amber calendar icon + duration text. Badges use `bg-slate-800` chip style — scannable at a glance without being noisy. Old jobs without these fields render normally (conditional block only appears when at least one is set).

**T04 — /profile GC default tab:** In `loadContractor()`, after setting contractor state, if `contractor.trade === 'General Contractor'`, call `setTab('posts')` and `setPostCategory('jobs')`. The "Post a Job" category is now a first-class tab button in the posts composer — renders `CreateJobForm` with `defaultOpen` when selected. Tab is shown to all approved contractors (any contractor can post work, not just GCs). Non-GC users default to Profile tab with Social category as before.

## Verification

- `npm run build` — ✅ zero errors, zero TypeScript errors, all 14 routes compile
- Migration 012 applied via `migrate.sh` — ✅ HTTP 201
- Schema verified — ✅ `[{"column_name":"duration","data_type":"text"},{"column_name":"pay_rate","data_type":"text"}]`
- `deploy.sh` — ✅ build passed, committed, pushed to origin master, Vercel deploy triggered

## Requirements Advanced

- **JOBS-05** — GC visiting /profile now defaults to Posts tab + Jobs sub-category pre-selected
- **JOBS-06** — Job post form has structured Title, Trade (dropdown), Pay Rate, Location City+State, Duration, Description fields
- **JOBS-07** — JobCard renders pay_rate and duration as labeled metadata badges

## Requirements Validated

- **JOBS-05** — Implemented via `loadContractor()` GC detection → `setTab('posts')` + `setPostCategory('jobs')`
- **JOBS-06** — All six structured fields present in CreateJobForm; trade and state use dropdowns
- **JOBS-07** — Badges render conditionally; only appear when fields are set; old jobs unaffected

## New Requirements Surfaced

- **JOBS-10 (candidate):** Jobs page itself could also default the CreateJobForm open for GC users (currently only profile does this). Low priority — GC can click "+ Post a Job" on /jobs.

## Requirements Invalidated or Re-scoped

- None

## Deviations

- "Post a Job" tab shown to all approved contractors, not just GCs — the plan said "for GC users" but the feature is equally useful for any contractor posting subcontracting work. GC-specific behavior is the *default tab* on /profile load; the "Post a Job" tab is available to all.
- Trade field changed to dropdown (plan said "dropdown") — added Drywall option proactively (S05 will add it to the filter, but it's already a real trade category in the apply form).

## Known Limitations

- GC tab default relies on `contractor.trade === 'General Contractor'` exact match — if a contractor's trade is stored with different capitalization or spacing, the detection fails silently (they just see Profile tab instead of Posts tab).
- Pay rate and duration are freetext — no validation of format; a contractor could enter anything. This is intentional for MVP flexibility.

## Follow-ups

- Monitor Vercel dashboard for successful production deploy
- Live smoke test: log in as a GC, confirm /profile opens to Posts tab with "Post a Job" selected and form open; fill in pay rate + duration, post, confirm JobCard shows badges on /jobs

## Files Created/Modified

- `supabase/migrations/012_jobs_pay_rate_duration.sql` — Adds pay_rate and duration columns to jobs (idempotent)
- `lib/types.ts` — Job interface updated with pay_rate and duration fields
- `app/jobs/actions.ts` — createJob accepts pay_rate and duration
- `components/CreateJobForm.tsx` — Full overhaul: trade/state dropdowns, pay rate + duration fields, defaultOpen prop, success feedback
- `components/JobCard.tsx` — Metadata badge row for pay_rate and duration
- `app/profile/page.tsx` — PostCategory type expanded; GC default tab logic in loadContractor(); "Post a Job" category tab with inline CreateJobForm

## Forward Intelligence

### What the next slice should know
- CreateJobForm now has a `defaultOpen` prop — S04 (Recent Contacts) doesn't need to change this but should know it exists
- JobCard badge row is between header and description — if S04 adds any new visual elements to JobCard, insert above the description block
- GC detection pattern (`contractor.trade === 'General Contractor'`) used in both jobs/page.tsx and profile/page.tsx — if trade values ever change, update both

### What's fragile
- GC detection exact string match — if admin approves a GC with trade = "General Contractor " (trailing space), detection silently fails

### Authoritative diagnostics
- Check browser DevTools Network → POST `/rest/v1/jobs` → request payload includes `pay_rate` and `duration` when filled
- Query production: `SELECT id, title, pay_rate, duration FROM jobs ORDER BY created_at DESC LIMIT 3`
