/*
  # Create exercise videos table for persistent video storage

  1. New Tables
    - `exercise_videos`
      - `id` (uuid, primary key)
      - `title` (varchar, video title)
      - `url` (text, original video URL)
      - `video_type` (varchar, youtube or direct)
      - `youtube_video_id` (varchar, YouTube video ID if applicable)
      - `embed_url` (text, embeddable URL)
      - `thumbnail_url` (text, video thumbnail)
      - `duration` (varchar, video duration)
      - `description` (text, video description)
      - `category` (varchar, video category)
      - `is_active` (boolean, soft delete flag)
      - `user_id` (uuid, foreign key to auth.users)
      - `metadata` (jsonb, additional video metadata)
      - `created_at` (timestamptz, creation timestamp)
      - `updated_at` (timestamptz, last update timestamp)

  2. Security
    - Enable RLS on `exercise_videos` table
    - Add policies for authenticated users to manage their own videos

  3. Performance
    - Add indexes for user_id, category, and created_at for optimal query performance
*/

-- Create videos table
CREATE TABLE IF NOT EXISTS exercise_videos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title varchar(255) NOT NULL,
  url text NOT NULL,
  video_type varchar(20) CHECK (video_type IN ('youtube', 'direct')) NOT NULL,
  youtube_video_id varchar(50),
  embed_url text NOT NULL,
  thumbnail_url text,
  duration varchar(20),
  description text,
  category varchar(100) DEFAULT 'General',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exercise_videos_user_id ON exercise_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_videos_category ON exercise_videos(category);
CREATE INDEX IF NOT EXISTS idx_exercise_videos_created_at ON exercise_videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exercise_videos_active ON exercise_videos(is_active, user_id);

-- Enable Row Level Security
ALTER TABLE exercise_videos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own videos" ON exercise_videos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own videos" ON exercise_videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own videos" ON exercise_videos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own videos" ON exercise_videos
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_exercise_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_exercise_videos_updated_at
  BEFORE UPDATE ON exercise_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_exercise_videos_updated_at();