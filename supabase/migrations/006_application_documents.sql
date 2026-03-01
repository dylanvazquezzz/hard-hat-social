-- Add document_urls to applications (credential uploads)
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS document_urls text[] DEFAULT '{}';

-- Storage bucket for application credential documents
-- Files are private; admins access via service role
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'application-docs',
  'application-docs',
  false,
  10485760, -- 10 MB per file
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Applicants can upload to their own folder (keyed by email prefix)
CREATE POLICY "Applicants can upload their own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'application-docs' AND auth.role() = 'authenticated');

-- Applicants can read their own documents
CREATE POLICY "Applicants can read their own documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'application-docs' AND auth.role() = 'authenticated');
