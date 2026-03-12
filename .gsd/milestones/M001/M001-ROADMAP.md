# v1.3 UX & Trade Expansion

**Vision:** Every feature a contractor touches feels intentional — finding subs is faster, posting jobs is structured, and the homepage makes an immediate impression.

## Success Criteria

- A contractor can filter the directory by insurance type or certification name and get accurate results
- A GC can post a job with structured pay/location/duration fields in under 60 seconds from the Jobs page
- The "Mark Hired" modal shows recently hired contractors first — repeat hires take 2 clicks
- Drywall is a fully supported trade across apply, directory, and homepage
- The homepage hero shows real trade photography behind the headline with Browse by Trade clearly separated below

## Slices

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
- [ ] **S01: Auto-Deploy + Bug Fix** `risk:low`
=======
- [x] **S01: Auto-Deploy + Bug Fix** `risk:low`
>>>>>>> gsd/M001/S01
=======
- [x] **S01: Auto-Deploy + Bug Fix** `risk:low`
>>>>>>> gsd/M001/S01
=======
- [x] **S01: Auto-Deploy + Bug Fix** `risk:low`
>>>>>>> gsd/M001/S01
  > After this: every future push auto-deploys to hardhatsocial.net; 400 error on applications query resolved

- [ ] **S02: Directory Filter Expansion** `risk:medium`
  > After this: contractors can be filtered by insurance type and certification name in addition to trade and location

- [ ] **S03: Job Posting UX Overhaul** `risk:medium`
  > After this: GCs land on the job posting form directly; structured fields (pay, location, duration) appear on job cards

- [ ] **S04: GC Recent Contacts** `risk:low`
  > After this: the Mark Hired modal shows up to 5 recently hired contractors at the top for fast repeat selection

- [ ] **S05: Drywall Trade** `risk:low`
  > After this: Drywall is selectable on apply form, filterable in directory, and visible on homepage

- [ ] **S06: Homepage Hero Redesign** `risk:medium`
  > After this: hero has full-bleed B&W trade photo background; Browse by Trade is a clearly separated section below

## Boundary Map

### S01 owns
- `.gsd/` structure setup
- BUG-06 fix in app code
- Vercel/GitHub deploy wiring documentation

### S02 owns
- `components/SearchFilters.tsx` — insurance + cert filter UI
- `app/contractors/page.tsx` — updated query with filter params
- Any new DB columns or indexes needed for filter performance

### S03 owns
- `app/profile/page.tsx` — default tab logic for GC users
- `components/CreateJobForm.tsx` — structured fields
- `components/JobCard.tsx` — render structured fields
- New columns on `jobs` table if needed (pay_rate, duration)

### S04 owns
- `components/SubSelectorModal.tsx` — Recent Contacts section
- Query: recent hires by this GC from jobs table

### S05 owns
- `app/apply/page.tsx` — add Drywall to trade options
- `app/page.tsx` — add Drywall to Browse by Trade
- `components/SearchFilters.tsx` — add Drywall to trade filter
- `lib/types.ts` — add Drywall to trade union if applicable

### S06 owns
- `app/page.tsx` — hero section redesign with photo background
- `public/` — trade photo assets (B&W, sourced from Unsplash or similar free license)
