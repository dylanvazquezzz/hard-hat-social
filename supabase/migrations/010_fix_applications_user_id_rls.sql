-- 010_fix_applications_user_id_rls.sql
-- BUG-06: Idempotent fix for the 400 error on applications status query.
--
-- Root cause: Migration 004 may not have been applied to production,
-- leaving the applications table without a user_id column. PostgREST
-- returns 400 when a query filters on a column that doesn't exist in
-- its schema cache.
--
-- This migration:
--   1. Ensures user_id column exists (idempotent ADD COLUMN IF NOT EXISTS)
--   2. Ensures the correct index exists
--   3. Drops and recreates the applications SELECT policy using user_id
--      so it works whether or not the old email-based policy is present

-- Step 1: Ensure user_id column exists
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users ON DELETE SET NULL;

-- Step 2: Ensure index exists for fast user_id lookups
CREATE INDEX IF NOT EXISTS applications_user_id_idx ON applications(user_id);

-- Step 3: Ensure document_urls column exists (from migration 006)
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS document_urls text[] DEFAULT '{}';

-- Step 4: Replace SELECT policy to use user_id (idempotent)
-- Drop both the old email-based policy and the user_id policy, then recreate cleanly.
DROP POLICY IF EXISTS "Applicants can view their own application" ON applications;
DROP POLICY IF EXISTS "Applicants can view their own pending application" ON applications;

CREATE POLICY "Applicants can view their own application"
  ON applications FOR SELECT
  USING (user_id = auth.uid());

-- Step 5: Ensure UPDATE policy exists (idempotent)
DROP POLICY IF EXISTS "Applicants can update their own pending application" ON applications;

CREATE POLICY "Applicants can update their own pending application"
  ON applications FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending');
