# S02: Comments on Posts — Research

**Date:** 2026-03-12
**Slice:** S02 (M002)

## Summary

S02 adds threaded comments to every post visible on the Explore feed. The deliverables are:
1. A `comments` DB table with RLS
2. A `Comment` TypeScript type
3. A `CommentThread` client component that renders inline below a PostCard (collapsible)
4. Comment count shown on `PostCard`
5. A `createComment` server action

The codebase is a Next.js 14 App Router project. **Explore (`/explore`) is currently a pure server component** — it has no client-side interactivity. Adding comment threads requires a strategy decision: either wrap PostCard in a client component that manages its own thread state, or lift the page to a client component. The lightest path is a new `CommentThread` client component imported by `PostCard`. Since `PostCard` is currently a server-renderable component, it will need to become a client component (add `'use client'`) OR receive comments as props and pass through a separate `CommentThread` island.

The best pattern given the codebase is: keep `PostCard` as-is, add a `CommentThread` client component alongside it in the Explore feed list. The Explore page renders `<PostCard>` + `<CommentThread postId={post.id} initialCount={post.comment_count} />` for each post. This keeps PostCard pure (no auth dependency) and isolates all interactivity to CommentThread.

Comment count denormalization: the boundary map specifies "comment count shown on PostCard". Two options: (a) a `comment_count` integer column on `posts` kept in sync via trigger, or (b) a JOIN query to COUNT on render. Option (b) is simpler for MVP and avoids trigger complexity. The Explore page already does two separate queries (posts + profiles) — add a third to fetch comment counts, or fetch comments inline with a subquery using `.select('*, comments(count)')` via PostgREST's embedded resource syntax.

PostgREST supports `select=*, comments(count)` for COUNT aggregates on foreign-key-linked tables. This would return `comments: [{count: N}]` per post. Using this pattern keeps the comment count query co-located with the posts fetch and avoids denormalization.

## Recommendation

**Comment thread as a client island alongside PostCard in Explore.** Architecture:

- `PostCard` receives an optional `commentCount` prop and renders a "N comments" toggle button (no network calls)
- `CommentThread` is a `'use client'` component that receives `postId` + `initialCount`, lazy-loads comments on toggle open, and contains the submit form
- Explore page fetches comment counts via PostgREST embedded count at render time, passes to each `PostCard`
- `createComment` is a Next.js server action (`'use server'`) that validates auth, inserts into `comments`, and calls `revalidatePath('/explore')`
- Auth check in `createComment` uses the same cookie-extract pattern from `admin-guard.ts` — call `getSupabaseAdmin().auth.getUser(token)` server-side
- `CommentThread` uses the browser Supabase client (`lib/supabase.ts`) to fetch comments on demand (no SSR needed for thread content)

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Comment count via JOIN | PostgREST `select=*, comments(count)` | Returns `{count: N}` per post row — no denormalization or trigger required |
| Server action auth | Cookie-extract pattern in `admin-guard.ts` + `lib/supabase-admin.ts` | Already battle-tested in this codebase; extract user from `sb-*-auth-token` cookie |
| Page revalidation after insert | `revalidatePath('/explore')` in server action | Already used in `admin/actions.ts` — triggers SSR re-fetch of comment counts |
| Client Supabase queries | `lib/supabase.ts` browser client | Must not use admin client in client components; browser client respects RLS |

## Existing Code and Patterns

- `components/PostCard.tsx` — currently pure, no client state; receives `Post` type; needs `commentCount?: number` prop added; a "💬 N comments" toggle button should call a passed-in `onToggle` handler OR just be a sibling component in the list
- `app/explore/page.tsx` — server component; already does multi-query pattern (posts + profiles separately); add comment count as embedded count to the posts query
- `app/admin/actions.ts` — canonical server action pattern: `'use server'`, call `assertIsAdmin()`, use `getSupabaseAdmin()`, call `revalidatePath()`; `createComment` follows same structure minus admin guard
- `lib/admin-guard.ts` — shows how to extract auth token from cookies server-side; `createComment` needs the same pattern to verify the user is authenticated (and optionally approved)
- `supabase/migrations/005_rls_improvements.sql` — shows DROP POLICY IF EXISTS + CREATE POLICY pattern to follow for `comments` table RLS
- `supabase/migrations/002_profiles_posts.sql` — RLS policy model to copy: `public read, authenticated insert, owner delete`
- `app/profile/page.tsx` lines 157–205 — client-side Supabase insert pattern for posts; `CommentThread` will use the same `supabase.from('comments').insert(...)` pattern
- `lib/types.ts` — add `Comment` type here; also update `Post` type to accept optional `comment_count` or `comments` embedded count shape from PostgREST

## Constraints

- `app/explore/page.tsx` is a server component (`export const dynamic = 'force-dynamic'`); `CommentThread` must be a separate `'use client'` component — cannot put hooks inside the page
- `lib/supabase-admin.ts` uses `import 'server-only'` — cannot be imported in client components; `CommentThread` must use `lib/supabase.ts` browser client
- No new npm packages — use existing Supabase client patterns only
- Migrations must be idempotent (`IF NOT EXISTS`, `DROP POLICY IF EXISTS`) — migration 013 will create the `comments` table
- Next.js server actions with `revalidatePath` must be in `'use server'` files; a new `app/explore/actions.ts` is the right home for `createComment`
- PostgREST embedded count syntax: `.select('*, comments(count)')` returns an array `[{count: number}]` under the `comments` key per post row — TypeScript typing requires casting or mapping

## Common Pitfalls

- **PostCard already used as a pure server component in `/u/[username]`** — adding `'use client'` to PostCard.tsx would break its use in the public profile server page; keep PostCard server-safe, put `CommentThread` as a sibling in the feed list only
- **PostgREST embedded count returns `[{count: N}]` not `N`** — must extract `post.comments?.[0]?.count ?? 0` in TypeScript; the `Post` type needs `comments?: [{ count: number }] | null` or handle via a mapping step before rendering
- **`revalidatePath('/explore')` revalidates the whole page** — after a comment is submitted, the server-rendered count updates on next page load; but since `CommentThread` manages local state for the thread display, the UX is smooth: the thread shows optimistically and the count in the PostCard header updates on re-render
- **RLS `write = authenticated`**: must ensure the insert policy checks `auth.uid() = user_id` (not just `is authenticated`) — otherwise any logged-in user could insert rows with arbitrary `user_id`
- **Empty thread state** — `CommentThread` should render a "No comments yet" message when open + empty, not just a blank div
- **Missing foreign key for comments→profiles join** — `profiles.id` references `auth.users`, not `posts` or `comments`; same two-step fetch pattern as Explore page (fetch comments, extract user_ids, fetch profiles separately) applies to `CommentThread`

## Open Risks

- **Comment count display in PostCard from `/u/[username]`** — the public profile page also renders PostCards. The embedded count approach only works if the Explore query adds it; profile page would need the same query change or comment_count would show 0/hidden there. MVP decision: hide comment count on profile page posts (only show on Explore where `CommentThread` is also present)
- **createComment auth check strictness** — should only approved contractors be able to comment, or any authenticated user? Boundary map says `write=authenticated` which implies any logged-in user. Keeping it `authenticated` (not `approved`) is simpler and consistent with the posts RLS policy
- **Inline thread UX on mobile** — the Explore feed is already a card list; an expanded CommentThread adds vertical height; ensure `CommentThread` has a reasonable max-height or lazy-load boundary
- **S03 dependency** — boundary map notes S02 produces `createComment` which S03 will hook into for notifications; the server action must be importable by S03 notification logic (or S03 adds its own hook). Best: `createComment` calls a `createNotification` helper that S03 will define — add a TODO stub comment in the action for now

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| Next.js App Router | (built-in knowledge) | none needed |
| Supabase RLS | (built-in knowledge) | none needed |

## Sources

- Existing codebase patterns (PostCard, explore/page.tsx, admin/actions.ts, admin-guard.ts)
- PostgREST embedded resource count syntax (`select=*, table(count)`) — established pattern in Supabase JS client
