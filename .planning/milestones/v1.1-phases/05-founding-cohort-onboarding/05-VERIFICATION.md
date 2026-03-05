---
phase: 05-founding-cohort-onboarding
verified: 2026-03-04T00:00:00Z
status: human_needed
score: 13/13 automated truths verified; 3 items require human execution
re_verification: false
human_verification:
  - test: "Set NEXT_PUBLIC_APP_URL in Vercel, redeploy, approve a test application, inspect approval email href"
    expected: "Sign In Now button href contains https://contractors-connect.vercel.app/auth?redirect=/profile — not localhost"
    why_human: "Email URL correctness depends on NEXT_PUBLIC_APP_URL being set in Vercel dashboard. Cannot verify the Vercel env var or send a live email programmatically."
  - test: "Sign in at https://contractors-connect.vercel.app/auth?redirect=/profile with a valid approved-contractor account"
    expected: "Lands on /profile after sign-in, not /contractors"
    why_human: "Dynamic redirect requires a live browser session — cannot simulate useSearchParams routing and window.location.href programmatically."
  - test: "Sign in as an approved contractor with no avatar photo"
    expected: "Welcome banner appears at top of /profile; disappears immediately after uploading a photo without page reload"
    why_human: "State-driven banner dismissal (profile.avatar_url becoming non-null on upload) requires a real session and browser render."
---

# Phase 5: Founding Cohort Onboarding — Verification Report

**Phase Goal:** Onboard the founding cohort of welding contractors smoothly — fix blocking bugs, deliver a warm first-run experience, and give the admin the tools to manage certifications without friction.
**Verified:** 2026-03-04
**Status:** HUMAN NEEDED — all 13 automated checks pass; 3 items require live execution to confirm end-to-end behavior
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

All truths derived from the four plan `must_haves` blocks (Plans 01–04). No `success_criteria` in ROADMAP for this phase — must-haves serve as the contract.

#### Plan 01 — Email Fix + Auth Redirect + Apply Banner

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Approval email "Sign In Now" button links to production URL with `?redirect=/profile`, not localhost | ? UNCERTAIN | `lib/email.ts` line 29: `href="${APP_URL}/auth?redirect=/profile"` — code is correct. Requires live Vercel env var `NEXT_PUBLIC_APP_URL` to confirm production URL resolves correctly. |
| 2 | After clicking the email link and signing in, the welder lands on /profile | ? UNCERTAIN | `app/auth/page.tsx` line 29: `window.location.href = redirectTo` where `redirectTo = searchParams.get('redirect') ?? '/contractors'`. Wiring is correct. Needs human to confirm live browser flow. |
| 3 | Visiting /apply shows invite-only banner above the form with the contact email | ? UNCERTAIN | `app/apply/page.tsx` lines 243–256: banner renders as first child inside outermost `<div>`, guarded by `process.env.NEXT_PUBLIC_CONTACT_EMAIL`. Code is correct. Requires env var set in Vercel to appear. |
| 4 | If NEXT_PUBLIC_CONTACT_EMAIL is not set, no banner, no error, no "undefined" text | ✓ VERIFIED | Guard is `{process.env.NEXT_PUBLIC_CONTACT_EMAIL && (...)}`. If falsy/undefined, entire block skipped. No render path for "undefined" string. |

#### Plan 02 — Welcome Banner

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 5 | An approved contractor with no avatar sees welcome banner on /profile | ✓ VERIFIED | `app/profile/page.tsx` lines 270–276: `{contractor && !profile?.avatar_url && (...)}`. `loadContractor` (line 85–92) queries with `.eq('status', 'approved')` — pending users get `null` contractor. Logic is correct. |
| 6 | The welcome banner is not shown to pending users | ✓ VERIFIED | `contractor` is null for pending users (loadContractor filters to approved only). Banner condition `contractor && ...` short-circuits. |
| 7 | Banner disappears automatically once avatar is uploaded | ✓ VERIFIED | `handleAvatarUpload` calls `setProfile((p) => p ? { ...p, avatar_url: publicUrl } : p)` at line 121 — makes `profile.avatar_url` non-null, `!profile?.avatar_url` becomes false, React re-renders, banner hides without reload. |
| 8 | Banner is styled with amber accent consistent with design system | ✓ VERIFIED | Lines 271–275: `border-amber-500/40 bg-amber-500/10 text-amber-400` — matches existing dark slate + amber design system. |

#### Plan 03 — Admin Inline Cert Editing

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 9 | Admin can click Edit to expand inline form with all fields | ✓ VERIFIED | `CertRow.tsx` line 127: `onClick={() => setIsEditing(true)}`. Edit form (lines 45–109) renders all fields: name, issuing body, cert number, expiry date, verified checkbox. |
| 10 | Saving the edit form updates cert in DB and collapses row | ✓ VERIFIED | `handleSave` (line 16–31) calls `updateCertification` via `startTransition`, then `setIsEditing(false)`. `updateCertification` in `actions.ts` lines 39–54 performs `admin.from('certifications').update(fields).eq('id', certId)` and revalidates both paths. |
| 11 | Cancel discards changes and collapses row without a DB call | ✓ VERIFIED | `handleCancel` (lines 33–40) resets all state fields to original `cert` prop values, then `setIsEditing(false)`. No server action call. |
| 12 | Verified checkbox is manually controlled — no auto-flip on save | ✓ VERIFIED | Checkbox state (line 13) initializes from `cert.verified`, updated only on user interaction (line 85: `onChange={(e) => setVerified(e.target.checked)}`). `handleSave` passes current `verified` state as-is to server action. No auto-flip logic present. |
| 13 | Remove button still works; page remains a server component | ✓ VERIFIED | Remove: `CertRow.tsx` line 132: `<form action={() => deleteCertification(cert.id, contractorId)}>` — calls imported server action from client component (valid Next.js 14). Page: `app/admin/contractors/[id]/page.tsx` has no `'use client'` directive; file uses `async function` with `await` — confirmed server component. |

#### Plan 04 — Operational Runbook

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 14 | Runbook tells co-founder exactly what Vercel env vars to set and in what order | ✓ VERIFIED | `RUNBOOK.md` Sections 2 Steps 1–2: `NEXT_PUBLIC_APP_URL` listed first with explicit "Why this is first" rationale; `NEXT_PUBLIC_CONTACT_EMAIL` listed second; both include redeploy instructions. |
| 15 | Runbook includes step-by-step end-to-end test before outreach | ✓ VERIFIED | `RUNBOOK.md` Section 2 Step 3: 8 numbered steps mirroring welder experience from sign-up to directory search. Instruction "Only proceed to outreach once all 8 steps above pass" is explicit. |
| 16 | Runbook includes direct DM template and group chat template with correct /apply URL | ✓ VERIFIED | `RUNBOOK.md` Section 3: Template A (direct DM) and Template B (group chat) both contain `https://contractors-connect.vercel.app/apply`. Both mention required documents (AWS cert, state license, insurance) upfront. |
| 17 | Runbook is readable as a standalone document with no assumed context | ✓ VERIFIED | RUNBOOK.md Section 1 overview paragraph explains what the doc is, who it's for, and what you'll accomplish. No code references. Plain language throughout. |

**Score:** 14/17 truths fully verified in code; 3 require human execution (live email send, live browser sign-in flow, live banner state management)

---

## Required Artifacts

### Plan 01 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `lib/email.ts` | Approval email CTA href contains `auth?redirect=/profile` | VERIFIED | Line 29: `href="${APP_URL}/auth?redirect=/profile"`. List item link also updated (line 24). |
| `app/auth/page.tsx` | Reads `?redirect=` param via useSearchParams; wrapped in Suspense | VERIFIED | Lines 4, 10–11: `useSearchParams` imported; `redirectTo = searchParams.get('redirect') ?? '/contractors'`. Lines 116–121: `AuthPage` default export wraps `AuthPageInner` in `<Suspense fallback={null}>`. |
| `app/apply/page.tsx` | Invite-only banner above form, guarded by NEXT_PUBLIC_CONTACT_EMAIL | VERIFIED | Lines 243–256: banner as first child of return div, conditional on env var, mailto link using env var value. |

### Plan 02 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app/profile/page.tsx` | Welcome banner for approved contractors with no avatar | VERIFIED | Lines 269–277: comment + conditional render. Text "Welcome to Contractors Connect" confirmed line 272. `onboardingItems` — confirmed ABSENT (no match in file). |

### Plan 03 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app/admin/contractors/[id]/CertRow.tsx` | Client component with inline edit state | VERIFIED | Line 1: `'use client'`. Full 140-line implementation with `isEditing` state, `handleSave`, `handleCancel`, display and edit views. Exports named `CertRow`. |
| `app/admin/contractors/[id]/actions.ts` | `updateCertification` server action | VERIFIED | Lines 39–54: `export async function updateCertification(certId, fields, contractorId)`. Follows same pattern as `addCertification` and `deleteCertification`. |
| `app/admin/contractors/[id]/page.tsx` | Server page mapping certs to `CertRow` | VERIFIED | Line 4: `import { CertRow } from './CertRow'`. Line 44: `<CertRow key={cert.id} cert={cert} contractorId={params.id} />`. No `'use client'` — confirmed server component. `deleteCertification` import removed from page (now in CertRow). |

### Plan 04 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `.planning/phases/05-founding-cohort-onboarding/RUNBOOK.md` | Operational runbook with env var setup, E2E test, outreach templates | VERIFIED | File exists. Contains `NEXT_PUBLIC_APP_URL` (line 15), `NEXT_PUBLIC_CONTACT_EMAIL` (line 32), 8-step E2E test (lines 53–73), Template A (lines 90–99), Template B (lines 108–114). |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `lib/email.ts` | `app/auth/page.tsx` | href `auth?redirect=/profile` in approval email CTA | VERIFIED | `email.ts` line 29 href contains `auth?redirect=/profile`; `auth/page.tsx` line 11 reads `searchParams.get('redirect')`. |
| `app/auth/page.tsx` | `window.location.href` | `useSearchParams` redirect param | VERIFIED | Line 11: `const redirectTo = searchParams.get('redirect') ?? '/contractors'`. Line 29: `window.location.href = redirectTo`. |
| `app/admin/contractors/[id]/CertRow.tsx` | `app/admin/contractors/[id]/actions.ts` | `import { updateCertification, deleteCertification }` | VERIFIED | `CertRow.tsx` line 4: `import { updateCertification, deleteCertification } from './actions'`. Both used in component body. |
| `app/admin/contractors/[id]/page.tsx` | `app/admin/contractors/[id]/CertRow.tsx` | `import { CertRow }` | VERIFIED | `page.tsx` line 4: `import { CertRow } from './CertRow'`. Used line 44. |

---

## Requirements Coverage

No formal requirement IDs apply to this phase. All four plans declare `requirements: []` — this phase is operational, validating and hardening existing phases 1–4 under real-world conditions. No orphaned requirement IDs found in REQUIREMENTS.md mapped to phase 5.

---

## Anti-Patterns Found

No blockers. No stubs. No TODO/FIXME comments found in any modified file.

All "placeholder" matches are HTML input element `placeholder=""` attributes — not code stubs.

---

## Commit Verification

All six documented commits exist and are valid:

| Commit | Type | Description |
|--------|------|-------------|
| `8c4ca47` | fix | Fix approval email CTA URL and add dynamic auth redirect |
| `84b73e7` | feat | Add invite-only banner to /apply page |
| `b08ae92` | feat | Replace onboarding checklist with welcome banner |
| `c3680dd` | feat | Add updateCertification server action |
| `0701583` | feat | Add inline cert editing via CertRow client component |
| `cccc267` | docs | Write founding cohort operational runbook |

---

## Human Verification Required

### 1. Approval Email Production URL

**Test:** Set `NEXT_PUBLIC_APP_URL=https://contractors-connect.vercel.app` in Vercel dashboard, trigger a redeploy, create a test application, approve it from `/admin`, open the approval email in the throwaway account's inbox.

**Expected:** The "Sign In Now" button href reads `https://contractors-connect.vercel.app/auth?redirect=/profile`. The list-item sign-in link should also contain `?redirect=/profile`.

**Why human:** Email URL correctness depends on the Vercel environment variable being set. The code reads `process.env.NEXT_PUBLIC_APP_URL` at build time. Cannot verify the Vercel project's env var setting or deliver a live email programmatically.

---

### 2. Auth Page Redirect Flow

**Test:** Navigate to `https://contractors-connect.vercel.app/auth?redirect=/profile` in a browser. Sign in with a valid approved-contractor account.

**Expected:** After successful sign-in, browser navigates to `/profile` — not `/contractors`.

**Why human:** `window.location.href = redirectTo` is a browser navigation. `useSearchParams().get('redirect')` requires a real browser URL. Cannot simulate in a file check.

---

### 3. Welcome Banner Lifecycle

**Test:** Sign in as an approved contractor who has not uploaded an avatar photo. Navigate to `/profile`.

**Expected:** (a) Welcome banner appears at top reading "Welcome to Contractors Connect". Then upload a photo. (b) Banner disappears immediately without a page reload.

**Why human:** State-driven dismissal (`setProfile` updating `avatar_url` triggers React re-render) requires a live browser session and a real Supabase storage upload. Cannot verify render lifecycle from file inspection.

---

## Gaps Summary

No gaps found in the codebase. All automated checks passed. The three human verification items are behavioral validations that depend on live environment variables (Vercel) and real browser sessions — they are not code deficiencies.

The one operational dependency worth flagging: the phase goal is only fully achieved after the co-founder sets `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_CONTACT_EMAIL` in Vercel and completes the 8-step runbook smoke test. The RUNBOOK.md guides this explicitly. Until those env vars are set and the test is run, truths 1–3 are uncertain at the infrastructure level even though the code is correct.

---

_Verified: 2026-03-04_
_Verifier: Claude (gsd-verifier)_
