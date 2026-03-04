---
phase: 2
slug: seo-and-cert-automation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-03
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no test config files present in project |
| **Config file** | None — manual verification only |
| **Quick run command** | N/A — manual browser check per task |
| **Full suite command** | N/A — manual checklist (see Per-Task Verification Map) |
| **Estimated runtime** | ~5 minutes (manual walkthrough) |

---

## Sampling Rate

- **After every task commit:** Manual browser verification of the specific change
- **After every plan wave:** Full manual checklist (all 6 requirements below)
- **Before `/gsd:verify-work`:** All 6 items checked off
- **Max feedback latency:** ~5 minutes per task (manual)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 1 | SEO-01 | manual | `curl -s https://contractors-connect.vercel.app/ \| grep metadataBase` | ❌ manual | ⬜ pending |
| 2-01-02 | 01 | 1 | SEO-02 | manual | Paste `/contractors/[id]` URL into opengraph.xyz; verify name, trade, image | ❌ manual | ⬜ pending |
| 2-01-03 | 01 | 1 | SEO-03 | manual | Paste `/u/[username]` URL into opengraph.xyz; verify username, image | ❌ manual | ⬜ pending |
| 2-01-04 | 01 | 1 | SEO-04 | manual | `curl -s [contractor-url] \| grep ld+json` then validate at validator.schema.org | ❌ manual | ⬜ pending |
| 2-02-01 | 02 | 2 | AUTH-01 | manual | Log in as pending user; navigate to `/contractors`, `/profile`, `/jobs` — expect restricted message; navigate to `/explore` — expect full access | ❌ manual | ⬜ pending |
| 2-03-01 | 03 | 3 | CERT-01 | manual | Run approval flow in admin queue; check `certifications` table in Supabase dashboard — expect at least one row | ❌ manual | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

No test infrastructure setup required. All phase verification is manual per the following constraints:
- No test framework is installed in the project
- All behaviors require HTTP responses, Supabase state changes, or auth session state
- Adding a test framework is out of scope for this phase

*Existing infrastructure covers all phase requirements via manual verification.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `metadataBase` resolves relative OG image URLs | SEO-01 | Requires deployed HTTP response inspection | `curl -s [url] \| grep og:image` — confirm absolute URL |
| `/contractors/[id]` OG tags show contractor name, trade, image | SEO-02 | Requires social crawler simulation | Paste URL into opengraph.xyz or metatags.io |
| `/u/[username]` OG tags show username and avatar | SEO-03 | Requires social crawler simulation | Paste URL into opengraph.xyz or metatags.io |
| JSON-LD `Person` schema in page source | SEO-04 | Requires rendered HTML inspection | View source or `curl`; validate at validator.schema.org |
| Pending user sees restricted message on locked pages | AUTH-01 | Requires auth session state | Sign in as pending applicant; navigate to `/contractors`, `/profile`, `/jobs` |
| Pending user can access `/explore` Social and Q&A | AUTH-01 | Requires auth session state | Same session; navigate to `/explore` — must show full content |
| Approving application creates certification records | CERT-01 | Requires Supabase state change | Approve an application in admin queue; query `certifications` table |

---

## Validation Sign-Off

- [ ] All tasks have manual verification steps defined above
- [ ] Sampling continuity: each task has a defined browser verification step
- [ ] Wave 0: no automated infrastructure needed — manual verification is appropriate
- [ ] No watch-mode flags
- [ ] Feedback latency: ~5 minutes per task (manual walkthrough)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
