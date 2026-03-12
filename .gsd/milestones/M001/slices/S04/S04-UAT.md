# M001/S04: GC Recent Contacts — UAT

**Milestone:** M001
**Written:** 2026-03-12

## UAT Type

- UAT mode: artifact-driven + live-runtime
- Why this mode is sufficient: Build passes. Logic verified by code review. Full live test requires a GC with at least one prior hire in the jobs table — documented below.

## Preconditions

- Signed in as an approved GC contractor (trade = 'General Contractor')
- At least one job row with `gc_contractor_id = <your id>` and `hired_contractor_id IS NOT NULL` and `hired_at` set
- An open job to click "Mark Hired" on

## Smoke Test

Open the Mark Hired modal on any open job as a GC who has prior hires. Confirm "Recent Contacts" section appears above the search input with up to 5 contractor buttons.

## Test Cases

### 1. Recent Contacts shown for GC with hire history

1. Sign in as a GC with at least one prior hire
2. Go to `/jobs`, find an open job you own
3. Click "Mark Hired"
4. **Expected:** Modal shows "RECENT CONTACTS" section at top with up to 5 previously hired contractors as selectable buttons; divider + "ALL CONTRACTORS" label below; search input below that

### 2. Select from Recent Contacts — 2-click hire

1. In the modal, click any contractor in Recent Contacts
2. Click "Confirm"
3. **Expected:** Job status updates to "Hired" — same behavior as selecting from search; modal closes

### 3. Recent Contacts order — most recent first

1. GC has hired contractor A 3 weeks ago and contractor B 1 week ago
2. Open Mark Hired modal
3. **Expected:** Contractor B appears above Contractor A in Recent Contacts

### 4. No duplicate in Recent Contacts

1. GC has hired the same contractor on 3 different jobs
2. Open Mark Hired modal
3. **Expected:** That contractor appears only once in Recent Contacts

### 5. Recent Contacts capped at 5

1. GC has hired 8 distinct contractors
2. Open Mark Hired modal
3. **Expected:** Only the 5 most recently hired appear in Recent Contacts; all 8 available in full search

### 6. No hire history — section absent

1. Sign in as a GC with zero prior hires (no hired jobs)
2. Open Mark Hired modal
3. **Expected:** No "Recent Contacts" section — modal shows only the search input and full contractor list

### 7. Full search still works

1. With Recent Contacts visible, type in the search box
2. **Expected:** All Contractors list filters normally; Recent Contacts section is unaffected by search input

## Failure Signals

- Recent Contacts section visible but empty — contractor fetch returned 0 results; check `.eq('status', 'approved')` — hired contractor may have been unapproved
- Recent Contacts shows wrong order — `hired_at` not set on prior jobs; check jobs table
- Section shows for a GC with no hires — `gc_contractor_id` lookup returning wrong rows
- Duplicate contractor in Recent Contacts — dedup logic not working; check `seen` Set iteration

## Requirements Proved By This UAT

- **JOBS-08** — Recent Contacts section shows up to 5 previously hired contractors at the top (test cases 1, 3, 4, 5)
- **JOBS-09** — Full contractor search remains available below Recent Contacts (test case 7)

## Not Proven By This UAT

- Performance with large hire history (>100 jobs) — the 20-row over-fetch is sufficient for MVP scale
- Behavior when hired contractor has been deleted from DB — would simply not appear (correct)

## Notes for Tester

- To seed test data: insert a jobs row with your GC's `contractor_id`, any `hired_contractor_id`, status='hired', and `hired_at = now()`. Then open Mark Hired on a different open job.
- The Recent Contacts query fires on modal open — if you hire someone and immediately reopen the modal, the new hire should appear.
