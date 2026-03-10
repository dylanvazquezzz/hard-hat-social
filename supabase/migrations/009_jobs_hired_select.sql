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
