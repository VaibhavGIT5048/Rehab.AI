import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface VideoData {
  id?: string;
  title: string;
  originalUrl: string;
  type: 'youtube' | 'direct';
  videoId?: string;
  embedUrl: string;
  thumbnail?: string;
  duration?: string;
  description?: string;
  category?: string;
  addedAt?: string;
  updatedAt?: string;
  metadata?: any;
}

export interface DatabaseVideoRecord {
  id: string;
  title: string;
  url: string;
  video_type: 'youtube' | 'direct';
  youtube_video_id?: string;
  embed_url: string;
  thumbnail_url?: string;
  duration?: string;
  description?: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  metadata: any;
}

class SupabaseVideoService {
  private tableName = 'exercise_videos';

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  async saveVideo(videoData: Partial<VideoData>): Promise<VideoData> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const videoRecord = {
        title: videoData.title || 'Untitled Exercise Video',
        url: videoData.originalUrl,
        video_type: videoData.type,
        youtube_video_id: videoData.videoId || null,
        embed_url: videoData.embedUrl,
        thumbnail_url: videoData.thumbnail || null,
        duration: videoData.duration || null,
        description: videoData.description || null,
        category: videoData.category || 'General',
        user_id: user.id,
        metadata: {
          addedAt: new Date().toISOString(),
          source: 'rehab_app',
          apiVersion: '1.0',
          ...videoData.metadata
        }
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([videoRecord])
        .select()
        .single();

      if (error) throw error;

      return this.transformDatabaseRecord(data);
    } catch (error) {
      console.error('Error saving video to Supabase:', error);
      throw new Error(`Failed to save video: ${(error as Error).message}`);
    }
  }

  async getAllVideos(): Promise<VideoData[]> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(record => this.transformDatabaseRecord(record));
    } catch (error) {
      console.error('Error fetching videos from Supabase:', error);
      throw new Error(`Failed to fetch videos: ${(error as Error).message}`);
    }
  }

  async updateVideo(videoId: string, updates: Partial<VideoData>): Promise<VideoData> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      // Map VideoData fields to database fields
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', videoId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return this.transformDatabaseRecord(data);
    } catch (error) {
      console.error('Error updating video:', error);
      throw new Error(`Failed to update video: ${(error as Error).message}`);
    }
  }

  async deleteVideo(videoId: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from(this.tableName)
        .update({ 
          is_active: false, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', videoId)
        .eq('user_id', user.id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting video:', error);
      throw new Error(`Failed to delete video: ${(error as Error).message}`);
    }
  }

  async getVideoById(videoId: string): Promise<VideoData> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', videoId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      return this.transformDatabaseRecord(data);
    } catch (error) {
      console.error('Error fetching video by ID:', error);
      throw new Error(`Failed to fetch video: ${(error as Error).message}`);
    }
  }

  transformDatabaseRecord(record: DatabaseVideoRecord): VideoData {
    return {
      id: record.id,
      title: record.title,
      originalUrl: record.url,
      type: record.video_type,
      videoId: record.youtube_video_id || undefined,
      embedUrl: record.embed_url,
      thumbnail: record.thumbnail_url || undefined,
      duration: record.duration || undefined,
      description: record.description || undefined,
      category: record.category,
      addedAt: record.created_at,
      updatedAt: record.updated_at,
      metadata: record.metadata
    };
  }

  // Real-time subscription for video changes
  subscribeToVideos(callback: (payload: any) => void) {
    return supabase
      .channel('exercise_videos_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: this.tableName 
        }, 
        callback
      )
      .subscribe();
  }

  async getVideosByCategory(category: string): Promise<VideoData[]> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', user.id)
        .eq('category', category)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(record => this.transformDatabaseRecord(record));
    } catch (error) {
      console.error('Error fetching videos by category:', error);
      throw new Error(`Failed to fetch videos by category: ${(error as Error).message}`);
    }
  }

  async searchVideos(query: string): Promise<VideoData[]> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(record => this.transformDatabaseRecord(record));
    } catch (error) {
      console.error('Error searching videos:', error);
      throw new Error(`Failed to search videos: ${(error as Error).message}`);
    }
  }
}

export const supabaseVideoService = new SupabaseVideoService();