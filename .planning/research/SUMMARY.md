# Project Research Summary

**Project:** Contractors Connect — Verified Contractor Directory
**Domain:** B2B verified contractor directory — homepage redesign, UX polish, SEO, production hardening, founding cohort onboarding
**Researched:** 2026-03-01
**Confidence:** HIGH (stack and architecture verified against official docs; features MEDIUM from marketplace research; pitfalls HIGH from direct code review)

## Executive Summary

Contractors Connect has a completed MVP — the core directory, application flow, admin review queue, and auth are all functional. The current milestone is about converting that working foundation into a production-ready product that can receive and onboard real users. This research covers five concrete areas: SEO metadata for discoverability, Supabase Storage bucket hardening, Resend domain verification for deliverability, loading skeletons for perceived performance, and homepage redesign for pre-cohort conversion. The existing tech stack (Next.js 14, Supabase, Tailwind, Resend, Vercel) is exactly right for all of these and requires no new dependencies beyond `schema-dts` as a dev-only type library.

The recommended approach is to execute this milestone in a clear dependency order: lock down production infrastructure first (env vars, DNS, database migrations, storage buckets), then add SEO hooks to existing pages, then redesign the homepage with honest teaser profiles, then polish the UX. This order matters because several features share upstream dependencies — `metadataBase` must be set in `app/layout.tsx` before any child page OpenGraph images resolve, DNS propagation for Resend takes up to 48 hours and must start before anything else, and placeholder profiles need a defined strategy before any component code is written to avoid trust damage.

The single highest-risk area for this milestone is not technical — it is trust damage from placeholder profiles that look like real verified contractors. The platform's entire value proposition is that every listed contractor is verified and real. A mock profile rendered with the same "Verified" badge as real profiles directly contradicts that promise to the founding cohort, who are personal contacts of the co-founder in a tight-knit trade community. The recommended mitigation is to either skip placeholders entirely (use an "applications under review" count instead) or use a visually distinct, honestly-labeled example section that is strictly homepage-only and never linkable as an individual profile.

## Key Findings

### Recommended Stack

The existing stack requires no changes for this milestone. All five feature areas (SEO metadata, JSON-LD structured data, Storage RLS policies, Resend domain verification, and loading skeletons) are achievable with built-in Next.js APIs, existing Supabase functionality, Tailwind utilities, and the existing Resend integration. The only new package recommended is `schema-dts@1.1.5` installed as a dev dependency for TypeScript types on Schema.org JSON-LD — it is type-only with zero runtime cost.

**Core technologies:**
- Next.js 14 App Router: `generateMetadata` + `loading.tsx` convention — no library alternatives needed or recommended; `next-seo` and `react-schemaorg` are explicitly anti-patterns for App Router
- Supabase JS v2.45.4: Storage RLS policies on `storage.objects` control access; bucket creation is a mix of migration SQL and manual dashboard steps that must be verified in production
- Tailwind CSS: `animate-pulse` utility provides skeleton loading UI — no `react-loading-skeleton` library needed
- Resend: Domain verification requires SPF + DKIM DNS records added at the registrar; DNS propagation takes up to 48 hours; this must be started before any other launch tasks
- `schema-dts@1.1.5` (dev dep only): TypeScript types for Schema.org JSON-LD; type-only, zero runtime, officially referenced in Next.js docs

**Version constraint:** Next.js 14.x does not have streaming metadata (added in 15.2.0). `generateMetadata` on dynamic routes blocks the initial response for bots and crawlers. This is acceptable at current scale and does not require a version upgrade.

### Expected Features

The milestone centers on three user-facing outcomes: a homepage that converts visiting tradespeople into applicants before the founding cohort is onboarded, UX polish that reduces friction on mobile, and discoverability via SEO once real profiles exist.

**Must have (table stakes for this milestone):**
- Clear homepage value prop with a single dominant CTA above the fold — visitors decide in 3-5 seconds; "Apply to Join" is the correct primary CTA at pre-cohort stage
- Trust indicators near the CTA — "Manually verified credentials," cert badge icons, and an honest count framing ("X applications under review" beats "Join 50+ members" if the latter is fabricated)
- Loading skeletons on `/contractors` and other data-fetching routes — empty or frozen screens read as broken, not loading; skeletons reduce abandonment on slow connections
- Empty state with reset action on `/contractors` when filters return no results — a blank grid destroys confidence in the platform
- Mobile-responsive nav with 44px minimum tap targets — tradespeople are on phones on job sites; current nav likely collapses poorly at 375px

**Should have (differentiators for this milestone):**
- Teaser profiles on homepage showing trade, state, years experience, specialty with name/photo obscured — honest labeling is mandatory; specificity (trade + state + specialty) makes them feel real without being deceptive
- SEO metadata via `generateMetadata` on contractor profile pages and public profile pages — unlocks discoverability once real profiles exist; static metadata on directory and homepage
- JSON-LD structured data on contractor profile pages — `LocalBusiness` schema type for Google rich result eligibility
- Application status transparency on post-apply confirmation screen — "under review — typically 3-5 business days" reduces anxious re-submissions

**Defer (after founding cohort is onboarded):**
- Dynamic member count on homepage — show once there is a real count worth showing
- Trade-specific homepage sections with specialty callouts — needs 10+ approved contractors per trade
- Credential-specific filter (filter by AWS cert, D1.1) — needs cert data density; cert table is currently unpopulated even after approval
- Review/rating system — after the network has completed jobs
- In-platform messaging, AI assistant, mobile app — post-MVP as defined in CLAUDE.md

**Anti-features to avoid:**
- Geolocation "near me" filtering — tradespeople travel; state filter is the right model
- AI chatbot on homepage — built for B2C homeowner discovery, not B2B contractor-to-contractor search
- Social feed on landing page — confuses the directory value prop; keep explore/feed in the logged-in area
- Star ratings before network has jobs — creates 0-review profiles that undermine quality signal
- Autoplay video or heavy animations — slow mobile connections, bright sunlight, tradespeople are task-oriented

### Architecture Approach

The architecture is a clear Server Component + Admin Client pattern throughout, with three leaf-level Client Components handling browser-only concerns (NavBar for auth state, SearchFilters for URL manipulation, ContactSection for authenticated API calls). This pattern is correctly implemented in the existing codebase and should be preserved exactly. The additions for this milestone slot cleanly into the existing structure: `loading.tsx` files go alongside existing `page.tsx` files, `generateMetadata` exports go into existing Server Component pages, a `components/skeletons/` directory holds new skeleton components, and `app/layout.tsx` gets `metadataBase` and a title template.

**Major components and additions:**
1. `app/layout.tsx` — add `metadataBase` (blocks OG image resolution without it) and title template `'%s | Contractors Connect'`; must be done first as it unblocks all child `generateMetadata` exports
2. `components/skeletons/` — new directory for `ContractorCardSkeleton`, `DirectoryGridSkeleton`, `ProfileSkeleton`; purely presentational, no data dependencies
3. `app/contractors/loading.tsx` + `app/contractors/[id]/loading.tsx` + `app/explore/loading.tsx` + `app/u/[username]/loading.tsx` — route-level skeletons using the `loading.js` convention; automatically wrapped by Next.js in Suspense boundaries
4. `app/contractors/[id]/page.tsx` — add `generateMetadata` + JSON-LD `<script>` tag; uses same admin client query, automatically deduplicated by Next.js
5. `app/page.tsx` — homepage redesign; add server Supabase fetch for teaser profiles with `export const revalidate = 300` (not `force-dynamic` — teaser profiles change infrequently)
6. Storage migration — new migration file adding `avatars` and `post-images` bucket creation + RLS policies; `application-docs` already created in migration 006 but needs policy verification

**Key architectural rule to preserve:** Never import `supabase-admin.ts` in a `'use client'` file. Add `import 'server-only'` to `lib/supabase-admin.ts` and `lib/email.ts` to enforce this at build time — currently enforced only by convention.

### Critical Pitfalls

1. **NEXT_PUBLIC_ env vars are baked at build time, not runtime** — set all `NEXT_PUBLIC_*` vars in Vercel dashboard before triggering the first production build; changing them after requires a manual redeploy. Silent failure: browser calls hit wrong Supabase project with no error.

2. **Supabase Auth `Site URL` still pointing to `localhost:3000`** — every password reset and approval email link bounces to a dead URL on a real device. Fix: set Site URL to production domain in Supabase dashboard → Authentication → URL Configuration before sending any emails to the founding cohort.

3. **Resend domain not verified — approval emails go to spam** — DNS propagation takes up to 48 hours; this must be started before any other production task. Founding cohort welders never see their approval email, onboarding stalls. Start DNS setup first.

4. **Placeholder profiles visually indistinguishable from real verified contractors** — using the same ContractorCard component with mock data produces a Verified-badge-bearing profile that directly contradicts the platform's core promise. Trust damage in small trade communities is severe. Use "applications under review" framing instead, or use visually distinct, clearly-labeled example cards that are never linkable.

5. **`supabase-admin.ts` has no `server-only` guard** — if accidentally imported in a client component, the service role key (which bypasses all RLS) appears in the browser bundle. Add `import 'server-only'` as the first line in `lib/supabase-admin.ts` and `lib/email.ts` before the first production deploy.

6. **Migrations applied out of order or skipped** — six sequential migrations must be applied in exact order (001-006) to the production Supabase project. Any skip causes schema inconsistencies that break the application flow. Use `supabase db push` or apply manually with explicit order verification.

7. **`metadataBase` missing in `app/layout.tsx`** — without it, OpenGraph image URLs in child pages resolve to `localhost` and social previews are broken on every social platform. Must be set before any SEO metadata is deployed.

## Implications for Roadmap

Based on the combined research, the correct phase structure for this milestone follows a strict dependency order. Infrastructure must be locked before user-facing features are built, and trust-sensitive decisions (placeholder strategy) must be resolved before any related components are written.

### Phase 1: Production Infrastructure Hardening
**Rationale:** Multiple features in later phases depend on correct infrastructure. DNS propagation for Resend takes 48 hours — this must start immediately. Env vars baked at build time mean a wrong first deploy is harder to undo than a missed feature. Storage buckets must exist before upload flows are tested. This phase has no code dependencies and unblocks everything else.
**Delivers:** A production Vercel deployment with correct env vars, verified Resend domain with SPF/DKIM DNS records, all 6 migrations applied to production Supabase in order, all 3 storage buckets created with correct RLS policies, Supabase Site URL set to production domain, `server-only` guard added to `supabase-admin.ts` and `email.ts`.
**Addresses:** Pitfalls 1 (env vars), 2 (auth redirect), 3 (Resend DNS), 5 (server-only guard), 6 (migrations), storage bucket pitfall
**Must verify:** Password reset flow end-to-end on production before onboarding; test approval email to personal Gmail to confirm it does not land in spam

### Phase 2: SEO Foundation
**Rationale:** SEO additions are purely additive to existing pages and have one upstream dependency: `metadataBase` in `app/layout.tsx`. Once that is set, `generateMetadata` on dynamic routes and static metadata on static pages can be added in any order. JSON-LD structured data on contractor profiles is the highest-value SEO addition because it enables Google rich results. This phase does not require any new components or data changes.
**Delivers:** `metadataBase` and title template in `app/layout.tsx`; `generateMetadata` on `/contractors/[id]` and `/u/[username]`; JSON-LD `LocalBusiness` script tag on contractor profile pages; static metadata exports on homepage, `/contractors`, `/apply`, `/auth`; `schema-dts` dev dependency installed.
**Uses:** Built-in Next.js `generateMetadata` API, `schema-dts` types, existing `supabase-admin.ts` (query auto-deduplicated between metadata and page)
**Avoids:** Missing `metadataBase` pitfall (OG images resolve to localhost without it); JSON-LD XSS pitfall (use `.replace(/</g, '\\u003c')` sanitization)
**Research flag:** Standard patterns — well-documented in official Next.js docs. No deeper research needed during planning.

### Phase 3: UX Polish — Loading States and Empty States
**Rationale:** Loading skeletons and empty states have zero data dependencies and are purely presentational. They should be built before the homepage redesign so that the directory page (which the homepage CTA links to) feels complete when first visitors arrive. The skeleton components also establish the `components/skeletons/` directory pattern that future phases may use.
**Delivers:** `components/skeletons/ContractorCardSkeleton`, `DirectoryGridSkeleton`, `ProfileSkeleton`; `app/contractors/loading.tsx`, `app/contractors/[id]/loading.tsx`, `app/explore/loading.tsx`, `app/u/[username]/loading.tsx`; empty state with reset action on `/contractors`; mobile nav improvement on `NavBar.tsx` (hamburger or bottom bar with 44px tap targets).
**Implements:** Route-level Suspense via `loading.js` convention; Tailwind `animate-pulse` skeleton pattern; progressive disclosure on mobile nav
**Avoids:** "Empty screen reads as broken" pitfall; mobile abandonment from tiny tap targets
**Research flag:** Standard patterns — well-documented. No deeper research needed.

### Phase 4: Homepage Redesign
**Rationale:** The homepage redesign depends on the placeholder strategy being decided first (Pitfall 5 — fake-looking profiles), relies on the `loading.tsx` and skeleton patterns from Phase 3, and benefits from having production infrastructure in place (Phase 1) so the teaser data can come from a real database. This is the most trust-sensitive phase and should not be rushed.
**Delivers:** Homepage redesigned as a server component with `revalidate = 300`; clear value prop headline (under 8 words); single dominant CTA above the fold; trust indicators (cert badge icons, verification language, honest member/application count); 3-6 teaser profile cards using real schema (trade, state, years experience, specialty) with name/photo obscured and honest labeling — no Verified badge, never linkable as individual profiles; application status transparency on post-apply confirmation screen.
**Addresses:** Chicken-and-egg cold-start problem; "Apply to Join" CTA conversion; mobile-first layout for tradespeople
**Avoids:** Placeholder trust damage pitfall; fabricated member counts; stock photos in teaser profiles; autoplay video or animations
**Research flag:** Placeholder strategy requires a design decision before any component code. Recommend confirming approach (teasers vs. "applications under review" count) at phase planning time.

### Phase 5: Founding Cohort Onboarding
**Rationale:** Once infrastructure is solid, SEO is in place, and the homepage converts, the founding cohort can be onboarded through the existing application flow. The gap in certification data (certifications table never populated after approval) must be resolved in this phase. Admin cert management already exists; this phase verifies it works and uses it on real profiles.
**Delivers:** Founding cohort welders onboarded via the existing application + approval flow; certifications added via admin cert management for each approved contractor; real contractor profiles replacing teaser profiles on the homepage; test of the full onboarding experience end-to-end (apply, review, approve, email received, sign in, profile visible).
**Addresses:** Certifications table gap (approveApplication never inserts certifications); "Verified badge requires populated certs" dependency from FEATURES.md
**Avoids:** Empty certifications section on approved contractor profiles; approval emails landing in spam (resolved in Phase 1)
**Research flag:** No additional research needed. The application and approval flow is complete; this phase is operational.

### Phase Ordering Rationale

- Phase 1 must come first because DNS propagation is a real-world constraint (48 hours), env vars baked at build time mean a wrong first deploy is sticky, and migrations must be verified before any user data is created.
- Phase 2 (SEO) comes before the homepage redesign because `metadataBase` in `layout.tsx` is a prerequisite for all OpenGraph images to resolve correctly — doing this early means it is verified before the homepage goes live.
- Phase 3 (UX polish) comes before Phase 4 (homepage) so the directory page is polished before the homepage CTA sends visitors there. Skeletons and empty states are pure frontend with no dependencies — they are fast to ship.
- Phase 4 (homepage) is last among the code phases because it is the most design-sensitive, depends on the placeholder strategy decision, and benefits from infrastructure and UX being solid first.
- Phase 5 (onboarding) is an operational phase that follows the code phases — it uses existing flows and verifies them under real conditions.

### Research Flags

Phases needing deeper research during planning:
- **Phase 4 (Homepage Redesign):** Placeholder profile strategy needs a design decision before component code is written. The research identifies the risk clearly but the exact implementation (teasers vs. count-only vs. "example" section) is a product decision that should be locked before planning begins.

Phases with standard patterns (can skip deeper research):
- **Phase 1 (Production Hardening):** All steps are operational checklists with official documentation. No ambiguity.
- **Phase 2 (SEO):** Official Next.js docs are definitive for `generateMetadata` and JSON-LD. No library research needed.
- **Phase 3 (UX Polish):** Tailwind `animate-pulse` and `loading.js` convention are well-documented. No novel patterns.
- **Phase 5 (Founding Cohort):** Uses existing flows — operational, not technical.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All patterns verified against official Next.js docs (updated 2026-02-27) and Supabase docs. One caveat: Supabase admin client query deduplication is documented for `fetch`-based requests; Supabase JS uses its own request layer, so deduplication behavior is MEDIUM confidence. |
| Features | MEDIUM | Table stakes and anti-features are well-established in marketplace and B2B directory research. Tradespeople-specific UX findings are extrapolated from broader low-digital-literacy research — directionally correct but not trade-specific primary research. |
| Architecture | HIGH | Based on direct codebase inspection combined with official Next.js docs. Component responsibilities and patterns reflect the actual codebase, not assumptions. |
| Pitfalls | HIGH | Most pitfalls identified through direct code review of the actual codebase (`/lib/supabase-admin.ts`, `/app/admin/layout.tsx`, `/app/admin/actions.ts`, migration files). Infrastructure pitfalls verified against official Supabase and Resend docs. |

**Overall confidence:** HIGH

### Gaps to Address

- **Supabase admin client query deduplication:** Next.js auto-deduplicates `fetch()` calls; Supabase JS uses its own HTTP layer. If the same query runs in both `generateMetadata` and the page component, it may execute twice. Resolution: extract shared data fetches into a React `cache()`-wrapped helper function in pages that need this optimization.
- **Certifications table population:** `approveApplication()` in `actions.ts` creates a `contractors` row but never inserts into `certifications`. Admin cert management page exists but must be verified to be functional before founding cohort onboarding. If it is not functional, certifications will not appear on approved profiles — the "Verified badge with cert specificity" differentiator identified in FEATURES.md will be absent.
- **Homepage teaser profile design decision:** The research identifies the risk of fake-looking placeholders but does not prescribe the exact visual design. This needs a product decision (teasers vs. count-only vs. "example" labeled section) before Phase 4 planning begins.
- **`NEXT_PUBLIC_ADMIN_EMAILS` format validation:** The env var is a comma-separated string of admin emails. The admin layout checks against this string. If the production value has trailing spaces or wrong casing, admin access breaks silently. Verify the check logic is case-insensitive and trims whitespace.

## Sources

### Primary (HIGH confidence)
- Next.js generateMetadata API Reference (updated 2026-02-27) — `generateMetadata`, `metadata` object, `openGraph`, `twitter`, `metadataBase`, title template patterns
- Next.js JSON-LD Guide (updated 2026-02-27) — `<script>` tag pattern, XSS sanitization with `\u003c`, `schema-dts` reference
- Next.js loading.js Convention — route-level Suspense pattern, streaming behavior
- Supabase Storage Access Control — RLS policy structure for INSERT and SELECT on `storage.objects`, public vs. private bucket behavior
- Supabase Auth Redirect URLs — Site URL configuration, redirect allowlist, `redirectTo` parameter in `resetPasswordForEmail()`
- Resend Domain Introduction — SPF + DKIM requirement, DNS verification process, 48-hour propagation timeline
- Direct codebase inspection (`/lib/supabase-admin.ts`, `/app/admin/layout.tsx`, `/app/admin/actions.ts`, `/app/api/contact/[id]/route.ts`, `/supabase/migrations/*.sql`, `/lib/email.ts`, `/app/apply/page.tsx`)

### Secondary (MEDIUM confidence)
- Sharetribe marketplace glossary — chicken-and-egg problem framing and teaser profile tactics
- LogRocket UX Design — skeleton loading screen design best practices
- UX Bulletin — designing for low digital literacy users (mobile tap targets, label-over-icon patterns)
- Jasmine Directory blog — verified badge consumer psychology
- DesignStudio UX — mobile navigation UX 2026
- schema-dts GitHub — v1.1.5 release date, type-only library status, weekly download count
- dmarc.wiki/resend — SPF record value `v=spf1 include:_spf.resend.com ~all`

### Tertiary (LOW confidence)
- Product Brain — designing LinkedIn for blue collar workers (PM interview format, single source)
- WebRunner Media — high-converting contractor landing page elements (contractor marketing firm, potential bias)
- Trade Hounds via CBInsights — competitive landscape reference only

---
*Research completed: 2026-03-01*
*Ready for roadmap: yes*
