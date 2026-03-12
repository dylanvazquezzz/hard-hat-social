# Hard Hat Social — Project Bible

## What We're Building
A verified contractor directory and social platform called **Hard Hat Social**. The core idea is a high-trust, curated network where only verified, credentialed contractors are allowed in. This is the main differentiator from existing platforms like Angi or Thumbtack — quality over quantity, no spam, no unqualified people.

The platform serves two user types:
- **Contractors** connecting with other sub contractors (subcontracting, referrals, trade communities)
- **Homeowners/Businesses** finding verified contractors for specific trades

The B2B (contractor-to-contractor) side is the primary focus first. Once a trusted contractor network exists, the B2C (homeowner-finding-contractor) layer gets added on top.

---

## Core Philosophy
- **Verified only.** Getting in requires credential review. This is the moat.
- **No bloat.** Do not add features that dilute quality or clutter the experience.
- **One thing done well beats many things done poorly.** Build each layer to a high standard before moving to the next.
- **Tradespeople first.** Design decisions should feel right for a welder or HVAC tech, not a tech worker.

---

## Current State (as of Feb 2026)

### MVP — COMPLETE ✅
All 5 core MVP features are fully functional:
1. ✅ Contractor profiles — trade, location, certifications, years experience, contact info
2. ✅ Search and filter — by trade, state, text search
3. ✅ Contractor application form — multi-step with document upload to Supabase Storage
4. ✅ Admin review queue — approve/reject with email notifications via Resend
5. ✅ Contact info gating — phone/email only visible to approved contractors (API-level enforcement)

### Beyond MVP — Also Built
- ✅ Posts system with categories: `social`, `qa`, `jobs`
- ✅ Explore page — Social / Q&A feed
- ✅ Jobs board — subcontracting opportunity postings
- ✅ User profile dashboard — 3-tab (Profile, Posts, Settings): avatar upload, post composer, username/password change
- ✅ Public profile pages at `/u/[username]` — avatar, posts feed, certifications, contractor info
- ✅ Auth-aware NavBar — shows @username dropdown when signed in
- ✅ Email notifications — approval/rejection emails via Resend
- ✅ 6 database migrations deployed — full schema with RLS

---

## Next Steps (Prioritized)

### 1. Production Readiness (Do First)
Before getting real users, lock down the deployment:
- [ ] **Deploy to Vercel** — set up production project, connect GitHub repo
- [ ] **Set environment variables in Vercel:**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `RESEND_API_KEY`
  - `NEXT_PUBLIC_ADMIN_EMAILS` (comma-separated admin emails)
  - `NEXT_PUBLIC_APP_URL` (production URL)
- [ ] **Create Supabase Storage buckets** (must be done manually in dashboard):
  - `avatars` — public read, authenticated write
  - `post-images` — public read, authenticated write
  - `application-docs` bucket already in migration 006, verify it exists
- [ ] **Verify Resend domain** — add DNS records so approval/rejection emails don't land in spam
- [ ] **Run all 6 migrations** against production Supabase project

### 2. Password Reset Flow (Missing)
No forgot password / reset flow exists yet. Users who forget their password are locked out.
- [ ] Add "Forgot password?" link on `/auth` page
- [ ] Create `/auth/reset` page that calls `supabase.auth.resetPasswordForEmail()`
- [ ] Create `/auth/update-password` page (the redirect target from the email link) that calls `supabase.auth.updateUser({ password })`

### 3. Certifications After Approval (Gap)
Admin approves applications and uploads docs, but certifications in the `certifications` table are never populated automatically. The admin action (`actions.ts`) only creates a `contractors` row — it doesn't parse document_urls into certification records. Options:
- [ ] Admin can manually add certifications via a `/admin/contractors/[id]` management page, OR
- [ ] Extend `approveApplication()` server action to auto-create a basic certification record from the application data

### 4. Homepage Polish
The landing page (`/`) exists but should convert visitors into applicants. Review and tighten:
- [ ] Hero headline and subhead — make the value prop crystal clear
- [ ] Add social proof placeholder (e.g., "Join 50+ verified welding contractors")
- [ ] Ensure CTA buttons are prominent and go to the right pages
- [ ] Mobile layout check — tradespeople are on phones

### 5. Seed Founding Cohort
The founding welders need real profiles. Options:
- [ ] Admin creates profiles directly in Supabase dashboard for the first cohort, OR
- [ ] Use the existing application → approval flow (preferred, creates a paper trail)
- [ ] Once profiles exist, manually add certifications via Supabase dashboard

### 6. SEO / Metadata
- [ ] Add OpenGraph tags to key pages (homepage, `/contractors`, contractor detail pages)
- [ ] Add structured data (JSON-LD) to contractor profile pages for Google rich results
- [ ] Set unique `<title>` and `<meta description>` per page via Next.js `generateMetadata()`

### 7. UX Polish (Lower Priority)
- [ ] Loading skeletons on contractor directory while fetching
- [ ] Empty state on `/contractors` when no results match filters
- [ ] Better mobile nav — hamburger menu or bottom nav bar for small screens
- [ ] Toast/snackbar feedback on form submissions (currently uses inline state)

---

## Future Features (Do NOT build yet)
These come after real users are on the platform:
- **In-platform messaging** — contractor to contractor
- **OpenClaw AI assistant** — helps homeowners find the right trade
- **Contract generation + e-signature** — DocuSign/HelloSign integration
- **Review/rating system** — verified completed jobs only
- **Mobile app** — after web MVP validated
- **Premium tier** — priority search placement, analytics, company accounts

---

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database + Auth:** Supabase (Postgres, RLS, Supabase Auth)
- **Email:** Resend
- **Hosting:** Vercel
- **Language:** TypeScript

Do not introduce additional dependencies without asking.

---

## Actual Project Structure
```
contractors-connect/
├── app/
│   ├── page.tsx                        # Homepage / landing page
│   ├── layout.tsx                      # Root layout with NavBar
│   ├── contractors/
│   │   ├── layout.tsx                  # Auth guard — redirects to /auth if not logged in
│   │   ├── page.tsx                    # Directory with search/filter + jobs feed
│   │   └── [id]/page.tsx              # Individual contractor profile
│   ├── apply/
│   │   └── page.tsx                    # Multi-step application form with doc upload
│   ├── auth/
│   │   └── page.tsx                    # Sign in / Sign up toggle
│   ├── profile/
│   │   └── page.tsx                    # 3-tab dashboard (Profile, Posts, Settings)
│   ├── u/
│   │   └── [username]/page.tsx         # Public profile page at /u/@handle
│   ├── explore/
│   │   └── page.tsx                    # Social + Q&A feed (server component)
│   ├── jobs/
│   │   └── page.tsx                    # Jobs/subcontracting board
│   ├── admin/
│   │   ├── layout.tsx                  # Admin email guard
│   │   ├── page.tsx                    # Application review queue
│   │   └── actions.ts                  # Server actions: approveApplication, rejectApplication
│   └── api/
│       └── contact/[id]/route.ts       # Protected endpoint — returns phone/email to approved contractors
├── components/
│   ├── NavBar.tsx                      # Auth-aware nav with username dropdown
│   ├── ContractorCard.tsx              # Card for directory grid
│   ├── SearchFilters.tsx               # Trade/state/text filter sidebar
│   ├── ProfileHeader.tsx               # Contractor profile header (photo, name, trade, location)
│   ├── CertificationBadge.tsx          # Cert display with verified/expired status
│   ├── PostCard.tsx                    # Social post card (author, category, content, image)
│   └── ContactSection.tsx              # Contact info with auth gating (client component)
├── lib/
│   ├── types.ts                        # Contractor, Certification, Application, Profile, Post
│   ├── supabase.ts                     # Browser-safe Supabase client (use this everywhere)
│   ├── supabase-admin.ts               # Server-only admin client (bypasses RLS)
│   └── email.ts                        # Resend email functions (approval/rejection)
├── supabase/
│   └── migrations/
│       ├── 001_initial.sql             # contractors, certifications, applications + RLS
│       ├── 002_profiles_posts.sql      # profiles, posts tables
│       ├── 003_posts_category.sql      # category column on posts
│       ├── 004_applications_user_id.sql # user_id FK on applications
│       ├── 005_rls_improvements.sql    # RLS fixes + full-text search index
│       └── 006_application_documents.sql # document_urls on applications + storage bucket
└── CLAUDE.md
```

---

## Database Schema

### `contractors`
`id`, `user_id` (FK auth.users), `full_name`, `trade`, `specialties[]`, `location_city`, `location_state`, `years_experience`, `bio`, `phone`, `email`, `website`, `profile_photo_url`, `status` (pending|approved|rejected), `created_at`

### `certifications`
`id`, `contractor_id` (FK), `name`, `issuing_body`, `cert_number`, `expiry_date`, `verified` (bool), `document_url`

### `applications`
Mirrors contractor fields plus: `id`, `submitted_at`, `status`, `document_urls[]`, `user_id` (FK auth.users)

### `profiles`
`id` (FK auth.users, cascade delete), `username` (unique), `avatar_url`, `updated_at`

### `posts`
`id`, `user_id` (FK), `contractor_id` (optional FK), `content`, `image_url`, `link_url`, `category` (social|qa|jobs), `created_at`

---

## Verification Requirements

**Welding (current focus):**
- AWS certification, state contractor license, proof of insurance (general liability), D1.1/D1.5 structural certs

**Other trades (add as platform grows):**
- HVAC: EPA 608, state license, proof of insurance
- Electrical: State electrician license, proof of insurance
- Plumbing: State plumber license, proof of insurance
- General Contractor: State GC license, proof of insurance, bonding

Verification is **manual** — admin reviews documents in the application queue.

---

## Monetization Plan
- **Free tier:** Full access to directory, profile, search, contact info
- **Ads:** Relevant trade ads only (tools, materials, insurance, accounting)
- **Premium tier:** Priority search placement, verified badge tiers, profile analytics, company accounts, contract templates

---

## Key Decisions Made
- Verification is manual — no automated document checking
- Contact info only visible to approved contractors (enforced at API level + RLS)
- No in-platform messaging for MVP
- Start with welding, expand trade by trade
- Founding cohort seeded manually by co-founder
- Admin access controlled by `NEXT_PUBLIC_ADMIN_EMAILS` env var

---

## What Success Looks Like
- 20-50 verified welding contractors have profiles
- Search and filter works cleanly by trade, specialty, location
- A contractor can find and contact a sub within 5 minutes of landing on the site
- Application form works and submissions land in admin queue
- Zero unverified contractors slip through

---

## Commands
```bash
npm run dev        # local development (http://localhost:3000)
npm run build      # production build
npm run lint       # linting
./scripts/deploy.sh "message"           # build → commit → push → triggers Vercel auto-deploy
./scripts/migrate.sh <file.sql>         # apply a migration file to production Supabase
./scripts/migrate.sh "SELECT ..."       # run inline SQL against production Supabase
```

### Migration workflow (fully automated)
1. Write migration SQL in `supabase/migrations/NNN_name.sql`
2. `./scripts/migrate.sh supabase/migrations/NNN_name.sql` — applies to production
3. `./scripts/migrate.sh "SELECT ... FROM pg_indexes WHERE ..."` — verify schema change landed
4. Commit migration file with the slice changes

---

## Notes for Claude Code
- Always use TypeScript, never plain JavaScript
- Use Supabase client from `lib/supabase.ts` — do not create multiple clients
- Admin/server operations use `lib/supabase-admin.ts` (service role, server-only)
- All database access should respect Row Level Security policies
- Keep components small and focused — one job per component
- When in doubt, do less and do it well rather than more and do it poorly
- Ask before adding any new npm package
- The `NEXT_PUBLIC_ADMIN_EMAILS` env var controls who can access `/admin`
- Storage buckets (`avatars`, `post-images`, `application-docs`) must be created manually in Supabase dashboard
