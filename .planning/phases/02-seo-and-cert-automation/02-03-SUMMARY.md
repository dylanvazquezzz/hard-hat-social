---
phase: 02-seo-and-cert-automation
plan: 03
subsystem: database
tags: [supabase, certifications, admin, server-actions]

# Dependency graph
requires:
  - phase: 01-production-hardening
    provides: deployed admin queue with approveApplication() server action
provides:
  - approveApplication() that auto-inserts certifications from application document_urls
  - approved contractors immediately show certification entries on their profile pages
affects: [03-password-reset, contractor-profiles, admin-queue]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Supabase .select('id').single() after insert to capture generated UUID for FK relationships"
    - "Guard pattern: check data existence and array length before dependent inserts"

key-files:
  created: []
  modified:
    - app/admin/actions.ts

key-decisions:
  - "Cert name defaults to '{trade} Credential' and issuing_body to 'Submitted via Application' — generic but accurate; admin can refine manually if needed"
  - "Guard with newContractorData && document_urls.length > 0 so approvals without docs never throw"
  - "cert_number and expiry_date omitted from insert (nullable in schema, Supabase defaults to null)"

patterns-established:
  - "Supabase chain pattern: .insert([...]).select('id').single() to capture row ID for FK use"

requirements-completed: [CERT-01]

# Metrics
duration: 3min
completed: 2026-03-04
---

# Phase 2 Plan 3: Cert Automation Summary

**approveApplication() now maps each application document_url to a certifications table row with verified=true, so approved contractors immediately show credential entries on their profile**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-04T00:53:43Z
- **Completed:** 2026-03-04T00:56:30Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Modified `approveApplication()` to add `.select('id').single()` to the contractors insert, capturing the new contractor UUID
- Inserted one certifications row per document_url from the application, each with `verified=true` and `contractor_id` set correctly
- Guarded cert insert so applications with zero document_urls still approve successfully without errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Modify approveApplication() to insert certification records on approval** - `f932d49` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `app/admin/actions.ts` - Added .select('id').single() to contractors insert and cert auto-insert block after approval

## Decisions Made
- Cert `name` defaults to `{trade} Credential` and `issuing_body` to `"Submitted via Application"` — generic but accurate; admin can refine individual certs manually in Supabase dashboard if needed
- `cert_number` and `expiry_date` omitted from the insert payload (they are nullable in the schema; Supabase uses null defaults)
- Guard with `newContractorData && application.document_urls && application.document_urls.length > 0` so approvals without documents never throw

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- First `npm run build` run failed with ENOENT on `.next/server/app/_not-found/page.js.nft.json` — pre-existing stale cache issue unrelated to code changes. Clean build (`rm -rf .next && npm run build`) passed completely with no TypeScript errors and all 14 static pages generated.

## User Setup Required
None - no external service configuration required. The change takes effect immediately for all future application approvals via the admin queue at `/admin`.

## Next Phase Readiness
- Certification auto-population is now complete — approved contractors will show credential entries on their profile pages without any manual DB intervention
- Admin can optionally update cert names, issuing bodies, cert numbers, and expiry dates via Supabase dashboard for precision
- Ready to proceed to next plan in phase 02

---
*Phase: 02-seo-and-cert-automation*
*Completed: 2026-03-04*
