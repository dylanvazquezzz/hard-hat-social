# M002: Social Layer

**Vision:** Transform Hard Hat Social from a directory with a bulletin board into a real social network — with comments, notifications, follows, DMs, and SEO — so contractors have a reason to come back every day.

## Success Criteria

- A contractor can comment on any post and see reply threads in the Explore feed
- Every contractor receives an in-app notification (bell icon) when someone engages with their content
- High-value events (comment on post, job in trade, approval) trigger Resend emails
- A contractor can follow others and filter the Explore feed to only followed users
- Two contractors can have a private DM conversation without leaving the platform
- Public profile pages rank in Google for contractor name + trade + location searches
- A newly approved contractor sees an onboarding checklist on first login
- TRADES constant is defined in one place (lib/constants.ts), imported everywhere
- Apply form rejects submissions exceeding 3 per email per 24 hours (server-side)
- Admin approve/reject actions are confirmed RLS-protected at the server level

## Key Risks / Unknowns

- Supabase RLS on messages table — per-user-pair visibility is tricky to get right without a full-table scan
- Notification fan-out at scale — a popular job post could trigger dozens of emails; Resend rate limits apply
- SEO crawlability — Next.js App Router dynamic routes need explicit generateMetadata() or Google won't index

## Proof Strategy

- Supabase RLS on messages → retire in S07 by proving User A cannot read User B/C thread via direct API query
- Notification fan-out → retire in S03 by proving bulk email send works and doesn't time out a server action
- SEO crawlability → retire in S05 by confirming og:title, og:description, and JSON-LD are present in page source

## Verification Classes

- Contract verification: TypeScript builds clean, migrations verify with SELECT, RLS policies tested via direct Supabase queries
- Integration verification: full browser flows for comments, notifications, follows, DMs exercised in dev + production
- Operational verification: all migrations applied and verified in production Supabase before slice is marked done
- UAT / human verification: DM flow, notification bell, onboarding checklist require visual browser confirmation

## Milestone Definition of Done

This milestone is complete only when all are true:

- All 7 slices shipped and deployed to production
- Migrations 013–020 applied and verified in production Supabase
- Full browser flow exercised: post → comment → notification bell + email → follow → DM
- Public profile pages have og:title + JSON-LD in production page source
- TRADES defined in lib/constants.ts only — grep confirms no other definitions
- Apply rate limiting confirmed blocking a 4th submission in same 24h window
- Admin server actions confirmed RLS-protected (not client-gated only)
- Success criteria re-checked against live hardhatsocial.net, not just localhost

## Slices

- [ ] **S01: Foundation Cleanup** `risk:low` `depends:[]`
  > After this: TRADES consolidated to lib/constants.ts, apply form rate-limited, admin actions audited and confirmed server-protected, error boundaries on Directory + Explore

- [ ] **S02: Comments on Posts** `risk:medium` `depends:[S01]`
  > After this: Any contractor can reply to a post on the Explore feed, reply thread is visible inline, comment count shown on PostCard

- [ ] **S03: Notifications** `risk:high` `depends:[S02]`
  > After this: Bell icon in NavBar shows unread count, clicking opens /notifications page, comment + job + approval events trigger in-app notifications and Resend emails

- [ ] **S04: Follow System** `risk:medium` `depends:[S03]`
  > After this: Contractors can follow/unfollow from public profiles, Explore feed has a Following tab showing only followed users' posts

- [ ] **S05: SEO + Public Profile Discoverability** `risk:low` `depends:[S01]`
  > After this: Public profiles have generateMetadata(), OpenGraph tags, and LocalBusiness JSON-LD in page source; directory and homepage have proper title/description meta

- [ ] **S06: Onboarding + Homepage Polish** `risk:low` `depends:[S03]`
  > After this: Newly approved contractors see a /welcome page with 3 first steps on login; homepage contractor count replaced with non-numeric social proof copy

- [ ] **S07: Direct Messaging** `risk:high` `depends:[S04]`
  > After this: A contractor can open a DM thread from any public profile or contractor detail page, send messages, and receive replies — all within the platform; no real-time required, polling is fine

## Boundary Map

### S01 → S02, S05, S06

Produces:
- `lib/constants.ts` — TRADES array, exported and imported by apply/page.tsx, SearchFilters.tsx, app/page.tsx, CreateJobForm.tsx
- Error boundary wrappers on /contractors and /explore (Suspense + error.tsx)
- Apply form server-side rate limit logic (max 3 per email per 24h)
- Admin action audit report in DECISIONS.md

Consumes:
- nothing (cleanup slice)

### S02 → S03, S04

Produces:
- `comments` table: id, post_id, user_id, content, created_at; RLS: read=public, write=authenticated
- `Comment` type in lib/types.ts
- CommentThread component (inline toggle below PostCard)
- Comment count displayed on PostCard
- Server action: createComment(postId, content)

Consumes:
- PostCard component (S01 state)
- posts table (existing)
- profiles table (existing, for author display)

### S03 → S06

Produces:
- `notifications` table: id, user_id, type (comment|job|approval), reference_id, read, created_at; RLS: user sees own only
- `Notification` type in lib/types.ts
- Bell icon in NavBar with unread count (client component)
- /notifications page listing recent notifications
- Resend email templates: comment notification, job-in-trade alert, approval email (replaces existing)
- Server actions: markNotificationRead, createNotification (internal)

Consumes:
- NavBar.tsx (S01 state)
- createComment server action (S02)
- jobs table (existing)
- lib/email.ts (existing Resend setup)

### S04 → S07

Produces:
- `follows` table: follower_id, following_id, created_at; RLS: read=public, write=own rows
- `Follow` type in lib/types.ts
- Follow/Unfollow button on /u/[username] and /contractors/[id]
- "Following" tab on Explore feed (filter posts to followed user_ids)
- Follower/following count on public profiles

Consumes:
- /u/[username]/page.tsx (S05 state for SEO)
- /contractors/[id]/page.tsx (existing)
- Explore feed (S03 state)

### S05 → (production SEO)

Produces:
- generateMetadata() on /u/[username]/page.tsx (name, trade, location, avatar)
- generateMetadata() on /contractors/[id]/page.tsx
- OpenGraph tags on homepage and /contractors
- LocalBusiness JSON-LD script on /u/[username] and /contractors/[id]
- Unique title + description on /explore, /jobs, /apply, /auth

Consumes:
- existing page components (S01 state)
- contractors + profiles tables (existing)

### S06 → (user activation)

Produces:
- /welcome page — 3-step checklist: complete profile, make first post, browse directory
- Triggered on first login after approval (check contractor.status === 'approved' + no prior welcome seen)
- Homepage contractor count replaced with "Growing network of verified pros" copy

Consumes:
- auth session (existing)
- contractors table (existing)
- Resend approval email updated to link to /welcome (S03 state)

### S07 → (DM system complete)

Produces:
- `messages` table: id, sender_id, recipient_id, content, read, created_at; RLS: sender or recipient only
- `Message` type in lib/types.ts
- /messages page — list of conversations (grouped by other user)
- /messages/[userId] page — single thread with send form
- "Message" button on /u/[username] and /contractors/[id] (auth-gated, approved contractors only)
- Messages link in NavBar dropdown + unread count badge
- Polling: refetch thread every 30s on /messages/[userId]

Consumes:
- follows table (S04 — establishes trust layer for messaging)
- profiles table (existing — for avatar + username in thread)
- NavBar.tsx (S03 state — unread count pattern established)
