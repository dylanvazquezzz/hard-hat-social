# S03: Job Posting UX Overhaul

**Slice goal:** GCs land directly on the job posting form from the nav. The form has structured fields for pay, location, and duration. JobCard renders those fields clearly.

**Requirements:** JOBS-05, JOBS-06, JOBS-07

**Depends on:** S01

## Tasks

- [ ] **T01: Add pay_rate and duration columns to jobs table** — Migration 010: add `pay_rate text` and `duration text` to the jobs table. Apply via Supabase Management API. Update `Job` type in lib/types.ts.

- [ ] **T02: Overhaul CreateJobForm with structured fields** — Replace or augment the freeform description with dedicated fields: Title, Trade (dropdown), Pay Rate (text, e.g. "$45/hr" or "Negotiable"), Location City, Location State, Duration/Timeline (text, e.g. "2 weeks" or "Ongoing"), Description. Update createJob server action to accept new fields.

- [ ] **T03: Update JobCard to render structured fields** — Show pay rate, location, and duration as labeled badges or metadata rows below the job title. Keep the card scannable — not a text wall.

- [ ] **T04: Pre-select Jobs tab on /profile for GC users** — When the logged-in user is an approved GC, /profile should default to the Posts tab with the Jobs sub-category active. Detect GC status server-side and pass as a prop to the tab component.

## Completion Criteria

- [ ] jobs table has pay_rate and duration columns in production
- [ ] Job post form shows Title, Trade, Pay Rate, Location, Duration, Description fields
- [ ] JobCard renders pay, location, duration visibly
- [ ] GC visiting /profile sees Jobs tab pre-selected
- [ ] `npm run build` passes
