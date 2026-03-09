# Roadmap: Hard Hat Social

## Milestones

- ✅ **v1.1 Polish & Launch** - Phases 1-5 (shipped 2026-03-05)
- 🚧 **v1.2 Rebrand & Growth** - Phases 6-9 (in progress)

## Phases

<details>
<summary>✅ v1.1 Polish & Launch (Phases 1-5) - SHIPPED 2026-03-05</summary>

### Phase 1: Production Hardening
**Goal**: The production deployment is correctly configured so that emails land in inboxes, auth links work, storage uploads succeed, and the service role key cannot leak into client bundles
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Install server-only package and add import guards to lib/supabase-admin.ts and lib/email.ts
- [x] 01-02-PLAN.md — Create migration 007_storage_policies.sql and fix apply/page.tsx upload path
- [x] 01-03-PLAN.md — Create deployment checklist for Resend domain verification and Supabase Auth URL configuration

### Phase 2: SEO and Cert Automation
**Goal**: Contractor profile pages are discoverable by search engines with accurate metadata, approving an application automatically creates a certification record, and pending applicants see a restricted experience
**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md — Add metadataBase, generateMetadata, and JSON-LD to app/layout.tsx, /contractors/[id], and /u/[username]
- [x] 02-02-PLAN.md — Extend contractors layout and add jobs layout with pending-user access guard
- [x] 02-03-PLAN.md — Modify approveApplication() to auto-insert certification records from application document_urls

### Phase 3: UX Polish
**Goal**: The contractor directory feels complete and usable on mobile — data loads with visible feedback, empty filter states are actionable, and navigation is usable at 375px viewport
**Plans**: 2 plans

Plans:
- [x] 03-01-PLAN.md — Loading skeletons and upgraded empty state for /contractors directory
- [x] 03-02-PLAN.md — Hamburger mobile navigation in NavBar.tsx

### Phase 4: Homepage Redesign
**Goal**: The homepage communicates the verified-only value proposition in under 5 seconds, shows honest social proof, and has a single primary CTA above the fold that drives applications
**Plans**: 1 plan

Plans:
- [x] 04-01-PLAN.md — Rewrite app/page.tsx: contractor-first hero, live DB stats, Apply CTA primary, updated How it Works copy

### Phase 5: Founding Cohort Onboarding
**Goal**: The first 20-50 welders are successfully onboarded through the existing application and approval flow with working emails, populated certification records, and visible profiles in the directory
**Plans**: 4 plans

Plans:
- [x] 05-01-PLAN.md — Fix approval email CTA URL bug and add auth redirect + /apply invite banner
- [x] 05-02-PLAN.md — Replace profile onboarding checklist with welcome banner for approved contractors
- [x] 05-03-PLAN.md — Add inline cert editing to admin cert management page
- [x] 05-04-PLAN.md — Write founding cohort operational runbook

</details>

### 🚧 v1.2 Rebrand & Growth (In Progress)

**Milestone Goal:** Rebrand to Hard Hat Social, fix critical bugs blocking the founding cohort, redesign the feed for engagement, and introduce a jobs-completion system to build contractor trust signals.

## Phase Details

### Phase 6: Bug Fixes & Rebrand
**Goal**: Hard Hat Social is live on hardhatsocial.net with all critical bugs fixed so the founding cohort can be onboarded without friction — admin nav works, emails link to the production domain, approved contractors appear in the directory, and the new brand identity is applied throughout the UI
**Depends on**: Phase 5
**Requirements**: BUG-01, BUG-02, BUG-03, BUG-04, BUG-05, BRAND-01, BRAND-02, BRAND-03, BRAND-04, BRAND-05, BRAND-06, BRAND-07
**Success Criteria** (what must be TRUE):
  1. An admin user sees an "Admin" link in the nav dropdown without typing the URL manually
  2. A test approval email sent to a personal Gmail account links to hardhatsocial.net (not localhost) and lands in the inbox, not spam
  3. A newly approved contractor appears in the /contractors directory immediately after admin approval — no manual refresh or cache clearing needed
  4. A contractor profile page shows the certifications submitted during their application
  5. Every page in the app displays "Hard Hat Social" branding with the lighter blue, yellow, and white color tokens
**Plans**: 3 plans

Plans:
- [ ] 06-01-PLAN.md — Bug fixes: admin nav link, revalidatePath coverage, email domain fallbacks, brand text in emails
- [ ] 06-02-PLAN.md — Brand tokens and UI rebrand: tailwind.config.ts colors, NavBar, layout metadata, JSON-LD URL
- [ ] 06-03-PLAN.md — Domain and infrastructure rebrand: GoDaddy DNS, Vercel domain, Supabase Auth URL, Resend domain, project renames

### Phase 7: Feed Redesign
**Goal**: The Explore feed displays posts at full content column width with a right sidebar showing recently verified contractors and suggested connections in the same trade — no new database schema required
**Depends on**: Phase 6
**Requirements**: FEED-01, FEED-02
**Success Criteria** (what must be TRUE):
  1. Post cards on the Explore page fill the full content column with no excessive side margins
  2. A right sidebar shows "Recently Verified" (up to 8 contractors, ordered by approval date) and "Suggested People" (up to 8 contractors in the viewer's trade) without a client-side data fetch
  3. The Explore page loads the feed and sidebar in a single server render — no hydration flash or layout shift when the sidebar appears
**Plans**: 1 plan

Plans:
- [ ] 07-01-PLAN.md — Two-column explore layout and FeedSidebar server component with Recently Verified and Suggested People widgets

### Phase 8: Jobs Schema
**Goal**: The `jobs` table exists in Supabase with correct RLS policies, a state-transition trigger preventing invalid status progressions, and TypeScript interfaces in lib/types.ts — providing the database foundation that Phase 9 builds on
**Depends on**: Phase 6
**Requirements**: (Infrastructure prerequisite — enables JOBS-01 through JOBS-04 in Phase 9)
**Success Criteria** (what must be TRUE):
  1. A Supabase migration creates the `jobs` table with a text + CHECK status constraint (open, hired, completed), a BEFORE UPDATE trigger that rejects invalid transitions (hired → open, completed → any), and RLS policies (public SELECT for open jobs, GC-only INSERT and status UPDATE)
  2. The `Job` TypeScript interface is defined in lib/types.ts with all fields and status union type — no TypeScript errors on import
  3. Running `npm run build` after the migration types are added completes without errors
**Plans**: 1 plan

Plans:
- [ ] 08-01-PLAN.md — Write and apply jobs table migration with trigger, RLS policies, and TypeScript types

### Phase 9: Jobs UI
**Goal**: A GC can post a job, mark a contractor as hired, and mark the job complete — and completed jobs appear as a verified portfolio section on the hired contractor's profile page
**Depends on**: Phase 8
**Requirements**: JOBS-01, JOBS-02, JOBS-03, JOBS-04
**Success Criteria** (what must be TRUE):
  1. A logged-in approved contractor can create a job posting on the Jobs board and see it appear immediately with "Open" status
  2. The GC who posted a job can select an approved contractor from the directory and mark them as hired — the job card updates to "Hired" status and shows the hired contractor's name
  3. The GC can mark a hired job as "Completed" — the job card updates to "Completed" status
  4. A completed job appears as a verified portfolio entry on the hired contractor's profile page, showing job title, GC name, and completion date
**Plans**: TBD

Plans:
- [ ] 09-01: Jobs board page using jobs table — JobCard component, createJob server action, job listing with status pills
- [ ] 09-02: Hired flow — SubSelectorModal, markHired server action, hired status display
- [ ] 09-03: Completion flow and portfolio — markCompleted server action, CompletedJobsSection on contractor profiles

## Progress

**Execution Order:**
Phases execute in numeric order: 6 → 7 → 8 → 9
(Phase 8 can start in parallel with Phase 7 since they share only a Phase 6 dependency)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Production Hardening | v1.1 | 3/3 | Complete | 2026-03-03 |
| 2. SEO and Cert Automation | v1.1 | 3/3 | Complete | 2026-03-04 |
| 3. UX Polish | v1.1 | 2/2 | Complete | 2026-03-04 |
| 4. Homepage Redesign | v1.1 | 1/1 | Complete | 2026-03-05 |
| 5. Founding Cohort Onboarding | v1.1 | 4/4 | Complete | 2026-03-05 |
| 6. Bug Fixes & Rebrand | 3/3 | Complete   | 2026-03-06 | - |
| 7. Feed Redesign | 1/1 | Complete   | 2026-03-08 | - |
| 8. Jobs Schema | 1/1 | Complete   | 2026-03-09 | - |
| 9. Jobs UI | v1.2 | 0/3 | Not started | - |
