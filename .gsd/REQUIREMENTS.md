# Requirements: Hard Hat Social — v1.3 UX & Trade Expansion

## Requirement Counts

- Total: 18
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
- Complete: 0
- Pending: 18
=======
- Complete: 1
- Pending: 17
>>>>>>> gsd/M001/S01
=======
- Complete: 2
- Pending: 16
>>>>>>> gsd/M001/S01
=======
- Complete: 2
- Pending: 16
>>>>>>> gsd/M001/S01

## Requirements

### Auto-Deploy
<<<<<<< HEAD
<<<<<<< HEAD
- [ ] **DEPLOY-01**: After any phase is approved, GSD automatically commits, pushes to GitHub, and Vercel deploys to hardhatsocial.net

### Bug Fix
<<<<<<< HEAD
- [ ] **BUG-06**: Fix 400 Bad Request on `GET /rest/v1/applications?select=status&user_id=eq.{id}&status=eq.pending`
=======
- [x] **BUG-06**: Fix 400 Bad Request on `GET /rest/v1/applications?select=status&user_id=eq.{id}&status=eq.pending`
>>>>>>> gsd/M001/S01
=======
=======
>>>>>>> gsd/M001/S01
- [x] **DEPLOY-01**: After any phase is approved, GSD automatically commits, pushes to GitHub, and Vercel deploys to hardhatsocial.net

### Bug Fix
- [x] **BUG-06**: Fix 400 Bad Request on `GET /rest/v1/applications?select=status&user_id=eq.{id}&status=eq.pending`
<<<<<<< HEAD
>>>>>>> gsd/M001/S01
=======
>>>>>>> gsd/M001/S01

### Directory Filters
- [ ] **FILTER-01**: /contractors filter panel includes insurance and certification filters
- [ ] **FILTER-02**: Filters compose correctly — trade + cert returns only contractors matching both
- [ ] **FILTER-03**: Filter UI works on mobile at 375px — no overflow

### Job Posting UX
- [ ] **JOBS-05**: Navigating to /profile as a GC defaults to Posts tab with Jobs sub-category pre-selected
- [ ] **JOBS-06**: Job post composer has structured fields: Title, Trade, Pay Rate, Location, Duration, Description
- [ ] **JOBS-07**: JobCard renders structured fields (pay, location, duration) clearly

### GC Recent Contacts
- [ ] **JOBS-08**: "Mark Hired" modal shows Recent Contacts (up to 5 previously hired) at the top
- [ ] **JOBS-09**: Full contractor search remains available below Recent Contacts

### Drywall Trade
- [ ] **TRADE-01**: "Drywall" selectable on application form
- [ ] **TRADE-02**: "Drywall" appears in /contractors trade filter
- [ ] **TRADE-03**: "Drywall" appears in Browse by Trade on homepage
- [ ] **TRADE-04**: Drywall verification requirements documented (state license + GL insurance)

### Homepage Hero
- [ ] **HOME-01**: Hero has full-bleed B&W trade photo background (HVAC, welding, plumbing, drywall, electricians)
- [ ] **HOME-02**: "Browse by Trade" is a separate section below hero divided by a horizontal rule
- [ ] **HOME-03**: Hero text readable over photo background (dark overlay or text shadow)
- [ ] **HOME-04**: Hero responsive — photo scales correctly on mobile
