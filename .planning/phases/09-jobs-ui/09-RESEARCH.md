# Phase 9: Jobs UI - Research

**Researched:** 2026-03-09
**Domain:** Next.js 14 App Router server actions, Supabase RLS, modal patterns, profile portfolio sections
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| JOBS-01 | A GC can create a job posting on the Jobs board | createJob server action + form component, RLS insert policy already exists via is_gc() |
| JOBS-02 | A GC can mark a job as "hired" by selecting which approved contractor was hired | markHired server action + SubSelectorModal, jobs RLS update policy covers this |
| JOBS-03 | A GC can mark a hired job as "completed" | markCompleted server action, DB trigger blocks invalid transitions |
| JOBS-04 | Completed jobs appear as a verified portfolio section on the hired contractor's profile | Query jobs where hired_contractor_id = contractor.id AND status = 'completed', add CompletedJobsSection to /contractors/[id] |
</phase_requirements>

---

## Summary

Phase 9 builds a complete Jobs lifecycle UI on top of the `jobs` table delivered in Phase 8. The database schema, RLS policies, status-transition trigger, and TypeScript types are all already in place — this phase is pure UI and server action work.

The three plans (09-01 Jobs board, 09-02 Hired flow, 09-03 Completion + portfolio) map cleanly to the three status transitions: `open`, `hired`, `completed`. Each transition is already enforced at the database layer; the UI just needs to surface the right controls to the right actors at the right time.

The most architecturally interesting piece is the SubSelectorModal (JOBS-02): selecting a hired contractor requires a searchable list of approved contractors rendered in a dialog, driven by a client component that calls a server action on confirm. The portfolio section (JOBS-04) is a pure read query added to the existing `/contractors/[id]` profile page — no new migration required for the feature itself, though a missing RLS policy (see "RLS Gap" section) warrants a small migration.

**Primary recommendation:** Use server actions for all job mutations (createJob, markHired, markCompleted) following the established pattern in `app/admin/actions.ts`. Use `'use client'` only for interactive UI components that need local state (the create-job form, the SubSelectorModal). Keep the jobs page itself a server component with `force-dynamic`.

---

## Standard Stack

### Core (already in project — no new installs needed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 14 | Server components, server actions, routing | Already in use throughout |
| Supabase JS | 2.x | Database queries, RLS-aware client | Already in lib/supabase.ts and lib/supabase-admin.ts |
| TypeScript | 5.x | Type safety | Project-wide requirement |
| Tailwind CSS | 3.x | Styling | Project-wide convention |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `next/navigation` (revalidatePath) | 14 | Cache invalidation after mutations | Every server action that changes jobs data |
| `server-only` package | existing | Guard admin/service-role imports | Already on supabase-admin.ts and email.ts — follow same pattern |

**Installation:** No new packages required.

---

## Architecture Patterns

### Recommended File Structure for Phase 9
```
app/
├── jobs/
│   ├── page.tsx              # REBUILT — server component, reads from jobs table
│   └── actions.ts            # NEW — createJob, markHired, markCompleted server actions
components/
├── JobCard.tsx               # NEW — 'use client', displays single job with status pill + action buttons
├── CreateJobForm.tsx         # NEW — 'use client' form for posting a new job
└── SubSelectorModal.tsx      # NEW — 'use client' modal for selecting hired contractor
supabase/migrations/
└── 009_jobs_hired_select.sql # NEW — RLS policy for hired contractor to SELECT their own jobs
```

The contractor profile at `app/contractors/[id]/page.tsx` gets a new section added inline — no new file needed for the portfolio display itself (a CompletedJobsSection component may be extracted for cleanliness).

### Pattern 1: Server Actions for Mutations
**What:** All three job mutations (create, markHired, markCompleted) live in `app/jobs/actions.ts` as `'use server'` functions. They call `getSupabaseAdmin()` for elevated access, mutate the jobs table, then call `revalidatePath` to clear Next.js cache.

**When to use:** Any time a mutation touches the jobs table. The admin client bypasses RLS at the mutation layer — RLS on SELECT still governs what gets read back by the browser client.

**Example (following app/admin/actions.ts pattern):**
```typescript
// app/jobs/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function createJob(data: {
  gc_contractor_id: string
  title: string
  description: string
  trade: string
  location_city: string | null
  location_state: string | null
}) {
  const admin = getSupabaseAdmin()
  const { error } = await admin.from('jobs').insert({ ...data, status: 'open' })
  if (error) throw new Error(error.message)
  revalidatePath('/jobs')
}

export async function markHired(jobId: string, hiredContractorId: string) {
  const admin = getSupabaseAdmin()
  const { error } = await admin
    .from('jobs')
    .update({
      status: 'hired',
      hired_contractor_id: hiredContractorId,
      hired_at: new Date().toISOString(),
    })
    .eq('id', jobId)
  if (error) throw new Error(error.message)
  revalidatePath('/jobs')
}

export async function markCompleted(jobId: string, hiredContractorId: string) {
  const admin = getSupabaseAdmin()
  const { error } = await admin
    .from('jobs')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', jobId)
  if (error) throw new Error(error.message)
  revalidatePath('/jobs')
  revalidatePath(`/contractors/${hiredContractorId}`)
}
```

### Pattern 2: Jobs Page as Server Component with force-dynamic
**What:** `app/jobs/page.tsx` is a server component (no `'use client'`) that reads from the jobs table via `getSupabaseAdmin()`, determines the viewer's identity via the cookie pattern, and passes `viewerContractorId` as a prop to each JobCard.

**When to use:** All list/read pages in this project use this pattern (see `/contractors/page.tsx`, `/explore/page.tsx`).

**Key query — FK hint required for dual FKs to contractors:**
```typescript
const { data } = await admin
  .from('jobs')
  .select(`
    *,
    gc_contractor:contractors!jobs_gc_contractor_id_fkey(full_name, trade),
    hired_contractor:contractors!jobs_hired_contractor_id_fkey(full_name, trade)
  `)
  .order('created_at', { ascending: false })
  .limit(50)
```

**Viewer identity (from explore/page.tsx pattern):**
```typescript
// Source: app/explore/page.tsx lines 103-117
const cookieStore = cookies()
const allCookies = cookieStore.getAll()
const authCookie = allCookies.find((c) => c.name.includes('-auth-token'))
const token = authCookie
  ? (() => { try { return JSON.parse(authCookie.value)?.[0] } catch { return null } })()
  : null
const { data: { user } } = await admin.auth.getUser(token ?? '')
// Then fetch viewer's contractor row to get viewerContractorId and viewerTrade
```

### Pattern 3: Client Component Modal for SubSelectorModal
**What:** A `'use client'` component that opens a dialog overlay, renders a searchable list of approved contractors (fetched client-side on open using the browser supabase client), and calls `markHired` server action on confirm.

**When to use:** Any time user needs to pick from a dynamic list with search — cannot be done in a static server component.

**Implementation sketch:**
```typescript
// components/SubSelectorModal.tsx
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { markHired } from '@/app/jobs/actions'
import type { Contractor } from '@/lib/types'

interface Props {
  jobId: string
  onClose: () => void
}

export default function SubSelectorModal({ jobId, onClose }: Props) {
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [search, setSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase
      .from('contractors')
      .select('id, full_name, trade, location_city, location_state, profile_photo_url, status, specialties, years_experience, bio, phone, email, website, user_id, created_at')
      .eq('status', 'approved')
      .order('full_name')
      .then(({ data }) => setContractors((data as Contractor[]) ?? []))
  }, [])

  const filtered = contractors.filter(
    (c) =>
      search === '' ||
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.trade.toLowerCase().includes(search.toLowerCase())
  )

  async function handleSelect(contractorId: string) {
    setSubmitting(true)
    await markHired(jobId, contractorId)
    onClose()
  }
  // ... render overlay backdrop + scrollable list with search input
}
```

### Pattern 4: JobCard as Client Component with Conditional Action Buttons
**What:** `JobCard` is `'use client'` because it manages modal open/close state. The page determines ownership server-side and passes `isOwner: boolean` as a prop.

**Status pill colors (matching project Tailwind conventions):**
```typescript
const statusConfig: Record<JobStatus, { label: string; className: string }> = {
  open:      { label: 'Open',      className: 'bg-emerald-900/50 text-emerald-400' },
  hired:     { label: 'Hired',     className: 'bg-amber-900/40 text-amber-400' },
  completed: { label: 'Completed', className: 'bg-slate-800 text-slate-400' },
}
```

**Action button visibility logic:**
- `isOwner && job.status === 'open'` → "Mark Hired" button (opens SubSelectorModal)
- `isOwner && job.status === 'hired'` → "Mark Complete" button (calls markCompleted directly)
- `isOwner && job.status === 'completed'` → no action buttons
- `!isOwner` → no action buttons at all

### Pattern 5: CompletedJobsSection on Contractor Profile
**What:** A new `<section>` added to `app/contractors/[id]/page.tsx` that queries completed jobs where `hired_contractor_id = params.id`. Rendered server-side alongside certifications, inside the existing `lg:col-span-2` content column.

**Key query:**
```typescript
const { data: completedJobsData } = await admin
  .from('jobs')
  .select(`
    id, title, trade, location_city, location_state, completed_at,
    gc_contractor:contractors!jobs_gc_contractor_id_fkey(full_name)
  `)
  .eq('hired_contractor_id', params.id)
  .eq('status', 'completed')
  .order('completed_at', { ascending: false })
```

**Display:** Each entry shows job title, "Hired by [GC full_name]", trade, location, and formatted completion date. Section header: "Verified Work History" with a sub-label like "Platform-verified completed jobs". Only shown if there are completed jobs.

**Placement:** After certifications section, before the end of the `lg:col-span-2` div.

### Anti-Patterns to Avoid
- **Don't use the browser supabase client in server components or server actions.** Jobs page and actions use `getSupabaseAdmin()`. SubSelectorModal uses `supabase` (browser client) because it runs client-side.
- **Don't forget the FK hint in Supabase selects.** The jobs table has two FKs to contractors. Without `!fk_name` hints, Supabase JS throws a relationship ambiguity error at runtime.
- **Don't determine GC ownership client-side.** The page (server component) determines `isOwner` from the viewer's contractor ID; passes it as prop to JobCard. No client-side auth check for ownership.
- **Don't revalidate only `/jobs` after markCompleted.** Must also revalidate the hired contractor's profile page so the portfolio section reflects the new entry immediately.
- **Don't use `getSupabaseAdmin()` inside a client component.** The `server-only` import will cause a build failure.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Status transition enforcement | JS guards in server action | Existing DB trigger `enforce_job_status_transition` | Already blocks invalid transitions at DB level — duplicating in JS creates drift risk |
| GC identity check at insert | Custom auth query | Existing `is_gc()` RLS function | Already enforced at the DB INSERT policy layer |
| Contractor search/filter in modal | Custom search algorithm | Client-side JS filter on pre-fetched list | Contractor list is small (< 200); single fetch + client filter is sufficient and simpler |
| Dialog/modal overlay | UI library component | Simple div overlay with backdrop | Project has no UI library; a positional overlay matches existing patterns |

---

## Common Pitfalls

### Pitfall 1: Ambiguous Foreign Key in Supabase Select
**What goes wrong:** `supabase.from('jobs').select('*, gc_contractor(*), hired_contractor(*)')` throws "Could not embed because more than one relationship was found" error.
**Why it happens:** Both `gc_contractor_id` and `hired_contractor_id` are FKs to `contractors`. Supabase JS cannot auto-resolve which FK to use.
**How to avoid:** Use the explicit FK hint syntax:
```typescript
.select('*, gc_contractor:contractors!jobs_gc_contractor_id_fkey(full_name), hired_contractor:contractors!jobs_hired_contractor_id_fkey(full_name)')
```
**Warning signs:** Runtime error mentioning "more than one relationship" or joined fields returning null unexpectedly.

### Pitfall 2: Missing RLS Policy for Hired Contractor Viewing Their Own Jobs
**What goes wrong:** A hired contractor's portfolio query returns zero rows when run through the RLS-enforcing browser client.
**Why it happens:** Phase 8 RLS has two SELECT policies: (1) public sees open jobs, (2) GC sees own jobs. No policy exists for hired contractor to see jobs where they are `hired_contractor_id`.
**How to avoid:** Add `009_jobs_hired_select.sql` migration as a Wave 0 task. The server-side admin client bypasses RLS, so JOBS-04 works from the profile page — but the gap is worth closing for hygiene.
**Warning signs:** Any future client-side query for "my hired jobs" returns empty.

### Pitfall 3: revalidatePath for Dynamic Route Not Clearing Cache
**What goes wrong:** After markCompleted, the portfolio section on `/contractors/[id]` remains stale.
**Why it happens:** `revalidatePath('/contractors/[id]')` literally does not match any dynamic route. Must use the actual path segment.
**How to avoid:** In the `markCompleted` server action, pass `hiredContractorId` and call `revalidatePath(\`/contractors/${hiredContractorId}\`)`.

### Pitfall 4: Admin Client in Client Component Causes Build Failure
**What goes wrong:** Importing `getSupabaseAdmin()` anywhere that ends up in client bundle causes build error.
**Why it happens:** `supabase-admin.ts` imports `server-only` — this is intentional and correct.
**How to avoid:** SubSelectorModal fetches contractors using `supabase` (browser client from `lib/supabase.ts`). All mutations go through server actions (which run server-side only).

### Pitfall 5: GC-Only Constraint Surprises Non-GC Contractors
**What goes wrong:** A non-GC approved contractor (e.g., a welder) tries to post a job and gets a silent failure because `is_gc()` returns false.
**Why it happens:** The INSERT RLS policy uses `is_gc()` which checks `trade = 'General Contractor'`.
**How to avoid:** Show the "Post a Job" button and CreateJobForm only to contractors whose `trade === 'General Contractor'`. The server-side viewer fetch makes this easy — check `viewerContractor?.trade === 'General Contractor'` before rendering the form.

### Pitfall 6: Flash on Action Buttons While Auth Resolves
**What goes wrong:** JobCard renders with action buttons visible, then they disappear once auth state confirms the viewer is not the owner.
**Why it happens:** If ownership is determined client-side, there is inherent latency.
**How to avoid:** Determine `isOwner` server-side in the jobs page using the cookie auth pattern from `explore/page.tsx`. Pass it as a boolean prop. No client auth check needed for rendering ownership UI.

---

## Code Examples

### Dual FK Select — Required Syntax
```typescript
// Source: Supabase JS FK disambiguation documented behavior
// Used when multiple foreign keys point to the same table
const { data } = await admin
  .from('jobs')
  .select(`
    id, title, description, trade, location_city, location_state, status,
    created_at, hired_at, completed_at,
    gc_contractor:contractors!jobs_gc_contractor_id_fkey(full_name, trade),
    hired_contractor:contractors!jobs_hired_contractor_id_fkey(full_name, trade)
  `)
  .order('created_at', { ascending: false })
  .limit(50)
```

### Server-Side Viewer Identity (from explore/page.tsx)
```typescript
// Source: app/explore/page.tsx lines 103-127
const cookieStore = cookies()
const allCookies = cookieStore.getAll()
const authCookie = allCookies.find((c) => c.name.includes('-auth-token'))
const token = authCookie
  ? (() => { try { return JSON.parse(authCookie.value)?.[0] } catch { return null } })()
  : null
const { data: { user } } = await admin.auth.getUser(token ?? '')

let viewerContractorId: string | null = null
let viewerIsGC = false
if (user) {
  const { data: viewerContractor } = await admin
    .from('contractors')
    .select('id, trade')
    .eq('user_id', user.id)
    .eq('status', 'approved')
    .maybeSingle()
  viewerContractorId = viewerContractor?.id ?? null
  viewerIsGC = viewerContractor?.trade === 'General Contractor'
}
```

### Revalidation After Mutation (from app/admin/actions.ts pattern)
```typescript
// Source: app/admin/actions.ts lines 83-85
revalidatePath('/admin')
revalidatePath('/contractors')
revalidatePath('/')
// Phase 9 adaptation for markCompleted:
revalidatePath('/jobs')
revalidatePath(`/contractors/${hiredContractorId}`)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| /jobs page reads from `posts` table (category='jobs') | /jobs page rebuilt to read from `jobs` table | Phase 9 | Structured job records with lifecycle status replace free-form posts on the Jobs board |
| No portfolio section on contractor profiles | CompletedJobsSection shows verified completed jobs | Phase 9 | Contractors gain a verified credibility signal beyond certifications |

**Deprecated/outdated:**
- `app/jobs/page.tsx` current implementation: reads from `posts` table with `category='jobs'`, renders PostCards. Phase 9 replaces this entirely. Old job posts in the `posts` table are not deleted — they remain visible on the Explore feed.

---

## RLS Gap Requiring Migration

The `008_jobs_table.sql` SELECT policies cover:
1. Public can see `open` jobs
2. GC can see their own jobs (any status)

**Missing:** hired contractor can see jobs where `hired_contractor_id = their contractor ID`.

The server-side admin client used in `app/contractors/[id]/page.tsx` bypasses RLS, so JOBS-04 works without this policy. However, the gap should be closed for correctness.

Migration file: `supabase/migrations/009_jobs_hired_select.sql`
```sql
-- 009_jobs_hired_select.sql
-- Allow hired contractor to view jobs they were hired for

create policy "jobs: hired contractor select own"
  on jobs for select
  using (
    exists (
      select 1 from contractors
      where user_id = auth.uid()
      and id = jobs.hired_contractor_id
    )
  );
```

---

## Open Questions

1. **Should the "Post a Job" form appear on /jobs or on the /profile page?**
   - What we know: The current /jobs page links to /profile for posting. The plan description calls for a "createJob server action" and jobs board — implies the form lives on /jobs.
   - What's unclear: Whether the create form is inline on /jobs (modal or inline form at top) or a separate route.
   - Recommendation: Inline create form at the top of /jobs, shown only to GC contractors. A modal approach keeps the page clean; an inline form is simpler. Either works — plan at discretion of implementer.

2. **Should the /jobs page show only the current user's jobs or all open jobs?**
   - What we know: RLS policies allow public to see `open` jobs; GC can see their own jobs regardless of status.
   - What's unclear: The current plan says "job listing with status pills" which implies all jobs are shown.
   - Recommendation: Show all `open` jobs publicly (no auth needed to browse). A GC who is logged in additionally sees their own `hired` and `completed` jobs. This matches the RLS design intent.

3. **Where does the hired contractor learn they were hired?**
   - What we know: No notification mechanism exists. The hired contractor only discovers this by checking their profile page.
   - What's unclear: Whether v1.2 should include any notification (email, in-app).
   - Recommendation: Out of scope for Phase 9. The portfolio section on the profile page is the only discovery mechanism for now.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — no jest.config, vitest.config, or test directory found |
| Config file | None |
| Quick run command | `npm run build && npm run lint` |
| Full suite command | `npm run build && npm run lint` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| JOBS-01 | GC can create a job posting | manual-only | `npm run build` (type-checks createJob action and form) | N/A |
| JOBS-02 | GC can mark job as hired with contractor selection | manual-only | `npm run build` (type-checks markHired action and modal) | N/A |
| JOBS-03 | GC can mark hired job as completed | manual-only | `npm run build` (type-checks markCompleted action) | N/A |
| JOBS-04 | Completed jobs appear on hired contractor's profile | manual-only | `npm run build` (type-checks CompletedJobsSection query) | N/A |

**Justification for manual-only:** No test framework exists in the project. All requirements involve UI interactions and live database state. Build + lint serves as the automated gate; human visual verification covers functional correctness (established project pattern from Phases 7 and 8).

### Sampling Rate
- **Per task commit:** `npm run build && npm run lint`
- **Per wave merge:** `npm run build && npm run lint`
- **Phase gate:** Build green + human visual verification before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `supabase/migrations/009_jobs_hired_select.sql` — RLS policy for hired contractor to SELECT their own jobs (good hygiene even though profile page uses admin client)

---

## Sources

### Primary (HIGH confidence)
- Direct codebase read — `supabase/migrations/008_jobs_table.sql` (exact schema, trigger, RLS policies)
- Direct codebase read — `lib/types.ts` (Job interface, JobStatus union type)
- Direct codebase read — `app/admin/actions.ts` (server action pattern — the template for job mutations)
- Direct codebase read — `app/explore/page.tsx` (server-side cookie auth pattern, sidebar layout)
- Direct codebase read — `app/contractors/[id]/page.tsx` (profile page structure to extend for JOBS-04)
- Direct codebase read — `components/ContactSection.tsx` (client component with auth-aware UI — model for JobCard)
- Direct codebase read — `app/jobs/page.tsx` (current implementation to replace)
- Direct codebase read — `components/ContractorCard.tsx` (card UI conventions, status pill pattern)

### Secondary (MEDIUM confidence)
- Supabase JS FK disambiguation (`table!fk_name` syntax) — documented behavior verified against known Supabase JS API patterns for tables with multiple FKs to the same target

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — codebase is fully established; no new dependencies required
- Architecture: HIGH — patterns directly derived from existing files; no speculation needed
- Pitfalls: HIGH — FK ambiguity and RLS gap identified from direct schema analysis, not guesswork
- Validation: HIGH — test infrastructure gap confirmed by filesystem scan

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (stable codebase, no external dependencies to expire)
