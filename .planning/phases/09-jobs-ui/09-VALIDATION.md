---
phase: 9
slug: jobs-ui
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none currently — manual/build verification |
| **Config file** | none |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run lint` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm run lint`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 9-01-01 | 09-01 | 1 | JOBS-01 | build | `npm run build` | ❌ W0 | ⬜ pending |
| 9-01-02 | 09-01 | 1 | JOBS-01 | build | `npm run build` | ❌ W0 | ⬜ pending |
| 9-02-01 | 09-02 | 2 | JOBS-02 | build | `npm run build` | ❌ W0 | ⬜ pending |
| 9-02-02 | 09-02 | 2 | JOBS-02 | build | `npm run build` | ❌ W0 | ⬜ pending |
| 9-03-01 | 09-03 | 3 | JOBS-03 | build | `npm run build` | ❌ W0 | ⬜ pending |
| 9-03-02 | 09-03 | 3 | JOBS-04 | build | `npm run build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Verify `npm run build` passes before starting execution

*Existing infrastructure (TypeScript compiler + Next.js build) covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Job appears with "Open" status on board | JOBS-01 | Requires Supabase + auth session | Sign in as approved contractor, create job, verify it appears with Open pill |
| GC can mark contractor as hired | JOBS-02 | Requires two contractor accounts + modal interaction | Sign in as GC, open SubSelectorModal, select contractor, verify Hired status |
| GC can mark job as completed | JOBS-03 | Requires hired state first | After hiring, click Complete, verify job shows Completed status |
| Completed job appears on hired contractor profile | JOBS-04 | Requires full workflow + profile page | After completion, navigate to hired contractor's profile, verify portfolio entry |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
