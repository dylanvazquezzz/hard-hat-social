---
phase: 6
slug: bug-fixes-rebrand
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no jest/vitest configured |
| **Config file** | none — Wave 0 not required (no new tests needed) |
| **Quick run command** | `npm run build && npm run lint` |
| **Full suite command** | `npm run build && npm run lint` |
| **Estimated runtime** | ~30-60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build && npm run lint`
- **After every plan wave:** Run `npm run build && npm run lint` + manual smoke of changed surfaces
- **Before `/gsd:verify-work`:** Build must be green + all manual verifications complete
- **Max feedback latency:** ~60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | BUG-01 | manual smoke | `npm run build` | ✅ | ⬜ pending |
| 06-01-02 | 01 | 1 | BUG-02 | manual smoke | `npm run build` | ✅ | ⬜ pending |
| 06-01-03 | 01 | 1 | BUG-03 | manual smoke | `npm run build` | ✅ | ⬜ pending |
| 06-01-04 | 01 | 1 | BUG-04 | manual smoke | `npm run build` | ✅ | ⬜ pending |
| 06-01-05 | 01 | 1 | BUG-05 | manual smoke | `npm run build` | ✅ | ⬜ pending |
| 06-02-01 | 02 | 1 | BRAND-01, BRAND-02 | manual smoke | `npm run build` | ✅ | ⬜ pending |
| 06-03-01 | 03 | 2 | BRAND-03 | automated | `curl -I https://hardhatsocial.net` | N/A | ⬜ pending |
| 06-03-02 | 03 | 2 | BRAND-04 | manual smoke | Visit https://hardhatsocial.net | N/A | ⬜ pending |
| 06-03-03 | 03 | 2 | BRAND-05 | manual smoke | Test password reset flow | N/A | ⬜ pending |
| 06-03-04 | 03 | 2 | BRAND-06 | manual smoke | Send test approval email to personal Gmail | N/A | ⬜ pending |
| 06-03-05 | 03 | 2 | BRAND-07 | manual smoke | Check GitHub/Vercel/Supabase dashboards | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- No automated test framework required for this phase
- All behavioral verification is manual smoke testing
- Build gate (`npm run build && npm run lint`) is the automated safety net

*Existing infrastructure covers all phase requirements via build gate.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Admin link appears in nav dropdown | BUG-01 | Requires browser session with admin email | Log in as admin email, open nav dropdown, verify "Admin" link visible |
| Approval email links to hardhatsocial.net | BUG-02 | Requires live email delivery | Approve test application, check email in Gmail, verify link domain |
| Approved contractor appears immediately in /contractors | BUG-03 | Requires admin approval action + page navigation | Approve test application in admin, navigate to /contractors, verify contractor appears |
| Homepage count reflects current DB | BUG-04 | Requires approval action to trigger revalidation | Approve application, navigate to homepage, verify count updated |
| Certifications visible on contractor profile | BUG-05 | Requires contractor with cert records in DB | View approved contractor profile (approved post-Phase 2), verify certs section shows |
| "Hard Hat Social" branding throughout UI | BRAND-01 | Requires visual review | Check NavBar, page titles, email subjects for "Hard Hat Social" text |
| Brand color tokens render on all pages | BRAND-02 | Requires visual review | Check all pages for brand-blue and brand-yellow color application |
| hardhatsocial.net DNS resolves | BRAND-03 | DNS propagation required | `curl -I https://hardhatsocial.net` returns 200 after 24-48h |
| Vercel serves hardhatsocial.net | BRAND-04 | Requires Vercel domain config | Visit https://hardhatsocial.net, verify app loads with correct env vars |
| Supabase auth callbacks redirect to hardhatsocial.net | BRAND-05 | Requires live auth flow | Test password reset email link, verify redirect goes to hardhatsocial.net |
| Approval email from hardhatsocial.net, inbox (not spam) | BRAND-06 | Requires Resend domain verification + live email | Send test approval, check Gmail inbox and spam folder |
| GitHub/Vercel/Supabase renamed | BRAND-07 | Dashboard operations | Check each platform dashboard for updated project names |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or manual smoke verification documented
- [ ] Build gate (`npm run build && npm run lint`) passes after each code task
- [ ] No watch-mode flags used
- [ ] Feedback latency < 60s for automated checks
- [ ] `nyquist_compliant: true` set in frontmatter when all checks pass

**Approval:** pending
