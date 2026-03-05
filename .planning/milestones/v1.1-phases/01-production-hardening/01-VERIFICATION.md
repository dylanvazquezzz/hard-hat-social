---
phase: 01-production-hardening
verified: 2026-03-02T00:00:00Z
status: human_needed
score: 2/4 requirements fully verifiable in codebase; 2/4 require human dashboard confirmation
re_verification: false
human_verification:
  - test: "Send a test approval email from /admin to a personal Gmail account"
    expected: "Email lands in inbox (not spam). Resend dashboard shows domain status as Verified."
    why_human: "PROD-01 requires DNS propagation of SPF/DKIM records — cannot verify DNS records or email deliverability programmatically without access to the Resend dashboard and a live email send."
  - test: "Request a password reset from https://contractors-connect.vercel.app/auth and click the link in the received email on a real device"
    expected: "Link opens https://contractors-connect.vercel.app/auth/update-password — not localhost:3000."
    why_human: "PROD-02 is a Supabase dashboard-only setting (Authentication > URL Configuration > Site URL). There is no env var or SQL migration that controls this. Cannot verify the production Supabase project Site URL setting without dashboard access."
---

# Phase 1: Production Hardening — Verification Report

**Phase Goal:** The production deployment is correctly configured so that emails land in inboxes, auth links work, storage uploads succeed, and the service role key cannot leak into client bundles.
**Verified:** 2026-03-02
**Status:** HUMAN NEEDED — 2 of 4 requirements verified in codebase; 2 require human dashboard confirmation
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | A test approval email sent to personal Gmail lands in inbox, not spam (Resend domain verified) | ? UNCERTAIN | DEPLOYMENT-CHECKLIST.md documents exact SPF/DKIM/DMARC DNS steps; cannot verify DNS propagation or Resend dashboard status programmatically |
| 2 | Clicking a password reset email link on a real device opens correct update-password page (not localhost) | ? UNCERTAIN | DEPLOYMENT-CHECKLIST.md documents Supabase Auth > URL Configuration > Site URL step; this is a dashboard-only setting — no code artifact to verify |
| 3 | Authenticated user can upload to `avatars`/`post-images`; `application-docs` enforces per-user folder restriction | VERIFIED | `supabase/migrations/007_storage_policies.sql` exists with correct CREATE POLICY for all three buckets; strict `storage.foldername` path check confirmed; `apply/page.tsx` uses `uploadUserId` in upload path (not `appData.id`) |
| 4 | `npm run build` fails if a client component imports `lib/supabase-admin.ts` or `lib/email.ts` | VERIFIED | `import 'server-only'` is line 1 of both files; `server-only@^0.0.1` in package.json; no client component (`'use client'`) imports either lib; server-action `app/admin/actions.ts` uses `'use server'` before importing both libs |

**Score:** 2/4 truths verifiable in codebase as fully implemented; 2/4 require human execution of external service steps

---

## Required Artifacts

### Plan 01-01 Artifacts (PROD-04)

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `lib/supabase-admin.ts` | Service role Supabase client — server-only guarded | VERIFIED | Line 1: `import 'server-only'`. Full implementation confirmed (createClient with SERVICE_ROLE_KEY). Commit `078c943`. |
| `lib/email.ts` | Resend email functions — server-only guarded | VERIFIED | Line 1: `import 'server-only'`. Full implementation confirmed (sendApprovalEmail, sendRejectionEmail). Commit `078c943`. |
| `package.json` (server-only dependency) | `server-only` package installed | VERIFIED | `"server-only": "^0.0.1"` present in dependencies. |

### Plan 01-02 Artifacts (PROD-03)

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/007_storage_policies.sql` | Storage RLS policies for avatars, post-images, application-docs | VERIFIED | File exists. 2x DROP POLICY IF EXISTS (old 006 policies). avatars: public read + authenticated INSERT + UPDATE. post-images: public read + authenticated INSERT. application-docs: public read + strict per-user INSERT with `storage.foldername` check. Commit `796e494`. |
| `app/apply/page.tsx` | Upload path uses `uploadUserId` (not `appData.id`) | VERIFIED | `uploadUserId` declared and used in storage path on line 189. `appData.id` only appears in DB `.eq('id', appData.id)` update query (correct). Session fallback for returning users implemented. Commit `c33f4c5`. |

### Plan 01-03 Artifacts (PROD-01, PROD-02)

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `.planning/phases/01-production-hardening/DEPLOYMENT-CHECKLIST.md` | Step-by-step manual configuration checklist | VERIFIED | File exists. Contains: Step 1 (Resend — SPF, DKIM, DMARC DNS records with exact navigation path), Step 2 (Supabase Auth Site URL — exact dashboard path + production URL + localhost redirect preservation), Step 3 (migration 007 push — CLI and SQL editor options), Step 4 (env var spot-check), Step 5 (git push). Commit `50a0f6f`. |

---

## Key Link Verification

### Plan 01-01 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `lib/supabase-admin.ts` | Next.js build graph | `import 'server-only'` — side-effect import | WIRED | `import 'server-only'` confirmed as line 1. No client component (`'use client'`) imports this file. All 10 usages are in server components or server actions. |
| `lib/email.ts` | Next.js build graph | `import 'server-only'` — side-effect import | WIRED | `import 'server-only'` confirmed as line 1. Only importer is `app/admin/actions.ts` which has `'use server'` directive as line 1. |

### Plan 01-02 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `app/apply/page.tsx` | `storage.objects` RLS policy | Upload path prefix = `auth.uid()` via `uploadUserId` | WIRED | Path built as `` `${uploadUserId}/...` `` at line 189. Session fallback resolves `uploadUserId` from `supabase.auth.getSession()` when `signUpData.user.id` is null. Matches migration 007 policy check `(storage.foldername(name))[1] = auth.uid()::text`. |
| `supabase/migrations/007_storage_policies.sql` | `storage.objects` | `CREATE POLICY` with `storage.foldername` | WIRED | Migration SQL uses `(storage.foldername(name))[1] = (SELECT auth.uid()::text)`. 8 total CREATE POLICY statements covering all three buckets. 2 DROP POLICY IF EXISTS for old 006 policies. |

### Plan 01-03 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `DEPLOYMENT-CHECKLIST.md` | Resend dashboard | Domain verification — SPF + DKIM DNS records | ? UNCERTAIN | Checklist contains exact instructions (SPF TXT, DKIM TXT on `resend._domainkey.*`, DMARC). Cannot verify whether DNS records were actually added or domain status is Verified in Resend dashboard. |
| `DEPLOYMENT-CHECKLIST.md` | Supabase dashboard | Authentication > URL Configuration > Site URL | ? UNCERTAIN | Checklist contains exact instructions and production URL (`https://contractors-connect.vercel.app`). Cannot verify whether Supabase project Site URL was actually updated — it is a dashboard-only setting. |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| PROD-04 | 01-01-PLAN.md | `lib/supabase-admin.ts` protected with `server-only` to prevent service role key leaking into client bundles | SATISFIED | `import 'server-only'` is line 1 of `lib/supabase-admin.ts`; `import 'server-only'` is line 1 of `lib/email.ts` (plan also covers `lib/email.ts`); package installed; no client component imports either file |
| PROD-03 | 01-02-PLAN.md | Supabase storage bucket write policies verified — authenticated users can upload to `avatars` and `post-images`; `application-docs` restricted to applicant's own folder | SATISFIED (code-level) | Migration 007 SQL is correct and complete; `apply/page.tsx` upload path fixed; migration is ready to apply to production — actual runtime behavior requires migration to be run (Step 3 of checklist) |
| PROD-01 | 01-03-PLAN.md | Resend domain is verified (SPF + DKIM DNS records set) so approval/rejection emails land in inbox, not spam | NEEDS HUMAN | Checklist documents exact steps; human must execute in Resend dashboard and confirm Verified status |
| PROD-02 | 01-03-PLAN.md | Supabase Auth Site URL updated to production URL so password reset and approval email links work correctly | NEEDS HUMAN | Checklist documents exact steps; human must execute in Supabase dashboard — this is a dashboard-only setting |

**Orphaned requirements check:** REQUIREMENTS.md maps PROD-01, PROD-02, PROD-03, PROD-04 to Phase 1. All four are claimed in plan frontmatter (01-01: PROD-04; 01-02: PROD-03; 01-03: PROD-01, PROD-02). No orphaned requirements.

**Note on REQUIREMENTS.md traceability table:** The traceability table in REQUIREMENTS.md still shows `Pending` status for all four PROD requirements (the table was not updated after phase completion). The requirement text (above the table) shows `[x]` checked for all four. The `[x]` markers reflect human confirmation from the plan 01-03 checkpoint; the traceability table is a documentation inconsistency, not a code issue.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | — | — | — | No anti-patterns detected in `lib/supabase-admin.ts`, `lib/email.ts`, `supabase/migrations/007_storage_policies.sql`, or `app/apply/page.tsx` |

No TODO, FIXME, PLACEHOLDER, empty implementations, or console.log-only implementations found in any phase-modified file.

---

## Human Verification Required

### 1. Resend Domain Verification (PROD-01)

**Test:** Log into the Resend dashboard at https://resend.com/domains and confirm the sending domain (`contractorsconnect.com` or the value of `RESEND_FROM_EMAIL` env var in Vercel) shows status `Verified`. Then send a test approval from `/admin` to a personal Gmail or Outlook address.
**Expected:** Email lands in inbox (not spam/junk). Resend dashboard shows `Verified` on the domain.
**Why human:** DNS propagation (SPF + DKIM records) is an external service configuration that takes up to 48 hours. There is no API or codebase artifact that confirms whether the records were added or whether Resend has verified them.

### 2. Supabase Auth Site URL Configuration (PROD-02)

**Test:** Log into Supabase dashboard, navigate to your project > Authentication > URL Configuration. Verify Site URL is set to `https://contractors-connect.vercel.app`. Then from the production site, request a password reset email and click the link on a real device (not localhost).
**Expected:** The link in the email opens `https://contractors-connect.vercel.app/auth/update-password`, not a localhost URL.
**Why human:** Supabase Auth Site URL is a dashboard-only setting — it cannot be set via SQL migration, env var, or any code artifact. The DEPLOYMENT-CHECKLIST.md documents the steps, but only a human can confirm the setting was applied in the actual Supabase project.

### 3. Storage Upload Live Test (PROD-03 runtime verification)

**Test:** After running migration 007 against production Supabase (DEPLOYMENT-CHECKLIST.md Step 3), upload an avatar from `/profile` and upload a post image from `/explore`. Then submit an application with a credential document attached.
**Expected:** Avatar upload succeeds; post image upload succeeds; credential document upload succeeds and path in Supabase Storage is prefixed with the user's UUID (not the application row UUID).
**Why human:** The migration SQL is correct and verifiable in the codebase, but it must actually be applied to the production Supabase project before uploads work. Migration execution is a human step (CLI or Supabase SQL editor). Runtime upload behavior requires live testing with an authenticated session.

---

## Gaps Summary

No code-level gaps found. All code artifacts are substantive, correctly implemented, and properly wired:

- `lib/supabase-admin.ts` and `lib/email.ts` have `import 'server-only'` as their first line
- `server-only` package is in `package.json`
- No client component imports either guarded file
- Migration `007_storage_policies.sql` is complete with correct DROP/CREATE POLICY statements and strict per-user path restriction
- `apply/page.tsx` uses `uploadUserId` (auth.uid()) in the upload path with proper fallback for returning users
- `DEPLOYMENT-CHECKLIST.md` is complete with actionable steps for PROD-01 and PROD-02

The two outstanding items (PROD-01, PROD-02) are external service configuration steps that require human execution in the Resend and Supabase dashboards. The checklist exists and is actionable — the phase goal is blocked only by human execution of these dashboard steps, not by missing or broken code.

---

_Verified: 2026-03-02_
_Verifier: Claude (gsd-verifier)_
