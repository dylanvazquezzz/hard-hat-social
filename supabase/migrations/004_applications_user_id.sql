-- Add user_id to applications so we can link applicants to their auth account on approval
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users ON DELETE SET NULL;

-- Index for lookups
CREATE INDEX IF NOT EXISTS applications_user_id_idx ON applications(user_id);
