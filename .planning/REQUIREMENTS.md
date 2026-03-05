# Requirements: Hard Hat Social — v1.2 Rebrand & Growth

**Defined:** 2026-03-05
**Core Value:** A contractor can find and contact a verified sub in their trade within 5 minutes — zero unverified people, no spam, no guesswork.

## v1.2 Requirements

Requirements for this milestone: bug fixes, full rebrand to Hard Hat Social, feed redesign, and jobs lifecycle.

### Bug Fixes

- [ ] **BUG-01**: Admin users see an "Admin" link in the nav dropdown without typing the URL manually
- [ ] **BUG-02**: All auth emails (approval, rejection, verification, password reset) link to the production domain, not localhost
- [ ] **BUG-03**: A newly approved contractor appears in the `/contractors` directory immediately after admin approves them
- [ ] **BUG-04**: The homepage approved contractor count reflects the actual current count from the database
- [ ] **BUG-05**: Certifications submitted during the application are visible on the contractor's profile page after approval

### Rebrand

- [ ] **BRAND-01**: Product name is "Hard Hat Social" throughout the UI — nav, page titles, metadata, emails
- [ ] **BRAND-02**: Color scheme uses lighter blue, yellow, and white brand tokens defined in `tailwind.config.ts`
- [ ] **BRAND-03**: GoDaddy DNS for hardhatsocial.net is configured (A record + CNAME) to point to Vercel
- [ ] **BRAND-04**: Vercel project connected to hardhatsocial.net as the production domain; `NEXT_PUBLIC_APP_URL` updated and redeployed
- [ ] **BRAND-05**: Supabase Auth Site URL and redirect allowlist updated to hardhatsocial.net
- [ ] **BRAND-06**: Resend sender domain updated to hardhatsocial.net with DNS verified (SPF + DKIM)
- [ ] **BRAND-07**: GitHub repo renamed to `hard-hat-social`; Supabase project and Vercel project renamed to match

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
| BUG-01 | — | Pending |
| BUG-02 | — | Pending |
| BUG-03 | — | Pending |
| BUG-04 | — | Pending |
| BUG-05 | — | Pending |
| BRAND-01 | — | Pending |
| BRAND-02 | — | Pending |
| BRAND-03 | — | Pending |
| BRAND-04 | — | Pending |
| BRAND-05 | — | Pending |
| BRAND-06 | — | Pending |
| BRAND-07 | — | Pending |
| FEED-01 | — | Pending |
| FEED-02 | — | Pending |
| JOBS-01 | — | Pending |
| JOBS-02 | — | Pending |
| JOBS-03 | — | Pending |
| JOBS-04 | — | Pending |

**Coverage:**
- v1.2 requirements: 18 total
- Mapped to phases: 0 (roadmap pending)
- Unmapped: 18

---
*Requirements defined: 2026-03-05*
*Last updated: 2026-03-05 after initial definition*
