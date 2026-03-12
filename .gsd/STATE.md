# GSD State

**Active Milestone:** M001 — v1.3 UX & Trade Expansion
**Active Slice:** S03 — Job Posting UX Overhaul
**Phase:** planning
**Requirements Status:** 5 complete · 13 pending · 0 deferred · 0 out of scope

## Milestone Registry
- 🔄 **M001:** v1.3 UX & Trade Expansion

## Completed Slices
- ✅ **S01:** Auto-Deploy + Bug Fix
- ✅ **S02:** Directory Filter Expansion

## Recent Decisions
- Sub-query → IN filter pattern for PostgREST JOIN-like operations (S02)
- CERT_OPTIONS hardcoded at MVP volume; make dynamic when distinct cert count > 15 (S02)

## Blockers
- Migration 011 must be applied to production Supabase (pzjommfcglozzuskubnl) before S02 deploy

## Next Action
Begin S03: Job Posting UX Overhaul — GC profile defaults to Posts/Jobs tab, structured job post fields (pay, location, duration).
