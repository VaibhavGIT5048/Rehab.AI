/*
  # Enhance Friends and Sharing Features

  1. Database Functions
    - Add function to get mutual friends
    - Add function to get friend suggestions
    - Add function to get friendship statistics

  2. Indexes
    - Add indexes for better friendship query performance
    - Add indexes for notification queries

  3. Security
    - Update RLS policies for better friend management
    - Add policies for sharing features

  4. Views
    - Create view for friend statistics
    - Create view for user activity
*/

-- Function to get mutual friends between two users
CREATE OR REPLACE FUNCTION get_mutual_friends(user1_id uuid, user2_id uuid)
RETURNS TABLE(friend_id uuid, friend_name text, friend_avatar text) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    CASE 
      WHEN f1.requester_id = user1_id THEN f1.addressee_id
      ELSE f1.requester_id
    END as friend_id,
    p.name as friend_name,
    p.avatar_url as friend_avatar
  FROM friendships f1
  JOIN friendships f2 ON (
    (f1.requester_id = user1_id AND f1.addressee_id = f2.requester_id AND f2.addressee_id = user2_id) OR
    (f1.requester_id = user1_id AND f1.addressee_id = f2.addressee_id AND f2.requester_id = user2_id) OR
    (f1.addressee_id = user1_id AND f1.requester_id = f2.requester_id AND f2.addressee_id = user2_id) OR
    (f1.addressee_id = user1_id AND f1.requester_id = f2.addressee_id AND f2.requester_id = user2_id)
  )
  JOIN profiles p ON p.id = CASE 
    WHEN f1.requester_id = user1_id THEN f1.addressee_id
    ELSE f1.requester_id
  END
  WHERE f1.status = 'accepted' AND f2.status = 'accepted';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get friend suggestions based on mutual connections
CREATE OR REPLACE FUNCTION get_friend_suggestions(for_user_id uuid, limit_count integer DEFAULT 10)
RETURNS TABLE(
  user_id uuid, 
  user_name text, 
  user_avatar text, 
  mutual_friends_count bigint,
  user_role text,
  verified boolean
) AS $$
BEGIN
  RETURN QUERY
  WITH user_connections AS (
    SELECT DISTINCT
      CASE 
        WHEN requester_id = for_user_id THEN addressee_id
        ELSE requester_id
      END as connected_user_id
    FROM friendships
    WHERE (requester_id = for_user_id OR addressee_id = for_user_id)
      AND status IN ('accepted', 'pending')
  ),
  potential_friends AS (
    SELECT DISTINCT
      CASE 
        WHEN f.requester_id != for_user_id AND f.requester_id NOT IN (SELECT connected_user_id FROM user_connections) THEN f.requester_id
        WHEN f.addressee_id != for_user_id AND f.addressee_id NOT IN (SELECT connected_user_id FROM user_connections) THEN f.addressee_id
        ELSE NULL
      END as potential_friend_id
    FROM friendships f
    WHERE (f.requester_id IN (SELECT connected_user_id FROM user_connections) 
           OR f.addressee_id IN (SELECT connected_user_id FROM user_connections))
      AND f.status = 'accepted'
      AND f.requester_id != for_user_id 
      AND f.addressee_id != for_user_id
  )
  SELECT 
    p.id as user_id,
    p.name as user_name,
    p.avatar_url as user_avatar,
    COUNT(DISTINCT uc.connected_user_id) as mutual_friends_count,
    COALESCE(ur.role::text, 'patient') as user_role,
    COALESCE(ur.verified, false) as verified
  FROM profiles p
  LEFT JOIN user_roles ur ON ur.user_id = p.id
  LEFT JOIN friendships f ON (
    (f.requester_id = p.id OR f.addressee_id = p.id) AND
    (f.requester_id IN (SELECT connected_user_id FROM user_connections) OR 
     f.addressee_id IN (SELECT connected_user_id FROM user_connections)) AND
    f.status = 'accepted'
  )
  LEFT JOIN user_connections uc ON (
    (f.requester_id = uc.connected_user_id AND f.addressee_id = p.id) OR
    (f.addressee_id = uc.connected_user_id AND f.requester_id = p.id)
  )
  WHERE p.id IN (SELECT potential_friend_id FROM potential_friends WHERE potential_friend_id IS NOT NULL)
    AND p.is_public = true
  GROUP BY p.id, p.name, p.avatar_url, ur.role, ur.verified
  ORDER BY mutual_friends_count DESC, p.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get friendship statistics for a user
CREATE OR REPLACE FUNCTION get_friendship_stats(for_user_id uuid)
RETURNS TABLE(
  friends_count bigint,
  pending_requests_count bigint,
  sent_requests_count bigint,
  mutual_friends_with_recent bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM friendships 
     WHERE (requester_id = for_user_id OR addressee_id = for_user_id) 
       AND status = 'accepted') as friends_count,
    (SELECT COUNT(*) FROM friendships 
     WHERE addressee_id = for_user_id AND status = 'pending') as pending_requests_count,
    (SELECT COUNT(*) FROM friendships 
     WHERE requester_id = for_user_id AND status = 'pending') as sent_requests_count,
    (SELECT COUNT(DISTINCT CASE 
       WHEN f1.requester_id = for_user_id THEN f1.addressee_id
       ELSE f1.requester_id
     END)
     FROM friendships f1
     WHERE (f1.requester_id = for_user_id OR f1.addressee_id = for_user_id)
       AND f1.status = 'accepted'
       AND f1.updated_at >= NOW() - INTERVAL '30 days') as mutual_friends_with_recent;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_friendships_status_users ON friendships(status, requester_id, addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_updated_at ON friendships(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_metadata_gin ON notifications USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_posts_sharing ON posts(is_public, created_at DESC) WHERE is_public = true;

-- Update RLS policies for friendships to allow better friend discovery
DROP POLICY IF EXISTS "Users can view own friendships" ON friendships;
CREATE POLICY "Users can view own friendships and public friend lists"
  ON friendships
  FOR SELECT
  TO authenticated
  USING (
    (requester_id = auth.uid()) OR 
    (addressee_id = auth.uid()) OR
    (status = 'accepted')
  );

-- Add policy for viewing public profiles for friend suggestions
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile and public profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    (id = auth.uid()) OR 
    (is_public = true)
  );

-- Create view for user activity (for friend suggestions)
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
  p.id,
  p.name,
  p.avatar_url,
  p.bio,
  p.location,
  p.created_at,
  ur.role,
  ur.verified,
  COUNT(DISTINCT posts.id) as posts_count,
  COUNT(DISTINCT pl.id) as likes_given_count,
  COUNT(DISTINCT pc.id) as comments_count,
  MAX(posts.created_at) as last_post_date
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
LEFT JOIN posts ON posts.user_id = p.id AND posts.is_public = true
LEFT JOIN post_likes pl ON pl.user_id = p.id
LEFT JOIN post_comments pc ON pc.user_id = p.id
WHERE p.is_public = true
GROUP BY p.id, p.name, p.avatar_url, p.bio, p.location, p.created_at, ur.role, ur.verified;

-- Grant access to the view
GRANT SELECT ON user_activity_summary TO authenticated;

-- Create RLS policy for the view
ALTER VIEW user_activity_summary SET (security_barrier = true);
CREATE POLICY "Public can view user activity summary"
  ON user_activity_summary
  FOR SELECT
  TO authenticated
  USING (true);