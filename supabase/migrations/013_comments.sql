-- Migration 013: comments table
-- Creates the comments table with RLS policies for public read, authenticated insert, and owner delete.

-- Create comments table (idempotent)
CREATE TABLE IF NOT EXISTS comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookup of comments by post
CREATE INDEX IF NOT EXISTS comments_post_id_idx ON comments(post_id);

-- Enable Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can read comments (public read)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'comments_select_public'
  ) THEN
    CREATE POLICY comments_select_public ON comments
      FOR SELECT USING (true);
  END IF;
END $$;

-- Policy: authenticated users can insert their own comments
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'comments_insert_authenticated'
  ) THEN
    CREATE POLICY comments_insert_authenticated ON comments
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Policy: owners can delete their own comments
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'comments_delete_owner'
  ) THEN
    CREATE POLICY comments_delete_owner ON comments
      FOR DELETE TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;
