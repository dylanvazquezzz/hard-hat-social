---
id: T02
parent: S02
milestone: M002
provides:
  - createComment server action in app/explore/actions.ts
  - auth-validated insert into comments table with structured error returns
  - S03 notification hook stub (TODO comment)
key_files:
  - app/explore/actions.ts
key_decisions:
  - Used same cookie extraction pattern as lib/admin-guard.ts (sb-*-auth-token cookie, parse JSON, take [0] or .access_token)
  - Used admin client (getUser) for token verification rather than browser client, consistent with existing auth patterns
patterns_established:
  - Server action error return shape: { error?: string } — callers check for truthy error property
observability_surfaces:
  - console.error('[createComment] error:', insertError.message) on DB insert failure
  - Returns { error: 'Unauthorized' } when no auth token or invalid token
  - Returns { error: 'Insert failed' } on DB error
  - Returns { error: 'Content required' } on empty content
duration: 10m
verification_result: passed
completed_at: 2026-03-12
blocker_discovered: false
---

# T02: Add createComment server action

**Created `app/explore/actions.ts` with authenticated `createComment` server action that validates auth, inserts into `comments`, and revalidates `/explore`.**

## What Happened

Created `app/explore/actions.ts` as a `'use server'` file exporting `createComment(postId: string, content: string): Promise<{ error?: string }>`.

Implementation flow:
1. Validates `content.trim()` is non-empty — returns `{ error: 'Content required' }` if empty
2. Extracts auth token from cookies: finds cookie with name `startsWith('sb-') && endsWith('-auth-token')`, parses JSON, takes `[0]` or `.access_token`
3. Returns `{ error: 'Unauthorized' }` if no token found or token parse fails
4. Calls `admin.auth.getUser(accessToken)` — returns `{ error: 'Unauthorized' }` if no user
5. Inserts `{ post_id: postId, user_id: user.id, content: content.trim() }` into `comments`
6. On insert error: logs `[createComment] error: <message>` and returns `{ error: 'Insert failed' }`
7. Calls `revalidatePath('/explore')`
8. Includes `// TODO S03: call createNotification(user.id, post.user_id, 'comment', newComment.id)`
9. Returns `{}` on success

## Verification

- `npm run build` → clean, no TypeScript errors ✅
- `app/explore/actions.ts` exists and exports `createComment` ✅

## Diagnostics

- Console: `[createComment] error: <message>` on DB insert failure
- Structured error returns allow CommentThread to display inline error messages to users
- Inspect inserted rows: `./scripts/migrate.sh "SELECT id, post_id, user_id, content, created_at FROM comments ORDER BY created_at DESC LIMIT 10"`

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `app/explore/actions.ts` — new server action file with `createComment` export
