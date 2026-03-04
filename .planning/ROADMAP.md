# Roadmap: Contractors Connect — v1.1 Polish & Launch

## Overview

Contractors Connect has a working MVP. This milestone converts that foundation into a production-ready product that can receive and onboard the founding cohort of verified welders. The work follows a strict dependency order: lock down infrastructure first (DNS propagation is a real-world 48-hour constraint), then add SEO and cert automation, then polish the directory UX, then redesign the homepage, then onboard the first contractors. Each phase delivers a coherent, verifiable capability before the next begins.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Production Hardening** - Lock down env vars, DNS, migrations, storage, and server-only guards before any user data is created
- [x] **Phase 2: SEO and Cert Automation** - Add metadata and JSON-LD to existing pages; auto-create cert records on approval (completed 2026-03-04)
- [ ] **Phase 3: UX Polish** - Loading skeletons, empty states, and mobile nav so the directory feels complete before the homepage sends visitors there
- [ ] **Phase 4: Homepage Redesign** - Clear value prop, honest social proof, and a single dominant CTA that converts visiting tradespeople into applicants
- [ ] **Phase 5: Founding Cohort Onboarding** - Run the first 20-50 welders through the existing application and approval flow end-to-end

## Phase Details

### Phase 1: Production Hardening
**Goal**: The production deployment is correctly configured so that emails land in inboxes, auth links work, storage uploads succeed, and the service role key cannot leak into client bundles
**Depends on**: Nothing (first phase)
**Requirements**: PROD-01, PROD-02, PROD-03, PROD-04
**Success Criteria** (what must be TRUE):
  1. A test approval email sent to a personal Gmail account lands in the inbox, not spam
  2. Clicking the link in a password reset email on a real device opens the correct update-password page (not localhost)
  3. An authenticated user can upload a file to `avatars` and `post-images` buckets; the `application-docs` bucket enforces that upload paths are restricted to the applicant's own folder
  4. Running `npm run build` with `server-only` added to `lib/supabase-admin.ts` and `lib/email.ts` fails with a build error if either file is imported in a client component
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Install server-only package and add import guards to lib/supabase-admin.ts and lib/email.ts (PROD-04)
- [x] 01-02-PLAN.md — Create migration 007_storage_policies.sql and fix apply/page.tsx upload path (PROD-03)
- [x] 01-03-PLAN.md — Create deployment checklist for Resend domain verification and Supabase Auth URL configuration (PROD-01, PROD-02)

### Phase 2: SEO and Cert Automation
**Goal**: Contractor profile pages are discoverable by search engines with accurate metadata, approving an application automatically creates a certification record, and pending applicants see a restricted experience instead of full access
**Depends on**: Phase 1
**Requirements**: AUTH-01, SEO-01, SEO-02, SEO-03, SEO-04, CERT-01
**Success Criteria** (what must be TRUE):
  1. A logged-in user with a pending application can view Social and Q&A explore pages but sees a "pending review" message when attempting to access Jobs, Profile, or the contractor directory
  2. Pasting a contractor profile URL (`/contractors/[id]`) into a social media link preview tool shows the contractor's name, trade, location, and a valid image
  3. Pasting a public profile URL (`/u/[username]`) into a social media link preview tool shows the user's name and a valid image
  4. Viewing the page source of `/contractors/[id]` shows a valid JSON-LD `<script>` block with `LocalBusiness` or `Person` schema type
  5. After an admin approves an application, the contractor's profile page shows at least one certification entry without the admin manually adding it
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md — Add metadataBase, generateMetadata, and JSON-LD to app/layout.tsx, /contractors/[id], and /u/[username] (SEO-01, SEO-02, SEO-03, SEO-04)
- [ ] 02-02-PLAN.md — Extend contractors layout and add jobs layout with pending-user access guard; add pending check to profile page (AUTH-01)
- [ ] 02-03-PLAN.md — Modify approveApplication() to auto-insert certification records from application document_urls (CERT-01)

### Phase 3: UX Polish
**Goal**: The contractor directory feels complete and usable on mobile — data loads with visible feedback, empty filter states are actionable, and navigation is usable at 375px viewport
**Depends on**: Phase 2
**Requirements**: UX-01, UX-02, UX-03
**Success Criteria** (what must be TRUE):
  1. Loading the `/contractors` directory on a throttled connection shows card-shaped skeleton placeholders in the grid instead of a blank screen or spinner
  2. Applying filters that match no contractors shows a clear message and a "reset filters" button that returns the directory to its unfiltered state
  3. A user on a 375px-wide screen can open and use the navigation menu by tapping elements that are at least 44px in height
**Plans**: TBD

### Phase 4: Homepage Redesign
**Goal**: The homepage communicates the verified-only value proposition in under 5 seconds, shows honest social proof, and has a single primary CTA above the fold that drives applications
**Depends on**: Phase 3
**Requirements**: HOME-01, HOME-02, HOME-03
**Success Criteria** (what must be TRUE):
  1. A first-time visitor landing on the homepage can identify what Contractors Connect is and what makes it different from Angi or Thumbtack without scrolling
  2. The homepage displays a real, accurate count of at least one trust indicator (applications reviewed, trades represented, or contractors approved) — no fabricated numbers or placeholder profiles using the Verified badge
  3. A user on a 375px-wide phone can tap the primary CTA button without zooming and is taken to the correct destination page
**Plans**: TBD

### Phase 5: Founding Cohort Onboarding
**Goal**: The first 20-50 welders are successfully onboarded through the existing application and approval flow with working emails, populated certification records, and visible profiles in the directory
**Depends on**: Phase 4
**Requirements**: (Operational — no new v1 requirements; validates phases 1-4 under real conditions)
**Success Criteria** (what must be TRUE):
  1. A founding cohort welder completes the application form, receives an approval email in their inbox (not spam), signs in, and sees their profile in the `/contractors` directory — all within one session
  2. Each approved contractor profile shows at least one certification entry (auto-created from the application or manually added via admin cert management)
  3. An approved contractor can search the directory by trade and find at least one other approved contractor's contact info (phone or email) displayed on the profile page
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Production Hardening | 3/3 | Complete | 2026-03-03 |
| 2. SEO and Cert Automation | 3/3 | Complete   | 2026-03-04 |
| 3. UX Polish | 0/TBD | Not started | - |
| 4. Homepage Redesign | 0/TBD | Not started | - |
| 5. Founding Cohort Onboarding | 0/TBD | Not started | - |
