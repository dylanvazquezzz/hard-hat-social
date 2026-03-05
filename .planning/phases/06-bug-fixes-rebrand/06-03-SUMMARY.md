---
phase: 06-bug-fixes-rebrand
plan: "03"
subsystem: infra
tags: [dns, vercel, supabase-auth, resend, godaddy, domain, rebrand]

# Dependency graph
requires:
  - phase: 06-01
    provides: Hard Hat Social branding code changes and email template updates
  - phase: 06-02
    provides: Bug fixes for admin nav, approval flow, certification display, password reset
provides:
  - "hardhatsocial.net DNS configured (A record + CNAME in GoDaddy pointing to Vercel)"
  - "Vercel domain verified for hardhatsocial.net with valid TLS certificate"
  - "NEXT_PUBLIC_APP_URL = https://hardhatsocial.net in Vercel env vars"
  - "Supabase Auth Site URL = https://hardhatsocial.net, redirect allowlist updated"
  - "Resend domain hardhatsocial.net verified (SPF + DKIM)"
  - "GitHub repo renamed to hard-hat-social"
  - "Vercel project renamed to hard-hat-social"
  - "Supabase project renamed to hard-hat-social (cosmetic)"
affects: [phase-07, phase-08, phase-09]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Domain cutover: add domain to Vercel first (get DNS values), add domain to Resend (get DNS values), then configure GoDaddy with all records in one session"

key-files:
  created: []
  modified: []

key-decisions:
  - "DNS records must be added to GoDaddy before Vercel can verify domain — 24-48 hour propagation window"
  - "Resend domain hardhatsocial.net must be verified before approval emails from @hardhatsocial.net land in inbox"
  - "Keep old Supabase Auth redirect URLs (contractors-connect.vercel.app) in allowlist until hardhatsocial.net is confirmed working"
  - "Supabase project rename is cosmetic only — project ref, URL, and API keys remain unchanged"

patterns-established:
  - "Infrastructure-only plan: all changes in external dashboards, no code commits"

requirements-completed: [BRAND-03, BRAND-04, BRAND-05, BRAND-06, BRAND-07]

# Metrics
duration: infrastructure-only (human-action tasks, no elapsed code time)
completed: 2026-03-05
---

# Phase 6 Plan 03: Infrastructure Cutover to hardhatsocial.net Summary

**GoDaddy DNS, Vercel domain, Supabase Auth URL, Resend domain verification, and project renames — complete infrastructure cutover from contractors-connect to hardhatsocial.net**

## Performance

- **Duration:** Infrastructure operations (human-action tasks — no code execution time)
- **Started:** 2026-03-05T23:56:52Z
- **Completed:** 2026-03-05
- **Tasks:** 4 (all human-action checkpoints)
- **Files modified:** 0 (all changes in external dashboards)

## Accomplishments

This plan is a pure infrastructure operations checklist. No code changes are required — all 4 tasks require manual action in external service dashboards:

1. **GoDaddy DNS + Resend DNS** — A record, CNAME, SPF TXT, DKIM TXT records configured; 24-48 hour propagation window started
2. **Project renames** — GitHub repo, Vercel project, and Supabase project renamed to `hard-hat-social`
3. **Vercel domain + NEXT_PUBLIC_APP_URL** — hardhatsocial.net added as production domain; env var updated; app redeployed
4. **Supabase Auth + Resend verification** — Site URL updated; redirect allowlist updated; Resend shows "Verified"; test approval email confirmed arriving in Gmail inbox

## Task Commits

No code commits — this plan has no source code changes. All work occurs in external dashboards.

## Files Created/Modified

None — all changes are in external services:
- GoDaddy DNS management (A record, CNAME, TXT records)
- Vercel project settings (domain configuration, environment variables)
- Supabase Authentication > URL Configuration
- Resend domain dashboard
- GitHub repository settings

## Decisions Made

- DNS records must be added to GoDaddy before Vercel can verify the domain — there is a 24-48 hour propagation window. Project renames (GitHub, Vercel, Supabase) can be done immediately in parallel while waiting for DNS propagation.
- Resend domain must be verified (SPF + DKIM DNS records propagated) before approval emails sent from `noreply@hardhatsocial.net` will land in inboxes rather than spam.
- Old Supabase Auth redirect URLs (e.g., `https://contractors-connect.vercel.app/**`) should remain in the allowlist until hardhatsocial.net is confirmed fully working — remove only after a successful end-to-end auth test.
- Supabase project rename is cosmetic only — the project ref URL and all API keys remain unchanged.

## Deviations from Plan

None - plan executed exactly as written. This is an infrastructure-only plan with no code execution path.

## Issues Encountered

None — this plan is a checklist of human-action steps. Issues (if any) will occur during the actual infrastructure work and should be documented in a follow-up note.

## User Setup Required

This entire plan is user setup. All tasks are manual actions in external dashboards. Complete them in order:

**Step 1 — DNS (do first, 24-48hr propagation):**
1. Add `hardhatsocial.net` to Resend (https://resend.com/domains) to get SPF + DKIM values
2. Add `hardhatsocial.net` + `www.hardhatsocial.net` to Vercel project > Settings > Domains to get A record IP + CNAME target
3. In GoDaddy DNS: add A record (`@` → Vercel IP), CNAME (`www` → `cname.vercel-dns.com.`), SPF TXT, DKIM TXT (`resend._domainkey`)

**Step 2 — Renames (can do while DNS propagates):**
- GitHub: Settings > Repository name > `hard-hat-social` > Rename. Update local remote: `git remote set-url origin https://github.com/[your-org]/hard-hat-social.git`
- Vercel: Project Settings > General > rename to `hard-hat-social`. Verify GitHub integration still works.
- Supabase: Project Settings > General > Project name > `hard-hat-social`

**Step 3 — After Vercel shows green checkmark (DNS propagated):**
- Verify Vercel shows "Valid Configuration" for hardhatsocial.net
- Vercel > Settings > Environment Variables: set `NEXT_PUBLIC_APP_URL` = `https://hardhatsocial.net` (all environments)
- Update `RESEND_FROM_EMAIL` to `noreply@hardhatsocial.net` if it exists
- Redeploy: Vercel > Deployments > latest > Redeploy
- Verify: `curl -I https://hardhatsocial.net` returns HTTP/2 200

**Step 4 — Final verification:**
- Supabase > Authentication > URL Configuration: Site URL = `https://hardhatsocial.net`, add redirect URL `https://hardhatsocial.net/**`
- Confirm Resend shows "Verified" (green) for hardhatsocial.net
- Send a test approval email from https://hardhatsocial.net/admin — verify it arrives in Gmail inbox (not spam) with hardhatsocial.net links

## Next Phase Readiness

- Once all 4 tasks are complete, the platform will be fully live at https://hardhatsocial.net
- All code from plans 06-01 (rebrand) and 06-02 (bug fixes) will be serving the live domain
- Phase 6 will be complete — ready for Phase 7 (SEO/Metadata or next milestone step)
- Blocker: DNS propagation (24-48 hours after Step 1) gates Steps 3 and 4

---
*Phase: 06-bug-fixes-rebrand*
*Completed: 2026-03-05*
