# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-01)

**Core value:** A contractor can find and contact a verified sub in their trade within 5 minutes — zero unverified people, no spam, no guesswork.
**Current focus:** Phase 1 — Production Hardening

## Current Position

Phase: 1 of 5 (Production Hardening)
Plan: 3 completed in current phase
Status: Executing
Last activity: 2026-03-03 — Plan 01-03 complete: DEPLOYMENT-CHECKLIST.md created, user confirmed checklist reviewed and Resend domain verification initiated

Progress: [███░░░░░░░] 15%

## Performance Metrics

**Velocity:**
- Total plans completed: 3
- Average duration: ~4 min
- Total execution time: ~13 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-production-hardening | 3 | ~13 min | ~4 min |

**Recent Trend:**
- Last 5 plans: 01-01 (~1 min), 01-02 (~7 min), 01-03 (~5 min)
- Trend: -

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap: Phase 5 is operational (no new v1 requirements); it validates phases 1-4 under real conditions with actual founding cohort welders
- Research: Homepage placeholder strategy (teasers vs. count-only) is a product decision to be made at Phase 4 planning time — research identified the risk but did not prescribe the design
- Research: DNS propagation for Resend takes up to 48 hours — Phase 1 must start before anything else
- 01-01: Use `server-only` package (not just comments) to enforce server boundary — build fails hard instead of silently leaking secrets
- 01-01: Any future server-only lib file should use `import 'server-only'` as its first line
- 01-02: Storage migration must DROP old permissive policies before creating strict replacements (PostgreSQL OR-evaluates all matching policies)
- 01-02: Storage path prefix = auth.uid()::text (not DB row IDs) for per-user RLS enforcement
- 01-02: avatars bucket needs UPDATE policy (not just INSERT) because profile/page.tsx uses upsert: true
- 01-03: Resend domain verification must start first — up to 48-hour DNS propagation is the longest lead-time task in Phase 1 deployment
- 01-03: Supabase Auth Site URL is a dashboard-only setting (cannot be set via SQL or env var) — must be configured manually before real users attempt password reset

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 1: `NEXT_PUBLIC_ADMIN_EMAILS` env var check must be verified as case-insensitive and whitespace-trimmed — silent failure if not
- Phase 4: Homepage placeholder strategy (teaser profiles vs. application count only) needs a product decision before component code is written; trust damage in small trade communities is severe

## Session Continuity

Last session: 2026-03-03
Stopped at: Completed 01-03-PLAN.md — DEPLOYMENT-CHECKLIST.md created, user confirmed checklist reviewed and Resend domain verification initiated
Resume file: None
