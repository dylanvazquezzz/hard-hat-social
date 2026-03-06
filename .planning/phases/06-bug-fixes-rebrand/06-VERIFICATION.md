---
phase: 06-bug-fixes-rebrand
verified: 2026-03-05T00:00:00Z
status: gaps_found
score: 9/13 must-haves verified
gaps:
  - truth: "NavBar displays 'Hard Hat Social' as the brand name with brand-blue and brand-yellow color classes (not amber-500)"
    status: partial
    reason: "NavBar uses text-brand-yellow for 'Hard Hat' and text-white for ' Social'. The plan specified text-brand-blue/'Hard Hat' + text-brand-yellow/' Social'. However, a post-plan user commit (ad00e69) intentionally changed this to yellow/white as a design preference. No amber-500 classes remain. BRAND-01/BRAND-02 goals are met but the exact color mapping differs from the plan spec."
    artifacts:
      - path: "components/NavBar.tsx"
        issue: "Uses text-brand-yellow + text-white instead of text-brand-blue + text-brand-yellow as specified in plan. User approved the deviation via commit ad00e69."
    missing:
      - "Acceptable as-is — user intentionally changed colors. No action required unless brand-blue on 'Hard Hat' is desired."
  - truth: "hardhatsocial.net DNS resolves to Vercel — curl -I https://hardhatsocial.net returns HTTP/2 200"
    status: failed
    reason: "Cannot verify programmatically — requires live DNS resolution check. Git remote still points to contractors-connect.git not hard-hat-social.git, suggesting BRAND-07 rename may be incomplete."
    artifacts:
      - path: "N/A — infrastructure"
        issue: "External DNS state cannot be read from codebase"
    missing:
      - "Human must verify: curl -I https://hardhatsocial.net returns HTTP/2 200"
  - truth: "Vercel project serves the app at hardhatsocial.net with NEXT_PUBLIC_APP_URL set to https://hardhatsocial.net"
    status: failed
    reason: "Cannot verify Vercel environment variable or domain configuration from codebase. Infrastructure-only."
    artifacts:
      - path: "N/A — infrastructure"
        issue: "Vercel dashboard state not readable from codebase"
    missing:
      - "Human must verify Vercel project has hardhatsocial.net as production domain and NEXT_PUBLIC_APP_URL=https://hardhatsocial.net in environment variables"
  - truth: "Supabase Auth Site URL is https://hardhatsocial.net and redirect allowlist includes https://hardhatsocial.net/**"
    status: failed
    reason: "Cannot verify Supabase Auth configuration from codebase. Infrastructure-only."
    artifacts:
      - path: "N/A — infrastructure"
        issue: "Supabase dashboard state not readable from codebase"
    missing:
      - "Human must verify: Supabase Authentication > URL Configuration shows Site URL = https://hardhatsocial.net and redirect allowlist includes https://hardhatsocial.net/**"
  - truth: "Resend domain hardhatsocial.net is verified (SPF + DKIM) and approval emails arrive in Gmail inbox, not spam"
    status: failed
    reason: "Cannot verify Resend domain verification status from codebase. Infrastructure-only."
    artifacts:
      - path: "N/A — infrastructure"
        issue: "Resend dashboard state not readable from codebase"
    missing:
      - "Human must verify: Resend shows 'Verified' (green) for hardhatsocial.net domain"
      - "Human must verify: Test approval email arrives in Gmail inbox with hardhatsocial.net sender"
  - truth: "GitHub repo is renamed to hard-hat-social; Vercel project name updated; Supabase project name updated"
    status: failed
    reason: "Git remote URL still points to contractors-connect.git, not hard-hat-social.git. Either the GitHub rename has not happened, or the local remote was not updated after rename."
    artifacts:
      - path: "N/A — git remote"
        issue: "git remote -v shows: origin https://github.com/dylanvazquezzz/contractors-connect.git — expected hard-hat-social.git"
    missing:
      - "If GitHub rename is done: run 'git remote set-url origin https://github.com/dylanvazquezzz/hard-hat-social.git'"
      - "If GitHub rename is not done: rename repo at github.com/dylanvazquezzz/contractors-connect > Settings > Repository name > hard-hat-social"
      - "Verify Vercel project name is hard-hat-social in project settings"
      - "Verify Supabase project name is hard-hat-social (cosmetic only)"
human_verification:
  - test: "Live domain check"
    expected: "curl -I https://hardhatsocial.net returns HTTP/2 200 with TLS certificate"
    why_human: "DNS resolution and TLS cannot be verified from codebase"
  - test: "Vercel domain + env var"
    expected: "Vercel project settings show hardhatsocial.net as production domain; NEXT_PUBLIC_APP_URL = https://hardhatsocial.net in all environments"
    why_human: "Vercel dashboard state is external to codebase"
  - test: "Supabase Auth URL configuration"
    expected: "Authentication > URL Configuration shows Site URL = https://hardhatsocial.net; redirect allowlist contains https://hardhatsocial.net/**"
    why_human: "Supabase dashboard configuration is external to codebase"
  - test: "Resend domain verification + email delivery"
    expected: "Resend shows 'Verified' for hardhatsocial.net; test approval email from /admin arrives in Gmail inbox (not spam) with @hardhatsocial.net sender and Hard Hat Social subject/links"
    why_human: "Email delivery requires live Resend account access and sending a test email"
  - test: "GitHub repo rename"
    expected: "github.com/dylanvazquezzz/hard-hat-social is accessible; git remote -v shows hard-hat-social.git"
    why_human: "GitHub repo names are externally controlled; git remote still shows contractors-connect.git"
  - test: "NavBar brand rendering"
    expected: "'Hard Hat' appears in yellow, ' Social' appears in white in the nav bar at top left; no 'Contractors Connect' text visible anywhere in the UI"
    why_human: "Visual rendering of color tokens requires browser"
---

# Phase 6: Bug Fixes & Rebrand Verification Report

**Phase Goal:** Hard Hat Social is live on hardhatsocial.net with all critical bugs fixed so the founding cohort can be onboarded without friction — admin nav works, emails link to the production domain, approved contractors appear in the directory, and the new brand identity is applied throughout the UI

**Verified:** 2026-03-05

**Status:** gaps_found

**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Admin link visible in both desktop dropdown and mobile hamburger when logged in with admin email | VERIFIED | NavBar.tsx lines 146-154 (desktop), 234-242 (mobile) — `isAdmin` state + conditional `{isAdmin && !pathname.startsWith('/admin') && <a href="/admin">}` in both menus |
| 2 | `approveApplication()` and `rejectApplication()` call `revalidatePath('/contractors')` and `revalidatePath('/')` | VERIFIED | actions.ts lines 83-85: `revalidatePath('/admin')`, `revalidatePath('/contractors')`, `revalidatePath('/')` in both functions |
| 3 | `lib/email.ts` APP_URL and FROM fallback constants reference hardhatsocial.net | VERIFIED | email.ts line 6: `const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@hardhatsocial.net'`; line 7: `const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hardhatsocial.net'` |
| 4 | Homepage count updates via `revalidatePath('/')` on approve/reject — ISR `revalidate=3600` remains as fallback | VERIFIED | `revalidatePath('/')` confirmed in both functions; `app/page.tsx` unchanged from plan (ISR still present as fallback) |
| 5 | BUG-05 documented as data gap — cert display code is correct; pre-Phase-2 contractors need manual cert entry | VERIFIED | 06-01-SUMMARY.md explicitly documents this decision; approveApplication() in actions.ts now auto-creates cert records from document_urls for future approvals |
| 6 | `tailwind.config.ts` defines brand color namespace with blue, blue-dark, yellow, yellow-dark, dark, surface, text-primary, and muted tokens | VERIFIED | tailwind.config.ts lines 11-22: all 8 tokens present under `theme.extend.colors.brand` |
| 7 | NavBar displays 'Hard Hat Social' as brand name with brand color classes (not amber-500) | PARTIAL | Brand name "Hard Hat Social" present (line 85-86). Uses `text-brand-yellow` + `text-white` instead of plan-specified `text-brand-blue` + `text-brand-yellow`. No amber-500 classes remain. User intentionally changed colors via commit ad00e69. |
| 8 | `app/layout.tsx` metadata title and description reference 'Hard Hat Social' and metadataBase uses hardhatsocial.net | VERIFIED | layout.tsx: `title: 'Hard Hat Social — Verified Contractor Network'`, `metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://hardhatsocial.net')` |
| 9 | `app/contractors/[id]/page.tsx` JSON-LD url uses NEXT_PUBLIC_APP_URL env var | VERIFIED | Line 81: `` url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://hardhatsocial.net'}/contractors/${contractor.id}` `` |
| 10 | Zero "Contractors Connect" occurrences in app/ and components/ | VERIFIED | grep returns zero matches in app/ and components/ for both "Contractors Connect" and "contractorsconnect.com" |
| 11 | hardhatsocial.net DNS resolves to Vercel (curl -I returns HTTP/2 200) | NEEDS HUMAN | Infrastructure-only — cannot verify from codebase |
| 12 | Supabase Auth Site URL = https://hardhatsocial.net; redirect allowlist updated | NEEDS HUMAN | Infrastructure-only — Supabase dashboard state |
| 13 | Resend domain hardhatsocial.net verified; test email arrives in inbox | NEEDS HUMAN | Infrastructure-only — Resend dashboard + email delivery |
| 14 | GitHub repo renamed to hard-hat-social | FAILED | `git remote -v` shows `contractors-connect.git` — either rename is incomplete or local remote not updated after GitHub rename |

**Score:** 9/14 truths verified (plus 4 infrastructure items requiring human verification, 1 confirmed failure)

---

## Required Artifacts

### Plan 06-01 (BUG-01 through BUG-05)

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app/admin/actions.ts` | `revalidatePath('/contractors')` and `revalidatePath('/')` in both functions | VERIFIED | Lines 83-85 and 105-107 confirm both paths in both functions |
| `components/NavBar.tsx` | `isAdmin` state + conditional Admin link in desktop + mobile | VERIFIED | `isAdmin` state at line 13; admin check in getSession (lines 24-29) and onAuthStateChange (lines 37-45); Admin link in desktop (146-154) and mobile (234-242) |
| `lib/email.ts` | FROM and APP_URL fallbacks reference hardhatsocial.net; brand text updated | VERIFIED | Lines 6-7 confirm fallbacks; subjects and body copy all say "Hard Hat Social" |

### Plan 06-02 (BRAND-01, BRAND-02)

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `tailwind.config.ts` | `brand` color tokens in `theme.extend.colors` | VERIFIED | All 8 tokens present: blue, blue-dark, yellow, yellow-dark, dark, surface, text-primary, muted |
| `app/layout.tsx` | "Hard Hat Social" title + hardhatsocial.net metadataBase | VERIFIED | Both confirmed at lines 6-7 |
| `components/NavBar.tsx` | "Hard Hat Social" brand name with brand color classes | PARTIAL | Brand name correct; color classes are brand-yellow/white instead of plan-specified brand-blue/brand-yellow (user design choice) |
| `app/contractors/[id]/page.tsx` | JSON-LD url uses NEXT_PUBLIC_APP_URL | VERIFIED | Line 81 confirmed |

### Plan 06-03 (BRAND-03 through BRAND-07)

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| GoDaddy DNS records | A record + CNAME for hardhatsocial.net | NEEDS HUMAN | External dashboard — cannot verify |
| Vercel domain config + env var | hardhatsocial.net production domain; NEXT_PUBLIC_APP_URL set | NEEDS HUMAN | External dashboard — cannot verify |
| Supabase Auth URL config | Site URL + redirect allowlist updated | NEEDS HUMAN | External dashboard — cannot verify |
| Resend domain verification | hardhatsocial.net SPF + DKIM verified | NEEDS HUMAN | External dashboard — cannot verify |
| GitHub repo rename | Repository name = hard-hat-social | FAILED | git remote still shows contractors-connect.git |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `NavBar.tsx` | `NEXT_PUBLIC_ADMIN_EMAILS` | `split(',').map(e => e.trim().toLowerCase()).includes(email)` | VERIFIED | Lines 25-28 and 38-41 confirm correct pattern |
| `actions.ts` | `next/cache` | `revalidatePath('/contractors')` and `revalidatePath('/')` | VERIFIED | Lines 83-85 and 105-107 confirmed |
| `lib/email.ts` | `hardhatsocial.net` | APP_URL and FROM fallback constants | VERIFIED | Lines 6-7 confirmed |
| `app/layout.tsx` | `metadataBase` | `new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://hardhatsocial.net')` | VERIFIED | Line 6 confirmed |
| `tailwind.config.ts` | all TSX files | `brand-yellow`, `brand-dark`, `brand-text-primary` static class names | VERIFIED | NavBar uses `text-brand-yellow`, `bg-brand-yellow`, `bg-brand-yellow-dark`; layout uses `bg-brand-dark text-brand-text-primary` |
| GoDaddy DNS | Vercel | A record + CNAME pointing to Vercel IP | NEEDS HUMAN | External |
| Supabase Auth | hardhatsocial.net | Site URL + redirect allowlist | NEEDS HUMAN | External |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| BUG-01 | 06-01 | Admin link visible in nav dropdown | SATISFIED | NavBar.tsx lines 146-154, 234-242 |
| BUG-02 | 06-01 | Emails link to production domain | SATISFIED | email.ts APP_URL fallback = hardhatsocial.net |
| BUG-03 | 06-01 | Approved contractor appears immediately in /contractors | SATISFIED | actions.ts revalidatePath('/contractors') in both functions |
| BUG-04 | 06-01 | Homepage count updates on approve/reject | SATISFIED | actions.ts revalidatePath('/') in both functions |
| BUG-05 | 06-01 | Certifications visible on profile (documented as data gap) | SATISFIED | Documented as data gap; future approvals now auto-create cert records from document_urls |
| BRAND-01 | 06-02 | "Hard Hat Social" throughout UI | SATISFIED | Zero "Contractors Connect" in app/ or components/; "Hard Hat Social" confirmed in layout, NavBar, email subjects, all page metadata |
| BRAND-02 | 06-02 | Brand color tokens in tailwind.config.ts; UI uses brand classes | SATISFIED | 8 brand tokens in tailwind.config.ts; NavBar and layout use brand-* classes; no amber-500 in NavBar |
| BRAND-03 | 06-03 | GoDaddy DNS A record + CNAME for hardhatsocial.net | NEEDS HUMAN | Infrastructure — cannot verify from codebase |
| BRAND-04 | 06-03 | Vercel production domain + NEXT_PUBLIC_APP_URL env var | NEEDS HUMAN | Infrastructure — cannot verify from codebase |
| BRAND-05 | 06-03 | Supabase Auth Site URL + redirect allowlist | NEEDS HUMAN | Infrastructure — cannot verify from codebase |
| BRAND-06 | 06-03 | Resend domain verified; email from @hardhatsocial.net lands in inbox | NEEDS HUMAN | Infrastructure — cannot verify from codebase |
| BRAND-07 | 06-03 | GitHub/Vercel/Supabase renamed to hard-hat-social | BLOCKED | git remote -v shows contractors-connect.git — rename not reflected locally |

No orphaned requirements — all 12 phase-6 requirement IDs are claimed by one of the three plans.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | None found | — | All modified files are substantive with no placeholder patterns |

No TODOs, FIXMEs, empty handlers, or stub return values found in the 7 modified source files.

---

## Human Verification Required

### 1. Live domain — hardhatsocial.net resolves

**Test:** Run `curl -I https://hardhatsocial.net` in a terminal

**Expected:** HTTP/2 200 with a valid TLS certificate (green padlock in browser)

**Why human:** DNS resolution state cannot be read from the codebase

---

### 2. Vercel production domain and environment variable

**Test:** Open Vercel project > Settings > Domains; also check Settings > Environment Variables

**Expected:** `hardhatsocial.net` listed as production domain with green checkmark; `NEXT_PUBLIC_APP_URL` = `https://hardhatsocial.net` set for all environments

**Why human:** Vercel dashboard configuration is external to the codebase

---

### 3. Supabase Auth URL configuration

**Test:** Open Supabase dashboard > Authentication > URL Configuration

**Expected:** Site URL = `https://hardhatsocial.net`; Redirect allowlist contains `https://hardhatsocial.net/**`

**Why human:** Supabase Auth configuration is external to the codebase

---

### 4. Resend domain verified + email delivery test

**Test:** Open Resend > Domains and find hardhatsocial.net; then approve a test application at /admin and check Gmail inbox

**Expected:** Resend shows "Verified" (green) status for hardhatsocial.net; approval email arrives in Gmail inbox (not spam) with sender `noreply@hardhatsocial.net` and subject "You're approved — Welcome to Hard Hat Social"; the "Sign In Now" link in the email points to https://hardhatsocial.net

**Why human:** Email delivery testing requires live Resend access and Gmail verification

---

### 5. GitHub repo rename + local remote

**Test:** Visit github.com/dylanvazquezzz — check if hard-hat-social repo exists; run `git remote -v` locally

**Expected:** github.com/dylanvazquezzz/hard-hat-social exists; local `git remote -v` shows hard-hat-social.git

**Why human:** If rename is done on GitHub but local remote not updated, `git remote set-url origin https://github.com/dylanvazquezzz/hard-hat-social.git` is needed. If rename is not done, GitHub repo settings require manual action.

---

### 6. NavBar visual check

**Test:** Run `npm run dev` and open http://localhost:3000

**Expected:** "Hard Hat" appears in yellow, " Social" appears in white (intentional design deviation from the plan which said blue/yellow). No "Contractors Connect" text anywhere. Sign In button appears yellow. Admin link visible when logged in with admin email.

**Why human:** Visual rendering requires browser

---

## Gaps Summary

**Code-layer changes (plans 06-01 and 06-02) are fully verified.** All 5 bug fixes are implemented correctly and all BRAND-01/BRAND-02 code changes are in place. The NavBar color choice (yellow + white vs. plan-specified blue + yellow) is a user-approved design deviation documented in commit ad00e69 — not a failure.

**Infrastructure layer (plan 06-03) cannot be verified from the codebase.** BRAND-03 through BRAND-07 require external dashboard verification. The one concrete failure is BRAND-07: `git remote -v` still points to `contractors-connect.git`, indicating either the GitHub repo rename is not yet done, or the local remote URL was not updated after the rename.

**To close all gaps:**
1. Confirm or complete the GitHub repo rename to `hard-hat-social`; update local remote with `git remote set-url origin https://github.com/dylanvazquezzz/hard-hat-social.git`
2. Verify hardhatsocial.net resolves (DNS + Vercel domain)
3. Confirm NEXT_PUBLIC_APP_URL in Vercel env vars
4. Confirm Supabase Auth Site URL and redirect allowlist
5. Confirm Resend domain shows "Verified" and test email lands in inbox

---

_Verified: 2026-03-05_
_Verifier: Claude (gsd-verifier)_
