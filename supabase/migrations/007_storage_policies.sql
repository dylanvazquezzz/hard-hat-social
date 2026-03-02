-- Migration 007: Storage bucket RLS policies
-- Sets public read + authenticated write for avatars and post-images.
-- Replaces permissive application-docs policies with strict per-user path restriction.
-- Source patterns: https://supabase.com/docs/guides/storage/security/access-control

-- ============================================================
-- DROP old permissive application-docs policies from migration 006
-- Must drop before creating new strict replacements.
-- PostgreSQL evaluates all policies with OR logic — old permissive
-- policies bypass new strict ones if not removed first.
-- ============================================================
DROP POLICY IF EXISTS "Applicants can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Applicants can read their own documents" ON storage.objects;

-- ============================================================
-- avatars bucket
-- Create if not exists (not in any prior migration — may be dashboard-only).
-- Set public = true per locked decision: all buckets public read.
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read — anyone (unauthenticated included) can view avatars
CREATE POLICY "avatars: public read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- Authenticated upload — no path restriction per locked decision
CREATE POLICY "avatars: authenticated upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- Authenticated update — required for upsert: true (used in profile/page.tsx)
CREATE POLICY "avatars: authenticated update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars');

-- ============================================================
-- post-images bucket
-- Create if not exists.
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read
CREATE POLICY "post-images: public read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'post-images');

-- Authenticated upload — no path restriction per locked decision
CREATE POLICY "post-images: authenticated upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'post-images');

-- ============================================================
-- application-docs bucket
-- Bucket already exists from migration 006 (public: false).
-- Update public flag to true per locked decision.
-- ============================================================
UPDATE storage.buckets
SET public = true
WHERE id = 'application-docs';

-- Public read — admins and applicants can view docs via URL
CREATE POLICY "application-docs: public read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'application-docs');

-- STRICT per-user upload: authenticated users may ONLY upload to
-- paths starting with their own auth.uid().
-- DEPENDS ON: apply/page.tsx using userId (not appData.id) as path prefix.
-- auth.uid() returns uuid — cast to text for string comparison.
CREATE POLICY "application-docs: upload to own folder only"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'application-docs'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );
