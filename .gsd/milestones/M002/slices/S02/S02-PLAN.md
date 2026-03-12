# S02: Comments on Posts

**Goal:** Any authenticated contractor can comment on a post from the Explore feed. Reply threads are visible inline below each PostCard. Comment counts are shown on PostCards in the Explore feed.
**Demo:** Open `/explore`, click "💬 N comments" on any post → thread expands inline, existing comments load, a text input appears; type a comment and submit → new comment appears in the thread immediately, comment count increments.

## Must-Haves

- `comments` table exists in production with RLS: public read, authenticated insert (user_id = auth.uid()), owner delete
- `Comment` TypeScript type added to `lib/types.ts`; `Post` type updated to accept PostgREST embedded count shape
- `createComment` server action in `app/explore/actions.ts` — validates auth, inserts into `comments`, calls `revalidatePath('/explore')`; includes a TODO stub for S03 notification hook
- `CommentThread` client component renders inline below each PostCard in Explore: shows count toggle, lazy-loads thread on open, submit form, empty state, error state
- Comment count shown on each PostCard in the Explore feed (not on `/u/[username]` profile page — deferred per research decision)
- Explore page posts query uses PostgREST embedded count (`select('*, comments(count)')`) to fetch counts alongside posts
- `PostCard` receives optional `commentCount` prop and renders a "💬 N comments" button (no network calls, no `'use client'` added)
- `CommentThread` uses `lib/supabase.ts` browser client only (never admin client)

## Proof Level

- This slice proves: integration
- Real runtime required: yes — browser flow exercised against running dev server
- Human/UAT required: no — browser automation assertions are sufficient

## Verification

- `npm run build` passes with no TypeScript errors
- `./scripts/migrate.sh "SELECT table_name FROM information_schema.tables WHERE table_name = 'comments'"` returns a row
- `./scripts/migrate.sh "SELECT policyname FROM pg_policies WHERE tablename = 'comments'"` returns at least 3 policies (select, insert, delete)
- Browser: navigate to `/explore` → at least one PostCard shows "💬 0 comments" toggle
- Browser: click the toggle on a post → CommentThread expands showing "No comments yet" message
- Browser: submit a comment → new comment appears inline in the thread; re-click toggle or refresh shows count incremented
- Browser: attempt to submit empty comment → submit button disabled (client-side guard)
- `npm run build` still passes after all tasks complete

## Observability / Diagnostics

- Runtime signals: `createComment` server action logs `[createComment] error:` to console on DB insert failure; returns `{ error: string }` on auth or insert failure so CommentThread can display an inline error message
- Inspection surfaces: `./scripts/migrate.sh "SELECT id, post_id, user_id, content, created_at FROM comments ORDER BY created_at DESC LIMIT 10"` — confirm comment rows land in DB; browser DevTools Network tab shows Supabase REST calls from CommentThread
- Failure visibility: `createComment` returns `{ error: 'Unauthorized' }` when no auth token found; `{ error: 'Insert failed' }` on DB error — CommentThread renders these as inline error text below the form
- Redaction constraints: no secrets or PII in logs; `user_id` is a UUID (non-sensitive for logging purposes)

## Integration Closure

- Upstream surfaces consumed: `PostCard` component (S01 state), `posts` table (existing), `profiles` table (existing, for comment author display), `lib/admin-guard.ts` (auth token extraction pattern), `lib/supabase.ts` browser client, `lib/supabase-admin.ts` server client
- New wiring introduced in this slice: `app/explore/actions.ts` (server action) ← wired into `CommentThread` client component ← rendered alongside `PostCard` in `app/explore/page.tsx`; `supabase/migrations/013_comments.sql` applied to production
- What remains before the milestone is truly usable end-to-end: S03 notification hook (TODO stub left in `createComment`), follow system (S04), DMs (S07)

## Tasks

- [ ] **T01: Create comments table migration and Comment type** `est:30m`
  - Why: Establishes the DB contract (table + RLS) and TypeScript type that all subsequent tasks depend on
  - Files: `supabase/migrations/013_comments.sql`, `lib/types.ts`
  - Do: Write idempotent migration creating `comments` table (id uuid pk, post_id uuid FK posts, user_id uuid FK auth.users, content text not null, created_at timestamptz default now()); add RLS policies: `select` for public, `insert` for authenticated with `auth.uid() = user_id` check, `delete` for owner (`auth.uid() = user_id`). Apply migration via `./scripts/migrate.sh`. Add `Comment` type to `lib/types.ts`. Add `comments?: [{ count: number }] | null` to `Post` type to hold PostgREST embedded count response.
  - Verify: `./scripts/migrate.sh "SELECT table_name FROM information_schema.tables WHERE table_name = 'comments'"` returns a row; `./scripts/migrate.sh "SELECT policyname FROM pg_policies WHERE tablename = 'comments'"` shows at least 3 policies; `npm run build` passes
  - Done when: migration applied to production, `Comment` type and updated `Post` type in `lib/types.ts`, build clean

- [ ] **T02: Add createComment server action** `est:30m`
  - Why: Provides the authenticated insert entry point that CommentThread will call; establishes the S03 notification hook stub
  - Files: `app/explore/actions.ts` (new file)
  - Do: Create `'use server'` file. Export `createComment(postId: string, content: string): Promise<{ error?: string }>`. Extract auth token from cookies using same pattern as `lib/admin-guard.ts` (find cookie with name startsWith `sb-` + endsWith `-auth-token`, parse JSON, take `[0]` or `.access_token`). Call `admin.auth.getUser(token)` — return `{ error: 'Unauthorized' }` if no user. Validate `content.trim()` is non-empty — return `{ error: 'Content required' }` if empty. Insert into `comments` with `{ post_id: postId, user_id: user.id, content: content.trim() }`. On insert error, log `[createComment] error:` and return `{ error: 'Insert failed' }`. Call `revalidatePath('/explore')`. Add TODO comment: `// TODO S03: call createNotification(user.id, post.user_id, 'comment', newComment.id)`. Return `{}` on success.
  - Verify: `npm run build` passes (TypeScript checks the new file); inspect file exists at `app/explore/actions.ts`
  - Done when: `app/explore/actions.ts` exports `createComment`, file compiles, build clean

- [ ] **T03: Update Explore page to fetch comment counts and render CommentThread** `est:1h`
  - Why: Wires comment counts into the Explore feed and renders the CommentThread alongside each PostCard
  - Files: `app/explore/page.tsx`, `components/PostCard.tsx`, `components/CommentThread.tsx` (new file)
  - Do: (1) In `app/explore/page.tsx`: change the posts query to `.select('*, comments(count), contractors(full_name, trade, location_city, location_state)')`. After merging profiles, also extract comment count: `const commentCountMap = Object.fromEntries(postsWithProfiles.map(p => [p.id, (p.comments?.[0] as any)?.count ?? 0]))`. In the feed JSX, replace `<PostCard key={post.id} post={post} />` with a wrapping fragment: `<PostCard key={post.id} post={post} commentCount={commentCountMap[post.id]} /><CommentThread postId={post.id} initialCount={commentCountMap[post.id]} />` inside the same `space-y-3` div — or nest them in a single `<div key={post.id}>`. (2) In `components/PostCard.tsx`: add optional `commentCount?: number` prop to the `Props` interface. Below the post content (and link/image), add a comment toggle button that accepts an `onToggle` callback — but since PostCard must stay server-safe and CommentThread is a sibling, just render the count as a static display element: a `<button>` with `'use client'` would break the server contract. Instead, keep PostCard pure: add a `commentCount` prop that renders `<div className="mt-3 text-xs text-slate-500">💬 {commentCount ?? 0} comments</div>` as a static label. The interactive toggle lives entirely in CommentThread. (3) Create `components/CommentThread.tsx` as `'use client'`. Props: `postId: string`, `initialCount: number`. State: `open: boolean`, `comments: Comment[]`, `loading: boolean`, `error: string | null`, `submitting: boolean`, `text: string`. On mount (or when `open` flips to true), fetch comments from Supabase: `supabase.from('comments').select('*, profiles(username, avatar_url)').eq('post_id', postId).order('created_at', { ascending: true })`. Render: a "💬 N comments" clickable button that toggles `open`. When open: show comment list (each comment: avatar initial or image, `@username`, time-ago, content); if empty show "No comments yet. Be the first."; show a textarea + "Post" button; disable Post button when `text.trim() === ''` or `submitting`; on submit call `createComment(postId, text)` server action, handle error by setting `error` state, on success clear text and re-fetch comments; show inline error message if `error` is set.
  - Verify: `npm run build` passes. Browser: `/explore` loads, each post shows "💬 N comments" count label in PostCard + a separate CommentThread toggle button below it. Click toggle → thread expands. Submit a comment (must be logged in) → appears in thread.
  - Done when: build clean, browser flow works end-to-end: count visible, thread opens, comment submits and appears, error state renders on failure

## Files Likely Touched

- `supabase/migrations/013_comments.sql` (new)
- `lib/types.ts`
- `app/explore/actions.ts` (new)
- `app/explore/page.tsx`
- `components/PostCard.tsx`
- `components/CommentThread.tsx` (new)
