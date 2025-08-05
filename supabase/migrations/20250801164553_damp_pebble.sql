/*
  # Create blood reports table

  1. New Tables
    - `blood_reports`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `file_name` (text)
      - `file_url` (text, optional)
      - `analysis_result` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `blood_reports` table
    - Add policies for users to manage their own reports
*/

CREATE TABLE IF NOT EXISTS blood_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text,
  analysis_result jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE blood_reports ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own blood reports"
  ON blood_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own blood reports"
  ON blood_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own blood reports"
  ON blood_reports
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own blood reports"
  ON blood_reports
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blood_reports_user_id ON blood_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_blood_reports_created_at ON blood_reports(created_at);

-- Update trigger
CREATE OR REPLACE FUNCTION update_blood_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blood_reports_updated_at
  BEFORE UPDATE ON blood_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_blood_reports_updated_at();