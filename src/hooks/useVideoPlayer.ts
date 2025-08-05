import { useState, useCallback } from 'react';
import { youTubeService } from '../services/youtubeService';

interface Video {
  id: number;
  url: string;
  title: string;
  type: 'youtube' | 'direct';
  embedUrl: string;
  thumbnail?: string;
  duration?: string;
  addedAt: string;
}

interface VideoState {
  currentVideo: Video | null;
  isLoading: boolean;
  error: string | null;
  videos: Video[];
  playerReady: boolean;
}

export const useVideoPlayer = () => {
  const [videoState, setVideoState] = useState<VideoState>({
    currentVideo: null,
    isLoading: false,
    error: null,
    videos: [],
    playerReady: false
  });

  const resetState = useCallback(() => {
    setVideoState(prev => ({
      ...prev,
      currentVideo: null,
      isLoading: false,
      error: null,
      playerReady: false
    }));
  }, []);

  const addVideo = useCallback(async (url: string, title = '') => {
    if (!url?.trim()) {
      setVideoState(prev => ({ ...prev, error: 'Please enter a valid URL' }));
      return;
    }

    setVideoState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      currentVideo: null
    }));

    try {
      const validatedVideo = await youTubeService.validateVideo(url.trim());
      
      const newVideo: Video = {
        id: Date.now(),
        url: url.trim(),
        title: title || validatedVideo.metadata?.snippet?.title || 'Exercise Video',
        type: validatedVideo.type as 'youtube' | 'direct',
        embedUrl: validatedVideo.embedUrl || url,
        thumbnail: validatedVideo.metadata?.snippet?.thumbnails?.medium?.url,
        duration: validatedVideo.metadata?.contentDetails?.duration,
        addedAt: new Date().toISOString()
      };

      setVideoState(prev => ({
        ...prev,
        videos: [...prev.videos, newVideo],
        currentVideo: newVideo,
        isLoading: false,
        error: null
      }));

      return newVideo;
    } catch (error) {
      setVideoState(prev => ({
        ...prev,
        isLoading: false,
        error: (error as Error).message || 'Failed to add video'
      }));
      throw error;
    }
  }, []);

  const selectVideo = useCallback((video: Video) => {
    setVideoState(prev => ({
      ...prev,
      currentVideo: video,
      error: null,
      playerReady: false
    }));
  }, []);

  const removeVideo = useCallback((videoId: number) => {
    setVideoState(prev => ({
      ...prev,
      videos: prev.videos.filter(v => v.id !== videoId),
      currentVideo: prev.currentVideo?.id === videoId ? null : prev.currentVideo
    }));
  }, []);

  const setPlayerReady = useCallback(() => {
    setVideoState(prev => ({ ...prev, playerReady: true }));
  }, []);

  return {
    ...videoState,
    addVideo,
    selectVideo,
    removeVideo,
    resetState,
    setPlayerReady
  };
};