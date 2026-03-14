---
id: T01
parent: S02
milestone: M002
provides:
  - comments table in production with RLS (public read, authenticated insert, owner delete)
  - Comment TypeScript type in lib/types.ts
  - Post type updated with optional comments embedded count field
key_files:
  - supabase/migrations/013_comments.sql
  - lib/types.ts
key_decisions:
  - Used idempotent DO $$ BEGIN...END $$ blocks for policy creation so migration can be re-run safely
  - Added comments_post_id_idx index for performant per-post comment lookups
  - Comment.profiles typed as Pick<Profile, 'username' | 'avatar_url'> matching the join shape used in CommentThread queries
patterns_established:
  - PostgREST embedded count shape on Post type: `comments?: [{ count: number }] | null`
observability_surfaces:
  - ./scripts/migrate.sh "SELECT id, post_id, user_id, content, created_at FROM comments ORDER BY created_at DESC LIMIT 10" — inspect live comment rows
  - ./scripts/migrate.sh "SELECT policyname FROM pg_policies WHERE tablename = 'comments'" — verify RLS policies
duration: 15m
verification_result: passed
completed_at: 2026-03-12
blocker_discovered: false
---

# T01: Create comments table migration and Comment type

**Created `comments` table in production with 3 RLS policies and added `Comment` + updated `Post` types to `lib/types.ts`.**

## What Happened

Wrote `supabase/migrations/013_comments.sql` creating the `comments` table (uuid pk, post_id FK → posts cascade delete, user_id FK → auth.users cascade delete, content text not null, created_at timestamptz default now()) with a `comments_post_id_idx` index for efficient per-post queries.

Added three idempotent RLS policies:
- `comments_select_public` — `FOR SELECT USING (true)` (anyone can read)
- `comments_insert_authenticated` — `FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)`
- `comments_delete_owner` — `FOR DELETE TO authenticated USING (auth.uid() = user_id)`

Applied migration via `./scripts/migrate.sh`. Updated `lib/types.ts`:
- Added `Comment` interface with `id`, `post_id`, `user_id`, `content`, `created_at`, and optional `profiles?: Pick<Profile, 'username' | 'avatar_url'>` join field
- Added `comments?: [{ count: number }] | null` to `Post` type for PostgREST embedded count queries

## Verification

- `./scripts/migrate.sh "SELECT table_name FROM information_schema.tables WHERE table_name = 'comments'"` → `[{"table_name":"comments"}]` ✅
- `./scripts/migrate.sh "SELECT policyname FROM pg_policies WHERE tablename = 'comments'"` → 3 policies (select_public, insert_authenticated, delete_owner) ✅
- `npm run build` → clean, no TypeScript errors ✅

## Diagnostics

- Inspect comments table: `./scripts/migrate.sh "SELECT id, post_id, user_id, content, created_at FROM comments ORDER BY created_at DESC LIMIT 10"`
- Inspect RLS policies: `./scripts/migrate.sh "SELECT policyname, cmd FROM pg_policies WHERE tablename = 'comments'"`

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `supabase/migrations/013_comments.sql` — new migration creating comments table + index + 3 RLS policies (idempotent)
- `lib/types.ts` — added `Comment` interface; added `comments?: [{ count: number }] | null` to `Post` type
