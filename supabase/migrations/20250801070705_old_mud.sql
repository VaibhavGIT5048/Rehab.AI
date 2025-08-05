/*
  # Create videos table for media functionality

  1. New Tables
    - `videos`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text)
      - `video_url` (text, not null)
      - `thumbnail_url` (text)
      - `file_name` (text, not null)
      - `file_size` (bigint)
      - `category` (text, default 'exercise')
      - `views` (integer, default 0)
      - `uploaded_by` (uuid, foreign key to auth.users)
      - `is_public` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `videos` table
    - Add policies for public video viewing
    - Add policies for admin video management
*/

CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  video_url text NOT NULL,
  thumbnail_url text,
  file_name text NOT NULL,
  file_size bigint DEFAULT 0,
  category text DEFAULT 'exercise',
  views integer DEFAULT 0,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Public can view public videos
CREATE POLICY "Anyone can view public videos"
  ON videos
  FOR SELECT
  TO authenticated
  USING (is_public = true);

-- Users can view their own uploaded videos
CREATE POLICY "Users can view own videos"
  ON videos
  FOR SELECT
  TO authenticated
  USING (uploaded_by = auth.uid());

-- Users can upload videos
CREATE POLICY "Users can upload videos"
  ON videos
  FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

-- Users can update their own videos
CREATE POLICY "Users can update own videos"
  ON videos
  FOR UPDATE
  TO authenticated
  USING (uploaded_by = auth.uid());

-- Users can delete their own videos
CREATE POLICY "Users can delete own videos"
  ON videos
  FOR DELETE
  TO authenticated
  USING (uploaded_by = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_videos_public ON videos (is_public, created_at);
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos (category);
CREATE INDEX IF NOT EXISTS idx_videos_uploaded_by ON videos (uploaded_by);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_videos_updated_at();