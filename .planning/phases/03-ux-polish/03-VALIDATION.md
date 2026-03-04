---
phase: 3
slug: ux-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no jest/vitest/playwright installed |
| **Config file** | None |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run lint && npm run build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run lint && npm run build`
- **Before `/gsd:verify-work`:** Full suite must be green + manual browser checks complete
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 1 | UX-01 | build | `npm run build` | ✅ | ⬜ pending |
| 3-02-01 | 02 | 1 | UX-02 | build | `npm run build` | ✅ | ⬜ pending |
| 3-03-01 | 03 | 1 | UX-03 | build | `npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements — `npm run build` verifies TypeScript correctness for all three tasks.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Skeleton cards show while `/contractors` loads | UX-01 | Visual browser behavior — no test framework | DevTools → Network → Slow 3G → navigate to `/contractors`, confirm skeleton grid appears |
| Empty state with reset button when no filter results | UX-02 | Visual browser behavior — no test framework | Apply trade + state filter with no matches, confirm message and "Reset filters" button appear |
| Hamburger visible at 375px with ≥44px tap target | UX-03 | Interaction behavior at specific viewport — no test framework | DevTools → 375px viewport, confirm hamburger icon visible, desktop links hidden, dropdown opens on tap |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
