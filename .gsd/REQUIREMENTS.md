# Requirements: Hard Hat Social — v1.3 UX & Trade Expansion

## Requirement Counts

- Total: 18
- Complete: 14
- Pending: 4

## Requirements

### Auto-Deploy
- [x] **DEPLOY-01**: After any phase is approved, GSD automatically commits, pushes to GitHub, and Vercel deploys to hardhatsocial.net

### Bug Fix
- [x] **BUG-06**: Fix 400 Bad Request on `GET /rest/v1/applications?select=status&user_id=eq.{id}&status=eq.pending`

### Directory Filters
- [x] **FILTER-01**: /contractors filter panel includes insurance and certification filters
- [x] **FILTER-02**: Filters compose correctly — trade + cert returns only contractors matching both
- [x] **FILTER-03**: Filter UI works on mobile at 375px — no overflow

### Job Posting UX
- [x] **JOBS-05**: Navigating to /profile as a GC defaults to Posts tab with Jobs sub-category pre-selected
- [x] **JOBS-06**: Job post composer has structured fields: Title, Trade, Pay Rate, Location, Duration, Description
- [x] **JOBS-07**: JobCard renders structured fields (pay, location, duration) clearly

### GC Recent Contacts
- [x] **JOBS-08**: "Mark Hired" modal shows Recent Contacts (up to 5 previously hired) at the top
- [x] **JOBS-09**: Full contractor search remains available below Recent Contacts

### Drywall Trade
- [x] **TRADE-01**: "Drywall" selectable on application form
- [x] **TRADE-02**: "Drywall" appears in /contractors trade filter
- [x] **TRADE-03**: "Drywall" appears in Browse by Trade on homepage
- [x] **TRADE-04**: Drywall verification requirements documented (state license + GL insurance)

### Homepage Hero
- [ ] **HOME-01**: Hero has full-bleed B&W trade photo background (HVAC, welding, plumbing, drywall, electricians)
- [ ] **HOME-02**: "Browse by Trade" is a separate section below hero divided by a horizontal rule
- [ ] **HOME-03**: Hero text readable over photo background (dark overlay or text shadow)
- [ ] **HOME-04**: Hero responsive — photo scales correctly on mobile
