# Codebase Concerns

**Analysis Date:** 2026-03-04

## Tech Debt

**Admin Client Usage in Server Components:**
- Issue: `getSupabaseAdmin()` is used directly in server components like `app/contractors/page.tsx:14`, `app/admin/page.tsx:7`, and `app/contractors/[id]/page.tsx:52` for read operations that don't require RLS bypass. This exposes the service role key to server-side calls unnecessarily.
- Files: `app/contractors/page.tsx`, `app/contractors/[id]/page.tsx`, `app/admin/page.tsx`, `app/u/[username]/page.tsx`, `app/admin/contractors/page.tsx`
- Impact: While not a security breach (server-only code), it makes the codebase harder to audit and increases risk of accidental data leakage if refactored. Server-side Supabase reads should use the anon client when possible to respect RLS.
- Fix approach: Create a server-side utility client that respects RLS policies, or migrate read-only queries to use RLS-aware clients where feasible.

**Direct API Key Usage in Admin Page:**
- Issue: `app/admin/page.tsx:7-19` constructs Supabase REST API calls manually with `process.env.SUPABASE_SERVICE_ROLE_KEY` instead of using the Supabase client SDK.
- Files: `app/admin/page.tsx` lines 7-20
- Impact: Manual HTTP calls bypass SDK protections and error handling. Harder to maintain and debug.
- Fix approach: Replace REST API calls with `getSupabaseAdmin().from('applications').select()` pattern.

**Error Handling with alert() in Client Components:**
- Issue: `app/profile/page.tsx` uses `alert()` for error messages (lines 111, 134, 160, 182) instead of proper toast/snackbar UI.
- Files: `app/profile/page.tsx` lines 111, 134, 160, 182
- Impact: Poor UX on mobile, blocking modal disrupts workflow, not dismissable gracefully.
- Fix approach: Replace with toast library (e.g., `react-hot-toast`) or custom snackbar component.

**Console Logging in Production Code:**
- Issue: Debugging console.log/error calls remain in production code (`app/admin/page.tsx:16,24`, `app/admin/actions.ts:80,99`, `app/contractors/page.tsx:47`).
- Files: `app/admin/page.tsx`, `app/admin/actions.ts`, `app/contractors/page.tsx`
- Impact: Leaks application state/errors to client browser console; clutters logs in production.
- Fix approach: Remove or wrap in environment checks (e.g., `if (process.env.NODE_ENV === 'development')`).

## Known Bugs

**Hardcoded Domain in Schema.org JSON-LD:**
- Symptoms: Public profile pages embed hardcoded URLs like `https://contractors-connect.vercel.app/contractors/${contractor.id}` and `https://contractors-connect.vercel.app/u/${profile.username}` in JSON-LD. If domain changes or is deployed to a different hostname, SEO markup breaks.
- Files: `app/contractors/[id]/page.tsx` line 81, `app/u/[username]/page.tsx` line 90
- Trigger: SEO crawlers parsing JSON-LD on profile pages
- Workaround: Use `process.env.NEXT_PUBLIC_APP_URL` instead (already available per CLAUDE.md). Must manually update JSON-LD before production migration.

**Username Collision Risk in Profile Creation:**
- Symptoms: Two rapid, simultaneous profile creation requests can bypass uniqueness check in `app/profile/page.tsx:204-217`. The check queries existing usernames before update, but there's a race condition window.
- Files: `app/profile/page.tsx` lines 204-217
- Trigger: Two users signing up at nearly the same time with the same desired username
- Workaround: Supabase has a unique constraint on `profiles.username`, so DB will reject the second insert, but the UI doesn't gracefully retry. Error surfaces as "username taken" after partial form submission.

**Document Upload Silent Failures in Apply Form:**
- Symptoms: If document upload fails in `app/apply/page.tsx:195-204`, the error is silently caught and the application is still submitted without documents. User has no way to know documents weren't uploaded.
- Files: `app/apply/page.tsx` lines 195-204
- Trigger: Network failure, storage quota exceeded, or file too large during upload
- Workaround: Application is still created (acceptable for MVP), but admin won't see credential documents. Documents can't be added retroactively without admin intervention.

## Security Considerations

**Storage Bucket Public Read Access:**
- Risk: All three storage buckets (`avatars`, `post-images`, `application-docs`) are set to `public = true` with public read policies (migration 007). This means credential documents (PDFs, images) uploaded by applicants are publicly readable by URL.
- Files: `supabase/migrations/007_storage_policies.sql` lines 20-22, 46-48, 67-75
- Current mitigation: Documents are only accessible if someone knows the exact URL. URLs are sufficiently random (`Date.now()_Math.random()`). Admin review flow doesn't expose document URLs publicly. RLS policy restricts uploads to authenticated users with per-user path prefix.
- Recommendations: Consider setting `application-docs` bucket to `public = false` and implementing a signed URL generation endpoint that checks if the requester is an approved contractor or admin. This prevents accidental discovery of unreviewed applications.

**Contact Info Exposed Without Proper Auth Check:**
- Risk: `app/api/contact/[id]/route.ts` checks if the requesting user is an "approved contractor" by querying the `contractors` table by `user_id` or email. A user who was approved, then had their contractor profile deleted by admin, could theoretically still access contact info if their auth session persists.
- Files: `app/api/contact/[id]/route.ts` lines 22-40
- Current mitigation: User would need an active session from before deletion. Logout/login would block access. Unlikely in practice but theoretically possible.
- Recommendations: Add an explicit check that the requesting user's contractor profile still exists and is approved before returning contact info. Cache bust logic or use real-time subscriptions if this endpoint is heavily used.

**Application User ID Null Handling:**
- Risk: `app/apply/page.tsx` allows `user_id` to be null when creating an application if auth signup fails (line 136). If the same person reapplies, the second application won't link to their auth account, creating duplicate application records.
- Files: `app/apply/page.tsx` lines 136, 155-157
- Current mitigation: Admin approval process can manually link user_id (handled in `app/admin/actions.ts:71-73`), but this is a manual workaround.
- Recommendations: Require email confirmation before accepting applications, or use a service-side pre-flight check to ensure the auth account was created successfully before inserting the application record.

**Email Notification Non-Blocking on Rejection:**
- Risk: `app/admin/actions.ts:98-101` does not block on email send failure for rejection emails. If Resend fails silently, rejected applicants won't be notified, but the application status will still be marked rejected.
- Files: `app/admin/actions.ts` lines 98-101
- Current mitigation: Errors are caught and logged. Application rejection still succeeds. Admin can manually email if needed.
- Recommendations: Log email failures to a monitoring service (Sentry, datadog). Consider a retry queue for failed emails.

## Performance Bottlenecks

**N+1 Query on Public Profile Page:**
- Problem: `/u/[username]` page makes parallel requests for profile, contractor, posts, and certifications (lines 58-82). If a user has many certifications, the page loads all certifications without pagination or limit.
- Files: `app/u/[username]/page.tsx` lines 58-82
- Cause: No limit on `certifications` query (line 77-79)
- Improvement path: Add `.limit(10)` to certifications query, or paginate if needed. Also consider combining queries into a single join if Supabase RLS allows.

**Unindexed Search on Contractors Table:**
- Problem: `app/contractors/page.tsx:31-33` uses `.or()` with `.ilike()` filters on `full_name`, `trade`, `location_city`, `bio`. Full-text search index exists (migration 005, lines 20-28) but the actual search query doesn't use it.
- Files: `app/contractors/page.tsx` lines 29-34
- Cause: Text search query uses ILIKE instead of full-text search (`.@@@` operator in Postgres), which is slower on large datasets.
- Improvement path: Implement full-text search using `.select('*').textSearch('search_column', term)` or use Postgres `.@@@` operator directly.

**All Contractors Fetched Without Pagination:**
- Problem: `app/contractors/page.tsx` loads all approved contractors into memory without pagination. With 1000+ contractors, this will become slow.
- Files: `app/contractors/page.tsx` lines 14-44
- Cause: No `.limit()` or `.range()` on the contractors query
- Improvement path: Add pagination with `.range(offset, offset + pageSize)` and update SearchFilters component to expose page controls.

**Admin Page Direct REST Call Without Caching:**
- Problem: `app/admin/page.tsx:8-20` fetches pending applications on every page load with `cache: 'no-store'`, even if no changes were made.
- Files: `app/admin/page.tsx` lines 8-20
- Cause: `force-dynamic` directive (line 4) + no-store cache policy
- Improvement path: Use incremental static regeneration (ISR) with revalidation every 30 seconds, or implement polling with real-time subscriptions.

## Fragile Areas

**Application to Contractor Conversion Logic:**
- Files: `app/admin/actions.ts` lines 8-84
- Why fragile: Complex multi-step logic (resolve user_id, create contractor, create certifications, upsert profile, update application). Many integration points. If any step fails (e.g., profile creation), the contractor row is left orphaned.
- Safe modification: Wrap in a database transaction (Supabase doesn't support txns in client SDK, so use a server action with RPC or handle rollback manually). Add detailed logging and error context before throwing.
- Test coverage: No tests visible in codebase. This is the most critical business logic path — ensure it's covered by integration tests before scaling to real users.

**RLS Policy Verification:**
- Files: `supabase/migrations/001_initial.sql`, `005_rls_improvements.sql`, `007_storage_policies.sql`
- Why fragile: RLS policies are complex and easy to accidentally bypass. Storage policies especially (006/007) have detailed per-user path restrictions. A single policy change could expose private data.
- Safe modification: Always test new RLS policies in a staging environment. Use a `SELECT * FROM current_user;` check in policies to understand auth context. Document policy intent in comments.
- Test coverage: No automated RLS tests. Recommend adding Supabase client test suite.

**Storage Path Construction in Apply Form:**
- Files: `app/apply/page.tsx` lines 193-194
- Why fragile: Uses `uploadUserId` to construct path for storage RLS policy to match `(storage.foldername(name))[1] = auth.uid()::text`. If `uploadUserId` is wrong (e.g., null check on line 181 fails), the upload will fail silently per the RLS policy.
- Safe modification: Add explicit error handling around path construction. Log the resolved `uploadUserId` for debugging.
- Test coverage: Manual testing only. Should add client-side unit tests for userId resolution logic.

## Scaling Limits

**Database Row Count:**
- Current capacity: MVP assumes <1000 contractors, <10,000 posts
- Limit: Supabase (Postgres) handles millions of rows fine. Real bottleneck is N+1 queries and lack of pagination. At 10,000+ contractors, the directory page will timeout without pagination and proper indexing.
- Scaling path: Add pagination, implement full-text search index usage, denormalize contractor counts if needed.

**Storage Bucket Size:**
- Current capacity: No explicit limit set in migrations. Supabase has 50GB per project on Pro plan.
- Limit: Application documents + avatars + post images could exceed plan limit at scale. One high-res avatar per contractor = 5MB * 1000 = 5GB. Post images unbounded.
- Scaling path: Add file size limits (already restricts documents to 10MB per file in UI, but not enforced server-side). Compress images on upload. Archive old posts.

**Auth User Limit:**
- Current capacity: Supabase Auth has no hard limits on free tier, but cost scales with MAU (monthly active users).
- Limit: At scale (10,000+ users), cost could be significant. Plan for auth cost in pricing model.
- Scaling path: Monitor auth billing. Consider self-hosted auth if cost becomes prohibitive, but not recommended for MVP.

## Dependencies at Risk

**Resend Email Service:**
- Risk: Email delivery relies entirely on Resend. No fallback if Resend goes down or rate-limits. Approval/rejection notifications will fail silently.
- Impact: Applicants won't know their status. Admin has no visibility into failed sends.
- Migration plan: Implement retry queue. Add fallback to Sendgrid or AWS SES. Consider storing email state in DB (e.g., `notifications` table with sent/failed status).

**Supabase as Single Source of Truth:**
- Risk: All data (auth, db, storage) lives on Supabase. Vendor lock-in. If Supabase has an outage, entire app is down. No data backup strategy visible.
- Impact: Data loss if bucket/DB is accidentally deleted. No business continuity.
- Migration plan: Implement automated daily backups of Postgres DB. Use Supabase's built-in backups (Pro plan feature). Document disaster recovery playbook.

**Outdated Dependencies:**
- Risk: Some dependencies may have known vulnerabilities. TypeScript version is 5.6.3 (current is 5.9+). Resend is 6.9.3 (check for security updates).
- Impact: Minor, as this is a new app with few dependencies, but should establish a dependency update schedule.
- Migration plan: Run `npm audit` monthly. Use Dependabot or Renovate for automated update PRs.

## Missing Critical Features

**No Test Suite:**
- Problem: Zero tests visible. Application form, admin approval flow, and RLS policies are untested.
- Blocks: Confident refactoring. Safe scaling. Catching regressions.
- Recommendations: Add Jest + Supabase testing library. Target 80%+ coverage on critical paths (auth, approval flow, contact gating).

**No Error Boundary / 500 Page:**
- Problem: No visible error handling at the page level. If a server component crashes, Next.js shows a generic error. No custom error page.
- Blocks: Professional error reporting. Better UX when things fail.
- Fix: Add `error.tsx` files per Next.js convention. Implement Sentry or similar for error tracking.

**No Rate Limiting on API:**
- Problem: `app/api/contact/[id]/route.ts` has no rate limiting. A bot could enumerate all contractor IDs and scrape contact info.
- Blocks: Preventing spam/abuse.
- Fix: Add Vercel's `Ratelimit` middleware or implement custom logic in middleware.

**No Email Verification:**
- Problem: Applications accept any email without verification. An applicant could list someone else's email as their contact.
- Blocks: Verification that the person applying actually owns the email.
- Fix: Send a verification link on application submit. Don't create auth account until email is confirmed.

## Test Coverage Gaps

**Admin Approval Flow:**
- What's not tested: The conversion from application → contractor + certifications + profile. All edge cases (duplicate emails, null user_id, failed profile creation).
- Files: `app/admin/actions.ts`
- Risk: Could silently fail and leave data in inconsistent state. Admin won't know if an "approved" application actually became a contractor.
- Priority: **HIGH** — this is the core business logic.

**RLS Policies:**
- What's not tested: That non-approved contractors cannot see approved contractor contact info. That unapproved users can't view admin pages. That applicants can't modify other applications.
- Files: `supabase/migrations/*.sql`
- Risk: Data leak if RLS is misconfigured.
- Priority: **HIGH** — security critical.

**Search and Filter:**
- What's not tested: Trade/state filters work correctly. Text search returns expected results. Edge cases (no results, special characters).
- Files: `app/contractors/page.tsx`
- Risk: Users can't find contractors they're looking for.
- Priority: **MEDIUM** — functional, not security-critical.

**Storage Upload Paths:**
- What's not tested: That document uploads respect the per-user path restriction. That avatars can be uploaded/updated. That post images work.
- Files: `app/apply/page.tsx`, `app/profile/page.tsx`
- Risk: Could accidentally allow cross-user file access if RLS policy is broken.
- Priority: **MEDIUM** — functional + minor security.

---

*Concerns audit: 2026-03-04*
