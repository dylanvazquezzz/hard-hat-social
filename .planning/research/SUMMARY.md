# Project Research Summary

**Project:** Hard Hat Social (formerly Contractors Connect)
**Domain:** Verified B2B contractor social platform — v1.2 milestone: rebrand, jobs lifecycle, mutual ratings, feed redesign
**Researched:** 2026-03-04
**Confidence:** HIGH

## Executive Summary

Hard Hat Social is a verified contractor directory and social platform built on a locked stack of Next.js 14, Supabase, Tailwind CSS v3, and Vercel. The MVP is complete. This v1.2 milestone adds four major capabilities: a domain rebrand to hardhatsocial.net with an updated color scheme, a two-column explore feed with a suggested-connections sidebar, a platform-tracked job lifecycle (open → hired → completed), and a mutual rating system that ties all ratings to verified job completions. Every feature is achievable within the existing dependency set — zero new npm packages are required. The two new capabilities that need schema changes (jobs and ratings) require new Supabase migrations using the text + CHECK constraint pattern already established in the codebase.

The recommended build order follows the dependency chain: database schema first (everything else depends on it), domain rebrand in parallel (no data dependencies), feed redesign next (no new schema needed), jobs UI after schema, and ratings UI last (depends on jobs). The existing server component + server action architecture must be strictly preserved — client components are leaf nodes only, all writes go through server actions with double-enforcement (application pre-check plus RLS), and the explore page sidebar must remain server-rendered to avoid degrading mobile performance for tradespeople on slow connections.

The primary risks are operational rather than technical. The domain rebrand touches four separate systems — Vercel env vars, Supabase Auth Site URL, Resend DNS, and application code — and missing any one of them silently breaks email delivery for the founding cohort. The ratings system requires blind submission (simultaneous reveal) from day one; retrofitting this after ratings are already visible to both parties causes irreparable trust damage that cannot be fixed with a schema migration. Both risks have clear, concrete prevention checklists and must be verified end-to-end before any real user interacts with the rebranded application.

## Key Findings

### Recommended Stack

The existing stack handles every v1.2 feature without additions. Two new Supabase migrations are required: one for the `jobs` table (with a BEFORE UPDATE trigger enforcing state transitions) and one for the `ratings` table (with a unique constraint on `(job_id, rater_id)` and a blind-submission reveal gate). Status columns use `text NOT NULL CHECK (status IN (...))` rather than Postgres enums — consistent with the existing codebase and avoids the limitation that enum values cannot safely be removed once created. The Tailwind rebrand is handled via `theme.extend.colors` in `tailwind.config.ts`, adding `brand.blue`, `brand.yellow`, and `brand.white` tokens without disrupting existing utility classes.

**Core technologies:**
- Next.js 14 (App Router): framework — the server component + server action pattern is the correct model for all new features; no upgrade warranted
- Supabase Postgres + RLS: database — two new migrations needed; the existing `is_approved_contractor()` helper function is reusable in new RLS policies
- Tailwind CSS v3: styling — brand color extension via `theme.extend.colors`; do NOT upgrade to Tailwind v4 mid-milestone (breaking config format change)
- Resend: email delivery — domain re-verification for `hardhatsocial.net` must start before any code changes due to 48-hour DNS propagation
- Vercel: hosting — `NEXT_PUBLIC_APP_URL` env var must be updated and a new production deployment triggered; env vars baked at build time do not take effect until redeployment

### Expected Features

**Must have (v1.2 core — each must be complete enough to be usable, not just present):**
- Full-width post cards with a right sidebar on the explore feed — industry standard since LinkedIn/Twitter normalized it; narrow single-column feels like an afterthought
- Right sidebar with "Recently Verified" and "Suggested People (same trade)" widgets — 5-8 items max, no infinite scroll
- Jobs state machine: GC can mark a sub as hired and mark the job complete; status visible to both parties on job cards
- Rating prompt (5-star + optional 280-char text) for both GC and sub after job completion; simultaneous reveal (neither party sees the other's rating until both submit or 14 days expire)
- Ratings displayed on contractor profiles — average score and count in "4.8 (12 ratings)" format
- Completed jobs portfolio section on contractor profiles — system-written fields (job title, GC name, completion date, received rating) are not user-editable; this protects the verified claim

**Should have (add after v1.2 core ships):**
- Rating sub-dimensions: Quality, Timeliness, Professionalism for subs; Payment, Communication, Safety for GCs
- Trade-filtered feed defaulting to the logged-in contractor's primary trade with an "All Trades" toggle
- Sub-added description and optional photo on portfolio entries (additive, does not override system-written fields)
- Active open jobs sidebar widget (lower priority than the two people-discovery widgets)
- GC profile rating scorecard — GCs being rated is a differentiator; build after ratings data exists to display

**Defer to v2+:**
- AI-based sidebar recommendations — insufficient network signal at under 500 users; rule-based suggestions (same trade, same state, recently joined) are more reliable and faster to build
- Admin dispute resolution flow for contested job completions — scope expansion; keep it human and manual for now
- Self-reported past jobs section — directly undermines the verified portfolio moat; if any entry can be fabricated, none are credible

### Architecture Approach

New features slot cleanly into the existing architecture without changing its shape. Server components fetch all data using `supabase-admin.ts` with `Promise.all` for parallel queries. Client components remain leaf nodes: two new interactive mutation components (`JobStatusControl`, `RatingForm`) and one modal (`SubSelectorModal`) join the existing three client components. The explore page sidebar is a server-rendered component that fetches suggested contractor data in the same `Promise.all` as the main post feed — no extra round-trip, no client boundary at the page level. All writes go through server actions with explicit pre-checks that run before the Supabase insert, backed by RLS as a second enforcement layer.

**Major components:**
1. `jobs` table (new) — GC-owned entity with status lifecycle; BEFORE UPDATE trigger rejects invalid transitions at the DB layer; RLS restricts status updates to the GC who posted the job
2. `ratings` table (new) — tied to `job_id` FK; unique constraint on `(job_id, rater_id)`; reveal gate enforced at query/RLS level so unrevealed ratings are never returned to non-admin users
3. `FeedSidebar` (new, server-compatible) — fetched in `Promise.all` from the explore page server component; receives data as props; no `'use client'` directive
4. `JobStatusControl` + `SubSelectorModal` (new, client leaf nodes) — use `useTransition` for pending state; call server actions directly
5. `RatingForm` (new, client leaf node) — only rendered when a server-side eligibility check confirms the viewer worked a completed job with this contractor and has not yet rated
6. `CompletedJobsSection` + `RatingSummary` + `RatingList` (new, server-compatible display components) — added to contractor profile page via `Promise.all` alongside existing queries

**New server actions:**
- `app/jobs/actions.ts` — `createJob`, `markHired`, `markCompleted`; all pre-check that the caller is the GC on this job before calling Supabase
- `app/ratings/actions.ts` — `submitRating`; pre-checks `job.status === 'completed'` and that the ratee is a participant; RLS independently enforces the same rules

### Critical Pitfalls

1. **Domain rebrand misses Supabase Auth Site URL — every email link breaks** — approval and rejection emails sent to the founding cohort link to the old domain or localhost. Prevention: complete all four systems atomically in a single checklist (Vercel env var + redeploy, Supabase Site URL + redirect allowlist update, Resend domain DNS verification, `email.ts` fallback constant removal). Send a real test approval email to a personal Gmail account on production and confirm the link reads `hardhatsocial.net` before onboarding any real user.

2. **Resend domain unverified — emails land in spam with no app error** — Resend returns `200 OK` even when the sender domain is unverified; the failure is silent at the inbox level. Prevention: start Resend DNS verification for `hardhatsocial.net` on day one of the milestone — before writing any code — because propagation takes up to 48 hours. Do not retire the old domain in Resend until the new one shows `Verified`.

3. **Mutual ratings without verified job completion — rating system is gameable immediately** — in a small tight-knit trade community, one bad actor can tank a competitor's rating. Prevention: enforce at both the DB layer (RLS INSERT policy gates on `job.status = 'completed'` and participant membership) and the server action pre-check layer. Add `UNIQUE (job_id, rater_id)` constraint in the schema migration.

4. **Ratings revealed immediately (no blind submission) — signal becomes meaningless within weeks** — sequential reveal creates social pressure; Airbnb's research shows simultaneous reveal reduces retaliatory 1-star ratings by 31% and produces more honest negative text. Prevention: ratings are stored but not returned by any SELECT policy until both parties have submitted OR the 14-day window has expired. This cannot be retrofitted without schema migration and trust damage from early retaliatory ratings — implement blind submission from day one.

5. **Job state machine has no DB enforcement — states can be skipped or regressed** — a text + CHECK constraint validates values but not transitions; any code path (admin dashboard SQL editor, future feature) can bypass application-layer rules. Prevention: add a BEFORE UPDATE Postgres trigger in the jobs migration that rejects `completed → any` and `hired → open` transitions. Server action pre-checks provide UX-friendly errors; the DB trigger is the actual security boundary.

6. **`'use client'` propagates to the explore feed page — mobile performance degrades** — the sidebar needs per-user data (current user's trade for filtering), which tempts developers to mark the feed page as `'use client'`. In Next.js App Router, the directive propagates through the import tree, pulling the entire feed into client territory. Prevention: read session server-side in `explore/page.tsx`; pass `userId` as a prop to the sidebar; keep any client interactivity in a narrow leaf component below the feed layout.

## Implications for Roadmap

The dependency chain is clear and the build order is well-defined. Jobs must exist before ratings. The database schema must exist before any jobs or ratings UI. The rebrand has no data dependencies and can proceed in parallel with schema work. Feed redesign has no new data dependencies and is the lowest-risk item to ship as soon as the rebrand is complete.

### Phase 1: Bug Fixes and Rebrand

**Rationale:** Existing bugs in the approval flow and email system must be resolved before any new user is onboarded. The domain rebrand must be complete before the founding cohort sees the platform. This phase has no new data dependencies — it is code fixes and configuration changes only. It is also the highest-operational-risk phase because it touches four separate systems that do not know about each other.

**Delivers:** Fully operational approval flow (admin nav, contractor visibility post-approval, certs showing on profiles); approval and rejection emails that link to `hardhatsocial.net` and land in inboxes; Hard Hat Social branding (color tokens in `tailwind.config.ts`, NavBar update, metadata base URL); `NEXT_PUBLIC_APP_URL` pointing to production domain with redeployment triggered

**Addresses:** Admin nav bug, email URL localhost bug, contractor visibility post-approval bug, certs not showing bug; brand color scheme; domain configuration across all four systems

**Avoids:** Domain rebrand checklist pitfall (verify all 4 systems, send real test email); Resend deliverability pitfall (start DNS day one before writing any code); approval flow regression pitfall (end-to-end test is the exit gate for this phase)

### Phase 2: Database Schema — Jobs and Ratings Tables

**Rationale:** Every subsequent phase depends on the `jobs` and `ratings` tables existing in Supabase with correct RLS and constraints. This is a blocking dependency. Migrations must be written and applied before any server actions or UI components referencing these tables can be built. TypeScript types must be added to `lib/types.ts` immediately after.

**Delivers:** `jobs` table with text + CHECK status constraint, BEFORE UPDATE state transition trigger, RLS policies (public SELECT for open jobs, GC-only INSERT and UPDATE), and indexes; `ratings` table with `job_id` FK, unique constraint on `(job_id, rater_id)`, score CHECK, reveal gate, RLS policies, and indexes; `Job` and `Rating` TypeScript interfaces in `lib/types.ts`

**Addresses:** Foundation for all jobs and ratings features; all trust and integrity constraints defined at schema level before UI is built on top

**Avoids:** New tables without RLS pitfall (policies in same migration file as table creation); job state machine bypass pitfall (DB trigger in same migration, not deferred); rating gaming pitfall (UNIQUE constraint and job completion gate in schema, not just application code)

### Phase 3: Feed Redesign

**Rationale:** The feed layout change queries only the existing `contractors` table (for suggested connections) and the existing `posts` table (for feed content). It has zero dependencies on the new jobs/ratings schema. It is the lowest-risk feature in the milestone and can ship independently as soon as the rebrand is complete, providing user-visible progress while the heavier schema-dependent features are built.

**Delivers:** Two-column explore page layout (full-width posts column + right sidebar); `FeedSidebar` server-compatible component with "Recently Verified" and "Suggested People (same trade)" widgets; `Promise.all` parallel data fetching in the explore server component; category tab filtering preserved at the top of the feed column; empty states per feed tab

**Addresses:** Full-width post cards, right sidebar for discovery, suggested connections, recently verified members widget

**Avoids:** `'use client'` propagation pitfall (sidebar stays server-compatible, `userId` passed as prop from page); sidebar performance pitfall (LIMIT 8, order by `created_at DESC` — simple query, no complex NOT IN)

### Phase 4: Jobs Lifecycle UI

**Rationale:** With the schema in place, the jobs UI can be built: migrating `app/jobs/page.tsx` from querying the `posts` table to the new `jobs` table, adding server actions, and creating the `JobCard`, `JobStatusControl`, and `SubSelectorModal` components. The existing `posts` table with `category='jobs'` is left intact — no hard cutover until the full jobs UI is built and verified locally.

**Delivers:** GC can post a job, mark a sub as hired (via `SubSelectorModal` searching the approved contractor directory), and mark a job complete; job status lifecycle visible on cards with status pills (Posted, Hired, Completed); completed jobs available as a portfolio data source for the next phase; server actions `createJob`, `markHired`, `markCompleted` in `app/jobs/actions.ts`

**Addresses:** Jobs state machine (open → hired → completed), GC-controlled status progression, sub selector from the verified directory, portfolio foundation

**Avoids:** Sub self-advancing job status anti-pattern (RLS UPDATE policy + server action pre-check both restrict status changes to the GC); hard cutover from old posts table (keep `posts` table intact; migrate `jobs/page.tsx` only after new UI is fully verified)

### Phase 5: Ratings System and Portfolio UI

**Rationale:** Ratings require completed jobs, so this phase comes after Phase 4. The rating form, summary, and list components are built on top of the already-validated schema and server actions. The completed jobs portfolio section on contractor profiles is delivered in this same phase because it reads from the same completed `jobs` data and is tightly coupled to the rating display.

**Delivers:** `RatingForm` client component (5-star + optional 280-char text); `submitRating` server action with double-enforcement (pre-check + RLS); blind reveal logic (ratings not returned until both parties submit or 14 days expire); `RatingSummary` and `RatingList` on contractor profile pages; `CompletedJobsSection` showing the verified portfolio (job title, GC name, completion date, received rating) on contractor profiles; server-side eligibility check gates `RatingForm` rendering

**Addresses:** Mutual ratings (GC and sub can each rate the other), simultaneous reveal, ratings aggregate on profiles, past jobs portfolio

**Avoids:** Immediate reveal pitfall (blind submission implemented from day one, not retrofitted); rating without job reference (enforced at schema and action layers — both must pass); ratings aggregate performance (query-time AVG is acceptable at current scale; denormalize to `contractors.rating_avg` column if profile load time grows)

### Phase Ordering Rationale

- Phase 1 must come first because DNS propagation is a real-world 48-hour constraint, env vars baked at build time are sticky, and the founding cohort cannot be onboarded until email links work correctly on the production domain.
- Phase 2 (schema) is a hard blocker for Phases 4 and 5. It can run in parallel with Phase 3 (feed) since the feed has no new schema dependencies, but it must complete before jobs or ratings UI begins.
- Phase 3 (feed redesign) is the right item to ship early because it has no new data dependencies, demonstrates visible progress, and validates the two-column layout before the heavier trust features land on top of it.
- Phase 4 (jobs UI) comes before Phase 5 (ratings) because completed jobs are the gate for ratings eligibility; you cannot demonstrate the rating flow without a completed job to trigger it.
- Phase 5 (ratings + portfolio) is the most complex phase and depends on all prior phases being stable — it closes the trust loop that is the core value proposition of the milestone.

### Research Flags

Phases likely needing deeper research during planning:

- **Phase 5 (Ratings):** The blind reveal mechanism has two valid implementation approaches — a `revealed` boolean column flipped by a cron job or Edge Function, versus a query-time check that joins the ratings table to count how many directions have been submitted. The trade-offs (operational complexity of cron vs. query complexity at read time) should be evaluated during phase planning before schema is finalized.
- **Phase 4 (Jobs):** The `SubSelectorModal` search-as-you-type against the contractor directory should use the existing GIN full-text search index from migration 005. Verify the exact query pattern before building the modal to avoid an inefficient `ILIKE` scan.

Phases with standard patterns (skip deeper research):

- **Phase 1 (Bug Fixes + Rebrand):** All fixes are code-level or configuration changes; research is complete. The rebrand checklist is fully specified in PITFALLS.md.
- **Phase 2 (Schema):** The exact SQL for both tables, triggers, and RLS policies is drafted in STACK.md and ARCHITECTURE.md. No further research needed.
- **Phase 3 (Feed Redesign):** Pure Tailwind grid layout change (`lg:grid-cols-3`) and a new server component query. The pattern is established and well-documented.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Direct codebase inspection of `package.json`, `tailwind.config.ts`, existing migrations, and all component files. Tailwind v3 patterns verified against official v3 docs. Exact migration SQL is drafted and consistent with existing codebase conventions. |
| Features | HIGH | Table stakes sourced from LinkedIn, Upwork, and Airbnb patterns. Simultaneous reveal backed by NBER academic research (Fradkin et al.) — 31% retaliation reduction is a primary-source finding. Portfolio read-only pattern is fundamental to every verified credential system. |
| Architecture | HIGH | Based on direct codebase inspection of all server actions, route handlers, migrations, and page components. All new patterns are extensions of existing conventions — no novel architectural decisions required. |
| Pitfalls | HIGH | Domain rebrand pitfalls are codebase-specific findings from reading `lib/email.ts` and `app/admin/actions.ts` directly. Ratings pitfalls backed by academic research and Airbnb's published policy rationale. DB trigger pattern sourced from official PostgreSQL documentation. |

**Overall confidence:** HIGH

### Gaps to Address

- **Blind reveal mechanism:** Research confirms simultaneous reveal is required and a 14-day window is the standard, but the exact implementation choice (revealed boolean + cron vs. query-time join check) should be locked during Phase 5 planning. The query-time approach avoids the operational complexity of a scheduled job but adds a join on every profile load. At current scale either is acceptable; document the decision in the migration file.

- **Rating window notification:** PITFALLS research recommends showing the rating prompt 24-48 hours post-completion (via a Resend email reminder) rather than immediately, to give GCs time to assess payment timeliness before rating. Implementing this requires a delayed/scheduled email trigger not currently in the Resend integration. Evaluate whether to defer the delay to a later milestone (accepting the UX downside of immediate prompts) or to add it in Phase 5.

- **Old `posts` table job entries:** The current `posts` table contains entries with `category='jobs'` from the existing informal jobs board. The plan leaves these untouched during Phase 4. A product decision is needed on how to communicate to GCs that informal posts do not support lifecycle tracking, and whether to eventually archive or migrate them.

- **Ratings aggregate performance:** At current scale, computing `AVG(score)` on every profile load is acceptable. If the platform grows to 500+ contractors with significant rating data, a denormalized `rating_avg` and `rating_count` column on the `contractors` table (updated by trigger on each rating insert) will be needed. Flag this as a future optimization, not a blocker for Phase 5.

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection of `/Users/dylanvazquez/Desktop/contractors-connect/` (2026-03-04) — `lib/email.ts`, `lib/supabase-admin.ts`, `app/admin/actions.ts`, `supabase/migrations/*.sql`, `tailwind.config.ts`, `package.json`, all page and component files
- [Supabase RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security) — policy design for jobs and ratings tables
- [Supabase Auth Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls) — Site URL and allowlist configuration
- [Tailwind CSS v3 Customizing Colors](https://tailwindcss.com/docs/customizing-colors) — `theme.extend.colors` pattern confirmed for v3
- [Vercel custom domains](https://vercel.com/docs/domains/working-with-domains/add-a-domain) — DNS setup for hardhatsocial.net
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) — `useTransition` with server actions, `revalidatePath` patterns
- [PostgreSQL Constraints Documentation](https://www.postgresql.org/docs/current/ddl-constraints.html) — UNIQUE and CHECK constraint design
- Airbnb simultaneous review reveal — Fradkin, Grewal, Holtz, Pearson (NBER); 31% reduction in retaliatory ratings with simultaneous reveal; Airbnb official policy rationale
- [ResearchGate: Tit for Tat? Two-Sided Reputation Systems](https://www.researchgate.net/publication/346961659) — academic backing for blind submission

### Secondary (MEDIUM confidence)
- [GetStream: Social Media Feed Design Patterns](https://getstream.io/blog/social-media-feed/) — feed sidebar layout conventions
- [Hootsuite: LinkedIn Algorithm 2025](https://blog.hootsuite.com/linkedin-algorithm/) — suggested connections sidebar patterns
- [Upwork: Job Success Score](https://support.upwork.com/hc/en-us/articles/211068358-All-about-your-Job-Success-Score) — bidirectional rating system reference
- [Resend domain management](https://resend.com/docs/dashboard/domains/introduction) — DNS verification process and propagation timeline
- [Postgres state machine enforcement](https://blog.lawrencejones.dev/state-machines/) — BEFORE UPDATE trigger pattern
- Platform growth wisdom: rule-based suggestions are reliable at under 500 users; algorithmic recommendations require data density

### Tertiary (LOW confidence)
- [TaskTag: Contractor Portfolio Guide 2026](https://portal.tasktag.com/blog/contractor-portfolio) — contractor portfolio UX norms; single source in contractor marketing context, treat as directional only

---
*Research completed: 2026-03-04*
*Ready for roadmap: yes*
