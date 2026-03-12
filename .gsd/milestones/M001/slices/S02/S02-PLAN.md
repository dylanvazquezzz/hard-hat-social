# S02: Directory Filter Expansion

**Slice goal:** Add insurance and certification filters to the /contractors directory so users can find contractors by whether they carry specific insurance or hold specific certs.

**Requirements:** FILTER-01, FILTER-02, FILTER-03

**Depends on:** S01

## Tasks

- [ ] **T01: Add insurance + cert filter UI to SearchFilters** — Add checkboxes or toggles for "Has General Liability Insurance", "Has Workers Comp", and a cert name multi-select (populated from distinct cert names in the certifications table). Keep mobile layout clean — stack filters vertically at 375px.

- [ ] **T02: Update /contractors query to apply new filters** — Pass insurance and cert filter params to the Supabase query. Insurance filter: check contractors who have a certification with issuing_body or name containing "insurance". Cert filter: join certifications table and filter by name. Filters must compose with existing trade + state filters.

- [ ] **T03: Verify filter accuracy and performance** — Confirm that selecting trade + cert returns only contractors matching both. Add a DB index on certifications(contractor_id, name) if not already present.

## Completion Criteria

- [ ] Filter panel shows insurance checkboxes and cert name options
- [ ] Selecting "Has General Liability" returns only contractors with a matching cert record
- [ ] Combining trade filter + cert filter returns correct intersection
- [ ] No horizontal overflow on mobile at 375px viewport
- [ ] `npm run build` passes
