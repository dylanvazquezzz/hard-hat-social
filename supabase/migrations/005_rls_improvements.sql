-- Fix applications SELECT policy: use user_id instead of email lookup
DROP POLICY IF EXISTS "Applicants can view their own application" ON applications;

CREATE POLICY "Applicants can view their own application"
  ON applications FOR SELECT
  USING (user_id = auth.uid());

-- Applications: allow applicants to update their own pending applications
CREATE POLICY "Applicants can update their own pending application"
  ON applications FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending');

-- Posts: add missing UPDATE policy
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Full-text search index on contractors (name, trade, specialties)
CREATE INDEX IF NOT EXISTS contractors_search_idx
  ON contractors USING gin (
    to_tsvector(
      'english',
      coalesce(full_name, '') || ' ' ||
      coalesce(trade, '') || ' ' ||
      coalesce(array_to_string(specialties, ' '), '')
    )
  );
