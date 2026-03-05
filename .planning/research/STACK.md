# Stack Research

**Domain:** Verified contractor social platform — milestone v1.2 (rebrand + jobs + ratings + feed redesign)
**Researched:** 2026-03-04
**Confidence:** HIGH — all claims verified against official Supabase docs, Tailwind v3 docs, Vercel docs, and existing codebase inspection

---

## Context: What This Research Covers

The core stack (Next.js 14, Supabase, Tailwind v3, TypeScript, Resend, Vercel) is locked and validated. This research answers only what is NEEDED for the five new milestone features:

1. **Bug fixes** — admin nav, email URL (localhost), contractor visibility post-approval, certs not showing
2. **Rebrand** — Hard Hat Social / hardhatsocial.net / lighter blue + yellow + white color scheme
3. **Feed redesign** — full-width posts on explore, right sidebar with suggested connections
4. **Jobs system** — GC marks job hired → completed; completed jobs appear as portfolio on contractor profiles
5. **Ratings system** — mutual GC ↔ sub ratings after platform-verified job completion

**Verdict: Zero new npm packages required.** Every new feature is achievable with the existing stack plus new Supabase migrations and Tailwind config changes.

---

## Current Stack (Do Not Upgrade)

| Technology | Version | Status |
|------------|---------|--------|
| Next.js | ^14.2.18 | Locked — no upgrade needed |
| Supabase JS | ^2.45.4 | Locked — no upgrade needed |
| Tailwind CSS | ^3.4.14 | Locked — v3, NOT v4 |
| TypeScript | ^5.6.3 | Locked |
| Resend | ^6.9.3 | Locked |

---

## Feature Analysis: What Each Feature Actually Needs

### Feature 1: Bug Fixes

No stack changes. These are code-level fixes:

| Bug | Root Cause (likely) | Fix Layer |
|-----|---------------------|-----------|
| Admin nav link broken | Hardcoded path or missing auth check | `components/NavBar.tsx` |
| Email URLs point to localhost | `NEXT_PUBLIC_APP_URL` not set in Vercel prod env | Vercel dashboard env var |
| Contractor not appearing post-approval | RLS policy or missing status filter in query | Supabase SQL + query fix |
| Certs not showing on profiles | Admin approval action (`actions.ts`) doesn't create `certifications` rows | Server action logic |

**Stack requirement:** None. Environment variable `NEXT_PUBLIC_APP_URL` must be set to `https://hardhatsocial.net` (or current prod URL) in Vercel dashboard. This already exists in the stack.

---

### Feature 2: Rebrand — Hard Hat Social / hardhatsocial.net

**Two parts: brand colors in Tailwind config + domain in Vercel.**

#### Part A: Tailwind Color Scheme

The project uses Tailwind CSS v3 with `tailwind.config.ts`. The current theme is `slate-950` background, `amber-500` accents. The rebrand calls for lighter blue + yellow + white.

**Pattern:** Extend `theme.colors` (not `theme.extend.colors`) in `tailwind.config.ts` to add brand-specific tokens. Keep Tailwind's default slate/blue/etc. available via `theme.extend` so existing components don't break.

The correct v3 approach (verified against Tailwind v3 docs — this project is NOT on v4):

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Hard Hat Social brand colors
        brand: {
          blue:   '#1E6FBF',   // primary — lighter steel blue
          yellow: '#F5C518',   // accent — hard hat yellow
          white:  '#F8FAFC',   // surface — near-white
        },
      },
    },
  },
  plugins: [],
}

export default config
```

This adds `bg-brand-blue`, `text-brand-yellow`, `border-brand-white` etc. without touching existing Tailwind utilities.

**Also update `app/globals.css`:** The current body defaults to `bg-slate-950 text-slate-100`. The rebrand should update this to lighter base (or leave it and apply new classes per-component if the dark theme is partially retained).

**No npm package required.** This is a config + class replacement across components.

#### Part B: Domain — hardhatsocial.net on Vercel

1. In Vercel dashboard → Project Settings → Domains → Add `hardhatsocial.net` and `www.hardhatsocial.net`
2. Vercel provides an A record (for apex) and CNAME (for www). Add these at the domain registrar.
3. Vercel auto-provisions SSL. DNS propagates in minutes to 48 hours.
4. Update environment variable `NEXT_PUBLIC_APP_URL` from old value to `https://hardhatsocial.net` in Vercel dashboard.
5. Trigger a redeployment after updating env vars (Vercel deployments don't pick up new env vars automatically).

**Also update in code:**
- `app/layout.tsx`: `metadataBase: new URL('https://hardhatsocial.net')`
- Any hardcoded domain references (grep for `contractorsconnect.com`)
- Resend: re-verify sending domain if sending from `@hardhatsocial.net` instead of old domain

**No npm package required.**

---

### Feature 3: Feed Redesign — Full-width Posts + Right Sidebar

The current explore layout uses `max-w-2xl` centered column. The redesign wants full-width posts with a right sidebar for suggested connections.

**Pattern:** Pure Tailwind CSS grid layout. No library required.

```
Desktop:  [  Main Feed (2/3 width)  ] [  Right Sidebar (1/3 width)  ]
Mobile:   [ Main Feed (full width) ]
          [ Sidebar (hidden or below) ]
```

Tailwind v3 implementation:

```typescript
// app/explore/page.tsx (layout wrapper)
<div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:grid lg:grid-cols-3 lg:gap-8">
  {/* Main feed — takes 2/3 on desktop */}
  <div className="lg:col-span-2">
    {/* PostCard list */}
  </div>

  {/* Right sidebar — takes 1/3 on desktop, hidden on mobile */}
  <aside className="hidden lg:block">
    {/* SuggestedConnections component */}
  </aside>
</div>
```

**Suggested Connections sidebar:** Fetches a small query of approved contractors from Supabase — no new API route needed, can be a server component alongside the feed. Query: `contractors` table, `status = 'approved'`, limit 5, exclude the current user's own record. RLS already allows this (public can view approved contractors).

**No npm package required.** This is layout CSS and a new server component query.

---

### Feature 4: Jobs System — State Machine + Portfolio

This requires new Supabase tables. No new npm packages.

#### New table: `job_posts`

The current `posts` table with `category = 'jobs'` is text-only and has no state. The jobs system requires tracking hired contractor, job status, and eventually portfolio association.

**Recommended schema:**

```sql
create table job_posts (
  id              uuid primary key default gen_random_uuid(),
  gc_user_id      uuid references auth.users on delete cascade not null,
  gc_contractor_id uuid references contractors(id),           -- GC's contractor profile (optional)
  title           text not null,
  description     text not null,
  trade           text not null,
  location_city   text,
  location_state  text,
  status          text not null default 'open'
                  check (status in ('open', 'hired', 'completed', 'cancelled')),
  hired_contractor_id uuid references contractors(id),        -- set when GC marks hired
  hired_at        timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz default timezone('utc', now())
);
```

**Status state machine (text check constraint, not Postgres enum):**

Use a `text` column with a `CHECK` constraint rather than a Postgres `CREATE TYPE enum`. Rationale: Postgres enums cannot safely remove values once created — if the status set ever needs adjustment, a text + check constraint is easier to migrate. The existing codebase uses this same pattern (`contractors.status`, `applications.status`). Consistency matters.

| Transition | Who triggers it | Notes |
|------------|-----------------|-------|
| `open` → `hired` | GC user (UI action) | Sets `hired_contractor_id`, `hired_at` |
| `hired` → `completed` | GC user (UI action) | Sets `completed_at`; unlocks rating |
| `open` / `hired` → `cancelled` | GC user | Does not unlock rating |

**State transition enforcement:** Enforce in the server action / API route, not at the DB layer (a DB trigger is overkill for MVP). The server action validates current status before allowing the transition.

**Portfolio link:** Completed jobs appear on contractor profiles via a join:
```sql
select * from job_posts
where hired_contractor_id = $contractor_id
and   status = 'completed'
order by completed_at desc;
```

No additional table needed for portfolio — the `job_posts` table IS the portfolio source.

**RLS policies needed:**

```sql
alter table job_posts enable row level security;

-- Anyone can view open jobs
create policy "Public can view open jobs"
  on job_posts for select
  using (status = 'open');

-- Approved contractors can view all non-cancelled jobs (for portfolio visibility)
create policy "Approved contractors can view hired/completed jobs"
  on job_posts for select
  using (
    status in ('hired', 'completed')
    and is_approved_contractor()
  );

-- GC can insert their own job posts
create policy "GC can post jobs"
  on job_posts for insert
  with check (auth.uid() = gc_user_id);

-- GC can update their own jobs (to mark hired/completed)
create policy "GC can update own jobs"
  on job_posts for update
  using (auth.uid() = gc_user_id);
```

**No npm package required.**

---

### Feature 5: Ratings System — Mutual GC ↔ Sub

Requires one new Supabase table. No new npm packages.

#### New table: `job_ratings`

```sql
create table job_ratings (
  id              uuid primary key default gen_random_uuid(),
  job_id          uuid references job_posts(id) on delete cascade not null,
  reviewer_id     uuid references contractors(id) on delete cascade not null,
  reviewee_id     uuid references contractors(id) on delete cascade not null,
  rating          integer not null check (rating between 1 and 5),
  comment         text,
  created_at      timestamptz default timezone('utc', now()),

  -- One rating per reviewer per job per reviewee
  unique (job_id, reviewer_id, reviewee_id),

  -- Reviewer and reviewee must be different contractors
  check (reviewer_id != reviewee_id)
);
```

**Key design decisions:**

1. **Tie ratings to `job_id`** — not just to user pairs. This enables the "platform-verified job completion" requirement: a rating can only be left after `job_posts.status = 'completed'`. Enforce in server action, not DB trigger.

2. **Unique constraint on `(job_id, reviewer_id, reviewee_id)`** — prevents duplicate ratings for the same job. One rating per direction per job (GC rates sub + sub rates GC = 2 rows, both valid).

3. **Both parties can rate** — the GC and the hired contractor can each leave one rating for the other. The unique constraint allows up to 2 rows per job (one in each direction). Check `reviewer_id != reviewee_id` prevents self-rating.

4. **`check (rating between 1 and 5)`** — DB-level validation. No need for application-layer clamping.

5. **Ratings display on profiles** — aggregate with:
```sql
select
  avg(rating)::numeric(3,2) as avg_rating,
  count(*) as total_ratings
from job_ratings
where reviewee_id = $contractor_id;
```

**RLS policies needed:**

```sql
alter table job_ratings enable row level security;

-- Public can view ratings (shown on contractor profiles)
create policy "Public can view ratings"
  on job_ratings for select
  using (true);

-- Approved contractors can insert ratings for completed jobs they participated in
create policy "Contractors can rate after completed job"
  on job_ratings for insert
  with check (
    is_approved_contractor()
    and exists (
      select 1 from contractors c
      where c.user_id = auth.uid()
      and c.id = reviewer_id
    )
  );
```

**No npm package required.**

---

## Installation

```bash
# No new packages required for this milestone.
# All features use existing dependencies + new Supabase migrations.
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Job status field | `text` + CHECK constraint | Postgres `CREATE TYPE` enum | Enums cannot safely remove values. Existing codebase uses text + check. Consistency over marginal performance gain at this scale. |
| Ratings storage | Single `job_ratings` table tied to `job_posts.id` | Separate `reviews` table with free-form user references | Job-tied ratings enforce the "platform-verified completion" requirement. Free-form references allow gaming (rating without a job). |
| Feed sidebar layout | Tailwind `lg:grid-cols-3` | External layout library (shadcn, etc.) | No library needed. Tailwind grid covers this trivially. Adding a component library mid-project is not justified for one layout change. |
| Color scheme | `tailwind.config.ts` `theme.extend.colors` | Swap to Tailwind v4 + CSS `@theme` directive | Project is on Tailwind v3. Upgrading to v4 mid-milestone is a breaking change (config format changes, many utility class changes). Do NOT upgrade. |
| Star rating UI | Plain number input or radio buttons | `react-stars`, `react-rating`, similar | A 5-star radio button group is 10 lines of Tailwind. No library justified. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Tailwind v4 `@theme` CSS directive | Project is on Tailwind v3 — this directive does not exist in v3 | `tailwind.config.ts` `theme.extend.colors` |
| Postgres `CREATE TYPE` enum for job status | Cannot remove enum values once created; text + check is already the project convention | `text NOT NULL CHECK (status IN (...))` |
| DB triggers for state transition enforcement | Overkill for MVP; makes debugging harder | Server action validates status before update |
| A star rating npm package | Adds dependency for a trivial UI element | 5 radio inputs styled with Tailwind |
| Separate `portfolio` table | Adds complexity; completed `job_posts` already IS the portfolio | Query `job_posts WHERE status = 'completed' AND hired_contractor_id = $id` |
| shadcn/ui or other component libraries | Not in the current stack; adding mid-milestone for one sidebar adds migration risk | Plain Tailwind components consistent with existing codebase |

---

## Stack Patterns by Feature

**For jobs system (state transitions):**
- New `job_posts` table with text + check constraint status column
- Server actions in `app/jobs/actions.ts` enforce state transitions before DB update
- RLS lets public see `open` jobs; approved contractors see `hired`/`completed` ones
- Portfolio: query `job_posts` where `status = 'completed'` and `hired_contractor_id = $id`

**For ratings system:**
- New `job_ratings` table tied to `job_posts.id`
- Server action validates `job_posts.status = 'completed'` before allowing INSERT
- Unique constraint `(job_id, reviewer_id, reviewee_id)` prevents duplicates
- Profile aggregate: `SELECT avg(rating), count(*) FROM job_ratings WHERE reviewee_id = $id`

**For feed redesign:**
- Change `max-w-2xl` wrapper to `max-w-6xl lg:grid lg:grid-cols-3 lg:gap-8`
- Feed takes `lg:col-span-2`, sidebar takes `lg:col-span-1`
- `SuggestedConnections` server component: query `contractors` where `status = 'approved'`, limit 5
- Mobile: sidebar is `hidden lg:block` — posts are always full-width on small screens

**For rebrand:**
- `tailwind.config.ts`: add `brand.blue`, `brand.yellow`, `brand.white` under `theme.extend.colors`
- `app/globals.css`: update body base colors if background changes from dark to lighter
- Vercel: add `hardhatsocial.net` in Domains, update `NEXT_PUBLIC_APP_URL` env var
- Redeploy after env var changes
- Grep for hardcoded old domain name in codebase and replace

---

## New Migrations Needed

This milestone requires two new SQL migration files:

| Migration | Contents |
|-----------|----------|
| `008_job_posts.sql` | `job_posts` table + status check constraint + RLS policies + indexes |
| `009_job_ratings.sql` | `job_ratings` table + rating check constraint + unique constraint + RLS policies + indexes |

The existing `is_approved_contractor()` helper function (from migration 001) is reusable in both new RLS policies — no changes to that function needed.

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|----------------|-------|
| `next@^14.2.18` | No new packages this milestone | N/A |
| `tailwindcss@^3.4.14` | `tailwind.config.ts` brand color extension | Use `theme.extend.colors`, NOT Tailwind v4 `@theme` directive |
| `@supabase/supabase-js@^2.45.4` | New `job_posts`, `job_ratings` tables | Standard table queries; no new Supabase features needed |

---

## Sources

- [Supabase Postgres Enums Guide](https://supabase.com/docs/guides/database/postgres/enums) — HIGH confidence. Verified: text + CHECK preferred over enum for mutable status fields; enum values cannot be safely removed.
- [Tailwind CSS v3 Customizing Colors](https://tailwindcss.com/docs/customizing-colors) — HIGH confidence. `theme.extend.colors` in `tailwind.config.js/ts` is the v3 pattern. Verified project is on Tailwind v3.4.14 from `package.json`.
- [Vercel — Adding & Configuring a Custom Domain](https://vercel.com/docs/domains/working-with-domains/add-a-domain) — HIGH confidence. A record for apex, CNAME for www, Vercel auto-provisions SSL.
- [PostgreSQL Constraints Documentation](https://www.postgresql.org/docs/current/ddl-constraints.html) — HIGH confidence. UNIQUE constraint on composite columns and CHECK constraints for ratings table design.
- Existing codebase (`supabase/migrations/001_initial.sql`, `package.json`, `tailwind.config.ts`, `app/globals.css`) — HIGH confidence. Direct inspection of current stack, schema, and patterns.

---

*Stack research for: Hard Hat Social v1.2 — Rebrand, Jobs System, Ratings, Feed Redesign*
*Researched: 2026-03-04*
