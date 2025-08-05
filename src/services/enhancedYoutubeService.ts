import { supabaseVideoService, VideoData } from './supabaseVideoService';

class EnhancedYouTubeService {
  private API_KEY = 'AIzaSyDeia-Bon_-7mGFdeY3_h1iTlYWbY1yd-0';
  private BASE_URL = 'https://www.googleapis.com/youtube/v3';

  extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) return match[1];
    }
    return null;
  }

  isYouTubeUrl(url: string): boolean {
    return /(?:youtube\.com|youtu\.be)/.test(url);
  }

  getEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`;
  }

  async getVideoMetadata(videoId: string) {
    try {
      const response = await fetch(
        `${this.BASE_URL}/videos?id=${videoId}&key=${this.API_KEY}&part=snippet,contentDetails,status`
      );
      
      if (!response.ok) {
        throw new Error(`YouTube API Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.items?.length) {
        throw new Error('Video not found or unavailable');
      }
      
      return data.items[0];
    } catch (error) {
      console.error('YouTube API Error:', error);
      throw error;
    }
  }

  parseDuration(duration: string): string {
    // Convert ISO 8601 duration (PT4M13S) to readable format (4:13)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return duration;

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  async processAndSaveVideo(url: string, title = '', category = 'General'): Promise<VideoData> {
    try {
      if (!this.isYouTubeUrl(url)) {
        // Handle direct video URLs
        const videoData: Partial<VideoData> = {
          title: title || 'Direct Video',
          originalUrl: url,
          type: 'direct',
          embedUrl: url,
          category,
          metadata: {
            source: 'direct_upload',
            processedAt: new Date().toISOString()
          }
        };

        return await supabaseVideoService.saveVideo(videoData);
      }

      // Handle YouTube URLs
      const videoId = this.extractVideoId(url);
      if (!videoId) {
        throw new Error('Invalid YouTube URL format');
      }

      const metadata = await this.getVideoMetadata(videoId);
      
      const videoData: Partial<VideoData> = {
        title: title || metadata.snippet.title,
        originalUrl: url,
        type: 'youtube',
        videoId,
        embedUrl: this.getEmbedUrl(videoId),
        thumbnail: metadata.snippet.thumbnails?.medium?.url || metadata.snippet.thumbnails?.default?.url,
        duration: this.parseDuration(metadata.contentDetails.duration),
        description: metadata.snippet.description?.substring(0, 500) || '', // Limit description length
        category,
        metadata: {
          source: 'youtube',
          channelTitle: metadata.snippet.channelTitle,
          publishedAt: metadata.snippet.publishedAt,
          tags: metadata.snippet.tags?.slice(0, 10) || [], // Limit tags
          processedAt: new Date().toISOString(),
          youtubeMetadata: {
            viewCount: metadata.statistics?.viewCount,
            likeCount: metadata.statistics?.likeCount,
            categoryId: metadata.snippet.categoryId
          }
        }
      };

      return await supabaseVideoService.saveVideo(videoData);
    } catch (error) {
      console.error('Error processing and saving video:', error);
      throw error;
    }
  }

  async validateVideo(url: string) {
    if (!this.isYouTubeUrl(url)) {
      return { 
        isValid: true, 
        type: 'direct', 
        url,
        embedUrl: url
      };
    }

    const videoId = this.extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL format');
    }

    try {
      const metadata = await this.getVideoMetadata(videoId);
      return {
        isValid: true,
        type: 'youtube',
        videoId,
        embedUrl: this.getEmbedUrl(videoId),
        metadata
      };
    } catch (error) {
      throw new Error(`YouTube video validation failed: ${(error as Error).message}`);
    }
  }

  // Batch process multiple videos
  async processMultipleVideos(urls: string[], category = 'General'): Promise<VideoData[]> {
    const results: VideoData[] = [];
    const errors: string[] = [];

    for (const url of urls) {
      try {
        const video = await this.processAndSaveVideo(url, '', category);
        results.push(video);
      } catch (error) {
        errors.push(`Failed to process ${url}: ${(error as Error).message}`);
      }
    }

    if (errors.length > 0) {
      console.warn('Some videos failed to process:', errors);
    }

    return results;
  }
}

export const enhancedYouTubeService = new EnhancedYouTubeService();