import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          bio: string | null;
          age: number | null;
          location: string | null;
          injury_type: string | null;
          recovery_goals: string[] | null;
          preferred_doctor: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          age?: number | null;
          location?: string | null;
          injury_type?: string | null;
          recovery_goals?: string[] | null;
          preferred_doctor?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          age?: number | null;
          location?: string | null;
          injury_type?: string | null;
          recovery_goals?: string[] | null;
          preferred_doctor?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      chat_conversations: {
        Row: {
          id: string;
          user_id: string;
          doctor_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          doctor_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          doctor_id?: string;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_type: 'user' | 'ai';
          content: string;
          message_type: 'text' | 'exercise' | 'image';
          metadata: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_type: 'user' | 'ai';
          content: string;
          message_type?: 'text' | 'exercise' | 'image';
          metadata?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_type?: 'user' | 'ai';
          content?: string;
          message_type?: 'text' | 'exercise' | 'image';
          metadata?: any | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'chat' | 'exercise' | 'achievement' | 'doctor';
          title: string;
          message: string;
          read: boolean;
          metadata: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'chat' | 'exercise' | 'achievement' | 'doctor';
          title: string;
          message: string;
          read?: boolean;
          metadata?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'chat' | 'exercise' | 'achievement' | 'doctor';
          title?: string;
          message?: string;
          read?: boolean;
          metadata?: any | null;
        };
      };
      doctor_reviews: {
        Row: {
          id: string;
          user_id: string;
          doctor_id: string;
          rating: number;
          review_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          doctor_id: string;
          rating: number;
          review_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          doctor_id?: string;
          rating?: number;
          review_text?: string | null;
          updated_at?: string;
        };
      };
      health_records: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          file_url: string;
          file_type: string;
          file_size: number | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_name: string;
          file_url: string;
          file_type: string;
          file_size?: number | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_name?: string;
          file_url?: string;
          file_type?: string;
          file_size?: number | null;
          description?: string | null;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          theme: string;
          notifications_enabled: boolean;
          email_notifications: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          theme?: string;
          notifications_enabled?: boolean;
          email_notifications?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          theme?: string;
          notifications_enabled?: boolean;
          email_notifications?: boolean;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          author_name: string;
          author_title: string;
          author_avatar: string;
          author_verified: boolean;
          content: string;
          image_url: string | null;
          likes: number;
          comments: number;
          tags: string[];
          category: 'all' | 'my-doctor' | 'exercise-tips' | 'inspiration';
          created_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          author_name: string;
          author_title: string;
          author_avatar: string;
          author_verified?: boolean;
          content: string;
          image_url?: string | null;
          likes?: number;
          comments?: number;
          tags?: string[];
          category?: 'all' | 'my-doctor' | 'exercise-tips' | 'inspiration';
          created_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          author_name?: string;
          author_title?: string;
          author_avatar?: string;
          author_verified?: boolean;
          content?: string;
          image_url?: string | null;
          likes?: number;
          comments?: number;
          tags?: string[];
          category?: 'all' | 'my-doctor' | 'exercise-tips' | 'inspiration';
        };
      };
      videos: {
        Row: {
          id: string;
          title: string;
          description: string;
          video_url: string;
          thumbnail_url: string | null;
          file_name: string;
          file_size: number;
          category: string;
          views: number;
          uploaded_by: string;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          video_url: string;
          thumbnail_url?: string | null;
          file_name: string;
          file_size?: number;
          category?: string;
          views?: number;
          uploaded_by: string;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          video_url?: string;
          thumbnail_url?: string | null;
          file_name?: string;
          file_size?: number;
          category?: string;
          views?: number;
          uploaded_by?: string;
          is_public?: boolean;
          updated_at?: string;
        };
      };
    };
  };
};