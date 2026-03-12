# M001 Acceptance Checklist
## v1.3 UX & Trade Expansion

Use this to verify each slice after it ships. Check the box when you've confirmed it yourself on the live site (hardhatsocial.net) or locally.

Each slice also has a detailed UAT file at `.gsd/milestones/M001/slices/SXX/SXX-UAT.md` — go there for step-by-step test cases and edge cases.

---

## S01: Auto-Deploy + Bug Fix ✅ SHIPPED

- [x] Navigate to `/apply` while logged in with a pending application — **no 400 error** in DevTools Network tab
- [x] Run `./scripts/deploy.sh "test"` from repo root — build passes, commit created, push succeeds
- [x] Check Vercel dashboard after push — deployment triggered automatically
- [x] `/admin` queue still shows pending applications and approve/reject still works

---

## S02: Directory Filter Expansion

- [ ] `/contractors` filter panel has **Insurance** and **Certification** filter options (in addition to existing trade/state filters)
- [ ] Select a trade + a cert type — results show only contractors matching **both** filters simultaneously
- [ ] On mobile (375px wide) — filter panel has no horizontal overflow, all controls usable
- [ ] Clear all filters — full contractor list returns

---

## S03: Job Posting UX Overhaul

- [ ] Log in as a General Contractor and navigate to `/profile` — **Posts tab opens by default** with Jobs sub-category pre-selected
- [ ] Create a new job post — form has structured fields: **Title, Trade, Pay Rate, Location, Duration, Description**
- [ ] Job appears on `/jobs` board showing the structured fields (pay, location, duration) clearly on the card
- [ ] Non-GC user navigating to `/profile` still defaults to normal tab behavior (no regression)

---

## S04: GC Recent Contacts

- [ ] On `/jobs`, click "Mark Hired" on a job — modal opens showing **Recent Contacts section** at the top (up to 5 previously hired contractors)
- [ ] First-time hire (no history) — Recent Contacts section either hidden or shows empty state gracefully
- [ ] Full contractor search is still available **below** the Recent Contacts section
- [ ] Hiring a contractor from Recent Contacts takes **2 clicks max** (click Mark Hired → click name)

---

## S05: Drywall Trade

- [ ] `/apply` — **Drywall** is selectable in the Trade dropdown
- [ ] `/contractors` — **Drywall** appears in the trade filter and returns results when selected
- [ ] Homepage (`/`) — **Drywall** appears in the Browse by Trade section
- [ ] Drywall verification requirements visible somewhere (tooltip, help text, or docs)

---

## S06: Homepage Hero Redesign

- [ ] Homepage hero has a **full-bleed background photo** (trade workers — welding, HVAC, plumbing, etc.)
- [ ] Photo is black & white or has a dark overlay — headline text is **clearly readable** over it
- [ ] **Browse by Trade** is a distinct section below the hero, visually separated by a horizontal rule or clear spacing
- [ ] On mobile (375px) — photo scales correctly, text doesn't overflow, CTA buttons are tappable

---

## Milestone Done When

All boxes above are checked AND:
- [ ] `npm run build` passes with zero errors
- [ ] No console errors on homepage, `/contractors`, `/jobs`, `/apply`, and `/profile`
- [ ] At least one real contractor can be found and contacted within 5 minutes of landing on the site
