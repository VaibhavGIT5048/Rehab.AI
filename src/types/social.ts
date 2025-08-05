export interface UserRole {
  id: string;
  user_id: string;
  role: 'doctor' | 'patient' | 'admin';
  specialization?: string;
  license_number?: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
  requester?: UserProfile;
  addressee?: UserProfile;
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: string;
  status: 'sent' | 'delivered' | 'read';
  metadata: any;
  created_at: string;
  updated_at: string;
  sender?: UserProfile;
  receiver?: UserProfile;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
  user?: UserProfile;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_comment_id?: string;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
  replies?: PostComment[];
}

export interface UserFollower {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  follower?: UserProfile;
  following?: UserProfile;
}

export interface EnhancedPost {
  id: string;
  user_id: string;
  author_name: string;
  author_title: string;
  author_avatar: string;
  author_verified: boolean;
  content: string;
  image_url?: string;
  post_type: string;
  category: 'all' | 'my-doctor' | 'exercise-tips' | 'inspiration';
  tags: string[];
  metadata: any;
  is_public: boolean;
  created_at: string;
  likes_count: number;
  comments_count: number;
  user_has_liked?: boolean;
  comments?: PostComment[];
}

export interface UserProfile {
  id: string;
  name: string;
  bio?: string;
  age?: number;
  location?: string;
  injury_type?: string;
  recovery_goals?: string[];
  preferred_doctor?: string;
  avatar_url?: string;
  profile_picture?: string;
  cover_image?: string;
  social_links?: any;
  achievements?: any[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
  role?: UserRole;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
}

export interface NotificationData {
  id: string;
  user_id: string;
  type: 'chat' | 'exercise' | 'achievement' | 'doctor' | 'like' | 'comment' | 'follow' | 'friend_request';
  title: string;
  message: string;
  read: boolean;
  metadata: any;
  created_at: string;
  from_user?: UserProfile;
}

export interface ConversationPreview {
  id: string;
  participant: UserProfile;
  last_message: DirectMessage;
  unread_count: number;
  updated_at: string;
}