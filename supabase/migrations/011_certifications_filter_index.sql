-- Migration 011: Add index for certification filter performance
-- S02 — Directory Filter Expansion
-- The insurance and cert filters run:
--   SELECT contractor_id FROM certifications WHERE name ILIKE '%...'
-- An index on (contractor_id, name) makes these lookups fast as the
-- certifications table grows. The index is created idempotently.

create index if not exists certifications_contractor_id_name_idx
  on certifications (contractor_id, name);
