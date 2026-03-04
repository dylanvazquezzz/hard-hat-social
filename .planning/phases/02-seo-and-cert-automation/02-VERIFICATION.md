---
phase: 02-seo-and-cert-automation
verified: 2026-03-03T00:00:00Z
status: passed
score: 12/12 must-haves verified
re_verification: false
---

# Phase 2: SEO and Cert Automation — Verification Report

**Phase Goal:** Improve search engine discoverability of contractor profiles, enforce access control for pending applicants, and automate certification record creation on approval.
**Verified:** 2026-03-03
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | Contractor profile link previews show the contractor name, trade, and image | VERIFIED | `generateMetadata` in `app/contractors/[id]/page.tsx` lines 15-49 builds `title`, `openGraph.images` from `full_name`, `trade`, and `profile_photo_url`; falls back to `/og-default.png` |
| 2  | Public profile link previews show the username and image | VERIFIED | `generateMetadata` in `app/u/[username]/page.tsx` lines 15-46 builds `title` as `@{username}`, `openGraph.images` from `avatar_url`; falls back to `/og-default.png` |
| 3  | Page source of /contractors/[id] contains a JSON-LD script block with Person schema | VERIFIED | `app/contractors/[id]/page.tsx` lines 70-88: `jsonLd` object with `'@type': 'Person'` rendered via `<script type="application/ld+json" dangerouslySetInnerHTML>` |
| 4  | OG image meta tags contain absolute URLs (not relative paths) | VERIFIED | `app/layout.tsx` line 6: `metadataBase: new URL('https://contractors-connect.vercel.app')` — Next.js resolves all relative paths like `/og-default.png` to absolute URLs automatically |
| 5  | A pending applicant navigating to /contractors sees an Application Under Review message | VERIFIED | `app/contractors/layout.tsx` lines 36-47: queries `applications` table with `.eq('status', 'pending').maybeSingle()`, returns `<PendingReviewMessage />` when `app` is truthy |
| 6  | A pending applicant navigating to /jobs sees an Application Under Review message | VERIFIED | `app/jobs/layout.tsx` lines 36-47: identical pending check pattern, returns `<PendingReviewMessage />` |
| 7  | A pending applicant navigating to /profile sees an Application Under Review message | VERIFIED | `app/profile/page.tsx` lines 56-67, 246-263: `isPending` state set after `maybeSingle()` check, renders inline pending message before full dashboard |
| 8  | A pending applicant navigating to /explore sees the full content with no restriction | VERIFIED | `app/explore/` directory has no `layout.tsx` — explore is completely ungated |
| 9  | A user with no application at all has unrestricted access to all pages | VERIFIED | `maybeSingle()` returns `null` when no row exists — `setStatus('ok')` / `setIsPending(false)` — no false positives |
| 10 | After approving an application with uploaded documents, the certifications table has at least one row for the new contractor | VERIFIED | `app/admin/actions.ts` lines 52-61: maps `document_urls` array to cert records and inserts via `admin.from('certifications').insert(certRecords)` |
| 11 | Each certification row has verified set to true and a valid contractor_id | VERIFIED | `app/admin/actions.ts` lines 53-59: each record explicitly sets `verified: true` and `contractor_id: newContractorData.id` from `.select('id').single()` result |
| 12 | Approving an application with no uploaded documents succeeds without error | VERIFIED | `app/admin/actions.ts` line 52: guard `if (newContractorData && application.document_urls && application.document_urls.length > 0)` skips cert insert when no docs present |

**Score:** 12/12 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app/layout.tsx` | `metadataBase` pointing to production URL | VERIFIED | Line 6: `metadataBase: new URL('https://contractors-connect.vercel.app')` |
| `app/contractors/[id]/page.tsx` | `generateMetadata` export and JSON-LD `<script>` tag | VERIFIED | Lines 15-49 (`generateMetadata`), lines 70-88 (JSON-LD) — both present and substantive |
| `app/u/[username]/page.tsx` | `generateMetadata` export | VERIFIED | Lines 15-46 — present, queries `profiles` table, returns `title`, `openGraph`, `twitter` |
| `public/og-default.png` | Branded OG fallback image 1200x630 | VERIFIED | File exists (11,313 bytes), `file` command confirms: `PNG image data, 1200 x 630, 8-bit/color RGB, non-interlaced` |
| `app/contractors/layout.tsx` | Auth + pending check, renders `PendingReviewMessage` | VERIFIED | Full implementation with `applications` query and `maybeSingle()` — 49 lines, substantive |
| `app/jobs/layout.tsx` | New client layout with pending check | VERIFIED | File exists (49 lines), identical pattern to contractors layout, `JobsLayout` export |
| `app/profile/page.tsx` | `isPending` state and pending message render | VERIFIED | `isPending` state at line 29, pending check in `useEffect` lines 56-67, render block lines 246-263 |
| `app/admin/actions.ts` | `approveApplication` inserts certification records from `document_urls` | VERIFIED | `.select('id').single()` captures contractor ID (line 48-49), cert insert block lines 52-61 |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `app/layout.tsx` | All `generateMetadata` OG image outputs | `metadataBase` resolution | VERIFIED | `metadataBase: new URL('https://contractors-connect.vercel.app')` at line 6 — Next.js resolves relative paths globally |
| `app/contractors/[id]/page.tsx` | `og-default.png` or `profile_photo_url` | `generateMetadata images` array | VERIFIED | Line 32: `const image = data.profile_photo_url ?? '/og-default.png'`; used in `openGraph.images` line 40 |
| `app/contractors/[id]/page.tsx` | schema.org Person JSON-LD | `dangerouslySetInnerHTML script` tag | VERIFIED | Lines 86-89: `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />` |
| `app/contractors/layout.tsx` | `applications` table | `supabase query .maybeSingle()` | VERIFIED | Lines 36-41: `.from('applications').select('status').eq('user_id', session.user.id).eq('status', 'pending').maybeSingle()` |
| `app/jobs/layout.tsx` | `applications` table | Same pending check pattern | VERIFIED | Lines 36-41: identical query — applications table, user_id filter, status pending, maybeSingle |
| `app/profile/page.tsx` | `applications` table | Pending check after session load | VERIFIED | Lines 57-62: same pattern inside existing `getSession().then()` handler |
| `app/admin/actions.ts` contractors insert | `certifications` insert | `.select('id').single()` captures contractor ID | VERIFIED | Line 48: `.select('id').single()` — `newContractorData.id` used at line 54 for `contractor_id` |
| Application `document_urls` | `certifications` rows | Map over `document_urls`, one cert per URL | VERIFIED | Lines 53-59: `application.document_urls.map((docUrl) => ({ contractor_id: ..., document_url: docUrl, verified: true, ... }))` |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| SEO-01 | 02-01-PLAN.md | `metadataBase` in `app/layout.tsx` | SATISFIED | Line 6 of `app/layout.tsx`: `metadataBase: new URL('https://contractors-connect.vercel.app')` |
| SEO-02 | 02-01-PLAN.md | `/contractors/[id]` has `generateMetadata` with unique OG tags | SATISFIED | Lines 15-49 of `app/contractors/[id]/page.tsx` — title, description, openGraph, twitter all present |
| SEO-03 | 02-01-PLAN.md | `/u/[username]` has `generateMetadata` with unique OG tags | SATISFIED | Lines 15-46 of `app/u/[username]/page.tsx` — title, description, openGraph, twitter all present |
| SEO-04 | 02-01-PLAN.md | `/contractors/[id]` contains JSON-LD Person schema | SATISFIED | Lines 70-88 of `app/contractors/[id]/page.tsx` — `'@type': 'Person'` with name, jobTitle, address, url; no contact info |
| AUTH-01 | 02-02-PLAN.md | Pending applicants see restricted experience on /contractors, /jobs, /profile; /explore accessible | SATISFIED | All three gates confirmed in `contractors/layout.tsx`, `jobs/layout.tsx`, `profile/page.tsx`; explore has no layout guard |
| CERT-01 | 02-03-PLAN.md | `approveApplication()` auto-creates certification records from `document_urls` | SATISFIED | Lines 51-61 of `app/admin/actions.ts` — cert records mapped from `document_urls`, `verified: true`, correct `contractor_id` |

**Note on SEO-04 schema type:** REQUIREMENTS.md line 36 describes the requirement as "LocalBusiness or Person schema" — the implementation uses `Person` only, which is the correct locked decision per 02-01-PLAN.md task 2 ("CRITICAL: Do NOT use `LocalBusiness` schema type. Use `Person` only"). This is intentional and fully satisfies the requirement.

**Orphaned requirements check:** No requirements mapped to Phase 2 in REQUIREMENTS.md traceability table (lines 86-91) were missed. All 6 (AUTH-01, CERT-01, SEO-01, SEO-02, SEO-03, SEO-04) are claimed by plans and verified. No orphaned requirements.

---

### Anti-Patterns Found

| File | Lines | Pattern | Severity | Impact |
|------|-------|---------|----------|--------|
| `app/profile/page.tsx` | 359, 360, 428, 430, 436, 437, 532-533, 543-544 | `placeholder` attribute on input elements | Info | HTML input placeholder text — not a stub, not a code smell. These are legitimate UX labels. |

No blockers or warnings found. The `placeholder` matches are HTML form field hints, not code stubs.

---

### Human Verification Required

The following behaviors are correct in code but require a running environment to observe end-to-end.

#### 1. OG Link Preview Rendering

**Test:** Share a `/contractors/[id]` URL in Slack, iMessage, or Twitter/X after deployment to Vercel.
**Expected:** Preview card shows contractor name as title, trade or bio excerpt as description, and contractor photo (or the navy og-default.png fallback).
**Why human:** Social crawlers fetch the deployed URL — cannot be verified from static code inspection alone.

#### 2. Pending Applicant UX Flow

**Test:** Create a test user account, submit an application (so an `applications` row with `status='pending'` exists), then sign in and navigate to `/contractors`, `/jobs`, and `/profile`.
**Expected:** Each page shows "Application Under Review" heading with a link to `/explore`. Navigating to `/explore` shows the full feed without restriction.
**Why human:** Client-side `useEffect` guards depend on Supabase session state at runtime — the logic is correct in code but requires a live browser + DB session to confirm the UX renders as intended.

#### 3. Certification Auto-Population on Approval

**Test:** Submit a test application with at least one document uploaded (so `document_urls` is non-empty), then approve it via `/admin`. Query the `certifications` table in Supabase dashboard.
**Expected:** At least one row exists for the newly created contractor with `verified=true`, `contractor_id` matching the contractor UUID, `name` = "{trade} Credential", `issuing_body` = "Submitted via Application", and `document_url` = the uploaded file URL.
**Why human:** Requires a live Supabase connection, an actual application row with documents, and the admin approval flow — cannot be end-to-end verified statically.

---

### Summary

All 12 must-have truths are verified against the actual codebase. All 6 required artifacts exist, are substantive (not stubs), and are correctly wired. All 6 requirement IDs (SEO-01, SEO-02, SEO-03, SEO-04, AUTH-01, CERT-01) are fully satisfied by the implementations in the codebase. No anti-patterns block the phase goal.

The phase goal — "Improve search engine discoverability of contractor profiles, enforce access control for pending applicants, and automate certification record creation on approval" — is achieved.

Three items are flagged for human verification (OG preview rendering, pending UX flow, cert auto-population) as they depend on a live deployment and Supabase runtime — but the code implementing each is complete and correct.

---

_Verified: 2026-03-03_
_Verifier: Claude (gsd-verifier)_
