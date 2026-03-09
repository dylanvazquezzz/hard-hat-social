-- 008_jobs_table.sql
-- Jobs table for subcontracting opportunities posted by General Contractors.
-- Status transitions are enforced at the DB layer via a BEFORE UPDATE trigger.

-- 1. is_gc() helper function (referenced by RLS insert policy)
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

-- 2. jobs table (text + CHECK for status -- matches project convention from 001_initial.sql)
create table jobs (
  id                   uuid primary key default gen_random_uuid(),
  gc_contractor_id     uuid references contractors(id) on delete cascade not null,
  hired_contractor_id  uuid references contractors(id),
  title                text not null,
  description          text not null,
  trade                text not null,
  location_city        text,
  location_state       text,
  status               text not null default 'open'
                       check (status in ('open', 'hired', 'completed')),
  created_at           timestamptz default timezone('utc', now()),
  hired_at             timestamptz,
  completed_at         timestamptz
);

-- 3. BEFORE UPDATE trigger function to enforce valid status transitions
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

  -- Enforce that hired_contractor_id is set when transitioning to 'hired'
  if NEW.status = 'hired' and NEW.hired_contractor_id is null then
    raise exception 'hired_contractor_id must be set when marking a job as hired';
  end if;

  return NEW;
end;
$$;

-- 4. Trigger (BEFORE UPDATE -- only BEFORE can prevent the write)
create trigger job_status_transition_check
  before update on jobs
  for each row
  execute function enforce_job_status_transition();

-- 5. Enable RLS + policies
alter table jobs enable row level security;

-- Anyone can view open jobs (unauthenticated discovery)
create policy "jobs: public select open"
  on jobs for select
  using (status = 'open');

-- GC can view their own jobs regardless of status
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

-- GC can update status on their own jobs
-- USING + WITH CHECK prevents gc_contractor_id reassignment
create policy "jobs: gc update status"
  on jobs for update
  using (
    exists (
      select 1 from contractors
      where user_id = auth.uid()
      and id = jobs.gc_contractor_id
    )
  )
  with check (
    exists (
      select 1 from contractors
      where user_id = auth.uid()
      and id = jobs.gc_contractor_id
    )
  );

-- 6. Indexes
create index jobs_status_idx           on jobs (status);
create index jobs_gc_contractor_idx    on jobs (gc_contractor_id);
create index jobs_hired_contractor_idx on jobs (hired_contractor_id);
create index jobs_created_at_idx       on jobs (created_at desc);
