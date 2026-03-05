---
phase: 5
slug: founding-cohort-onboarding
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None (no jest/vitest detected) — build + lint as proxy |
| **Config file** | none — existing `next.config.js` / `tsconfig.json` |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run lint` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm run lint`
- **Before `/gsd:verify-work`:** Full manual smoke test (application → approval → email → sign-in → profile) must pass
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 5-01-01 | 01 | 1 | Email URL fix | build | `npm run build` | ✅ lib/email.ts | ⬜ pending |
| 5-01-02 | 01 | 1 | Auth redirect param | build | `npm run build` | ✅ app/auth/page.tsx | ⬜ pending |
| 5-01-03 | 01 | 1 | Welcome banner | build | `npm run build` | ✅ app/profile/page.tsx | ⬜ pending |
| 5-01-04 | 01 | 1 | /apply invite banner | build | `npm run build` | ✅ app/apply/page.tsx | ⬜ pending |
| 5-02-01 | 02 | 1 | updateCertification action | build | `npm run build` | ✅ app/admin/contractors/[id]/actions.ts | ⬜ pending |
| 5-02-02 | 02 | 1 | CertRow client component | build | `npm run build` | ❌ W0 | ⬜ pending |
| 5-03-01 | 03 | 2 | Operational runbook | manual | n/a | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `app/admin/contractors/[id]/CertRow.tsx` — new client component (stub)
- [ ] `.planning/phases/05-founding-cohort-onboarding/RUNBOOK.md` — operational runbook (stub)

*No test framework installation required — build serves as automated verification proxy.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Approval email links to production URL | Email URL fix | No automated email test harness | Approve test application via admin queue; inspect received email href — must contain `contractors-connect.vercel.app`, not `localhost` |
| Email CTA navigates to `/auth?redirect=/profile` | Auth redirect param | Email link requires live inbox | Click CTA in approval email; verify URL contains `?redirect=/profile` before signing in |
| After sign-in via redirect param, lands on `/profile` | Auth redirect | Requires browser + live auth session | Sign in via `/auth?redirect=/profile`; confirm browser navigates to `/profile` |
| Welcome banner visible on `/profile` for new approved contractor | Welcome banner | Requires approved contractor session with no avatar | Sign in as fresh approved contractor; verify banner appears with correct copy |
| Welcome banner disappears after avatar upload | Welcome banner dismiss | Requires file upload interaction | Upload avatar on `/profile`; verify banner is gone after page refresh |
| Inline cert edit expands and saves | Cert edit | Requires admin session + UI interaction | Visit `/admin/contractors/[id]`; click Edit on a cert row; change a field; Save; verify change reflected in list and on `/contractors/[id]` |
| /apply banner shows with contact email link | Invite banner | Requires env var + page visit | Set `NEXT_PUBLIC_CONTACT_EMAIL` in Vercel; visit `/apply`; verify banner appears above form with mailto link |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
