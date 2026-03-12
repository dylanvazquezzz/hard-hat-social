#!/usr/bin/env bash
# scripts/migrate.sh — Apply a SQL migration to the Supabase project
#
# Usage:
#   ./scripts/migrate.sh <path/to/migration.sql>
#   ./scripts/migrate.sh "SELECT 1"   (inline SQL string)
#
# Requires:
#   SUPABASE_ACCESS_TOKEN — personal access token (in .env.local)
#   NEXT_PUBLIC_SUPABASE_URL — project URL (in .env.local)
#
# Exit codes:
#   0 — migration applied successfully
#   1 — error (missing args, missing env, API failure)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Load env from .env.local
if [[ -f "${REPO_ROOT}/.env.local" ]]; then
  set -o allexport
  # shellcheck disable=SC1091
  source "${REPO_ROOT}/.env.local"
  set +o allexport
fi

# Validate required env
if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "❌ SUPABASE_ACCESS_TOKEN not set" >&2
  exit 1
fi

if [[ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ]]; then
  echo "❌ NEXT_PUBLIC_SUPABASE_URL not set" >&2
  exit 1
fi

# Extract project ref from URL (e.g. https://pzjommfcglozzuskubnl.supabase.co → pzjommfcglozzuskubnl)
PROJECT_REF="$(echo "${NEXT_PUBLIC_SUPABASE_URL}" | sed 's|https://||' | cut -d'.' -f1)"

if [[ -z "${PROJECT_REF}" ]]; then
  echo "❌ Could not extract project ref from NEXT_PUBLIC_SUPABASE_URL" >&2
  exit 1
fi

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <path/to/migration.sql> OR $0 \"SELECT 1\"" >&2
  exit 1
fi

INPUT="$1"

# Determine if argument is a file path or inline SQL
if [[ -f "${INPUT}" ]]; then
  SQL="$(cat "${INPUT}")"
  LABEL="$(basename "${INPUT}")"
else
  SQL="${INPUT}"
  LABEL="inline SQL"
fi

echo "🔄 Applying migration: ${LABEL}"
echo "   Project: ${PROJECT_REF}"

# Call Management API
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  "https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query" \
  -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg sql "${SQL}" '{"query": $sql}')")

HTTP_CODE=$(echo "${RESPONSE}" | tail -n1)
BODY=$(echo "${RESPONSE}" | sed '$d')

if [[ "${HTTP_CODE}" == "200" || "${HTTP_CODE}" == "201" ]]; then
  echo "✅ Migration applied successfully (HTTP ${HTTP_CODE})"
  if [[ -n "${BODY}" && "${BODY}" != "null" ]]; then
    echo "   Response: ${BODY}"
  fi
else
  echo "❌ Migration failed (HTTP ${HTTP_CODE})" >&2
  echo "   Response: ${BODY}" >&2
  exit 1
fi
