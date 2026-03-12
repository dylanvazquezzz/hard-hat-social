# S04: GC Recent Contacts

**Slice goal:** The "Mark Hired" modal shows up to 5 recently hired contractors at the top so repeat hiring takes 2 clicks instead of searching.

**Requirements:** JOBS-08, JOBS-09

**Depends on:** S01

## Tasks

- [ ] **T01: Add recent contacts query to SubSelectorModal** — Query the jobs table for the current GC's previously hired contractors (hired_contractor_id IS NOT NULL, ordered by hired_at DESC, limit 5, distinct by contractor). Fetch contractor name and trade for display.

- [ ] **T02: Render Recent Contacts section in modal** — Show a "Recent Contacts" section at the top of the modal with the fetched contractors as quick-select buttons. Full search remains below. If no previous hires, skip the section entirely.

## Completion Criteria

- [ ] A GC who has previously hired someone sees them in the Recent Contacts section of the Mark Hired modal
- [ ] Clicking a recent contact selects them (same behavior as searching and selecting)
- [ ] A GC with no hire history sees only the search — no empty Recent Contacts section
- [ ] `npm run build` passes
