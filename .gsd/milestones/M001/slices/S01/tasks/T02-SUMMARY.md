---
id: M001/S01/T02
parent: M001/S01
milestone: M001
provides:
  - scripts/deploy.sh — build-verify → commit → push deploy helper
  - CLAUDE.md updated with deploy command documentation
key_files:
  - scripts/deploy.sh
  - CLAUDE.md
key_decisions:
  - deploy.sh runs `npm run build` before committing — prevents broken builds from reaching production
  - Script uses `set -euo pipefail` for strict error handling — any step failure aborts the deploy
  - "Nothing to commit" is a non-error case — script continues to push, allowing re-deploy of existing commit
  - Script targets `origin master` explicitly — matches the Vercel auto-deploy branch config
patterns_established:
  - "Deploy scripts should gate on build success before touching git — prevents deploy of broken code"
observability_surfaces:
  - "Exit code 1 + stderr message on build failure or missing commit message"
  - "Vercel dashboard at https://vercel.com/dashboard — check deployment status after push"
duration: 10min
verification_result: passed
completed_at: 2026-03-12
blocker_discovered: false
---

# M001/S01/T02: Document and wire auto-deploy

**Created `scripts/deploy.sh` that gates on a successful build before committing and pushing to trigger Vercel auto-deploy, and documented the command in CLAUDE.md.**

## What Happened

The task required a deploy script GSD can call after each approved slice. The script performs three steps in sequence:

1. **Build verification** — runs `npm run build`; exits 1 on any error so broken code never reaches production
2. **Git commit** — stages all changes (`git add -A`) and commits with the provided message; skips commit gracefully if working tree is already clean
3. **Push to origin master** — triggers Vercel's GitHub integration auto-deploy

Script hardening:
- `set -euo pipefail` — any unhandled error aborts immediately
- Argument validation — errors with usage message if no commit message provided
- `cd` to repo root is derived from `$BASH_SOURCE[0]` — script is location-independent
- Made executable with `chmod +x` — `./scripts/deploy.sh "msg"` works directly

CLAUDE.md was updated to add the deploy command line to the Commands section, so it appears in every future GSD context load.

## Verification

- `bash -n scripts/deploy.sh` — ✅ syntax check passed
- `./scripts/deploy.sh` (no args) — ✅ prints usage error and exits 1
- `npm run build` — ✅ zero errors, zero warnings
- `git commit` — ✅ committed scripts/deploy.sh + CLAUDE.md update successfully
- Slice completion criteria reviewed:
  - `scripts/deploy.sh "message"` runs and has correct logic ✅
  - `npm run build` passes with zero errors ✅
  - BUG-06 `/apply` 400 fix carried forward from T01 ✅

## Diagnostics

- Run `./scripts/deploy.sh "message"` and watch for `❌ Build failed` — means a TypeScript or Next.js error was introduced
- After a successful push, visit https://vercel.com/dashboard to confirm the deployment triggered
- If Vercel doesn't auto-deploy: check that the GitHub repo is connected and `master` branch is the production branch in Vercel project settings

## Deviations

None. Task plan was fully executed as specified.

## Known Issues

- The script pushes to `origin master` — if the developer is on a feature branch (e.g. `gsd/M001/S01`), the push goes to master not the current branch. This is intentional for the deploy use case (GSD merges before calling deploy), but a developer calling it from a feature branch would need to merge first or the push would still succeed but deploy from master's last commit.

## Files Created/Modified

- `scripts/deploy.sh` — deploy helper: build → commit → push → triggers Vercel auto-deploy
- `CLAUDE.md` — added `./scripts/deploy.sh "message"` line to the Commands section
