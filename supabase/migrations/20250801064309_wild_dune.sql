/*
  # Create storage buckets for file uploads

  1. Storage Buckets
    - avatars: For profile pictures
    - health-records: For health documents and images
  2. Security
    - RLS policies for secure file access
    - Users can only access their own files
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('avatars', 'avatars', true),
('health-records', 'health-records', false);

-- Create RLS policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create RLS policies for health-records bucket
CREATE POLICY "Users can view their own health records" ON storage.objects
FOR SELECT USING (
  bucket_id = 'health-records' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own health records" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'health-records' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own health records" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'health-records' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own health records" ON storage.objects
FOR DELETE USING (
  bucket_id = 'health-records' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);