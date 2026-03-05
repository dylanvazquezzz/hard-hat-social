# Architecture Research

**Domain:** Verified contractor social platform — v1.2 Feed Redesign, Jobs Lifecycle, Mutual Ratings, Domain Rebrand
**Researched:** 2026-03-04
**Confidence:** HIGH (based on direct codebase inspection + Next.js 14 / Supabase official docs)

---

## Context: Existing Architecture (What We're Adding To)

This is a subsequent milestone. The existing architecture is well-established and must be preserved. Key constraints from the current codebase:

- Server Components fetch all data using `supabase-admin.ts` (service role, bypasses RLS)
- Client Components are leaf nodes only: `NavBar`, `SearchFilters`, `ContactSection`
- `force-dynamic` on all data pages — no caching except homepage (revalidate: 300)
- Supabase RLS protects data at the database layer; API route handler enforces contact gating at application layer
- Server Actions (`app/admin/actions.ts`) handle all write mutations from the admin
- No global state management — state lives in URL params, React `useState`, and Supabase session

The four new feature areas for v1.2 slot into this architecture as follows:
- **Feed redesign** — layout change only, no new data tables
- **Suggested connections sidebar** — new query pattern, no new tables
- **Jobs system** — new `jobs` table + new status lifecycle + new route + Server Actions
- **Mutual ratings** — new `ratings` table + RLS enforcement + new UI sections
- **Domain rebrand** — config/metadata changes only, no schema changes

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Browser / Client                             │
│                                                                     │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────────────────┐  │
│  │  NavBar    │  │SearchFilters │  │    ContactSection            │  │
│  │ 'use client'│  │ 'use client' │  │    'use client'              │  │
│  └────────────┘  └──────────────┘  └─────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  NEW: RatingForm 'use client' — submit mutual rating         │   │
│  │  NEW: JobStatusControl 'use client' — mark hired/completed   │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
         │
         │ (hydration / Server Actions / fetch)
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│               Next.js App Router — Server Layer                     │
│                                                                     │
│  ┌──────────────┐  ┌───────────────────┐  ┌──────────────────────┐  │
│  │ explore/     │  │ jobs/             │  │ contractors/[id]/    │  │
│  │ page.tsx     │  │ page.tsx          │  │ page.tsx             │  │
│  │ MODIFIED:    │  │ MODIFIED: lifecycle│  │ MODIFIED: completed  │  │
│  │ 2-col layout │  │ status display    │  │ jobs + ratings       │  │
│  └──────────────┘  └───────────────────┘  └──────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  NEW Server Actions                                           │  │
│  │  app/jobs/actions.ts — createJob, markHired, markCompleted    │  │
│  │  app/ratings/actions.ts — submitRating                        │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Existing Route Handlers (unchanged)                          │  │
│  │  /api/contact/[id] — protected contact info endpoint          │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
         │ (supabase-admin / service role for reads)
         │ (supabase browser client for write actions via Server Actions)
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Supabase                                      │
│                                                                     │
│  EXISTING TABLES                                                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │contractors │  │certific-   │  │applications│  │ profiles     │  │
│  │(RLS)       │  │ations (RLS)│  │(RLS)       │  │ (RLS)        │  │
│  └────────────┘  └────────────┘  └────────────┘  └──────────────┘  │
│  ┌────────────┐                                                     │
│  │  posts     │                                                     │
│  │  (RLS)     │                                                     │
│  └────────────┘                                                     │
│                                                                     │
│  NEW TABLES (v1.2)                                                  │
│  ┌────────────────────────────┐  ┌──────────────────────────────┐  │
│  │  jobs                      │  │  ratings                     │  │
│  │  id, gc_contractor_id,     │  │  id, job_id, rater_id,       │  │
│  │  sub_contractor_id,        │  │  ratee_id, score, review,    │  │
│  │  title, description,       │  │  created_at                  │  │
│  │  trade, location_state,    │  │  CONSTRAINT: unique per      │  │
│  │  status, posted_at,        │  │  (job_id, rater_id)          │  │
│  │  hired_at, completed_at    │  │  GATED: job must be completed│  │
│  │  (RLS)                     │  │  (RLS)                       │  │
│  └────────────────────────────┘  └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## New Database Schema

### `jobs` table

```sql
CREATE TABLE jobs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gc_contractor_id uuid REFERENCES contractors(id) ON DELETE CASCADE NOT NULL,
  sub_contractor_id uuid REFERENCES contractors(id) ON DELETE SET NULL,
  -- sub is nullable: job is "open" until GC marks it hired
  title            text NOT NULL,
  description      text,
  trade            text NOT NULL,
  location_state   text NOT NULL,
  status           text NOT NULL DEFAULT 'posted'
                   CHECK (status IN ('posted', 'hired', 'completed')),
  posted_at        timestamptz DEFAULT now(),
  hired_at         timestamptz,
  completed_at     timestamptz,
  created_at       timestamptz DEFAULT now()
);
```

**Status lifecycle:**
```
posted → hired → completed
```
- `posted`: GC posted a job, seeking a sub. `sub_contractor_id` is NULL.
- `hired`: GC marked a sub as hired. `sub_contractor_id` is set. `hired_at` is set.
- `completed`: GC marked job complete. `completed_at` is set. Ratings unlock.

**Note on `sub_contractor_id`:** The GC selects a sub from the platform directory when marking hired. This creates a verified relationship between two approved contractors — the foundation for ratings integrity.

**RLS policies:**

```sql
-- Anyone can view posted jobs
CREATE POLICY "Jobs are publicly viewable"
  ON jobs FOR SELECT USING (true);

-- Only the GC contractor (owner) can insert
CREATE POLICY "GC can post jobs"
  ON jobs FOR INSERT
  WITH CHECK (
    gc_contractor_id IN (
      SELECT id FROM contractors WHERE user_id = auth.uid() AND status = 'approved'
    )
  );

-- Only the GC contractor can update status
CREATE POLICY "GC can update job status"
  ON jobs FOR UPDATE
  USING (
    gc_contractor_id IN (
      SELECT id FROM contractors WHERE user_id = auth.uid() AND status = 'approved'
    )
  );
```

**Why GC-only updates:** The GC is the job owner and controls progression. The sub cannot self-report completion or hiring. This prevents fraudulent completed-job claims that would unlock ratings.

---

### `ratings` table

```sql
CREATE TABLE ratings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  rater_id    uuid REFERENCES contractors(id) ON DELETE CASCADE NOT NULL,
  ratee_id    uuid REFERENCES contractors(id) ON DELETE CASCADE NOT NULL,
  score       integer NOT NULL CHECK (score BETWEEN 1 AND 5),
  review      text,
  created_at  timestamptz DEFAULT now(),

  -- Each contractor can only rate the other once per job
  UNIQUE (job_id, rater_id)
);
```

**RLS policies:**

```sql
-- Ratings are publicly viewable
CREATE POLICY "Ratings are publicly viewable"
  ON ratings FOR SELECT USING (true);

-- Only the GC or sub on a completed job can submit a rating
CREATE POLICY "Participants can rate after completion"
  ON ratings FOR INSERT
  WITH CHECK (
    -- Rater must be a participant in this job
    rater_id IN (
      SELECT id FROM contractors WHERE user_id = auth.uid()
    )
    AND
    -- The job must be completed
    job_id IN (
      SELECT id FROM jobs WHERE status = 'completed'
    )
    AND
    -- Rater must be GC or sub on this specific job
    job_id IN (
      SELECT id FROM jobs
      WHERE gc_contractor_id = rater_id OR sub_contractor_id = rater_id
    )
  );
```

**Critical integrity rule:** Ratings are locked to `status = 'completed'` jobs. This is enforced at both the RLS layer (INSERT policy) and the Server Action layer (pre-check before insert). Double enforcement prevents any bypass — even if a user calls the Server Action directly, Supabase rejects the insert if the job is not completed.

---

## Component Map: New vs. Modified

### New Components

| Component | Type | File | Responsibility |
|-----------|------|------|---------------|
| `JobCard` | Server-compatible | `components/JobCard.tsx` | Display a job listing with status badge (posted/hired/completed) |
| `JobStatusControl` | Client | `components/JobStatusControl.tsx` | Buttons for GC to mark hired / mark completed — calls Server Actions |
| `SubSelectorModal` | Client | `components/SubSelectorModal.tsx` | Search-as-you-type to pick a sub from the directory when marking hired |
| `RatingForm` | Client | `components/RatingForm.tsx` | 1-5 star score + optional text review form — calls Server Actions |
| `RatingSummary` | Server-compatible | `components/RatingSummary.tsx` | Aggregate average score + count for a contractor profile |
| `RatingList` | Server-compatible | `components/RatingList.tsx` | Individual rating cards on a contractor profile |
| `FeedSidebar` | Server-compatible | `components/FeedSidebar.tsx` | Suggested connections sidebar — list of approved contractors the user is not yet connected to |
| `CompletedJobsSection` | Server-compatible | `components/CompletedJobsSection.tsx` | Portfolio of completed jobs on a contractor profile |

### Modified Components

| Component | Current State | What Changes |
|-----------|---------------|-------------|
| `app/explore/page.tsx` | Single-column, max-w-2xl | Change to two-column layout: main feed (posts) + right sidebar (FeedSidebar with suggested connections) |
| `app/jobs/page.tsx` | Lists job posts from `posts` table (category='jobs') | Replace with query against new `jobs` table; show status lifecycle; include JobStatusControl for GC owners |
| `app/contractors/[id]/page.tsx` | Shows bio, specialties, certifications, contact | Add: CompletedJobsSection, RatingSummary, RatingList |
| `app/u/[username]/page.tsx` | Shows bio, posts, certifications | Add: RatingSummary if user is an approved contractor |
| `app/layout.tsx` | Brand: "Contractors Connect", dark navy | Rebrand: "Hard Hat Social", lighter blue + yellow + white color tokens |
| `components/NavBar.tsx` | "Contractors Connect" logo text, amber accent | Update brand name, update color scheme |
| `lib/types.ts` | Contractor, Certification, Application, Profile, Post | Add: Job, Rating TypeScript interfaces |

### New Server Actions

**`app/jobs/actions.ts`** — all protected by `is_approved_contractor()` check

```typescript
'use server'
// createJob(formData) — GC posts a new job
// markHired(jobId, subContractorId) — GC marks a sub hired; sets hired_at
// markCompleted(jobId) — GC marks job done; sets completed_at, status='completed'
```

**`app/ratings/actions.ts`** — protected by job completion check

```typescript
'use server'
// submitRating(jobId, rateeId, score, review) — GC or sub submits a rating
//   Pre-check: verify job.status === 'completed'
//   Pre-check: verify caller is gc_contractor_id or sub_contractor_id on this job
//   Then: insert into ratings table (RLS also enforces as second layer)
```

**Why Server Actions for writes (not API routes):** The existing pattern uses Server Actions for admin mutations and the API route only for the contact-info protected endpoint. Server Actions fit naturally for form submissions (rating form, job posting form) without needing a separate fetch call from the client.

---

## Data Flow: New Patterns

### Jobs Lifecycle Flow

```
GC visits /jobs page (Server Component)
    ↓
Queries jobs WHERE gc_contractor_id matches session user
    + all jobs with status='posted' (public feed)
    ↓
JobCard renders — if viewer is the GC and status='posted':
    → JobStatusControl renders (Client Component)
    → "Mark Hired" button → opens SubSelectorModal
        → sub selector fetches /contractors?approved (directory)
        → GC picks sub → calls markHired(jobId, subId) Server Action
            → UPDATE jobs SET status='hired', sub_contractor_id=X, hired_at=now()
    → "Mark Completed" button (visible when status='hired')
        → calls markCompleted(jobId) Server Action
            → UPDATE jobs SET status='completed', completed_at=now()
            → ratings unlock for both GC and sub
```

### Mutual Ratings Flow

```
GC or sub views /contractors/[id] of the other party
    ↓
Server Component queries:
    - ratings WHERE ratee_id = contractor.id (their received ratings)
    - jobs WHERE (gc_contractor_id=viewer OR sub_contractor_id=viewer)
               AND (gc_contractor_id=contractor.id OR sub_contractor_id=contractor.id)
               AND status='completed'
    → If a completed shared job exists AND viewer has not yet rated: show RatingForm
    ↓
RatingForm (Client Component) renders — 1-5 stars + text
    → user submits → calls submitRating(jobId, rateeId, score, review) Server Action
        → Server Action pre-checks: job.status === 'completed'
        → Server Action pre-checks: caller is participant
        → Supabase INSERT — RLS also validates (double layer)
        → revalidatePath('/contractors/[id]') — profile re-renders with new rating
```

### Feed Redesign: Explore Page Layout

```
Current: single column, max-w-2xl, posts only

New layout (2-column):
┌────────────────────────────────────────────────────────┐
│  [Explore] header + category tabs                      │
├───────────────────────────────┬────────────────────────┤
│  Main feed (posts)            │  Right sidebar         │
│  flex-1, space-y-3            │  w-72, shrink-0        │
│  PostCard[]                   │  FeedSidebar           │
│                               │  "Suggested"           │
│                               │  List of 5-8 approved  │
│                               │  contractors not in    │
│                               │  viewer's connections  │
│                               │  (or random sample     │
│                               │  if not logged in)     │
└───────────────────────────────┴────────────────────────┘

Mobile: sidebar stacks below feed (flex-col on mobile, flex-row on lg)
```

**Suggested connections query (Server Component):**
```typescript
// If authenticated: query approved contractors whose user_id is not the viewer
//   ORDER BY created_at DESC LIMIT 8
// If not authenticated: same query, no exclusion
// No "connections" table exists yet — "suggested" = recently approved contractors
// This is the correct scope for v1.2; a connections table comes later
```

The sidebar does not require a new table. "Suggested connections" for v1.2 means recently approved contractors the viewer might not know. This is honest (they are all real verified contractors) and requires zero new schema.

---

## Project Structure Changes

```
contractors-connect/
├── app/
│   ├── layout.tsx                    # MODIFIED: rebrand colors, title template
│   ├── explore/
│   │   └── page.tsx                  # MODIFIED: 2-col layout + FeedSidebar
│   ├── jobs/
│   │   ├── page.tsx                  # MODIFIED: query jobs table, status display
│   │   └── actions.ts                # NEW: createJob, markHired, markCompleted
│   ├── contractors/
│   │   └── [id]/
│   │       └── page.tsx              # MODIFIED: CompletedJobsSection + RatingSummary + RatingForm
│   ├── u/
│   │   └── [username]/
│   │       └── page.tsx              # MODIFIED: RatingSummary if contractor
│   └── ratings/
│       └── actions.ts                # NEW: submitRating Server Action
├── components/
│   ├── NavBar.tsx                    # MODIFIED: rebrand name + colors
│   ├── JobCard.tsx                   # NEW
│   ├── JobStatusControl.tsx          # NEW (client)
│   ├── SubSelectorModal.tsx          # NEW (client)
│   ├── RatingForm.tsx                # NEW (client)
│   ├── RatingSummary.tsx             # NEW (server-compatible)
│   ├── RatingList.tsx                # NEW (server-compatible)
│   ├── FeedSidebar.tsx               # NEW (server-compatible)
│   └── CompletedJobsSection.tsx      # NEW (server-compatible)
├── lib/
│   └── types.ts                      # MODIFIED: add Job, Rating interfaces
└── supabase/
    └── migrations/
        └── 007_jobs_ratings.sql      # NEW: jobs + ratings tables, RLS, indexes
```

---

## Architectural Patterns

### Pattern 1: GC-Owned Entity with Status Lifecycle

The `jobs` table introduces a status lifecycle. The GC is the owner (inserter) and the only party who can advance status. This is enforced at three layers:

1. **RLS INSERT policy** — `gc_contractor_id` must match `auth.uid()`
2. **RLS UPDATE policy** — same check on updates
3. **Server Action pre-check** — verify the caller is the GC before calling Supabase

The triple-layer approach is deliberate. The Server Action pre-check provides a clear error message to the UI. The RLS policies are the actual security boundary.

**When to use:** Any entity where one party (GC) controls lifecycle and the other (sub) has read-only visibility.

```typescript
// app/jobs/actions.ts
'use server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function markCompleted(jobId: string, gcUserId: string) {
  const admin = getSupabaseAdmin()

  // Pre-check: verify caller is GC on this job
  const { data: job } = await admin
    .from('jobs')
    .select('gc_contractor_id, status, contractors!gc_contractor_id(user_id)')
    .eq('id', jobId)
    .single()

  if (!job || job.status !== 'hired') {
    return { error: 'Job must be in hired state to mark complete' }
  }

  // Supabase UPDATE — RLS also enforces GC ownership
  await admin
    .from('jobs')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', jobId)

  revalidatePath('/jobs')
  revalidatePath(`/contractors/${job.gc_contractor_id}`)
}
```

### Pattern 2: Double-Enforced Rating Gate

Ratings are only valid for completed jobs. This is enforced at both layers (Server Action pre-check + RLS INSERT policy) because the integrity of ratings is the core trust signal of the platform. A single bypass point would corrupt the entire ratings system.

**When to use:** Any write where the validity condition is derived from another table's state (here: job status).

```typescript
// app/ratings/actions.ts
'use server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function submitRating(
  jobId: string,
  rateeId: string,
  score: number,
  review: string | null
) {
  const admin = getSupabaseAdmin()

  // Pre-check 1: job must be completed
  const { data: job } = await admin
    .from('jobs')
    .select('status, gc_contractor_id, sub_contractor_id')
    .eq('id', jobId)
    .single()

  if (!job || job.status !== 'completed') {
    return { error: 'Ratings are only allowed after job completion' }
  }

  // Pre-check 2: ratee must be a participant
  const validRatees = [job.gc_contractor_id, job.sub_contractor_id]
  if (!validRatees.includes(rateeId)) {
    return { error: 'Can only rate a participant in this job' }
  }

  // RLS policy enforces the same checks as a second layer
  const { error } = await admin
    .from('ratings')
    .insert({ job_id: jobId, ratee_id: rateeId, score, review })

  if (error) return { error: error.message }

  revalidatePath(`/contractors/${rateeId}`)
  return { success: true }
}
```

**Note on using admin client in Server Actions:** The existing `actions.ts` pattern uses `supabase-admin` for all writes. This is consistent with the existing codebase. The admin client bypasses RLS — which means the Server Action's pre-checks ARE the security layer. Preserve the double-check pattern exactly.

### Pattern 3: Server Component Sidebar (No Extra Round-Trip)

The `FeedSidebar` (suggested connections) fetches data in the same Server Component render as the main feed. No separate API call needed — both queries run in parallel with `Promise.all`.

**When to use:** Any sidebar/secondary content that is adjacent to the main page content, has no user interaction, and can be fetched on the server.

```typescript
// app/explore/page.tsx
export default async function ExplorePage({ searchParams }: PageProps) {
  const admin = getSupabaseAdmin()

  const [{ data: postsData }, { data: suggestedData }] = await Promise.all([
    admin.from('posts').select('...').eq('category', category).limit(20),
    admin.from('contractors').select('id, full_name, trade, location_state, profile_photo_url')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <div className="flex-1">
        {/* posts feed */}
      </div>
      <aside className="w-full shrink-0 lg:w-72">
        <FeedSidebar contractors={suggestedData ?? []} />
      </aside>
    </div>
  )
}
```

The sidebar is server-rendered, passes data as props to `FeedSidebar`, which is a pure display component (no `'use client'` directive needed). No hydration cost.

### Pattern 4: Client Component for Interactive Mutation (Slim Boundary)

`JobStatusControl` and `RatingForm` are `'use client'` components because they have interactive state (button loading states, form inputs, modal open/close). They call Server Actions directly — no fetch to an API route needed.

```typescript
// components/RatingForm.tsx
'use client'
import { useState, useTransition } from 'react'
import { submitRating } from '@/app/ratings/actions'

export default function RatingForm({ jobId, rateeId }: Props) {
  const [score, setScore] = useState(0)
  const [review, setReview] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    startTransition(async () => {
      await submitRating(jobId, rateeId, score, review || null)
    })
  }
  // ...
}
```

`useTransition` is the correct pattern here — it marks the Server Action call as a non-urgent transition so the UI stays responsive during the round-trip.

---

## Domain Rebrand: Integration Points

The rebrand (Hard Hat Social / hardhatsocial.net) touches configuration and visual layer only. No schema changes.

### Files to Update

| File | Change |
|------|--------|
| `app/layout.tsx` | Update `metadataBase`, title template, `og:site_name` |
| `components/NavBar.tsx` | Update logo text: "Hard Hat Social" |
| `app/contractors/[id]/page.tsx` | Update JSON-LD `url` field domain |
| `app/u/[username]/page.tsx` | Update JSON-LD `url` field domain |
| `tailwind.config.ts` | Add/update brand colors: lighter blue, yellow, white |
| All pages with static `metadata` export | Update `openGraph.siteName` |

### Color Token Changes

Current palette: dark navy (`slate-900`), amber (`amber-500`), slate grays.

New palette (lighter blue + yellow + white):
- Primary background: shift from `slate-950` / `slate-900` to `blue-950` / `blue-900` tones
- Accent: keep yellow/amber family (`yellow-400` / `amber-400`) — consistent with construction industry
- Text: `white` and `slate-200` on dark backgrounds

**Recommendation:** Define color aliases in `tailwind.config.ts` so a single token change propagates everywhere, rather than find-and-replace hex values across 15+ files.

```javascript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      brand: {
        bg: '#0a1628',       // dark blue (replaces slate-950)
        surface: '#0f2040',  // lighter dark blue (replaces slate-900)
        accent: '#fbbf24',   // yellow-400 (same amber family)
        text: '#f1f5f9',     // slate-100
      }
    }
  }
}
```

**Caution:** The codebase uses Tailwind class names directly (`bg-slate-900`, `text-amber-500`) in every component — not CSS variables or aliases. Updating colors requires a systematic find-and-replace across all component and page files. This is tedious but not risky if done in a single focused pass. Do not mix old and new color tokens partway through — the visual inconsistency would look worse than either palette alone.

---

## Data Flow: Completed Jobs on Contractor Profile

```
User visits /contractors/[id] (Server Component)
    ↓
Promise.all([
  fetch contractor,
  fetch certifications,
  fetch completed jobs WHERE (gc_contractor_id=id OR sub_contractor_id=id) AND status='completed',
  fetch ratings WHERE ratee_id=id,
  fetch viewer's contractor_id (to determine if viewer can leave a rating)
])
    ↓
Server renders:
  - ProfileHeader (existing)
  - Bio, specialties, certifications (existing)
  - CompletedJobsSection — list of completed jobs (NEW)
  - RatingSummary — avg score + count (NEW)
  - RatingList — individual reviews (NEW)
  - RatingForm — only if: viewer is approved contractor AND viewer was a participant
               in a completed job with this contractor AND has not yet rated (NEW, client)
```

**Rating eligibility check (server-side):**
```typescript
// In /contractors/[id]/page.tsx
const viewerEligibleToRate = completedSharedJobs.some(job =>
  !existingRatingsByViewer.find(r => r.job_id === job.id)
)
```

This check runs on the server — the `RatingForm` only renders if `viewerEligibleToRate` is true. No client-side gate needed.

---

## Integration Points

### New Internal Boundaries

| Boundary | Communication | Rule |
|----------|---------------|------|
| `JobStatusControl` (client) ↔ `markHired`/`markCompleted` (server) | Server Actions (direct call, no fetch) | Use `useTransition` for pending state; revalidate `/jobs` and `/contractors/[id]` after mutation |
| `SubSelectorModal` (client) ↔ contractors directory | Query via `supabase.ts` browser client (RLS-safe read of approved contractors) | Only approved contractors visible — RLS `status='approved'` policy already enforces this |
| `RatingForm` (client) ↔ `submitRating` (server) | Server Action | Double-check job completion status in action before insert |
| `FeedSidebar` (server) ↔ contractors table | Direct Supabase query in `explore/page.tsx` via `Promise.all` | No new client boundary — sidebar is a pure display component |
| `jobs` table ↔ `ratings` table | `job_id` FK in ratings + `status='completed'` gate | Ratings without a completed job are impossible at the DB layer (RLS) |

### External Services (unchanged)

| Service | Status | Notes |
|---------|--------|-------|
| Supabase Postgres | Unchanged | Two new tables: jobs, ratings |
| Supabase Auth | Unchanged | Same JWT pattern for all Server Actions |
| Resend | Unchanged | No new email triggers for v1.2 |
| Vercel | Config change | Update `NEXT_PUBLIC_APP_URL` to hardhatsocial.net after DNS is live |

---

## Build Order for v1.2 Milestone

Dependencies determine the order. The jobs table must exist before any jobs UI is built. Ratings require jobs. Feed redesign has no dependencies and can go first.

### Step 1: Database Migration (prerequisite for jobs + ratings features)

Write and apply `supabase/migrations/007_jobs_ratings.sql`:
- `jobs` table + status check constraint + indexes
- `ratings` table + unique constraint + score check + indexes
- RLS policies for both tables
- Nothing else can be built until this migration is applied

### Step 2: TypeScript Types

Add `Job` and `Rating` interfaces to `lib/types.ts`.
- Prerequisite for all component and action files

### Step 3: Domain Rebrand (no data dependency — can do in parallel with Step 1)

- Update `tailwind.config.ts` color tokens
- Update `NavBar.tsx` brand text
- Update `app/layout.tsx` metadataBase + title
- Update JSON-LD URLs in contractor profile pages
- Systematic color class replacement across all files
- Test locally that no visual regressions appear

### Step 4: Server Actions

Write `app/jobs/actions.ts` and `app/ratings/actions.ts`.
- Depends on: Step 1 (table exists), Step 2 (types)
- These are server-only — can be verified with unit tests before building UI

### Step 5: Feed Redesign (no new data dependency)

Modify `app/explore/page.tsx`:
- Change layout to 2-column (main + sidebar)
- Add `Promise.all` to fetch suggested contractors
- Create `components/FeedSidebar.tsx` (server-compatible, display only)
- No new table needed

### Step 6: Jobs UI

Create `components/JobCard.tsx` (server-compatible).
Create `components/JobStatusControl.tsx` (client).
Create `components/SubSelectorModal.tsx` (client).
Modify `app/jobs/page.tsx` to query `jobs` table instead of `posts` table.
- Depends on: Steps 1, 2, 4

### Step 7: Ratings UI

Create `components/RatingSummary.tsx` (server-compatible).
Create `components/RatingList.tsx` (server-compatible).
Create `components/RatingForm.tsx` (client).
Create `components/CompletedJobsSection.tsx` (server-compatible).
Modify `app/contractors/[id]/page.tsx` to add all rating sections.
Modify `app/u/[username]/page.tsx` to add `RatingSummary`.
- Depends on: Steps 1, 2, 4

---

## Anti-Patterns

### Anti-Pattern 1: Allowing Sub to Advance Job Status

**What people do:** Add a "Mark as Complete" button visible to the sub on a job they worked.
**Why it's wrong:** The sub self-reporting completion means unverified jobs unlock ratings. A sub could fabricate a completed relationship with any GC by advancing a job they were never hired on.
**Do this instead:** Only the GC can advance status (`posted → hired → completed`). The sub's only action is submitting a rating after the GC has marked the job complete.

### Anti-Pattern 2: Rating Without Job Reference

**What people do:** Create a ratings table without a `job_id` FK — allow any approved contractor to rate any other approved contractor.
**Why it's wrong:** Open ratings are easily gamed. Competitors submit negative ratings. Allies submit fake positives. The entire trust signal collapses within weeks.
**Do this instead:** Every rating must reference a specific completed job. The unique constraint `(job_id, rater_id)` ensures one rating per participant per job. No job reference = no rating. This is enforced at schema level (FK + constraint) and cannot be bypassed by any application-layer code.

### Anti-Pattern 3: Putting SubSelectorModal Data in Server Action

**What people do:** Fetch the list of available subs inside the `markHired` Server Action so the modal doesn't need its own query.
**Why it's wrong:** The sub selection modal needs a live, searchable list of approved contractors. This is a UI interaction that requires client-side state (search input). The Server Action runs only when the GC submits — not during browsing.
**Do this instead:** `SubSelectorModal` is a Client Component that queries the `contractors` table directly via the browser Supabase client (`supabase.ts`). RLS already enforces `status='approved'` so the browser client can query safely. The Server Action receives only `jobId` and `subContractorId` when the GC confirms selection.

### Anti-Pattern 4: Replacing the `posts` Jobs Category with the New `jobs` Table Immediately

**What people do:** Remove the `category='jobs'` posts in a single migration and rebuild everything at once.
**Why it's wrong:** The existing `jobs/page.tsx` queries `posts` with `category='jobs'`. A hard cutover breaks the jobs page until all new UI is deployed simultaneously. Any migration mishap means zero jobs are visible.
**Do this instead:** Keep the `posts` table and `category='jobs'` untouched. Build the new `jobs` table in parallel. Migrate `app/jobs/page.tsx` to query the new `jobs` table only after the full jobs UI is built and verified locally. Old job posts (from the `posts` table) can be archived or left as-is — they are a different entity (informal posts vs. formal job lifecycle).

### Anti-Pattern 5: Using force-dynamic on the Ratings/Jobs Queries

**What people do:** Add `export const dynamic = 'force-dynamic'` to every page that now has extra queries.
**Why it's wrong:** The contractor profile page already has `force-dynamic` — adding more queries doesn't change this. But for pages that do not need `force-dynamic`, adding it unnecessarily kills ISR benefits.
**Do this instead:** Only pages that read from user session state or volatile data need `force-dynamic`. The contractor profile needs it (contact gating). The explore feed needs it (fresh posts). The ratings display on a profile does not need a fresh hit on every request — it can tolerate 60s stale data. Use `revalidatePath` in Server Actions to invalidate cached profiles after a new rating is submitted.

---

## Scaling Considerations

| Scale | Jobs + Ratings Impact |
|-------|----------------------|
| 0-500 contractors | Current approach fine. Jobs and ratings are low-volume. No indexes beyond FK indexes needed initially. |
| 500-5K contractors | Add `CREATE INDEX jobs_status_idx ON jobs(status)` and `CREATE INDEX ratings_ratee_id_idx ON ratings(ratee_id)`. Profile pages load rating aggregates — consider a `rating_summary` materialized view if query time grows. |
| 5K-50K contractors | Ratings aggregate (AVG score per contractor) becomes expensive on every profile load. Pre-compute with a Postgres trigger that updates a `contractors.rating_avg` column on each new rating insert. |
| 50K+ contractors | Sub selector modal (searching all approved contractors) requires full-text search — the existing `contractors_search_idx` GIN index (migration 005) already handles this. |

---

## Sources

- Direct codebase inspection of `/Users/dylanvazquez/Desktop/contractors-connect/` (2026-03-04): all server actions, route handlers, migrations, components, and page files
- Next.js Server Actions documentation: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- Next.js useTransition with Server Actions: https://react.dev/reference/react/useTransition
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Postgres CHECK constraints and UNIQUE constraints (standard SQL, HIGH confidence)
- Project context from `.planning/PROJECT.md` (2026-03-04)

---
*Architecture research for: Hard Hat Social v1.2 — Feed Redesign, Jobs Lifecycle, Mutual Ratings, Domain Rebrand*
*Researched: 2026-03-04*
