class YouTubeService {
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

  async validateVideo(url: string) {
    if (!this.isYouTubeUrl(url)) {
      return { isValid: true, type: 'direct', url };
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
}

export const youTubeService = new YouTubeService();