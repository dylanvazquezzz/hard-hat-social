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

## Current State (as of April 2026)

### MVP — COMPLETE ✅
All 5 core MVP features are fully functional:
1. ✅ Contractor profiles — trade, location, certifications, years experience, contact info
2. ✅ Search and filter — by trade, state, text search, insurance, certification
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

### SEO — COMPLETE ✅ (April 2026)
Full SEO optimization pass. Estimated score moved from ~52 to ~90+:
- ✅ Next.js Image components with alt text on homepage hero (was CSS backgrounds — unindexable)
- ✅ FAQ section + FAQPage JSON-LD on homepage — eligible for Google rich results
- ✅ Organization + WebSite JSON-LD on homepage (enables sitelinks search box)
- ✅ BreadcrumbList JSON-LD on all `/contractors/[id]` profile pages
- ✅ OG + Twitter Card tags on root layout and all key pages
- ✅ Unique metadata (title + description) on every public page
- ✅ Title template in root layout: `%s | Hard Hat Social`
- ✅ `/about`, `/privacy`, `/terms` pages with real content
- ✅ `Footer` component on every page linking to trust/legal pages
- ✅ 6 trade landing pages: `/welding-contractors`, `/hvac-contractors`, `/electrical-contractors`, `/plumbing-contractors`, `/general-contractors`, `/drywall-contractors`
- ✅ `app/robots.ts` — blocks admin/api/profile/auth from crawlers
- ✅ `app/sitemap.ts` — static routes + all approved contractor profiles (dynamic)
- ✅ Guide page at `/guides/find-welding-subcontractor` (1200+ words, FAQPage + Article + Breadcrumb schema)
- ✅ External authority links to AWS, EPA 608, NCCER on apply page
- ✅ Intro copy on `/contractors` directory page (shown with no active filters)
- ✅ Google Search Console verified + sitemap submitted
- ✅ Google Rich Results Test — FAQPage valid, no errors

---

## Next Steps (Prioritized)

### 1. Seed Founding Cohort (Most Important Now)
Real users unlock rankings, social proof, and word of mouth:
- [ ] Use the application → approval flow to onboard the first welders personally known to the co-founder
- [ ] Manually add certifications via Supabase dashboard after approval
- [ ] Replace the 3 seeded testimonials on homepage with real quotes from actual contractors

### 2. More Guide Pages (SEO momentum)
Each guide targets real B2B search queries. Same format as `/guides/find-welding-subcontractor`:
- [ ] `/guides/find-hvac-subcontractor`
- [ ] `/guides/find-electrical-subcontractor`
- [ ] `/guides/find-plumbing-subcontractor`

### 3. Password Reset Flow (Missing)
Users who forget their password are locked out:
- [ ] `/auth/reset` — calls `supabase.auth.resetPasswordForEmail()`
- [ ] `/auth/update-password` — redirect target from email link

### 4. Certifications After Approval (Gap)
Admin approves applications but `certifications` table rows are never auto-created:
- [ ] Extend `approveApplication()` to create a basic certification record, OR
- [ ] Admin manually adds certs via `/admin/contractors/[id]` page

### 5. Update Contact Email
- [ ] Replace `hello@hardhatsocial.net` placeholder in `/about`, `/privacy`, `/terms` with a real inbox

### 6. Legal Review
- [ ] Privacy Policy and Terms should be reviewed by a lawyer before significant user volume

### 7. UX Polish (Lower Priority)
- [ ] Loading skeletons on contractor directory
- [ ] Better mobile nav
- [ ] Toast/snackbar feedback on form submissions

### 8. SEO ✅ COMPLETE (April 2026)
- [x] OG + Twitter tags, unique metadata on every page
- [x] FAQPage + Organization + WebSite + BreadcrumbList JSON-LD
- [x] 6 trade landing pages, robots.ts, sitemap.ts
- [x] /about, /privacy, /terms + Footer
- [x] Welding guide at /guides/find-welding-subcontractor
- [x] Google Search Console verified + sitemap submitted
- [x] Rich Results Test passing — FAQPage eligible

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
hardhat/
├── app/
│   ├── page.tsx                        # Homepage — hero, trade grid, how it works, FAQ, testimonials, CTA
│   ├── layout.tsx                      # Root layout — NavBar + Footer + global metadata + OG/Twitter tags
│   ├── robots.ts                       # Robots.txt — blocks admin/api/profile/auth
│   ├── sitemap.ts                      # Sitemap — all static routes + approved contractor profiles
│   ├── contractors/
│   │   ├── layout.tsx                  # Auth guard — redirects to /auth if not logged in
│   │   ├── page.tsx                    # Verified Contractor Directory — search/filter + intro copy + jobs feed
│   │   └── [id]/page.tsx              # Contractor profile — Person + BreadcrumbList JSON-LD
│   ├── apply/
│   │   ├── layout.tsx                  # Metadata wrapper (client page can't export metadata directly)
│   │   └── page.tsx                    # Multi-step application form with doc upload + credentialing links
│   ├── auth/
│   │   ├── page.tsx                    # Sign in / Sign up toggle
│   │   ├── reset/page.tsx              # Password reset request
│   │   └── update-password/page.tsx    # Password update (email link target)
│   ├── profile/
│   │   └── page.tsx                    # 3-tab dashboard (Profile, Posts, Settings)
│   ├── u/
│   │   └── [username]/page.tsx         # Public profile page at /u/@handle
│   ├── explore/
│   │   └── page.tsx                    # Social + Q&A feed
│   ├── jobs/
│   │   ├── layout.tsx                  # Auth + pending-review guard (server wrapper)
│   │   ├── JobsGuard.tsx               # Client component — auth/pending check logic
│   │   └── page.tsx                    # Jobs/subcontracting board
│   ├── admin/
│   │   ├── layout.tsx                  # Admin email guard
│   │   ├── page.tsx                    # Application review queue
│   │   └── contractors/[id]/           # Per-contractor admin management
│   ├── about/page.tsx                  # About page — mission, verification process, contact
│   ├── privacy/page.tsx                # Privacy Policy
│   ├── terms/page.tsx                  # Terms of Service
│   ├── welding-contractors/page.tsx    # Trade landing page — welding
│   ├── hvac-contractors/page.tsx       # Trade landing page — HVAC
│   ├── electrical-contractors/page.tsx # Trade landing page — electrical
│   ├── plumbing-contractors/page.tsx   # Trade landing page — plumbing
│   ├── general-contractors/page.tsx    # Trade landing page — general contractors
│   ├── drywall-contractors/page.tsx    # Trade landing page — drywall
│   ├── guides/
│   │   └── find-welding-subcontractor/page.tsx  # SEO guide — FAQPage + Article + BreadcrumbList JSON-LD
│   └── api/
│       └── contact/[id]/route.ts       # Protected — returns phone/email to approved contractors
├── components/
│   ├── NavBar.tsx                      # Auth-aware nav with username dropdown
│   ├── Footer.tsx                      # Site footer — Platform + Company links
│   ├── ContractorCard.tsx              # Card for directory grid
│   ├── SearchFilters.tsx               # Trade/state/insurance/cert filter sidebar
│   ├── ProfileHeader.tsx               # Contractor profile header
│   ├── CertificationBadge.tsx          # Cert display with verified/expired status
│   ├── PostCard.tsx                    # Social post card
│   └── ContactSection.tsx              # Contact info with auth gating
├── lib/
│   ├── types.ts                        # Contractor, Certification, Application, Profile, Post, Job
│   ├── supabase.ts                     # Browser-safe Supabase client
│   ├── supabase-admin.ts               # Server-only admin client (bypasses RLS)
│   ├── constants.ts                    # TRADES array
│   └── email.ts                        # Resend email functions
├── supabase/migrations/                # 006 migrations deployed to production
├── next.config.js                      # remotePatterns: supabase + images.unsplash.com
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

---

## Slice Completion Protocol (MANDATORY — every slice, no exceptions)
At the end of every GSD slice, in this exact order:
1. **Verify locally** — run the full user flow in the browser at localhost:3000, use browser assertions, check console for errors
2. **Build check** — `npm run build` must pass clean
3. **Apply migrations** — run `./scripts/migrate.sh supabase/migrations/NNN_name.sql` for any new migrations, verify with a follow-up SELECT
4. **Deploy** — `./scripts/deploy.sh "<S0X>: short description"` — this gates on build before pushing
5. **Verify production** — repeat key browser assertions against hardhatsocial.net

Never mark a slice complete until step 5 passes. Every slice ships to production.
