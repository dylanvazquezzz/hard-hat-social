---
id: M001
provides:
  - BUG-06 eliminated — 400 on applications queries removed from 3 files; migration 010 hardens production schema
  - scripts/deploy.sh — build-gated commit+push; Vercel auto-deploys on every master push
  - scripts/migrate.sh — Management API migration runner; all DB changes applied autonomously
  - /contractors filter panel — insurance (GL, WC) and cert name filters compose with trade/state/text
  - Migration 011 — certifications(contractor_id, name) index for filter performance
  - Job posting form overhauled — Title, Trade dropdown, Pay Rate, Duration, Location (city + state), Description
  - JobCard metadata badge row — pay_rate and duration displayed as scannable chips
  - Migration 012 — pay_rate and duration columns on jobs table (applied + verified in production)
  - GC profile default — /profile opens to Posts tab + Jobs sub-category for General Contractor users
  - Mark Hired modal — Recent Contacts section (up to 5 previously hired) above full contractor search
  - Drywall trade — selectable on apply form, filterable in directory, present in Browse by Trade
  - Homepage hero — full-bleed 4-panel B&W trade photo collage with dark gradient overlay
  - Browse by Trade — separated section with border-t divider, 6-column grid, per-trade SVG icons
  - Migrations 010–012 applied and verified in production Supabase (ref: pzjommfcglozzuskubnl)
key_decisions:
  - Applications queries use status-only filter; RLS scopes rows to current user — no user_id in PostgREST URL params
  - Sub-query → IN pattern for PostgREST JOIN-like operations — resolve matching IDs first, then .in('id', ids)
  - Empty certFilterIds short-circuits to zero results before issuing .in('id', []) — avoids PostgREST empty array edge case
  - Insurance filter via ILIKE on cert name/issuing_body — avoids schema change; depends on naming conventions
  - GC detection by contractor.trade === 'General Contractor' exact string match — consistent across jobs/page.tsx and profile/page.tsx
  - "Post a Job" tab available to all approved contractors, not GC-only — GC-specific behavior is only the auto-default on /profile
  - defaultOpen prop on CreateJobForm — caller controls initial expanded state
  - Recent contacts: over-fetch 20 ordered jobs → JS dedup to 5 distinct IDs → IN fetch → re-sort — PostgREST has no DISTINCT ON
  - Hero background: CSS background-image with Unsplash CDN URLs + grayscale/brightness-50 Tailwind classes — no next/image remotePatterns config needed
  - TRADE_ICONS constant maps trade name to SVG path — trade-specific icons without external icon library
  - Browse by Trade 6-column grid (lg:grid-cols-6) — accommodates all 6 trades including Drywall
  - Every migration is idempotent (IF NOT EXISTS, CREATE OR REPLACE, DROP POLICY IF EXISTS)
  - Deploy gates on npm run build success — broken code never reaches production
patterns_established:
  - "When RLS policy already scopes rows to current user, client queries must NOT include user_id in PostgREST URL params — RLS executes server-side; PostgREST validates columns at the HTTP layer"
  - "Sub-query → IN for PostgREST JOIN-like operations: resolve matching IDs in a separate query, apply .in('id', ids) to main query"
  - "Dedup + re-sort: over-fetch ordered IDs, deduplicate in JS, fetch details by IN, re-sort to match original order"
  - "Decorative background photos: CSS background-image with external URLs + grayscale/brightness Tailwind classes + dark overlay — no next/image config needed"
  - "Deploy workflow: npm run build → git add -A → git commit → git push origin master → Vercel auto-deploy"
observability_surfaces:
  - "Browser DevTools Network → /rest/v1/applications — 200 confirms BUG-06 fixed; 400 means PostgREST schema cache stale"
  - "Browser DevTools Network → /rest/v1/contractors?id=in.(...) — confirms cert/insurance IN filter applied"
  - "scripts/deploy.sh stdout — ❌ Build failed exits 1 before any git operations"
  - "scripts/migrate.sh — HTTP 201 + verification SELECT confirms migration landed"
  - "Vercel dashboard deployments — confirms push triggered auto-deploy and it succeeded"
  - "Supabase SQL editor — any migration 010-012 can be re-run safely (all idempotent)"
requirement_outcomes:
  - id: DEPLOY-01
    from_status: active
    to_status: validated
    proof: "scripts/deploy.sh created; gates on npm run build; commits and pushes to origin master; Vercel auto-deploy wired to master branch — verified by S01 T02 build + syntax check + deploy.sh run in CI"
  - id: BUG-06
    from_status: active
    to_status: validated
    proof: "Removed .eq('user_id', ...) from applications queries in 3 files (contractors/layout.tsx, jobs/layout.tsx, profile/page.tsx); RLS handles user isolation; migration 010 idempotently adds user_id column and rebuilds RLS policies — verified by npm run build pass + grep confirming no user_id filter on applications queries"
  - id: FILTER-01
    from_status: active
    to_status: validated
    proof: "SearchFilters.tsx extended with insurance checkboxes (GL, WC) and cert name dropdown; new props currentInsurance + currentCert thread through correctly — verified by npm run build pass + lint pass + code review"
  - id: FILTER-02
    from_status: active
    to_status: validated
    proof: "contractors/page.tsx implements sub-query → IN intersection: insurance and cert filters resolve contractor_id sets independently, intersect in JS, apply .in('id', ids) to main query — verified by code review of intersection logic and empty-list short-circuit"
  - id: FILTER-03
    from_status: active
    to_status: validated
    proof: "All filter UI elements use space-y-* vertical stacks and w-full selects — no fixed-width horizontal elements; verified by code review for 375px overflow risk"
  - id: JOBS-05
    from_status: active
    to_status: validated
    proof: "profile/page.tsx loadContractor() detects contractor.trade === 'General Contractor' and calls setTab('posts') + setPostCategory('jobs') — verified by npm run build pass and code review"
  - id: JOBS-06
    from_status: active
    to_status: validated
    proof: "CreateJobForm overhauled with Title, Trade dropdown (7 options incl. Drywall), Pay Rate, Duration, Location City + State dropdown, Description — verified by npm run build pass + code review of all 6 structured fields"
  - id: JOBS-07
    from_status: active
    to_status: validated
    proof: "JobCard renders pay_rate and duration as amber-icon metadata badges between header and description; conditional — only renders when at least one field is set — verified by npm run build pass + code review"
  - id: JOBS-08
    from_status: active
    to_status: validated
    proof: "SubSelectorModal queries jobs for hired_contractor_id IS NOT NULL, deduplicates to 5 distinct IDs, fetches contractor details, renders Recent Contacts section above search — verified by npm run build pass + code review of dedup logic"
  - id: JOBS-09
    from_status: active
    to_status: validated
    proof: "Search input and full contractor list remain unchanged below the Recent Contacts divider — verified by code review confirming search flow is unmodified"
  - id: TRADE-01
    from_status: active
    to_status: validated
    proof: "apply/page.tsx TRADES array, SPECIALTIES_BY_TRADE, and CREDENTIAL_NOTES all include Drywall — verified by grep and npm run build pass"
  - id: TRADE-02
    from_status: active
    to_status: validated
    proof: "SearchFilters.tsx TRADES array includes Drywall — verified by grep"
  - id: TRADE-03
    from_status: active
    to_status: validated
    proof: "page.tsx TRADES array includes Drywall in Browse by Trade grid — verified by grep"
  - id: TRADE-04
    from_status: active
    to_status: validated
    proof: "Drywall CREDENTIAL_NOTES in apply/page.tsx specify state contractor license + GL insurance — consistent with other trades' verification pattern"
  - id: HOME-01
    from_status: active
    to_status: validated
    proof: "page.tsx hero has 4-panel CSS grid with Unsplash B&W trade photos (welder, HVAC, electrician, drywall worker) using grayscale + brightness-50 Tailwind classes — verified by 7/7 browser assertions passing in S06 UAT"
  - id: HOME-02
    from_status: active
    to_status: validated
    proof: "Browse by Trade section has border-t border-slate-800 divider below hero — verified by 7/7 browser assertions and code review"
  - id: HOME-03
    from_status: active
    to_status: validated
    proof: "Dark gradient overlay (from-slate-950/80 via-slate-950/70 to-slate-950/90) covers photo collage; text assertions pass at all viewport sizes — verified by 7/7 browser assertions in S06 UAT"
  - id: HOME-04
    from_status: active
    to_status: validated
    proof: "375px browser assertions (3/3 PASS) in S06 UAT: all key content visible, 2-col photo grid, stacked CTAs — verified by mobile viewport assertions"
duration: ~2h total (S01: 25min, S02: 30min, S03: 35min, S04: 20min, S05: 10min, S06: 25min)
verification_result: passed
completed_at: 2026-03-12
---

# M001: v1.3 UX & Trade Expansion

**Shipped 6 slices that make the contractor experience meaningfully faster and more professional — directory filtering by insurance and cert, structured job posting with pay/duration fields, repeat-hire shortcuts in the Mark Hired modal, Drywall as a fully supported trade, and a B&W photo-collage homepage hero that makes Hard Hat Social look like a real platform.**

## What Happened

M001 rebuilt the day-to-day contractor UX across four product surfaces: directory discovery, job posting, the hiring flow, and the homepage first impression. The milestone started by clearing a critical infrastructure debt (S01) before expanding features slice by slice.

**S01 — Foundation:** A 400 Bad Request on every applications query was silently breaking the auth guards across the site. Root cause: PostgREST's schema cache hadn't registered the `user_id` column, so including it in the URL params caused a hard HTTP error — even though RLS was already scoping rows to the current user. The fix removed the redundant `user_id` filter from three files (contractors layout, jobs layout, profile page). Migration 010 idempotently rebuilt the column and RLS policies so production stayed in sync regardless of which prior migrations had run. `scripts/deploy.sh` and `scripts/migrate.sh` were shipped here — every subsequent slice used these tools to apply and verify DB changes and push code without manual steps.

**S02 — Directory filters:** Contractors can now filter by insurance coverage (General Liability, Workers' Comp) and certification name in addition to the existing trade/state/text filters. Because PostgREST doesn't support SQL subquery IN natively, the filter logic resolves matching `contractor_id` sets from the certifications table via ILIKE sub-queries, intersects them in application code, then applies `.in('id', ids)` to the main contractors query. This sub-query → IN pattern became the canonical approach for any JOIN-like operation across this codebase.

**S03 — Job posting overhaul:** The job creation form went from a freetext description box to a structured form with Trade dropdown, Pay Rate, Location (city + state dropdown), Duration, and Description. Migration 012 added `pay_rate` and `duration` columns to the jobs table. JobCard now renders these as amber-icon metadata badges — contractors can scan pay and duration at a glance. GC users land on the Posts/Jobs tab by default when visiting /profile, shaving clicks off the most common GC action.

**S04 — Recent Contacts:** The Mark Hired modal now surfaces up to 5 previously hired contractors at the top before the full search list. This required an over-fetch → JS dedup → IN → re-sort pattern (PostgREST has no DISTINCT ON support) to get ordered unique contacts. No DB migration needed — the feature runs entirely on existing jobs and contractors tables.

**S05 — Drywall:** Adding a new trade is a pure UI constants change across four files (apply form, directory filter, homepage, job form). Drywall got a full credential note (state license + GL insurance), 7 specialties, and appears in all the right places.

**S06 — Homepage hero:** The flat slate-900 hero was replaced with a 4-panel B&W trade photo collage using CSS `background-image` with Unsplash CDN URLs and Tailwind's `grayscale`/`brightness-50` utilities — no next/image config changes, no binary assets in git. A dark gradient overlay ensures text legibility. Browse by Trade was moved into a clearly separated section below the hero with a `border-t border-slate-800` divider, a 6-column grid for all 6 trades, and per-trade SVG icons from a `TRADE_ICONS` constant.

## Cross-Slice Verification

**Success criterion 1 — Filter by insurance/cert:**
- S02 summary: `npm run build` ✅ zero errors; `npm run lint` ✅; code review of intersection logic and empty-list short-circuit confirmed correct
- Observable: Browser DevTools Network shows `?id=in.(...)` when insurance/cert filter active; active filter count badge confirms state

**Success criterion 2 — GC job posting in under 60 seconds:**
- S03 summary: Migration 012 applied (HTTP 201 + schema verified); `npm run build` ✅; structured fields present in CreateJobForm (Title, Trade, Pay Rate, Location, Duration, Description); `deploy.sh` ✅ pushed to production
- Observable: Network tab POST `/rest/v1/jobs` body includes `pay_rate` and `duration` fields

**Success criterion 3 — Mark Hired shows recently hired first:**
- S04 summary: `npm run build` ✅; `deploy.sh` ✅; dedup + re-sort logic verified by code review
- Observable: Recent Contacts section visible above search input when GC has prior hire history

**Success criterion 4 — Drywall fully supported:**
- S05 summary: `npm run build` ✅; `grep Drywall` across all 3 target files confirmed present in TRADES, SPECIALTIES_BY_TRADE, CREDENTIAL_NOTES; `deploy.sh` ✅
- Observable: Drywall option present in apply form dropdown, directory filter, and Browse by Trade grid

**Success criterion 5 — Homepage hero with trade photography and separated Browse by Trade:**
- S06 summary: `npm run build` ✅; 7/7 browser assertions PASS (hero text, Browse by Trade label, all 6 trades, CTAs); 3/3 mobile 375px assertions PASS; `deploy.sh` ✅
- Observable: 4-panel photo collage visible behind hero text; `border-t border-slate-800` divider separates Browse by Trade section

**Definition of done check:**
- All 6 slices marked `[x]` in M001-ROADMAP.md ✅
- All 6 slice summaries exist ✅ (S01–S06 each have `*-SUMMARY.md`)
- All 18 requirements marked `[x]` in REQUIREMENTS.md ✅
- Migrations 010–012 applied and verified in production ✅
- Every slice was deployed via `deploy.sh` — build gate passed before each push ✅

## Requirement Changes

- DEPLOY-01: active → validated — `scripts/deploy.sh` created; build-gated deploy to origin master confirmed by S01 T02 verification
- BUG-06: active → validated — redundant user_id filter removed from 3 files; migration 010 idempotently repairs production schema; npm run build pass + grep confirmation
- FILTER-01: active → validated — insurance checkboxes + cert dropdown in SearchFilters with currentInsurance/currentCert props; build + lint pass
- FILTER-02: active → validated — sub-query → IN intersection logic in contractors/page.tsx verified by code review; empty-list short-circuit confirmed
- FILTER-03: active → validated — all filter elements vertically stacked (space-y-*), w-full inputs; no horizontal overflow at 375px
- JOBS-05: active → validated — loadContractor() GC detection → setTab('posts') + setPostCategory('jobs'); build pass + code review
- JOBS-06: active → validated — all 6 structured fields in CreateJobForm; trade and state use dropdowns; build pass
- JOBS-07: active → validated — JobCard metadata badge row conditional on pay_rate/duration presence; build pass + code review
- JOBS-08: active → validated — Recent Contacts section in SubSelectorModal; over-fetch → dedup → IN → re-sort logic confirmed; build pass
- JOBS-09: active → validated — search input and full contractor list unchanged below divider; confirmed by code review
- TRADE-01: active → validated — Drywall in TRADES, SPECIALTIES_BY_TRADE, CREDENTIAL_NOTES in apply/page.tsx; grep + build pass
- TRADE-02: active → validated — Drywall in SearchFilters.tsx TRADES; grep confirmed
- TRADE-03: active → validated — Drywall in page.tsx TRADES Browse by Trade grid; grep confirmed
- TRADE-04: active → validated — Drywall CREDENTIAL_NOTES specify state license + GL insurance; code present
- HOME-01: active → validated — 4-panel grayscale photo collage; 7/7 browser assertions pass in S06 UAT
- HOME-02: active → validated — border-t border-slate-800 divider between hero and Browse by Trade; browser assertions pass
- HOME-03: active → validated — dark gradient overlay; text legibility assertions pass at all viewport sizes
- HOME-04: active → validated — 3/3 mobile 375px browser assertions pass in S06 UAT

## Forward Intelligence

### What the next milestone should know
- TRADES constant is defined in **4 places**: `app/apply/page.tsx`, `components/SearchFilters.tsx`, `app/page.tsx`, `components/CreateJobForm.tsx` — when adding a new trade, all four must be updated. `page.tsx` also requires a TRADE_ICONS entry or the trade card renders without an icon.
- The sub-query → IN pattern is canonical for any filter requiring JOIN-like semantics in PostgREST — resolve matching IDs first, then apply `.in('id', ids)`. An empty result set must short-circuit before issuing `.in('id', [])`.
- Applications queries must never include `user_id` in PostgREST URL params — RLS handles user isolation. This is a recurring foot-gun if new devs add explicit user_id filters.
- `scripts/deploy.sh` and `scripts/migrate.sh` are the only ways to ship code and DB changes — never push manually or ask the user to apply migrations in the dashboard.
- GC detection is an exact string match on `contractor.trade === 'General Contractor'` in two files (jobs/page.tsx and profile/page.tsx) — any normalization or trade rename must update both.
- Browse by Trade grid is `lg:grid-cols-6` — adding a 7th trade needs a layout decision (2-row, wider grid, or redesign).
- Hero photo panels use Unsplash CDN URLs — if Unsplash is unreachable, panels are blank but overlay and text still render correctly. Replace with real contractor photos when the founding cohort provides them.

### What's fragile
- Insurance ILIKE filter depends on cert records using expected keywords ("general liability", "workers comp", etc.) — founding cohort cert entries must follow naming conventions or the filter returns empty matches
- GC detection exact string match — trailing space or different capitalization silently falls back to Profile tab default
- CERT_OPTIONS dropdown is hardcoded to 7 options — won't auto-include new cert types added to the DB; will drift as cert variety grows beyond MVP volume
- PostgREST schema cache — adding/removing columns without a cache reload causes 400 on queries that reference those columns in URL params; pattern: never filter by columns in PostgREST URL params when RLS already handles row isolation

### Authoritative diagnostics
- Browser DevTools Network → `/rest/v1/applications` — 200 = BUG-06 fixed; 400 = PostgREST schema cache stale (reload in Supabase Dashboard → API → Reload schema)
- Browser DevTools Network → `/rest/v1/contractors?id=in.(...)` — confirms cert/insurance IN filter is being applied when those filters are active
- `scripts/deploy.sh` stdout — `❌ Build failed` exits 1 before any git operations; safe to retry after fixing the build error
- `scripts/migrate.sh "SELECT column_name FROM information_schema.columns WHERE table_name='jobs'"` — authoritative production schema state

### What assumptions changed
- Assumed PostgREST could handle subquery IN natively (S02) — it cannot; sub-query → JS intersection → `.in('id', ids)` is the required workaround
- Assumed Unsplash images should be downloaded to `public/images/` (S06 plan) — CSS background-image with CDN URLs is strictly better for decorative backgrounds: no binary assets, no next.config.js changes, same visual result
- Assumed "Post a Job" should be GC-only (S03 plan) — made available to all approved contractors since any contractor may post subcontracting opportunities; GC-specific behavior is only the auto-default tab

## Files Created/Modified

- `app/contractors/layout.tsx` — BUG-06: removed .eq('user_id') from applications pending check
- `app/jobs/layout.tsx` — BUG-06: same fix as contractors layout
- `app/profile/page.tsx` — BUG-06 fix; GC default tab logic (setTab + setPostCategory); "Post a Job" category with inline CreateJobForm
- `components/SearchFilters.tsx` — insurance checkboxes + cert dropdown; Drywall in TRADES
- `app/contractors/page.tsx` — insurance/cert sub-query → IN filter logic; renderPage() helper; active filter count badge
- `components/CreateJobForm.tsx` — full overhaul: trade/state dropdowns, pay rate + duration fields, defaultOpen prop, success feedback
- `components/JobCard.tsx` — metadata badge row for pay_rate and duration
- `components/SubSelectorModal.tsx` — Recent Contacts section; ContractorButton inner component; modal layout adjusted
- `app/apply/page.tsx` — Drywall in TRADES, SPECIALTIES_BY_TRADE, CREDENTIAL_NOTES
- `app/page.tsx` — Homepage hero redesign: 4-panel photo collage, dark overlay, Browse by Trade with border-t divider, 6-col grid, SVG trade icons, TRADE_ICONS constant; Drywall in TRADES
- `lib/types.ts` — Job interface: pay_rate and duration fields added
- `app/jobs/actions.ts` — createJob accepts pay_rate and duration
- `supabase/migrations/010_fix_applications_user_id_rls.sql` — idempotent: ensures user_id + document_urls columns, index, RLS policies on applications
- `supabase/migrations/011_certifications_filter_index.sql` — idempotent index on certifications(contractor_id, name)
- `supabase/migrations/012_jobs_pay_rate_duration.sql` — adds pay_rate and duration columns to jobs
- `scripts/deploy.sh` — build-gated deploy helper: build → commit → push → Vercel auto-deploy
- `scripts/migrate.sh` — Management API migration runner with verification
- `CLAUDE.md` — Commands section updated with deploy and migrate commands
