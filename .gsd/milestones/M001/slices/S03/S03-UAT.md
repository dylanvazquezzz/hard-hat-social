# M001/S03: Job Posting UX Overhaul — UAT

**Milestone:** M001
**Written:** 2026-03-12

## UAT Type

- UAT mode: artifact-driven + live-runtime
- Why this mode is sufficient: Build passes clean. Migration verified in production DB. Full live runtime test requires an authenticated approved-contractor session — documented below for manual execution post-deploy.

## Preconditions

- Signed in as an approved contractor
- To test GC default tab: contractor must have `trade = 'General Contractor'` in the contractors table
- Migration 012 applied to production Supabase (confirmed ✅)

## Smoke Test

Navigate to `/jobs`. Click "+ Post a Job". Confirm form shows Title, Trade (dropdown), Pay Rate, Duration, City, State (dropdown), and Description fields. Fill in trade and description, submit. Confirm new job appears with pay/duration badges if filled.

## Test Cases

### 1. CreateJobForm structured fields

1. Go to `/jobs` as an approved contractor
2. Click "+ Post a Job"
3. **Expected:** Form shows 6 labelled fields — Job Title, Trade Needed (dropdown with Welding/HVAC/Electrical/Plumbing/General Contractor/Drywall/Other), Pay Rate, Duration, City + State (dropdown), Description

### 2. Post a job with pay rate and duration

1. Fill in: Title = "TIG Welder — 4 weeks", Trade = "Welding", Pay Rate = "$50/hr", Duration = "4 weeks", City = "Houston", State = "TX", Description = "Structural pipe welding, certified required."
2. Click "Post Job"
3. **Expected:** Form shows "Job posted!" briefly, then collapses. New job card appears on /jobs with "$50/hr" and "4 weeks" badges visible below the title.

### 3. JobCard badge rendering

1. View any job card where pay_rate = "$50/hr" and duration = "4 weeks"
2. **Expected:** Two amber-icon badges appear between the title row and description — one showing "$50/hr", one showing "4 weeks"

### 4. JobCard — old jobs without pay/duration

1. View a job card created before S03 (no pay_rate or duration)
2. **Expected:** No badge row — card renders exactly as before; description appears directly under the title row

### 5. GC default tab on /profile

1. Sign in as a contractor with trade = "General Contractor"
2. Navigate to `/profile`
3. **Expected:** Page loads with Posts tab active and "Post a Job" category pre-selected; CreateJobForm is already expanded/open

### 6. Non-GC default tab on /profile

1. Sign in as a contractor with trade = "Welding" (or any non-GC trade)
2. Navigate to `/profile`
3. **Expected:** Page loads with Profile tab active (default, unchanged behavior)

### 7. "Post a Job" category on /profile for any contractor

1. Go to `/profile` as any approved contractor
2. Click "Posts" tab
3. **Expected:** Category buttons show "Social", "Q&A", and "Post a Job"
4. Click "Post a Job"
5. **Expected:** CreateJobForm renders inline with form expanded

### 8. Post a job from /profile

1. On /profile, Posts tab, "Post a Job" selected
2. Fill in form fields, click "Post Job"
3. **Expected:** "Job posted!" confirmation, form collapses to "+ Post a Job" button; job appears on /jobs

## Edge Cases

### Pay Rate + Duration empty

1. Post a job with only Title, Trade, and Description filled (no pay rate or duration)
2. **Expected:** Job posts successfully; JobCard shows no badge row

### Trade dropdown — "Other"

1. Select "Other" from the Trade dropdown
2. Fill remaining required fields and submit
3. **Expected:** Job posts with trade = "Other"

### State dropdown empty

1. Leave State unselected (value = "—")
2. Submit the form
3. **Expected:** Job posts with location_state = null; location shows only city if city was entered

## Failure Signals

- Form still shows freetext trade input — old CreateJobForm cached; hard refresh or redeploy needed
- Pay/duration badges not showing on a job that has those fields — check DB: `SELECT pay_rate, duration FROM jobs WHERE id = '<id>'`
- GC lands on Profile tab instead of Posts/Jobs — `contractor.trade` exact value mismatch; check DB: `SELECT trade FROM contractors WHERE user_id = '<uid>'`
- "Post a Job" category button missing on /profile — contractor state is null (user not approved); check contractor load

## Requirements Proved By This UAT

- **JOBS-05** — GC visits /profile → Posts tab + Jobs sub-category pre-selected (test case 5)
- **JOBS-06** — Job post form shows all six structured fields with appropriate input types (test case 1)
- **JOBS-07** — JobCard renders pay_rate and duration badges when present; clean fallback for old jobs (test cases 3, 4)

## Not Proven By This UAT

- DB persistence of pay_rate and duration at scale — functional verification only
- Jobs page live behavior with GC auto-open form — JOBS-10 candidate, not in S03 scope

## Notes for Tester

- To test GC default tab: you need a contractor row with `trade = 'General Contractor'`. Check the contractors table in Supabase dashboard or use the admin approve flow.
- Pay Rate and Duration are freetext — enter any string. No validation enforced.
- The "Post a Job" category in /profile is available to ALL approved contractors, not just GCs. Any contractor can post subcontracting work.
