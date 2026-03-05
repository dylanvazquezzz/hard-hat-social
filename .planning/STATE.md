---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Rebrand & Growth
status: planning
stopped_at: Defining requirements
last_updated: "2026-03-04T00:00:00.000Z"
last_activity: 2026-03-04 — Milestone v1.2 started
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-04)

**Core value:** A contractor can find and contact a verified sub in their trade within 5 minutes — zero unverified people, no spam, no guesswork.
**Current focus:** v1.2 — Defining requirements

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-03-04 — Milestone v1.2 started

## Accumulated Context

### From v1.1

- Use `server-only` package on lib/supabase-admin.ts and lib/email.ts — build fails hard vs silently leaking
- Storage migration must DROP old permissive policies before creating strict replacements
- avatars bucket needs UPDATE policy (not just INSERT) — profile/page.tsx uses upsert: true
- approveApplication() maps document_urls to certifications rows with verified=true
- Query applications table (not contractors) for pending check — pending users have no contractors row yet
- Use maybeSingle() not single() for pending gate queries
- CertRow is a client component — only cert rows opt into client, page.tsx stays server
- NEXT_PUBLIC_APP_URL must be set in Vercel before NEXT_PUBLIC_CONTACT_EMAIL — email links read from APP_URL

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-04
Stopped at: Defining requirements for v1.2
Next action: Define requirements, then create roadmap
Resume file: None
