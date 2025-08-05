/*
  # Create sample posts for the professional feed

  1. New Tables
    - Sample posts with different categories for testing
  2. Security
    - Posts are publicly readable for authenticated users
  3. Sample Data
    - Posts from different doctors and categories
    - Exercise tips, inspiration, and doctor-specific content
*/

-- Insert sample posts for the professional feed
INSERT INTO posts (author_id, author_name, author_title, author_avatar, author_verified, content, image_url, likes, comments, tags, category) VALUES
-- Dr. Sarah Mitchell posts
('mitchell', 'Dr. Sarah Mitchell', 'Sports Physiotherapist', 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=400', true, 
'Recovery tip: Focus on proper form over speed when doing rehabilitation exercises. Quality movement patterns are key to preventing re-injury and building lasting strength. Remember, slow and steady wins the race! 💪', 
'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800', 
24, 8, ARRAY['rehabilitation', 'form', 'recovery'], 'exercise-tips'),

('mitchell', 'Dr. Sarah Mitchell', 'Sports Physiotherapist', 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=400', true,
'Just finished a great session with one of my ACL recovery patients. Seeing the progress from week 1 to week 12 never gets old. The human body''s ability to heal and adapt is truly remarkable. Keep pushing forward, everyone! 🌟',
NULL,
31, 12, ARRAY['ACL', 'progress', 'motivation'], 'my-doctor'),

-- Dr. Marcus Chen posts  
('chen', 'Dr. Marcus Chen', 'Orthopedic Surgeon', 'https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=400', true,
'Post-surgical care is just as important as the surgery itself. Follow your physiotherapist''s guidance, attend all follow-up appointments, and don''t rush the healing process. Your future self will thank you.',
'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=800',
18, 5, ARRAY['surgery', 'recovery', 'patience'], 'my-doctor'),

('chen', 'Dr. Marcus Chen', 'Orthopedic Surgeon', 'https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=400', true,
'Understanding your injury is the first step to recovery. Don''t hesitate to ask questions during your appointments. Knowledge empowers you to take an active role in your healing journey.',
NULL,
22, 7, ARRAY['education', 'empowerment', 'healing'], 'exercise-tips'),

-- Emma Rodriguez posts
('rodriguez', 'Emma Rodriguez', 'Physical Therapist', 'https://images.pexels.com/photos/8376285/pexels-photo-8376285.jpeg?auto=compress&cs=tinysrgb&w=400', true,
'Gentle reminder: Rest days are not lazy days. They''re growth days. Your muscles repair and strengthen during rest, not just during exercise. Listen to your body and honor what it needs. 🧘‍♀️',
'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=800',
45, 15, ARRAY['rest', 'recovery', 'selfcare'], 'inspiration'),

('rodriguez', 'Emma Rodriguez', 'Physical Therapist', 'https://images.pexels.com/photos/8376285/pexels-photo-8376285.jpeg?auto=compress&cs=tinysrgb&w=400', true,
'Manual therapy techniques can significantly improve range of motion and reduce pain. Combined with targeted exercises, it creates a comprehensive approach to rehabilitation. Every small improvement counts!',
NULL,
28, 9, ARRAY['manual-therapy', 'ROM', 'comprehensive'], 'my-doctor'),

-- General inspiration posts
('community', 'RehabAI Community', 'Recovery Platform', 'https://images.pexels.com/photos/3768114/pexels-photo-3768114.jpeg?auto=compress&cs=tinysrgb&w=400', false,
'Success story spotlight: Sarah completed her 12-week knee rehabilitation program and is back to playing tennis! Her dedication to consistent exercise and following her treatment plan paid off. What''s your recovery goal? Share below! 🎾',
'https://images.pexels.com/photos/1263349/pexels-photo-1263349.jpeg?auto=compress&cs=tinysrgb&w=800',
67, 23, ARRAY['success-story', 'tennis', 'goals'], 'inspiration'),

('community', 'RehabAI Community', 'Recovery Platform', 'https://images.pexels.com/photos/3768114/pexels-photo-3768114.jpeg?auto=compress&cs=tinysrgb&w=400', false,
'Exercise of the week: Wall sits! Great for building quadriceps strength and endurance. Start with 30 seconds and gradually increase. Perfect for knee injury recovery. Remember to keep your back flat against the wall! 🏋️‍♀️',
'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800',
39, 11, ARRAY['wall-sits', 'quadriceps', 'knee-recovery'], 'exercise-tips'),

('community', 'RehabAI Community', 'Recovery Platform', 'https://images.pexels.com/photos/3768114/pexels-photo-3768114.jpeg?auto=compress&cs=tinysrgb&w=400', false,
'Nutrition plays a crucial role in recovery. Protein helps repair tissues, anti-inflammatory foods reduce swelling, and staying hydrated supports all bodily functions. Fuel your recovery with the right foods! 🥗',
NULL,
33, 14, ARRAY['nutrition', 'recovery', 'anti-inflammatory'], 'exercise-tips'),

('community', 'RehabAI Community', 'Recovery Platform', 'https://images.pexels.com/photos/3768114/pexels-photo-3768114.jpeg?auto=compress&cs=tinysrgb&w=400', false,
'Mental health is just as important as physical health during recovery. It''s normal to feel frustrated or discouraged sometimes. Celebrate small wins, practice patience with yourself, and remember that healing takes time. You''ve got this! 💙',
'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=800',
52, 18, ARRAY['mental-health', 'patience', 'encouragement'], 'inspiration');