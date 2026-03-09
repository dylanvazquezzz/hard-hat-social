---
phase: 8
slug: jobs-schema
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-08
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none — TypeScript build check via `npm run build` |
| **Config file** | none — no jest/vitest/pytest config detected |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run lint` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm run lint`
- **Before `/gsd:verify-work`:** Full suite must be green + manual trigger verification done
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 8-01-01 | 01 | 1 | SC-1 (jobs table + trigger) | manual | apply migration to local Supabase, run test UPDATEs | ❌ W0 N/A | ⬜ pending |
| 8-01-02 | 01 | 1 | SC-2 (Job TypeScript interface) | build | `npm run build` | ✅ (after edit) | ⬜ pending |
| 8-01-03 | 01 | 1 | SC-3 (build passes) | build | `npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test files needed.

- `npm run build` is the automated gate for TypeScript correctness
- Manual DB verification is documented in the plan task steps

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `jobs` table created with CHECK constraint | SC-1 | Requires running Postgres instance; no test harness | Apply migration to local Supabase; run `SELECT * FROM jobs LIMIT 1` |
| BEFORE UPDATE trigger blocks invalid transitions | SC-1 | Requires DB execution with live trigger | Insert a job, attempt `UPDATE jobs SET status = 'open' WHERE status = 'hired'` — expect error; attempt `UPDATE jobs SET status = 'hired' WHERE status = 'completed'` — expect error |
| RLS public SELECT only returns open jobs | SC-1 | Requires Supabase RLS testing with anon key | Query jobs as anon user; verify only status='open' rows returned |
| GC-only INSERT policy | SC-1 | Requires RLS auth context | Attempt INSERT as non-GC approved contractor — expect permission denied |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
