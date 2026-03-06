# Requirements: Hard Hat Social — v1.2 Rebrand & Growth

**Defined:** 2026-03-05
**Core Value:** A contractor can find and contact a verified sub in their trade within 5 minutes — zero unverified people, no spam, no guesswork.

## v1.2 Requirements

Requirements for this milestone: bug fixes, full rebrand to Hard Hat Social, feed redesign, and jobs lifecycle.

### Bug Fixes

- [x] **BUG-01**: Admin users see an "Admin" link in the nav dropdown without typing the URL manually
- [x] **BUG-02**: All auth emails (approval, rejection, verification, password reset) link to the production domain, not localhost
- [x] **BUG-03**: A newly approved contractor appears in the `/contractors` directory immediately after admin approves them
- [x] **BUG-04**: The homepage approved contractor count reflects the actual current count from the database
- [x] **BUG-05**: Certifications submitted during the application are visible on the contractor's profile page after approval

### Rebrand

- [x] **BRAND-01**: Product name is "Hard Hat Social" throughout the UI — nav, page titles, metadata, emails
- [x] **BRAND-02**: Color scheme uses lighter blue, yellow, and white brand tokens defined in `tailwind.config.ts`
- [x] **BRAND-03**: GoDaddy DNS for hardhatsocial.net is configured (A record + CNAME) to point to Vercel
- [x] **BRAND-04**: Vercel project connected to hardhatsocial.net as the production domain; `NEXT_PUBLIC_APP_URL` updated and redeployed
- [x] **BRAND-05**: Supabase Auth Site URL and redirect allowlist updated to hardhatsocial.net
- [x] **BRAND-06**: Resend sender domain updated to hardhatsocial.net with DNS verified (SPF + DKIM)
- [x] **BRAND-07**: GitHub repo renamed to `hard-hat-social`; Supabase project and Vercel project renamed to match

### Feed Redesign

- [ ] **FEED-01**: Explore page posts fill the full content column width — no excessive side margins
- [ ] **FEED-02**: Explore page has a right sidebar with "Recently Verified" and "Suggested People (same trade)" widgets

### Jobs Lifecycle

- [ ] **JOBS-01**: A GC can create a job posting on the Jobs board
- [ ] **JOBS-02**: A GC can mark a job as "hired" by selecting which approved contractor was hired
- [ ] **JOBS-03**: A GC can mark a hired job as "completed"
- [ ] **JOBS-04**: Completed jobs appear as a verified portfolio section on the hired contractor's profile

## v1.3 Requirements

Deferred — ships after the v1.2 jobs foundation is live and validated.

### Ratings

- **RATE-01**: Both GC and sub receive a rating prompt after a job is marked completed
- **RATE-02**: Ratings use blind submission — neither party sees the other's rating until both submit or 14 days expire
- **RATE-03**: Ratings (5-star + optional 280-char text) and aggregate score are visible on contractor profiles

### Feed

- **FEED-03**: User's posts are visible on their public profile page (/u/[username])

## Out of Scope

| Feature | Reason |
|---------|--------|
| Self-reported past jobs | Undermines the verified portfolio moat — any fabricated entry destroys credibility |
| AI-powered sidebar recommendations | Insufficient network signal at current scale; rule-based suggestions (same trade, same state) are more reliable |
| Admin dispute resolution for jobs | Keep it human and manual; build after patterns emerge |
| In-platform messaging | Post-network feature |
| Mobile app | Web-first until validated |
| Premium tier | After network has active users |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| BUG-01 | Phase 6 | Complete |
| BUG-02 | Phase 6 | Complete |
| BUG-03 | Phase 6 | Complete |
| BUG-04 | Phase 6 | Complete |
| BUG-05 | Phase 6 | Complete |
| BRAND-01 | Phase 6 | Complete |
| BRAND-02 | Phase 6 | Complete |
| BRAND-03 | Phase 6 | Complete |
| BRAND-04 | Phase 6 | Complete |
| BRAND-05 | Phase 6 | Complete |
| BRAND-06 | Phase 6 | Complete |
| BRAND-07 | Phase 6 | Complete |
| FEED-01 | Phase 7 | Pending |
| FEED-02 | Phase 7 | Pending |
| JOBS-01 | Phase 9 | Pending |
| JOBS-02 | Phase 9 | Pending |
| JOBS-03 | Phase 9 | Pending |
| JOBS-04 | Phase 9 | Pending |

**Coverage:**
- v1.2 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

**Phase 8 note:** Phase 8 (Jobs Schema) is an infrastructure prerequisite with no user-facing requirements of its own. It is the technical foundation that makes JOBS-01 through JOBS-04 (Phase 9) possible. Its success criteria are observable at the database and build level.

---
*Requirements defined: 2026-03-05*
*Last updated: 2026-03-05 after roadmap creation*
