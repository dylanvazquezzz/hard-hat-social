# Pitfalls Research

**Domain:** Verified contractor directory — v1.2 Rebrand, ratings, job lifecycle, feed redesign
**Researched:** 2026-03-04
**Confidence:** HIGH (code reviewed directly; codebase-specific findings; external sources verified for new feature areas)

---

## Critical Pitfalls

### Pitfall 1: Domain Rebrand Misses Supabase Auth Site URL — Every Email Link Breaks

**What goes wrong:**
`lib/email.ts` hard-codes the old brand name in the `FROM` address default (`noreply@contractorsconnect.com`) and the `APP_URL` fallback (`https://contractorsconnect.com`). The new domain is `hardhatsocial.net`. After DNS is pointed at the new domain and Vercel is updated, Supabase Auth still has `Site URL` set to the old domain. Password reset links, confirmation emails, and the "Sign In Now" button in approval emails all direct contractors to the old domain or to localhost — a dead link on a real phone.

This is compounded by the fact that `NEXT_PUBLIC_APP_URL` is a `NEXT_PUBLIC_*` variable — baked at build time. If it's changed in Vercel but a redeploy is not triggered, the running app still has the old domain hardcoded in its JS bundle.

**Why it happens:**
Domain changes touch four separate systems (Vercel env vars, Supabase Auth settings, Resend DNS, application code), none of which know about each other. Developers update one or two, test on production, and assume it's fine — then the founding cohort welders receive approval emails that link to a 404.

**How to avoid:**
Complete the rebrand as a single atomic checklist — do not ship the feature until every item is checked:
1. Update `NEXT_PUBLIC_APP_URL` in Vercel to `https://hardhatsocial.net` → trigger a new production build
2. Update Supabase Dashboard → Authentication → URL Configuration: set `Site URL` to `https://hardhatsocial.net`; add `https://hardhatsocial.net/**` to the Redirect URL allowlist
3. Remove `RESEND_FROM_EMAIL` fallback from `email.ts` code — require it via env var, never hard-code a domain
4. Add the new domain to Resend → Domains → start DNS verification at least 48 hours before first email goes out
5. Update `email.ts` `FROM` and `APP_URL` fallbacks to the new brand (or better: remove fallbacks entirely and require env vars)
6. Send a real test approval email to a personal Gmail account after all steps — confirm the link is `hardhatsocial.net` and not spam-foldered

**Warning signs:**
- Approval email "Sign In Now" still says `contractorsconnect.com` after rebrand deploy
- Supabase Auth logs show `redirect_uri_mismatch` for the new domain
- Resend domain shows `Unverified` for `hardhatsocial.net`
- `process.env.NEXT_PUBLIC_APP_URL` returns the old domain in the browser (means env var was updated in Vercel but no redeploy was triggered)

**Phase to address:** Bug Fixes & Rebrand phase — must be verified end-to-end before any real user interacts with the rebranded app.

---

### Pitfall 2: Resend Sender Domain Change Silently Breaks Deliverability

**What goes wrong:**
Resend's SPF/DKIM DNS records are tied to the specific domain they were verified for. Switching from `contractorsconnect.com` to `hardhatsocial.net` requires a full re-verification: add the new domain in Resend, add new DNS TXT records (SPF, DKIM, optionally DMARC) to `hardhatsocial.net`'s DNS, and wait up to 48 hours for propagation.

During that window — and if the developer forgets to complete the verification — emails sent from `noreply@hardhatsocial.net` have no SPF or DKIM authentication. Gmail and Outlook route unauthenticated emails to spam. The founding cohort welders won't see their approval emails. There is no error in the app; Resend's API returns `200 OK` even when the domain is unverified — the email is sent but lands in spam.

**Why it happens:**
DNS verification is an out-of-band step that doesn't block the code from running. There's no exception, no 500, no log line in the app — it just fails silently at the inbox level.

**How to avoid:**
- Start Resend domain verification for `hardhatsocial.net` as the very first rebrand step, even before writing any code, because DNS propagation takes up to 48 hours.
- In Resend dashboard: add domain → copy all DNS records → add to `hardhatsocial.net` registrar → wait for "Verified" status.
- Test with a real Gmail account after verification shows green in Resend dashboard — check both inbox delivery and sender display name.
- Do not retire `contractorsconnect.com` from Resend until `hardhatsocial.net` shows `Verified` and test emails are landing in inbox.

**Warning signs:**
- Resend dashboard shows `hardhatsocial.net` as `Pending` or `Unverified`
- Test emails show "via resend.dev" in Gmail sender line instead of the custom domain
- Founding cohort members report never receiving the approval email

**Phase to address:** Bug Fixes & Rebrand phase — DNS setup must start day one of the milestone, not after code changes are complete.

---

### Pitfall 3: Mutual Ratings Without Verified Job Completion Enable Fake Rating Attacks

**What goes wrong:**
If a contractor can submit a rating for any other contractor without requiring a verified completed job — or if the job verification check is weak (e.g., trusting only a `status = 'completed'` column without verifying both parties agreed) — the rating system becomes gameable from day one. In a small tight-knit community like a regional welding network, one bad actor can tank a competitor's rating or inflate their own by coordinating with friends.

Worse, mutual ratings that are revealed immediately (rather than simultaneously after both parties submit) create retaliation pressure: the first reviewer gives 5 stars expecting the same back, and if they don't get it, they edit or feel social pressure to retaliate through other channels.

Research on two-sided review systems (Airbnb's double-blind experiment) shows that simultaneous revelation — hiding ratings until both parties submit — reduces retaliation and produces more honest ratings. Without it, you get rating inflation where almost everyone rates 5/5 due to social pressure, making the signal meaningless.

**Why it happens:**
Developers implement the data model first (ratings table with `from_contractor_id`, `to_contractor_id`, `job_id`, `score`) and add the business logic constraints as an afterthought. The constraint "a rating may only be submitted after job_status = completed AND both parties agreed on completion" is easy to skip in a first pass.

**How to avoid:**
- Enforce at the database level: rating INSERT must be blocked by a CHECK or trigger unless the referenced `job_id` has `status = 'completed'` and both the GC and sub are parties to that job. Do not trust this to application logic alone.
- Implement blind submission: ratings are written to the DB but a `revealed` boolean is `false` until both parties have submitted their rating for that job. A cron job or Supabase Edge Function flips `revealed = true` once both sides exist (or after a 14-day window regardless).
- One rating per direction per job: enforce with a UNIQUE constraint on `(from_contractor_id, to_contractor_id, job_id)`.
- No editing after reveal: add `created_at` and make the row immutable after insert (RLS UPDATE policy: `false`).
- For MVP, accept that the rating system will have a small N (under 50 ratings total) and prioritize correctness over complexity — a simple 5-star with an optional text comment is sufficient; do not overbuild.

**Warning signs:**
- Two contractors who have never worked together have ratings between each other
- A contractor's rating jumps by a full star in a single day
- The ratings table has no UNIQUE constraint on `(from_contractor_id, to_contractor_id, job_id)`
- Ratings are visible immediately after one party submits (before the other side has responded)

**Phase to address:** Ratings System phase — data model and constraints must be designed before any UI is built.

---

### Pitfall 4: Job State Machine Has No Enforcement — States Can Be Skipped or Regressed

**What goes wrong:**
A job lifecycle (e.g., `open → hired → completed`) looks simple in a schema column but breaks badly without transition enforcement. Without a database-level CHECK or trigger, any update can set `status` to any value regardless of current state:
- A GC can mark a job `completed` without ever setting `hired` — the contractor never knew they were hired
- A sub can reopen a `completed` job to prevent a bad rating from unlocking
- An application bug can set `status = 'open'` on a completed job, wiping the portfolio entry

In a small contractor network where trust is the product, a job that disappears from "completed" after a contractor counts on it for their portfolio is a trust-destroying event.

**Why it happens:**
Postgres enforces column types and foreign keys but does not natively enforce state transition rules. Developers add a `status TEXT CHECK (status IN ('open','hired','completed'))` column, which validates values but not transitions. The transition logic gets put in the Next.js Server Action, where it's easy to accidentally bypass (e.g., an admin action that sets `status` directly, or a future developer who doesn't know the rules).

**How to avoid:**
- Enforce valid transitions in Postgres with a trigger that blocks invalid transitions:
  ```sql
  -- Only allow: open→hired, hired→completed; never backwards
  CREATE OR REPLACE FUNCTION enforce_job_status_transition()
  RETURNS TRIGGER AS $$
  BEGIN
    IF OLD.status = 'hired' AND NEW.status = 'open' THEN
      RAISE EXCEPTION 'Cannot reopen a hired job';
    END IF;
    IF OLD.status = 'completed' THEN
      RAISE EXCEPTION 'Cannot change status of a completed job';
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  ```
- Store transition timestamps separately (`hired_at`, `completed_at`) — this gives an audit trail and feeds the portfolio display accurately.
- RLS: only the GC who posted the job can transition `open → hired`; only the GC can mark `hired → completed`; the sub cannot change job status.
- Do not let rating submission act as implicit job completion — keep them decoupled.

**Warning signs:**
- `jobs` table has `status TEXT` but no trigger enforcing transitions
- An admin can set `status = 'open'` on a completed job via the Supabase dashboard (no trigger blocks it)
- The rating submission endpoint does not verify `job.status = 'completed'` before allowing insert

**Phase to address:** Jobs System phase — state machine must be enforced before the UI is built on top of it.

---

### Pitfall 5: Feed Sidebar Forced into a Client Component — Kills Server Rendering for the Whole Page

**What goes wrong:**
Adding a "Suggested Connections" sidebar to the explore feed requires per-user data (which contractors the current user has not yet connected with). The natural impulse is to mark the page or layout as `'use client'` to access the Supabase session. Once `'use client'` propagates to the layout containing the sidebar, the entire explore page — including the main feed — becomes a client component. Server rendering is lost, the page hydrates fully on the client, and performance degrades on mobile (tradespeople on slow connections).

In Next.js App Router, `'use client'` is inherited by every component in the import tree below the directive. One misplaced directive at the layout level can silently degrade the entire page's performance.

**Why it happens:**
The sidebar needs auth context (current user ID) to query "contractors you haven't connected with." The easiest way to get auth context in a component is `supabase.auth.getUser()` in a useEffect — which requires `'use client'`. Developers add the directive to the nearest wrapper and don't realize it propagates upward through the import tree, pulling the feed into client territory.

**How to avoid:**
- Keep the feed server-rendered. Pass the current user's ID to the sidebar as a prop from the server component (read session server-side with `createServerClient` or equivalent).
- Isolate the sidebar into a narrow `'use client'` component that receives `userId` as a prop and fetches suggested connections client-side — this limits the client boundary to just the sidebar.
- Pattern: `page.tsx` (server) → reads session → renders `<FeedLayout posts={posts} userId={userId} />` (server) → renders `<PostList>` (server) + `<SuggestionsSidebar userId={userId} />` (client boundary at sidebar only).
- Test with the React DevTools "Highlight client components" toggle — the feed posts should not be highlighted.

**Warning signs:**
- `'use client'` appears in `explore/page.tsx` or `explore/layout.tsx`
- The explore page shows no initial HTML in view-source (page is fully client-rendered)
- Lighthouse shows a high Total Blocking Time on the explore page on mobile

**Phase to address:** Feed Redesign phase — design component boundaries before building the sidebar.

---

### Pitfall 6: New `ratings` and `jobs` Tables Created Without RLS — Data Exposed by Default

**What goes wrong:**
Every new Postgres table created in Supabase's `public` schema is accessible via the PostgREST API with the anon key unless RLS is enabled and policies are defined. If `ratings` or `jobs` tables are created via a migration that enables RLS (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`) but no policies are added yet, the default behavior is "deny all" — which sounds safe but breaks server actions that use the service role client (which bypasses RLS). If a developer creates the table with RLS disabled to "get it working first," the table is wide open to any unauthenticated request.

The reverse also happens: tables are created with overly permissive policies (`USING (true)`) as a placeholder during development, and those policies are never tightened before production.

**Why it happens:**
RLS policies are easy to defer. The developer creates the table, writes the server action (which uses the admin client and bypasses RLS), tests that it works, and never comes back to add proper user-facing policies because the server action path was tested but the direct API path was not.

**How to avoid:**
- Every migration that creates a new table must also: `ENABLE ROW LEVEL SECURITY` and add at minimum a restrictive default policy.
- For `jobs`: GC can INSERT their own jobs; all approved contractors can SELECT open jobs; only the GC can UPDATE status of their own jobs.
- For `ratings`: any approved contractor can SELECT ratings where `revealed = true`; only the rating author can INSERT; no UPDATE after insert (policy: `false`).
- Test the anon key path explicitly: use a Supabase REST call with the anon key to confirm it cannot read unintended data.

**Warning signs:**
- A new migration creates a table but has no `CREATE POLICY` statements
- `SELECT * FROM jobs` with the anon key returns rows
- `SELECT * FROM ratings` with the anon key returns unrevealed ratings

**Phase to address:** Jobs System phase and Ratings System phase — RLS must be part of the same migration as the table creation, not a follow-up.

---

### Pitfall 7: Existing Bug Fixes Touch Auth State — Easy to Break Password Reset or Approval Flow

**What goes wrong:**
The v1.2 milestone starts with bug fixes: admin nav link, email URLs pointing to localhost, contractor not appearing post-approval, certs not showing. Several of these bugs are in `actions.ts` (approval flow) and `email.ts` (URL generation). When fixing these, it is easy to accidentally introduce a regression in the password reset flow or break the user_id linking logic in `approveApplication()`.

Specifically, `approveApplication()` has a multi-step sequence: look up application → resolve user_id → insert contractor → insert certifications → upsert profile → update application status → send email. If a bug fix modifies the early steps (e.g., changing how user_id is resolved), the later steps can receive wrong data silently — a contractor row is created without a user_id link, and the contractor never appears as "their own profile" after login.

**Why it happens:**
The approval flow is a sequential chain of Supabase operations with no transaction — each step can succeed while later steps fail, and the function continues regardless (no early returns on most failures). Bug fixes in one step can invalidate assumptions in later steps without any runtime error.

**How to avoid:**
- Wrap the approval flow in a Postgres transaction (via a single RPC call or by using `supabase.rpc()`) so that partial failures roll back cleanly rather than leaving orphaned rows.
- Add explicit error checks after each step in `approveApplication()` — if the contractor INSERT fails, do not proceed to insert certifications or send the email.
- After any bug fix in `actions.ts` or `email.ts`, run a full end-to-end test: submit a test application, approve it, verify the contractor appears in the directory, verify certifications show on the profile, verify the email arrives with the correct domain.
- Never modify `approveApplication()` without a regression test plan.

**Warning signs:**
- Approval action succeeds (no error in admin UI) but the contractor does not appear in the directory
- Certifications table has orphaned rows pointing to non-existent contractor IDs
- Approval email arrives but links to `localhost:3000`

**Phase to address:** Bug Fixes & Rebrand phase — this is the first phase; regression testing is the exit gate.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| No `import 'server-only'` in `supabase-admin.ts` | Saves one line | Service role key leaks into JS bundle if accidentally imported in a client component; no build-time warning | Never acceptable — add immediately |
| `FROM` address and `APP_URL` hard-coded as fallbacks in `email.ts` | Works without env vars in dev | After rebrand, old domain remains in code; forgetting to update env var silently sends from wrong domain | Acceptable only in dev; require env vars in production |
| Job status enforced only in application code (Server Action), not in database | Faster initial build | Any future code path (admin action, Edge Function, direct SQL) can bypass the transition rules | Never acceptable for a trust-critical system — enforce in DB with a trigger |
| Ratings revealed immediately after one party submits | Simpler implementation | Retaliation pressure; rating inflation; signal becomes meaningless within 6 months | Never — implement blind submission from day one, even if the reveal window is only 7 days |
| No UNIQUE constraint on `(from_contractor_id, to_contractor_id, job_id)` in ratings | Faster migration | Duplicate ratings allowed; averages become meaningless | Never — add the constraint in the same migration as the table |
| Username derived from email prefix on approval | Avoids extra UX step | Duplicate usernames if two applicants share an email prefix (e.g., `j.smith@gmail.com` and `j.smith@yahoo.com`) | Acceptable for MVP founding cohort; fix before scaled onboarding |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase Auth + new domain | Updating `NEXT_PUBLIC_APP_URL` without updating Supabase `Site URL` → Auth emails still link to old domain | Update both in a single checklist; Supabase `Site URL` is in Dashboard → Auth → URL Configuration |
| Resend + domain rebrand | Sending from `hardhatsocial.net` before DNS records are verified → spam folder, no error in app | Verify new domain in Resend dashboard first; do not change `RESEND_FROM_EMAIL` until Resend shows `Verified` |
| Supabase Auth + password reset | `resetPasswordForEmail()` without `redirectTo` → Supabase uses `Site URL`, which may still be the old domain during a transition | Always pass `redirectTo` explicitly; do not rely on the `Site URL` fallback |
| Next.js App Router + sidebar | Marking the feed page `'use client'` to support sidebar auth needs → entire feed loses server rendering | Read session server-side in `page.tsx`; pass userId as prop to a narrow `'use client'` sidebar component |
| Supabase RLS + new tables | Creating `jobs`/`ratings` tables without immediately writing RLS policies → table open to anon key | Every migration that creates a table must include `ENABLE ROW LEVEL SECURITY` and at least one policy in the same file |
| Postgres + job state machine | Relying on Server Action to enforce state transitions → admin Supabase dashboard or a future code path bypasses it | Add a `BEFORE UPDATE` trigger in the migration to reject invalid transitions at the DB level |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Feed page fetches all posts with no cursor-based pagination | Explore page slows as post count grows; all post data loaded on first visit | Use `range()` pagination from day one; 20 posts per page is sufficient for MVP | Noticeable at 200+ posts; severe at 1,000+ |
| Sidebar "suggested connections" runs a full `NOT IN` query against the contractors table on every page load | Sidebar is slow; extra DB round-trip blocks page render | Cache the suggestion list per user (5-minute TTL) or limit to top-10 by `created_at DESC`; do not re-query on every feed scroll | Fine at 50 contractors; slow at 500+ |
| Ratings aggregate (average score) computed on-the-fly with `AVG()` per profile page load | Profile pages are slow when a contractor has many ratings | Store a denormalized `avg_rating` and `rating_count` column on `contractors`; update via trigger or after each rating insert | Fine at 50 ratings; noticeable at 500+ |
| Full-text search GIN index not used when sidebar and feed queries run simultaneously | DB CPU spikes during explore page loads | Keep sidebar and feed as separate queries; do not join them in a single complex query | Fine at current scale |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Rating INSERT allowed for any authenticated user without verifying job participation | Contractor A rates Contractor B with no shared job | RLS policy on ratings: `EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND (gc_id = auth.uid() OR sub_id = auth.uid()))` |
| Job status updatable by anyone with an authenticated session | A sub marks their own job completed to unlock a rating before the GC agrees | RLS: only the job creator (GC) can UPDATE job status; sub can only view |
| `hardhatsocial.net` added to Supabase redirect allowlist but old domain `contractorsconnect.com` left in the allowlist indefinitely | If the old domain is ever squatted by a bad actor, Supabase Auth would happily redirect auth tokens there | After rebrand is fully live, remove old domain from Supabase redirect allowlist |
| Service role key used without `server-only` import guard | Key could leak into client bundle if `supabase-admin.ts` imported in a client component | Add `import 'server-only'` as first line in `supabase-admin.ts` — causes build error if misused |
| Ratings with `revealed = false` exposed by an overly permissive SELECT policy | Contractor can read what the other party wrote before they submit their own rating, enabling strategic retaliation | RLS SELECT policy on ratings: `WHERE revealed = true` — never return unrevealed rows to non-admin users |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Rating prompt appears immediately after job is marked completed | Contractors don't remember enough detail to rate accurately if they rate in the same session | Show the rating prompt 24 hours after job completion (use `completed_at` timestamp); send a Resend email reminder with a direct link |
| Rating is a simple 1-5 star with no guidance | Tradespeople don't know what they're rating — professionalism? quality of work? punctuality? | Add 2-3 specific dimensions (e.g., "Quality of Work", "Communication", "Would Hire Again") — keeps ratings actionable and harder to game |
| Feed sidebar shows all contractors including ones the user is already connected to | Noise; suggestions feel random | Filter sidebar suggestions by trade proximity and exclude contractors the user has already contacted (track via a `connections` or `job` relationship) |
| Rebrand color change ships without mobile testing | Industrial workers read phones in bright sunlight; lighter blue + white may be low contrast | Test color scheme on an actual phone outdoors or use a contrast checker (WCAG AA minimum); amber/yellow accents must pass 4.5:1 contrast ratio against white background |
| Empty state on jobs board when no open jobs exist | Contractors land on an empty board and assume the platform is dead | Show "No open jobs right now — check back soon" with a clear CTA to post a subcontracting opportunity |

---

## "Looks Done But Isn't" Checklist

- [ ] **Domain rebrand:** Verify all 4 systems updated — Vercel `NEXT_PUBLIC_APP_URL`, Supabase `Site URL`, Resend verified domain, `email.ts` fallback constants. Send a real test email to confirm.
- [ ] **Email links post-rebrand:** Trigger a real approval and a real rejection from the admin queue on production and confirm emails arrive at the correct domain with no spam-foldering.
- [ ] **Supabase Auth redirect allowlist:** Confirm `https://hardhatsocial.net/**` is in the allowlist AND `localhost:3000/**` is still there for local dev. Do not break local development during rebrand.
- [ ] **Job state machine triggers:** After adding the `jobs` table, confirm that a direct `UPDATE jobs SET status = 'open' WHERE status = 'completed'` via the Supabase dashboard SQL editor is rejected by the trigger.
- [ ] **Ratings blind submission:** After both parties submit ratings for a job, confirm that the ratings table's `revealed` column flips to `true` and both ratings become visible simultaneously. Confirm that before both submit, neither party can read the other's rating via the API.
- [ ] **RLS on new tables:** Confirm that a request with the anon key to `GET /rest/v1/ratings` returns zero rows (not all rows, not an error). Same check for `jobs`.
- [ ] **Feed sidebar client boundary:** Inspect the explore page in React DevTools — the post list should NOT be highlighted as a client component. Only the sidebar should be client-rendered.
- [ ] **Portfolio from completed jobs:** After marking a job `completed`, confirm the job appears under the sub-contractor's profile as a portfolio entry. Confirm it disappears if status is never reached `completed`.
- [ ] **Bug fixes regression:** After fixing the "contractor not appearing post-approval" bug, approve a test application end-to-end and verify the contractor appears in the directory, certs show on the profile, and the admin queue correctly shows the updated status.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Rebrand with old domain still in Supabase Site URL | LOW | Update Site URL in Supabase dashboard → instant, no redeploy |
| Resend domain unverified for new domain (emails in spam) | MEDIUM | Add DNS records, wait up to 48 hours. Manually notify affected users via phone/text. |
| Old domain left in Supabase redirect allowlist after rebrand | LOW | Remove from dashboard → instant |
| Ratings table with no blind submission (ratings already written as visible) | HIGH | Requires schema migration (add `revealed` column, set all existing to `true`), plus application logic change. Trust damage from early retaliatory ratings is not technically recoverable. |
| Job status regressed (completed → open) by a bug | MEDIUM | Add DB trigger to block future regressions; manually restore correct status for affected rows; audit who changed what via Supabase logs if available |
| `use client` propagated to feed page (full page client-rendered) | LOW | Refactor sidebar into isolated client component, move directive down. No data loss, but requires careful component restructuring. |
| New table created without RLS (data exposed) | MEDIUM | `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + add policies. If the anon key was used to access data before the fix, audit what was exposed and notify affected users. |
| `approveApplication()` bug creates contractor row with no user_id | MEDIUM | Manually link `user_id` in Supabase dashboard for affected rows; fix the root cause; re-run end-to-end approval test |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Domain rebrand misses Supabase Site URL | Bug Fixes & Rebrand | Send real test email on production; confirm link is `hardhatsocial.net` |
| Resend domain unverified for new domain | Bug Fixes & Rebrand (start DNS day 1) | Resend dashboard shows `Verified`; test email not spam-foldered |
| Mutual ratings without verified job completion | Ratings System | Attempt to rate a contractor with no shared completed job — confirm RLS blocks insert |
| Ratings revealed immediately (no blind submission) | Ratings System | Submit one side of a rating; confirm the other party cannot read it until they also submit |
| Job state machine has no DB enforcement | Jobs System | Run `UPDATE jobs SET status = 'open'` on a completed job via Supabase SQL editor — confirm trigger rejects it |
| New tables without RLS | Jobs System / Ratings System | Anon key GET request returns no data for `jobs` and `ratings` |
| Feed sidebar forces full page client rendering | Feed Redesign | React DevTools: post list is server component; only sidebar is highlighted as client |
| Bug fixes break approval flow | Bug Fixes & Rebrand | End-to-end: submit test application → approve → verify contractor appears in directory → verify certs show on profile |
| Old domain in Supabase redirect allowlist after rebrand | Bug Fixes & Rebrand (cleanup step) | After new domain is live, remove old domain from allowlist; verify new domain still works |
| Ratings aggregate computed on-the-fly | Ratings System | Profile page load time on a contractor with 50+ ratings stays under 500ms |

---

## Sources

- Supabase Auth Redirect URLs: https://supabase.com/docs/guides/auth/redirect-urls
- Supabase Custom Domains (Auth impact): https://supabase.com/docs/guides/platform/custom-domains
- Supabase Email Templates and Site URL variables: https://supabase.com/docs/guides/auth/auth-email-templates
- Supabase RLS documentation: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase RLS troubleshooting (service role key): https://supabase.com/docs/guides/troubleshooting/why-is-my-service-role-key-client-getting-rls-errors-or-not-returning-data-7_1K9z
- Resend domain management: https://resend.com/docs/dashboard/domains/introduction
- Resend email authentication guide: https://resend.com/blog/email-authentication-a-developers-guide
- Vercel environment variables: https://vercel.com/docs/environment-variables
- Next.js common App Router mistakes (Vercel): https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them
- Next.js hydration errors and client boundary propagation: https://medium.com/@blogs-world/next-js-hydration-errors-in-2026-the-real-causes-fixes-and-prevention-checklist-4a8304d53702
- React Server Components performance pitfalls: https://blog.logrocket.com/react-server-components-performance-mistakes
- Mutual review system research (Airbnb blind reveal experiment): https://pubsonline.informs.org/doi/10.1287/mksc.2021.1311
- Two-sided reputation systems (tit-for-tat / retaliation): https://andreyfradkin.com/assets/mir_titfortat.pdf
- Double-blind reviews in marketplaces (Sharetribe glossary): https://www.sharetribe.com/marketplace-glossary/double-blind-reviews/
- Postgres state machine enforcement: https://blog.lawrencejones.dev/state-machines/
- Implementing state machines in PostgreSQL: https://felixge.de/2017/07/27/implementing-state-machines-in-postgresql/
- Code review: `/lib/email.ts`, `/app/admin/actions.ts`, `/app/api/contact/[id]/route.ts`, `/lib/supabase-admin.ts`, `/supabase/migrations/*.sql`

---
*Pitfalls research for: Contractors Connect v1.2 — domain rebrand, mutual ratings, job lifecycle, feed redesign*
*Researched: 2026-03-04*
