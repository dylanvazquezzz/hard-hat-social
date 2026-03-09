# Phase 8: Jobs Schema - Research

**Researched:** 2026-03-08
**Domain:** PostgreSQL / Supabase — table design, CHECK constraints, BEFORE UPDATE triggers, Row Level Security
**Confidence:** HIGH

---

## Summary

Phase 8 is a pure database migration phase. No UI is touched. The deliverable is a single SQL migration file (`008_jobs_table.sql`) that creates the `jobs` table with the correct schema, a state-transition BEFORE UPDATE trigger, RLS policies, and indexes — plus a new `Job` TypeScript interface in `lib/types.ts`.

The project has 7 prior migrations establishing clear patterns: `text NOT NULL CHECK (value IN (...))` for enum-like columns, `security definer` helper functions for RLS, named policies using the format `"table: policy description"`, and `CREATE INDEX` statements at the end of each migration. Phase 8 must follow these patterns exactly.

The core complexity is the BEFORE UPDATE trigger. PostgreSQL triggers can access `OLD` and `NEW` row values, making it straightforward to reject invalid status transitions (hired → open, completed → anything) by raising an exception. Supabase runs standard Postgres 15, so all standard trigger syntax applies.

**Primary recommendation:** Write one migration file following the existing migration conventions, keep the trigger logic simple (explicit bad-transition checks), and define RLS using the existing `is_approved_contractor()` helper plus a new `is_gc()` helper or inline subquery for GC detection.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| PostgreSQL triggers | Postgres 15 (Supabase) | State-transition enforcement at DB layer | Cannot be bypassed by app layer bugs |
| Supabase RLS | Built-in | Access control per row | Established pattern in all 7 prior migrations |
| TypeScript interfaces | Project standard | Type-safe DB rows | Required by CLAUDE.md |

### No New Dependencies

This phase adds zero npm packages. It is a SQL migration + TypeScript type addition only.

---

## Architecture Patterns

### Recommended Project Structure

Migration file goes here:
```
supabase/migrations/008_jobs_table.sql
```

TypeScript type addition goes in:
```
lib/types.ts   (append — do not replace existing types)
```

### Pattern 1: Table With CHECK Constraint (established in this project)

**What:** Use `text NOT NULL CHECK (column IN ('val1', 'val2', 'val3'))` — never a Postgres ENUM type.

**Why this project uses text + CHECK, not ENUM:**
- Migration 001 (`contractors.status`), migration 003 (`posts.category`) both use this pattern
- ENUM types in Postgres require `ALTER TYPE` to add values — risky in production migrations
- text + CHECK is simpler to alter (just `ADD CONSTRAINT` or `DROP CONSTRAINT / ADD CONSTRAINT`)

**Example from 001_initial.sql (HIGH confidence — read directly):**
```sql
status text not null default 'pending'
       check (status in ('pending', 'approved', 'rejected')),
```

### Pattern 2: BEFORE UPDATE Trigger for State Machine

**What:** A PL/pgSQL function + trigger that fires BEFORE UPDATE, inspects `OLD.status` and `NEW.status`, and raises an exception for invalid transitions.

**When to use:** Any column that must follow a directed state graph rather than allow arbitrary updates.

**State graph for jobs:**
```
open → hired → completed
 ↑        ↗
(blocked: hired → open is invalid, completed → any is invalid)
```

**Valid transitions:**
- `open → hired` — GC selects a contractor
- `hired → completed` — GC marks job done

**Invalid transitions (trigger must block):**
- `hired → open` — cannot un-hire
- `completed → open` — cannot reopen a completed job
- `completed → hired` — nonsensical

**Postgres trigger pattern (HIGH confidence — standard Postgres 15 syntax):**
```sql
create or replace function enforce_job_status_transition()
returns trigger
language plpgsql
as $$
begin
  -- Block any transition out of 'completed'
  if OLD.status = 'completed' then
    raise exception 'Job status cannot change after completion';
  end if;

  -- Block reverting from 'hired' to 'open'
  if OLD.status = 'hired' and NEW.status = 'open' then
    raise exception 'Cannot revert a hired job to open';
  end if;

  return NEW;
end;
$$;

create trigger job_status_transition_check
  before update on jobs
  for each row
  execute function enforce_job_status_transition();
```

**Key details:**
- `returns trigger` — not `returns void`
- `BEFORE UPDATE` — fires before the row is written; AFTER UPDATE cannot prevent the write
- `FOR EACH ROW` — required to access OLD/NEW
- Return `NEW` on success, raise exception on failure — Supabase surfaces exception messages to the client as error objects
- Function must be defined BEFORE the trigger that references it

### Pattern 3: RLS Policies

**What:** Enable RLS, write named policies for SELECT / INSERT / UPDATE.

**GC detection challenge:** "GC-only INSERT and status UPDATE" per the success criteria. The existing `is_approved_contractor()` helper (in migration 001) checks if the current user has any approved contractor row. GC detection requires checking that the approved contractor's `trade = 'General Contractor'`. Two approaches:

**Option A — New helper function (preferred for reuse in Phase 9):**
```sql
create or replace function is_gc()
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from contractors
    where user_id = auth.uid()
    and   status  = 'approved'
    and   trade   = 'General Contractor'
  );
$$;
```

**Option B — Inline subquery in policy (acceptable for one-off):**
```sql
create policy "jobs: gc insert"
  on jobs for insert
  with check (
    exists (
      select 1 from contractors
      where user_id = auth.uid()
      and status = 'approved'
      and trade = 'General Contractor'
    )
  );
```

Option A is preferred because Phase 9 will likely need this check in server actions too.

**SELECT policy:** Public can view open jobs (status = 'open'). Hired/completed jobs are viewable by participants (GC who posted, contractor who was hired). For MVP simplicity, all approved contractors can view all jobs — the requirement only specifies "public SELECT for open jobs". Interpret strictly: unauthenticated users can see open jobs.

**Recommended RLS set:**
```sql
-- Anyone can view open jobs (discovery)
create policy "jobs: public select open"
  on jobs for select
  using (status = 'open');

-- GC can also view their own jobs regardless of status
create policy "jobs: gc select own"
  on jobs for select
  using (
    exists (
      select 1 from contractors
      where user_id = auth.uid()
      and id = jobs.gc_contractor_id
    )
  );

-- GC can insert job postings
create policy "jobs: gc insert"
  on jobs for insert
  with check (is_gc());

-- GC can update status of their own jobs
create policy "jobs: gc update status"
  on jobs for update
  using (
    exists (
      select 1 from contractors
      where user_id = auth.uid()
      and id = jobs.gc_contractor_id
    )
  );
```

### Pattern 4: Indexes at Migration End

**Established pattern from all prior migrations:**
```sql
-- indexes come last, after tables + RLS
create index jobs_status_idx         on jobs (status);
create index jobs_gc_contractor_idx  on jobs (gc_contractor_id);
create index jobs_hired_contractor_idx on jobs (hired_contractor_id);
create index jobs_created_at_idx     on jobs (created_at desc);
```

### Recommended `jobs` Table Schema

Based on REQUIREMENTS.md (JOBS-01 through JOBS-04) and what Phase 9 will need:

```sql
create table jobs (
  id                   uuid primary key default gen_random_uuid(),
  gc_contractor_id     uuid references contractors(id) on delete cascade not null,
  hired_contractor_id  uuid references contractors(id),        -- null until hired
  title                text not null,
  description          text not null,
  trade                text not null,
  location_city        text,
  location_state       text,
  status               text not null default 'open'
                       check (status in ('open', 'hired', 'completed')),
  created_at           timestamptz default timezone('utc', now()),
  hired_at             timestamptz,                            -- set when status → hired
  completed_at         timestamptz                             -- set when status → completed
);
```

**Field rationale:**
- `gc_contractor_id` — FK to contractors (not auth.users) so we can join trade/location directly; GC who posted the job
- `hired_contractor_id` — nullable until JOBS-02 fires; FK to contractors for JOBS-04 (portfolio display)
- `hired_at` / `completed_at` — timestamp records for audit trail; Phase 9 will want these for display
- `trade` — allows job-board filtering by trade without joining contractors table
- Status column uses text + CHECK per project pattern

### Anti-Patterns to Avoid

- **Using a Postgres ENUM instead of text + CHECK:** ENUM additions require ALTER TYPE which can lock tables; this project consistently uses text + CHECK — follow the pattern.
- **Using AFTER UPDATE trigger for state enforcement:** AFTER triggers run after the row is written; only BEFORE UPDATE can prevent the write.
- **Omitting `FOR EACH ROW`:** Statement-level triggers do not have access to OLD/NEW row values.
- **Defining the trigger before the trigger function:** Postgres requires the function to exist first.
- **Overly broad RLS policies on UPDATE:** Allow GC to update only their own jobs (using `gc_contractor_id`) — not all jobs.
- **Omitting `hired_contractor_id` from schema:** Phase 9 JOBS-04 (portfolio display) requires this FK to link a completed job to a contractor profile. Adding it later requires a separate migration.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State enforcement | Application-layer status checks | Postgres BEFORE UPDATE trigger | App layer can be bypassed by direct DB calls, bugs, or future server actions that forget to check |
| GC authorization | Repeated inline subqueries in every policy | `is_gc()` security definer function | DRY, easier to update if GC trade name changes, consistent with `is_approved_contractor()` precedent |

**Key insight:** Encoding state machine rules in the database makes them impossible to bypass, regardless of what application code does. This is especially important when Phase 9 will add multiple server actions that touch job status.

---

## Common Pitfalls

### Pitfall 1: Trigger Function Missing `returns trigger`

**What goes wrong:** Migration runs but trigger silently does nothing, or fails with "function must return type trigger."

**Why it happens:** PL/pgSQL trigger functions have a specific return type — `returns trigger` — not `returns void` or `returns boolean`.

**How to avoid:** Always declare trigger functions as `returns trigger language plpgsql`.

**Warning signs:** Migration executes without error but status transitions are not blocked in testing.

### Pitfall 2: RLS Policy Naming Conflicts

**What goes wrong:** Migration fails with "policy already exists" if run against a DB that partially applied a previous migration attempt.

**Why it happens:** Postgres does not do implicit IF NOT EXISTS for policies (unlike `CREATE TABLE IF NOT EXISTS`).

**How to avoid:** Use `DROP POLICY IF EXISTS "name" ON table;` before `CREATE POLICY` in any migration that might be re-run, or use a fresh migration number each time.

**Project pattern:** Migration 007 uses explicit `DROP POLICY IF EXISTS` before creating replacements — follow this pattern if replacing policies.

### Pitfall 3: Missing `WITH CHECK` on UPDATE Policy

**What goes wrong:** A GC can update any job to point `gc_contractor_id` at a different contractor, effectively stealing jobs.

**Why it happens:** `USING` clause governs which rows are visible for the operation; `WITH CHECK` governs what the resulting row must satisfy. UPDATE needs both.

**How to avoid:** Always pair `USING` (which rows the user can target) with `WITH CHECK` (what the updated row must look like) on UPDATE policies.

### Pitfall 4: Trigger Does Not Fire on Partial Updates

**What goes wrong:** Phase 9 sends `UPDATE jobs SET status = 'hired' WHERE id = ?` — trigger fires. But if Phase 9 sends `UPDATE jobs SET hired_contractor_id = ?` without changing status, trigger still fires (BEFORE UPDATE on any column change). This is correct behavior but worth knowing.

**How to avoid:** No action needed — this is Postgres default behavior and is safe. The trigger only raises exceptions for invalid status transitions; non-status updates pass through.

### Pitfall 5: `hired_contractor_id` NOT NULL Constraint Too Early

**What goes wrong:** If `hired_contractor_id` is `NOT NULL`, the INSERT (new job posting) fails because no contractor is hired yet.

**Why it happens:** `hired_contractor_id` is only set on the `open → hired` transition, not at creation.

**How to avoid:** `hired_contractor_id` must be nullable. Set it in the same UPDATE that moves status to `hired`.

---

## Code Examples

Verified patterns from existing project migrations:

### CHECK Constraint (from 001_initial.sql)
```sql
-- Source: supabase/migrations/001_initial.sql line 22-23
status text not null default 'pending'
       check (status in ('pending', 'approved', 'rejected')),
```

### Security Definer Helper for RLS (from 001_initial.sql)
```sql
-- Source: supabase/migrations/001_initial.sql lines 64-73
create or replace function is_approved_contractor()
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from contractors
    where user_id = auth.uid()
    and   status  = 'approved'
  );
$$;
```

### RLS Policy With Subquery (from 001_initial.sql)
```sql
-- Source: supabase/migrations/001_initial.sql lines 96-104
create policy "Public can view certifications for approved contractors"
  on certifications for select
  using (
    exists (
      select 1 from contractors c
      where c.id = certifications.contractor_id
      and   c.status = 'approved'
    )
  );
```

### DROP POLICY IF EXISTS Before Replacement (from 007_storage_policies.sql)
```sql
-- Source: supabase/migrations/007_storage_policies.sql lines 12-13
DROP POLICY IF EXISTS "Applicants can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Applicants can read their own documents" ON storage.objects;
```

### TypeScript Union Type Pattern (from lib/types.ts)
```typescript
// Source: lib/types.ts line 1
export type ContractorStatus = 'pending' | 'approved' | 'rejected'

// New pattern to add for Phase 8:
export type JobStatus = 'open' | 'hired' | 'completed'

export interface Job {
  id: string
  gc_contractor_id: string
  hired_contractor_id: string | null
  title: string
  description: string
  trade: string
  location_city: string | null
  location_state: string | null
  status: JobStatus
  created_at: string
  hired_at: string | null
  completed_at: string | null
  // joined fields (optional — for Phase 9 queries)
  gc_contractor?: { full_name: string; trade: string }
  hired_contractor?: { full_name: string; trade: string } | null
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Application-layer state guards | DB-layer BEFORE UPDATE triggers | N/A — trigger is the right tool | State enforcement is tamper-proof |
| Postgres ENUM for status | text + CHECK | Already established in this project | Easier future migrations |

---

## Open Questions

1. **What trade value does "GC" use?**
   - What we know: The `trade` column is free text (not an enum). "General Contractor" is listed in CLAUDE.md as a valid trade.
   - What's unclear: Whether any existing contractors have `trade = 'General Contractor'` vs some variant like "GC" or "General Contracting".
   - Recommendation: Use `'General Contractor'` exactly as written in CLAUDE.md. The `is_gc()` function can be updated if the trade name changes.

2. **Should all approved contractors see all jobs (hired/completed), or only open jobs publicly?**
   - What we know: Success criteria says "public SELECT for open jobs." That implies non-open jobs are not public.
   - What's unclear: Whether logged-in approved non-GC contractors should see hired/completed jobs (e.g., to see portfolio context).
   - Recommendation: Keep it simple — public SELECT only for `status = 'open'`, plus GC can SELECT their own jobs regardless of status. Phase 9 can add more visibility if needed.

3. **Should the trigger also validate that `hired_contractor_id` is set when transitioning to `hired`?**
   - What we know: Phase 9 (JOBS-02) requires the GC to select a contractor when marking hired.
   - What's unclear: Whether to enforce this at the DB layer (trigger) or app layer (Phase 9 server action).
   - Recommendation: Enforce at DB layer — add a check in the trigger that `NEW.status = 'hired' AND NEW.hired_contractor_id IS NULL` raises an exception. Defense in depth.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no pytest.ini, jest.config, or vitest.config found in project |
| Config file | None — Wave 0 must add if testing is required |
| Quick run command | `npm run build` (TypeScript compile check — confirmed in CLAUDE.md) |
| Full suite command | `npm run build && npm run lint` |

### Phase Requirements → Test Map

Phase 8 is an infrastructure prerequisite with no user-facing requirements. Its success criteria are observable at the database and build level only.

| ID | Behavior | Test Type | Automated Command | File Exists? |
|----|----------|-----------|-------------------|-------------|
| SC-1 | `jobs` table exists with CHECK status constraint and BEFORE UPDATE trigger | manual-only (DB inspection) | Apply migration to local Supabase, `SELECT * FROM jobs LIMIT 1` | N/A — DB migration |
| SC-2 | `Job` TypeScript interface compiles without errors | build | `npm run build` | ✅ (after types added) |
| SC-3 | `npm run build` completes without errors after types added | build | `npm run build` | ✅ |

**Manual-only justification for SC-1:** Trigger behavior verification requires a running Postgres instance. The project has no test DB or automated migration test harness. The planner should include a manual test step where the developer applies the migration to local Supabase and runs explicit UPDATE statements to verify the trigger blocks invalid transitions.

### Sampling Rate
- **Per task commit:** `npm run build` — catches TypeScript errors immediately
- **Per wave merge:** `npm run build && npm run lint`
- **Phase gate:** `npm run build` green + manual trigger verification before `/gsd:verify-work`

### Wave 0 Gaps

None — no new test files needed. `npm run build` is the automated gate. Manual DB verification is documented in the plan's task steps.

---

## Sources

### Primary (HIGH confidence)
- `supabase/migrations/001_initial.sql` — text + CHECK pattern, security definer functions, RLS policy syntax
- `supabase/migrations/002_profiles_posts.sql` — FK + cascade patterns, index conventions
- `supabase/migrations/005_rls_improvements.sql` — DROP POLICY, user_id-based auth patterns
- `supabase/migrations/007_storage_policies.sql` — DROP POLICY IF EXISTS before replacement pattern
- `lib/types.ts` — existing type conventions (union type + interface)
- `CLAUDE.md` — trade names, project constraints, TypeScript rules
- PostgreSQL 15 documentation (BEFORE UPDATE triggers, PL/pgSQL raise exception) — standard syntax

### Secondary (MEDIUM confidence)
- REQUIREMENTS.md — JOBS-01 through JOBS-04 define what Phase 9 needs from this schema, constraining design
- STATE.md — confirms `server-only` pattern, RLS usage discipline from prior phases

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Supabase/Postgres 15 is confirmed; no new packages needed
- Architecture: HIGH — trigger and RLS patterns are standard Postgres; existing migrations confirm project conventions
- Pitfalls: HIGH — all pitfalls derived from direct inspection of existing migrations and Postgres documentation
- TypeScript interface: HIGH — existing type file shows exact conventions to follow

**Research date:** 2026-03-08
**Valid until:** 2026-06-08 (stable Postgres/Supabase behavior — not fast-moving)
