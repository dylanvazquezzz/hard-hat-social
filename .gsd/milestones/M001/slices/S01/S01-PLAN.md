# S01: Auto-Deploy + Bug Fix

**Slice goal:** Wire auto-deploy into the project workflow so every approved push lands on hardhatsocial.net automatically. Diagnose and fix the 400 error on the applications status query.

**Requirements:** DEPLOY-01, BUG-06

**Depends on:** nothing

## Tasks

<<<<<<< HEAD
- [x] **T01: Diagnose and fix BUG-06** — The 400 Bad Request on `GET /rest/v1/applications?select=status&user_id=eq.{id}&status=eq.pending` needs root cause analysis. Migration 004 (which adds user_id to applications) was missing until 2026-03-12 — verify if that self-resolved the bug. If not, fix the RLS policy or query. Verify admin can still see all applications.

- [x] **T02: Document and wire auto-deploy** — Add a `scripts/deploy.sh` that: (1) runs `npm run build` to verify no errors, (2) commits any unstaged changes with a provided message, (3) pushes to origin master. Update CLAUDE.md with the deploy command. GSD will call this after each approved slice going forward.
=======
- [x] **T01: Diagnose and fix BUG-06** — The 400 Bad Request on `GET /rest/v1/applications?select=status&user_id=eq.{id}&status=eq.pending` needs root cause analysis. Migration 004 (which adds user_id to applications) was missing until 2026-03-12 — verify if that self-resolved the bug. If not, fix the RLS policy or query. Verify admin can still see all applications.

- [x] **T02: Document and wire auto-deploy** — Add a `scripts/deploy.sh` that: (1) runs `npm run build` to verify no errors, (2) commits any unstaged changes with a provided message, (3) pushes to origin master. Update CLAUDE.md with the deploy command. GSD will call this after each approved slice going forward.
>>>>>>> gsd/M001/S01

## Completion Criteria

- [ ] Visiting `/apply` as a logged-in user with a pending application does NOT produce a 400 in the browser console
- [ ] `scripts/deploy.sh "message"` runs successfully and triggers a Vercel production deploy
- [ ] `npm run build` passes with zero errors
