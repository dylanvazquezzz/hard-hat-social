---
phase: 4
slug: homepage-redesign
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None detected — no jest.config, vitest.config, or test files found |
| **Config file** | None — Wave 0 gap |
| **Quick run command** | `npm run build` (TypeScript compile check) |
| **Full suite command** | Manual visual inspection (see below) |
| **Estimated runtime** | ~30 seconds (build) + ~5 minutes (manual) |

---

## Sampling Rate

- **After every task commit:** Run `npm run build` to catch TypeScript errors, then visually verify homepage at `npm run dev`
- **After every plan wave:** Full homepage review — all 4 sections visible, stats populated with real numbers, CTAs correct order and styling
- **Before `/gsd:verify-work`:** Full suite must be green (build passes + all 3 manual checks done)
- **Max feedback latency:** ~35 seconds per task (build + quick visual scan)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 4-01-01 | 01 | 1 | HOME-01, HOME-02 | manual | `npm run build` | ✅ | ⬜ pending |
| 4-01-02 | 01 | 1 | HOME-03 | manual | DevTools 375×667 | N/A | ⬜ pending |
| 4-01-03 | 01 | 1 | HOME-01 | manual | Visual inspection at `/` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- No test framework installed — all validation is manual inspection for this phase
- `npm run build` serves as the automated gate (TypeScript compile, no runtime errors)

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Hero contains "Apply as a Contractor" as amber primary CTA, visually above "Browse Directory" | HOME-01 | UI/visual — no test framework | Visit `/` in browser, confirm Apply button is amber-filled, Browse is outlined, Apply appears first |
| Stats row shows real non-broken numbers (not blank) | HOME-02 | Requires DB state to verify | Check Supabase contractors/applications tables, confirm rendered numbers match DB counts |
| CTA buttons are full-width and tappable at 375px viewport | HOME-03 | Responsive layout — requires visual check | Open DevTools → Responsive mode → 375×667 (iPhone SE) → confirm buttons are full-width, stat row visible without scrolling |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
