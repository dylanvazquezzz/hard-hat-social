# Pitfalls Research

**Domain:** Verified contractor directory — Next.js 14 + Supabase + Vercel launch hardening
**Researched:** 2026-03-01
**Confidence:** HIGH (code reviewed directly; findings verified against official docs and known issues)

---

## Critical Pitfalls

### Pitfall 1: NEXT_PUBLIC_ Env Vars Inlined at Build Time, Not Runtime

**What goes wrong:**
`NEXT_PUBLIC_` variables are frozen at `next build` time, not at server start. If you add or change `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, or `NEXT_PUBLIC_APP_URL` in Vercel's dashboard _after_ the last deploy, the running app still uses the baked-in values from the previous build. The app silently points at the wrong project.

**Why it happens:**
Developers assume environment variables work like Node.js — read at runtime. In Next.js, `NEXT_PUBLIC_*` values are replaced with string literals during the build step. Vercel's dashboard makes it easy to add/change vars, which creates a false sense that the change is live without a redeploy.

**How to avoid:**
- Set all `NEXT_PUBLIC_*` vars in Vercel _before_ the first production build.
- After any env var change in Vercel dashboard, trigger a manual redeploy (Deployments → Redeploy).
- Server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`) are read at runtime — only `NEXT_PUBLIC_*` have this constraint.
- Verify values post-deploy by checking the browser's network tab for requests to confirm they hit the correct Supabase project URL.

**Warning signs:**
- Supabase calls in the browser return 401 or go to a different project than expected.
- `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)` returns `undefined` in browser devtools — means the build ran without that var set.
- Approval emails link to `localhost:3000` or the wrong domain (the `APP_URL` var was empty at build time).

**Phase to address:** Production Hardening phase — verify all env vars are set _before_ triggering the initial Vercel production build.

---

### Pitfall 2: Supabase Auth Redirect URLs Not Configured for Production Domain

**What goes wrong:**
Password reset emails, email confirmation links, and auth magic links all use Supabase's `Site URL` setting to generate redirect targets. If `Site URL` in the Supabase dashboard still points to `localhost:3000` (the default from local dev), every email link bounces users to localhost. On a real phone, this is a dead link — the contractor opens the approval email, taps "Sign In Now," and lands on a broken page.

**Why it happens:**
Supabase's `Site URL` is set once during project setup and rarely revisited. The password reset flow (`/auth/update-password`) depends on Supabase correctly issuing a token and redirecting to the right domain. Local dev works fine; production silently breaks.

**How to avoid:**
- In Supabase Dashboard → Authentication → URL Configuration:
  - Set `Site URL` to the production Vercel domain (e.g., `https://contractorsconnect.com`)
  - Add `https://contractorsconnect.com/**` to the Redirect URL allowlist
  - Also add `http://localhost:3000/**` for local dev
- Set `NEXT_PUBLIC_APP_URL` in Vercel to the production domain — `email.ts` uses this as the base for email links.
- Test the reset flow end-to-end on production before onboarding the founding cohort.

**Warning signs:**
- Password reset email link opens to a 404 or localhost.
- Approval email "Sign In Now" button goes to `localhost:3000/auth` instead of the real domain.
- Supabase dashboard logs show `redirect_uri_mismatch` errors.

**Phase to address:** Production Hardening phase — must be verified before any email notifications are sent to real users.

---

### Pitfall 3: Storage Bucket Missing in Production (Buckets Don't Migrate Automatically)

**What goes wrong:**
Migration `006_application_documents.sql` creates the `application-docs` bucket via `INSERT INTO storage.buckets`. However, the `avatars` and `post-images` buckets are listed in CLAUDE.md as needing to be created manually in the Supabase dashboard — they have no migration. If the production Supabase project doesn't have these buckets, avatar uploads and post image uploads silently fail (Supabase Storage returns a 404 on upload).

Additionally, even if `application-docs` is created by the migration, the RLS policies on `storage.objects` may not apply correctly if the bucket is recreated manually rather than via migration.

**Why it happens:**
Storage bucket creation is mixed — some via migration, some via dashboard. The approach is inconsistent, and there's no automated check that all three buckets exist with correct policies before launch.

**How to avoid:**
- Before launch, verify all three buckets exist in the production Supabase project:
  - `application-docs` — created by migration 006, verify it ran
  - `avatars` — create manually in dashboard; set public read, authenticated write
  - `post-images` — create manually in dashboard; set public read, authenticated write
- Write a simple test: upload a small test file to each bucket via the Supabase dashboard UI to confirm policies allow it.
- Document the bucket creation steps in a deploy checklist so nothing is missed when re-deploying to a fresh Supabase project.

**Warning signs:**
- Avatar upload in `/profile` page fails silently (spinner stops, no image appears).
- `application-docs` uploads during `/apply` succeed locally but 400 on production.
- Supabase Storage logs show `Bucket not found` or `new row violates row-level security policy`.

**Phase to address:** Production Hardening phase — run the bucket verification checklist before opening the application form to the founding cohort.

---

### Pitfall 4: Admin Guard Is Client-Side Only — Security Theater if Service Role Key Leaks

**What goes wrong:**
`/admin/layout.tsx` is a client component that reads `NEXT_PUBLIC_ADMIN_EMAILS` and does a client-side auth check. If the `SUPABASE_SERVICE_ROLE_KEY` ever reaches the client bundle (e.g., a developer accidentally uses `getSupabaseAdmin()` in a client component), the admin actions (`approveApplication`, `rejectApplication`) can be called by anyone who grabs the key from the bundle.

The admin guard itself is not a security hole — `approveApplication` is a server action, and server actions cannot be forged arbitrarily. But the risk pattern exists: the service role key bypasses all RLS, and `supabase-admin.ts` is server-only by convention, not by build-time enforcement.

**Why it happens:**
Next.js App Router doesn't prevent importing server-only files into client components at the type level. A `'use client'` annotation is runtime, not compile-time. Adding `import 'server-only'` to `supabase-admin.ts` would make the build fail if it's ever imported client-side, but this guard is not currently in place.

**How to avoid:**
- Add `import 'server-only'` as the first line in `/lib/supabase-admin.ts` and `/lib/email.ts`. This causes a build error if either file is imported in a client component.
- Never prefix `SUPABASE_SERVICE_ROLE_KEY` with `NEXT_PUBLIC_` — this is already correct, but verify it stays that way.
- Periodically grep the bundle output for the service role key pattern: `eyJ` (JWT prefix) should never appear in any `.js` file under `.next/static/`.

**Warning signs:**
- A build succeeds after accidentally importing `getSupabaseAdmin()` in a client component — currently no build-time guard prevents this.
- `SUPABASE_SERVICE_ROLE_KEY` appears in `.next/static/chunks/` files.

**Phase to address:** Production Hardening phase — add `server-only` guard to `supabase-admin.ts` before first production deploy.

---

### Pitfall 5: Placeholder/Teaser Profiles That Look Like Real Verified Contractors

**What goes wrong:**
The PROJECT.md notes the plan to use "teaser/placeholder profiles" on the homepage to solve the chicken-and-egg problem before the founding cohort is onboarded. If placeholder profiles appear in the same visual format as real verified contractor profiles — with a "Verified" badge, realistic names, trade data, and certification listings — visitors who share the link or return expecting to contact those contractors will feel deceived when the profiles are either gone or were never real.

The trust damage is severe and specific to this platform: the entire value proposition is that every contractor is verified and real. A placeholder that looks real directly contradicts the core brand promise. Word spreads fast in tight trade communities (welders in a region all know each other).

**Why it happens:**
It's tempting to use the same `ContractorCard` component with mock data to make the directory look populated. The path of least resistance produces something that looks real because the component is designed to look trustworthy.

**How to avoid:**
- Placeholder profiles must be visually distinct: use a clearly labeled "Example Profile" or "Coming Soon" section, separate from the main grid, without a Verified badge.
- Better alternative: skip placeholders entirely. Instead, use a "directory launching soon" hero section with a count of applications under review and a strong CTA to apply. This is honest and creates urgency.
- If placeholders are used, they must not appear in search results or be linkable as individual profiles — homepage-only, clearly marked as illustrative examples.
- Never give placeholder profiles real-looking contact info, even dummy phone numbers, because founders will share these links with real welders.

**Warning signs:**
- A placeholder card renders with the same "Verified" badge as real profiles.
- Placeholder profiles are accessible at `/contractors/[fake-id]` URLs.
- A founding cohort member messages asking "who is [placeholder name], I tried to contact them."

**Phase to address:** Homepage Redesign phase — design the placeholder strategy before any code is written.

---

### Pitfall 6: Resend Domain Not Verified — Approval Emails Go to Spam

**What goes wrong:**
Resend's free tier allows sending from `onboarding@resend.dev` without domain verification. If the production app is still using the Resend default sender (or `noreply@contractorsconnect.com` without DNS records set up), every approval and rejection email lands in spam. The founding cohort welders never see their approval — they wait, check spam eventually, and the onboarding experience feels broken.

`email.ts` defaults `FROM` to `noreply@contractorsconnect.com` via `RESEND_FROM_EMAIL`. Without SPF/DKIM records added for `contractorsconnect.com`, Resend cannot authenticate the sender and major providers (Gmail, Outlook) will spam-folder or reject the message outright.

**Why it happens:**
Domain verification is a DNS step that happens outside the codebase. It's easy to miss during deploy checklists because it's not in the repo and doesn't cause a code error — emails appear to send successfully from the app's perspective while actually landing in spam.

**How to avoid:**
- In Resend dashboard → Domains → Add Domain → add `contractorsconnect.com`.
- Add the three DNS TXT records Resend provides (SPF, DKIM, and optionally DMARC) to the domain's DNS host.
- DNS propagation takes up to 48 hours — start this step before any other launch tasks.
- Set `RESEND_FROM_EMAIL` in Vercel to the verified sender address once DNS verifies.
- Send a test approval email to a personal Gmail account and verify it does not land in spam before onboarding the founding cohort.

**Warning signs:**
- Resend dashboard shows `Unverified` next to the domain.
- Test emails sent via Resend land in Gmail Spam with "via resend.dev" in the sender line.
- Founding cohort members say they never received the approval email.

**Phase to address:** Production Hardening phase — DNS must be set up at least 48 hours before the first approval is triggered.

---

### Pitfall 7: Migrations Run Out of Order or Skipped in Production

**What goes wrong:**
The app has 6 sequential migrations. If applied to the production Supabase project in the wrong order or with any skipped, the schema will be inconsistent. For example, migration 004 adds `user_id` to `applications` — if migration 004 is skipped, the approval flow in `actions.ts` will error trying to link `user_id`. Migration 005 adds `updated_at` to the RLS fix — if skipped, the policy drop-and-recreate in 005 will fail because it targets a policy that was never created.

**Why it happens:**
Without the Supabase CLI or a migration runner, developers copy-paste SQL into the dashboard editor and may reorder or skip files. The migration files are named with numeric prefixes but the Supabase dashboard doesn't enforce order — it runs whatever SQL you paste.

**How to avoid:**
- Apply migrations in exact numeric order: 001 → 002 → 003 → 004 → 005 → 006.
- Use the Supabase CLI (`supabase db push`) against the production project to apply all pending migrations at once, in order.
- After applying, run a quick verification: check that `applications` has `user_id` and `document_urls` columns, and that `storage.buckets` contains `application-docs`.
- Keep a deploy checklist that checks off each migration as applied.

**Warning signs:**
- Application submissions fail with `column "user_id" does not exist` or `column "document_urls" does not exist`.
- Admin actions throw Postgres errors about missing columns or policy conflicts.
- `storage.buckets` table does not contain `application-docs` after running all migrations.

**Phase to address:** Production Hardening phase — migration verification is a pre-launch gate, not an afterthought.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| No `import 'server-only'` in `supabase-admin.ts` | Saves one line | If a developer accidentally imports it in a client component, the service role key could leak into the bundle; no build-time warning | Never acceptable — add it now |
| Username derived from email prefix on approval (`email.split('@')[0]`) | Avoids asking for username during application | Duplicate usernames if two applicants share an email prefix; usernames like `john.smith` from `john.smith@gmail.com` look odd; no way for user to choose before they log in | Acceptable for MVP founding cohort, fix before scaled onboarding |
| Contact info gating enforced only at API level (no DB column-level restriction) | Simpler schema | If the API route is bypassed or RLS misconfigured, contact info is exposed; RLS policy on `contractors` exposes all columns including `phone`/`email` to the anon key | Acceptable for MVP; add a Postgres column-level security or a view before scaling |
| Admin guard is client-side only (email check in `layout.tsx`) | No server middleware needed | A determined attacker can bypass the redirect by disabling JS; server actions are still protected but the admin UI is technically accessible | Acceptable for MVP with trusted small admin team; add server-side middleware before adding more admins |
| Social proof numbers hardcoded ("Join 50+ verified welding contractors") | Easy to write | When the real count is visible in the directory, inconsistency erodes trust | Never — either pull the real count from the DB or use language that doesn't commit to a number |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase Auth + password reset | `resetPasswordForEmail()` without `redirectTo` option — Supabase uses `Site URL` which may be `localhost` | Always pass `redirectTo: process.env.NEXT_PUBLIC_APP_URL + '/auth/update-password'` explicitly in the reset call |
| Resend + transactional email | URL in email body (`APP_URL`) doesn't match the verified sending domain — triggers spam filters | `NEXT_PUBLIC_APP_URL` and `RESEND_FROM_EMAIL` domain must be the same root domain |
| Supabase Storage + application upload | `getPublicUrl()` returns a URL even if the bucket is private — the URL is non-functional but no error is thrown | `application-docs` is private; use signed URLs via `createSignedUrl()` when admin needs to view documents, not `getPublicUrl()` |
| Next.js `generateMetadata` + dynamic routes | Fetching contractor data twice — once in `generateMetadata` and once in the page component | Next.js automatically memoizes `fetch()` calls with the same URL within a request; use `fetch` with the same URL (or Supabase with `cache: 'force-cache'`) in both to avoid double queries |
| `NEXT_PUBLIC_ADMIN_EMAILS` env var | Forgetting to set this in Vercel → the admin layout reads an empty string → no email matches → admin is locked out of `/admin` | Set this before first deploy and test admin access immediately after deployment |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Directory page fetches all approved contractors with no pagination | Page load slows as contractors are added; all contractor data downloaded on first visit | Add `range()` pagination to the Supabase query from the start — even 50 rows is fine initially, but the pattern should be correct | Noticeable degradation around 200+ contractors with bio, specialties, and photo URLs |
| `is_approved_contractor()` function called on every contact API request (3 queries per request) | Contact info requests become slow under any concurrency | Add an index on `contractors(user_id, status)` — already partially covered by `contractors_status_idx` but a composite index would help | Fine at 50 users; noticeable at 500+ concurrent sessions |
| Full-text search GIN index on `contractors` not used by filter queries | Search feels slow; filter by trade alone doesn't use the GIN index | Keep trade/state filters using the existing B-tree indexes (`contractors_trade_idx`, `contractors_state_idx`); use GIN only for text search queries | Fine at current scale; relevant if search queries mix multiple filter types |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| `application-docs` bucket uses `auth.role() = 'authenticated'` as the INSERT policy — any authenticated user can upload to any path in the bucket | A rejected applicant or a contractor (not an applicant) can upload arbitrary files to `application-docs`, cluttering storage and potentially overwriting other applicants' files | Tighten the policy to scope uploads to the applicant's own application ID folder: `bucket_id = 'application-docs' AND (storage.foldername(name))[1] = auth.uid()::text` |
| Admin route protected only by client-side JS email check | An attacker with JS disabled can render the admin page HTML, though server actions still require auth | Add Next.js middleware (`middleware.ts`) that checks the Supabase session server-side for `/admin` routes |
| Service role key used without `server-only` import guard | If `supabase-admin.ts` is accidentally imported in a client component, the key appears in the JS bundle | Add `import 'server-only'` as first line in `supabase-admin.ts` |
| XSS risk in JSON-LD structured data | If contractor `full_name`, `bio`, or `trade` contains `</script>` or similar, and that data is injected into a JSON-LD script tag without sanitization, it can break the page or execute scripts | Use `JSON.stringify()` with a replacer that converts `<` to `\u003c` in all JSON-LD output |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Single-page application form with no progress indicator | Tradespeople on mobile don't know how long the form is; 27% abandon long forms that "feel endless" | Add a visible step counter or progress bar even though it's a single-page form — section headings ("1 of 3 — Your Info") reduce perceived length |
| No confirmation that document upload succeeded before form submit | Contractor uploads their AWS cert PDF, sees nothing visual, submits — upload may have silently failed | Show a file list with names and a checkmark after each upload succeeds; show an error if the bucket is missing |
| No "save progress" for multi-step form | Tradespeople interrupted mid-form (a job site call) lose all progress and give up | At minimum, use `localStorage` to persist form state between page reloads; full resume-later requires a draft application row |
| Approval email links to `/auth` with no context | Contractor taps "Sign In Now" but has no memory of what password they set 3 days ago | Approval email should include a one-liner: "Sign in with the email and password you used during your application" and link directly to the sign-in page |
| Empty state on `/contractors` when no welders are approved yet | Homepage CTA says "Browse Directory" → page shows nothing → visitor bounces thinking the platform is dead | Implement an empty state that explains the directory is growing and encourages application — do not show a blank grid |

---

## "Looks Done But Isn't" Checklist

- [ ] **Password reset flow:** The reset flow was listed as "missing" in CLAUDE.md — verify `/auth/reset` and `/auth/update-password` pages exist and work end-to-end with a real email before onboarding. `supabase.auth.resetPasswordForEmail()` must include the correct `redirectTo` URL.
- [ ] **Certifications table:** `approveApplication()` in `actions.ts` creates a `contractors` row but never inserts into `certifications`. The profile page will show no certifications even for approved contractors with uploaded docs. Verify the admin cert management page exists and works.
- [ ] **Storage bucket policies:** `application-docs` policy allows any authenticated user to upload to any path. Verify this is acceptable for MVP or tighten before launch.
- [ ] **Resend domain verification:** The `FROM` address is `noreply@contractorsconnect.com` by default. Verify DNS records are added and Resend shows the domain as `Verified` before sending any real emails.
- [ ] **Supabase Site URL:** Verify the Supabase dashboard Site URL is set to the production domain, not `localhost:3000`.
- [ ] **`NEXT_PUBLIC_ADMIN_EMAILS`:** Verify this is set in Vercel and test that the admin account can access `/admin` on production.
- [ ] **OG images:** `metadataBase` must be set in `layout.tsx` for OpenGraph images to resolve correctly. Without it, OG image URLs point to `localhost` and social previews are broken on every social platform.
- [ ] **JSON-LD in dynamic profiles:** Contractor `full_name` and `bio` can contain characters that break inline JSON — verify structured data output is sanitized before rendering in `<script type="application/ld+json">`.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Wrong Supabase project targeted (wrong env vars at build) | LOW | Update env vars in Vercel, trigger redeploy. No data loss. |
| Auth redirect pointing to localhost in production | LOW | Update Site URL in Supabase dashboard → instant fix, no redeploy needed |
| Missing storage buckets (avatar/post-images) | LOW | Create buckets in Supabase dashboard with correct policies → feature starts working immediately |
| Approval emails in spam (Resend domain not verified) | MEDIUM | Add DNS records, wait up to 48 hours for propagation. Emails already sent to spam cannot be recalled — manually notify affected founding cohort members by other channel |
| Placeholder profiles mistaken for real by founding cohort | MEDIUM | Remove placeholders immediately, communicate via personal contact with the founding welders that the directory is being seeded. Trust damage is recoverable with a small cohort of personal contacts. |
| Migrations applied out of order (schema inconsistency) | HIGH | Identify which migrations ran, manually apply missing ones in order. May require data fixes if rows were inserted into a misconfigured schema. Test all flows after fixing. |
| Service role key leaked in client bundle | HIGH | Immediately rotate the service role key in Supabase (Settings → API → Regenerate), update `SUPABASE_SERVICE_ROLE_KEY` in Vercel, redeploy. Audit logs for unauthorized access. |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| NEXT_PUBLIC env vars baked at build time | Production Hardening | After deploy: check browser network tab shows requests to correct Supabase URL |
| Supabase Auth redirect URLs misconfigured | Production Hardening | Send a real password reset email on production domain; confirm link goes to correct URL |
| Storage buckets missing in production | Production Hardening | Upload a test file to each bucket via dashboard; confirm success |
| Admin service role key leak risk | Production Hardening | Add `server-only` import; grep bundle for `eyJ` pattern |
| Placeholder profiles look real | Homepage Redesign | Design review: confirm no Verified badge, no linkable individual profile pages |
| Resend domain not verified | Production Hardening (start early — 48hr DNS) | Resend dashboard shows `Verified`; test email does not land in spam |
| Migrations out of order | Production Hardening | Verify column existence in production DB after migrations run |
| Missing metadataBase for OG images | SEO/Metadata phase | Use an OG preview tool (e.g., opengraph.xyz) to verify images resolve correctly |
| JSON-LD XSS in contractor profiles | SEO/Metadata phase | Test contractor profile with special characters in name/bio; verify page does not break |
| No password reset flow | Production Hardening (before onboarding) | End-to-end test: request reset, receive email, click link, update password, sign in |
| Certifications not populated after approval | Founding Cohort Onboarding | Approve a test application; verify certifications appear on the contractor's profile |
| Application form drop-off on mobile | UX Polish phase | Test full form flow on a real mobile device at 4G speeds; measure time to complete |

---

## Sources

- Next.js official docs — `generateMetadata`, env vars, metadata/OG images: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- Supabase Storage Access Control: https://supabase.com/docs/guides/storage/security/access-control
- Supabase Auth Redirect URLs: https://supabase.com/docs/guides/auth/redirect-urls
- Supabase RLS documentation: https://supabase.com/docs/guides/database/postgres/row-level-security
- Resend domain authentication guide: https://resend.com/docs/dashboard/domains/introduction
- Resend deliverability best practices: https://resend.com/blog/top-10-email-deliverability-tips
- Next.js NEXT_PUBLIC_ env var pitfalls: https://dev.to/koyablue/the-pitfalls-of-nextpublic-environment-variables-96c
- Next.js metadataBase discussion (OG images): https://github.com/vercel/next.js/discussions/57251
- Supabase security — 170 apps exposed by missing RLS: https://byteiota.com/supabase-security-flaw-170-apps-exposed-by-missing-rls/
- JSON-LD hydration issues in Next.js App Router: https://github.com/vercel/next.js/discussions/80088
- Supabase migration history mismatch: https://blog.stackademic.com/how-to-fix-supabase-migration-history-mismatch-a-quick-solution-6e61cda9ee53
- Code review: `/app/admin/layout.tsx`, `/app/admin/actions.ts`, `/app/api/contact/[id]/route.ts`, `/lib/supabase-admin.ts`, `/lib/email.ts`, `/app/apply/page.tsx`, `/supabase/migrations/*.sql`

---
*Pitfalls research for: Contractors Connect — verified contractor directory, launch hardening milestone*
*Researched: 2026-03-01*
