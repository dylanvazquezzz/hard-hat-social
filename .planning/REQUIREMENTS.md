# Requirements: Contractors Connect — v1.1 Polish & Launch

**Defined:** 2026-03-01
**Core Value:** A contractor can find and contact a verified sub in their trade within 5 minutes — zero unverified people, no spam, no guesswork.

## v1 Requirements

Requirements for this milestone (polish, production hardening, founding cohort readiness).

### Production Infrastructure

- [x] **PROD-01**: Resend domain is verified (SPF + DKIM DNS records set) so approval/rejection emails land in inbox, not spam
- [x] **PROD-02**: Supabase Auth Site URL is updated to production URL so password reset and approval email links work correctly
- [x] **PROD-03**: Supabase storage bucket write policies are verified — authenticated users can upload to `avatars` and `post-images`; `application-docs` upload is restricted to the applicant's own folder
- [x] **PROD-04**: `lib/supabase-admin.ts` is protected with `server-only` to prevent service role key from leaking into client bundles

### Access Control

- [x] **AUTH-01**: Logged-in users with a pending application see a restricted experience — Social and Q&A explore are accessible, but Jobs feed, Profile dashboard, and contractor directory are locked with a "pending review" message until their application is approved or rejected

### Certifications

- [x] **CERT-01**: `approveApplication()` in `admin/actions.ts` automatically creates a basic certification record in the `certifications` table from the application data when a contractor is approved

### Homepage

- [ ] **HOME-01**: Homepage hero prominently frames "verified only" value prop with a single clear CTA (apply or browse)
- [ ] **HOME-02**: Homepage displays social proof via real stats/numbers (e.g. trades represented, applications reviewed) — no fake placeholder profiles
- [ ] **HOME-03**: Homepage layout is mobile-responsive with tap-friendly buttons for tradespeople viewing on phones

### SEO

- [x] **SEO-01**: `metadataBase` is set in root `app/layout.tsx` so all relative OpenGraph image URLs resolve correctly
- [x] **SEO-02**: `/contractors/[id]` has `generateMetadata` with unique title, description, and OpenGraph tags per contractor
- [x] **SEO-03**: `/u/[username]` has `generateMetadata` with unique title, description, and OpenGraph tags per user
- [x] **SEO-04**: `/contractors/[id]` includes JSON-LD structured data (LocalBusiness or Person schema) for Google rich results

### UX Polish

- [ ] **UX-01**: `/contractors` directory shows card-shaped loading skeletons while data is fetching (instead of blank or spinner)
- [ ] **UX-02**: `/contractors` shows a clear empty state with a "reset filters" action when no contractors match the active search/filters
- [ ] **UX-03**: Mobile navigation is usable at 375px viewport — larger tap targets, collapsed menu accessible without tiny icons

## v2 Requirements

Deferred — worthwhile but not blocking the founding cohort.

### Analytics & Visibility

- **ANLX-01**: Contractor profile view counts visible to the contractor (who viewed my profile)
- **ANLX-02**: Search impression tracking (how often a contractor appeared in results)

### Notifications

- **NOTF-01**: Contractor receives email when someone views their contact info
- **NOTF-02**: Admin receives daily digest of new applications

### Advanced Search

- **SRCH-01**: Filter by certification type (not just trade)
- **SRCH-02**: Filter by years of experience range
- **SRCH-03**: Search by specialty tags (not just top-level trade)

## Out of Scope

| Feature | Reason |
|---------|--------|
| In-platform messaging | Post-network; contractors exchange contact info off-platform for now |
| AI assistant (OpenClaw) | After real users exist and patterns emerge |
| Contract generation + e-sign | Future milestone |
| Review/rating system | Needs verified completed jobs — future |
| Mobile app | Web-first until validated |
| Premium tier | After network has active users |
| Fake/stock-photo placeholder profiles | Tradespeople know each other — destroys trust |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Phase Name | Status |
|-------------|-------|------------|--------|
| PROD-01 | Phase 1 | Production Hardening | Pending |
| PROD-02 | Phase 1 | Production Hardening | Pending |
| PROD-03 | Phase 1 | Production Hardening | Pending |
| PROD-04 | Phase 1 | Production Hardening | Pending |
| AUTH-01 | Phase 2 | SEO and Cert Automation | Pending |
| CERT-01 | Phase 2 | SEO and Cert Automation | Pending |
| SEO-01 | Phase 2 | SEO and Cert Automation | Pending |
| SEO-02 | Phase 2 | SEO and Cert Automation | Pending |
| SEO-03 | Phase 2 | SEO and Cert Automation | Pending |
| SEO-04 | Phase 2 | SEO and Cert Automation | Pending |
| UX-01 | Phase 3 | UX Polish | Pending |
| UX-02 | Phase 3 | UX Polish | Pending |
| UX-03 | Phase 3 | UX Polish | Pending |
| HOME-01 | Phase 4 | Homepage Redesign | Pending |
| HOME-02 | Phase 4 | Homepage Redesign | Pending |
| HOME-03 | Phase 4 | Homepage Redesign | Pending |

**Coverage:**
- v1 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0

---
*Requirements defined: 2026-03-01*
*Last updated: 2026-03-01 after roadmap creation — phase assignments finalized*
