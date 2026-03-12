#!/usr/bin/env bash
# scripts/deploy.sh — Hard Hat Social deploy helper
#
# Usage:
#   ./scripts/deploy.sh "your commit message"
#
# What it does:
#   1. Runs `npm run build` to verify zero build errors
#   2. Commits any unstaged/untracked changes with the provided message
#   3. Pushes to origin master — Vercel auto-deploys on push
#
# Requirements:
#   - Git remote "origin" must point to the GitHub repo
#   - Vercel project must be connected to the GitHub repo with auto-deploy enabled
#   - Run from the repository root

set -euo pipefail

# ── 1. Validate args ─────────────────────────────────────────────────────────
if [[ $# -lt 1 || -z "${1:-}" ]]; then
  echo "❌  Usage: ./scripts/deploy.sh \"commit message\""
  exit 1
fi

COMMIT_MSG="$1"

# ── 2. Ensure we're in the repo root ─────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

echo "📂  Working directory: $REPO_ROOT"

# ── 3. Build verification ─────────────────────────────────────────────────────
echo ""
echo "🔨  Running npm run build..."
if ! npm run build; then
  echo ""
  echo "❌  Build failed. Fix errors before deploying."
  exit 1
fi
echo "✅  Build passed."

# ── 4. Stage all changes ──────────────────────────────────────────────────────
echo ""
echo "📦  Staging changes..."
git add -A

# Check if there's anything to commit
if git diff --cached --quiet; then
  echo "ℹ️   Nothing to commit — working tree is clean."
else
  git commit -m "$COMMIT_MSG"
  echo "✅  Committed: $COMMIT_MSG"
fi

# ── 5. Merge current branch to master if not already on master ───────────────
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$CURRENT_BRANCH" != "master" ]]; then
  echo ""
  echo "🔀  On branch '$CURRENT_BRANCH' — merging to master..."
  git checkout master
  git merge "$CURRENT_BRANCH" --no-ff -m "feat: merge $CURRENT_BRANCH to master"
  echo "✅  Merged $CURRENT_BRANCH → master"
fi

# ── 6. Push to origin master ──────────────────────────────────────────────────
echo ""
echo "🚀  Pushing to origin master..."
git push origin master
echo ""
echo "✅  Pushed. Vercel will auto-deploy to production."
echo "    Monitor at: https://vercel.com/dashboard"
