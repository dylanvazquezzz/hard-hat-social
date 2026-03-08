---
phase: 7
slug: feed-redesign
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-08
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no test framework installed |
| **Config file** | None |
| **Quick run command** | `npm run lint` |
| **Full suite command** | `npm run lint && npm run build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint`
- **After every plan wave:** Run `npm run lint && npm run build`
- **Before `/gsd:verify-work`:** Full suite must be green + manual visual check on desktop viewport
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | FEED-01 | build + manual visual | `npm run lint && npm run build` | N/A | ⬜ pending |
| 07-01-02 | 01 | 1 | FEED-02 | build + manual visual | `npm run lint && npm run build` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

- No test framework exists in this project (no Jest, Vitest, or Playwright).
- TypeScript type-checking via `npm run build` catches prop type mismatches on `FeedSidebar`.
- No Wave 0 test files needed — changes are UI layout only.

*Existing infrastructure (TypeScript + lint) covers the automated checks available in this project.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Post cards fill full content column width with no excessive side margins | FEED-01 | No test framework; visual layout check only | Load `/explore` in desktop browser (≥1024px), confirm posts span the full feed column with no max-w-2xl restriction |
| Right sidebar shows "Recently Verified" and "Suggested People" widgets | FEED-02 | Visual layout; no test framework | Load `/explore` in desktop browser, confirm right sidebar appears with both widgets populated |
| Sidebar is sticky — stays visible while feed scrolls | FEED-02 | CSS behavior; no test framework | Scroll the explore feed on desktop and confirm sidebar remains visible |
| Mobile: sidebar hidden, feed full width | FEED-01/02 | Responsive layout | Resize browser to <1024px, confirm sidebar is hidden and feed fills full width |
| Suggested People shows same-trade contractors for logged-in approved user | FEED-02 | Requires live auth session | Log in as an approved welding contractor, confirm Suggested People shows welders |
| Suggested People falls back to Recently Verified for logged-out users | FEED-02 | Requires auth state toggle | Log out, confirm Suggested People widget is replaced or shows Recently Verified list |
| No hydration flash or layout shift when sidebar appears | FEED-02 | Visual; no test framework | Hard refresh `/explore`, confirm sidebar renders in initial paint with no flash |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
