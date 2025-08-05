import { useState, useEffect, useCallback, useRef } from 'react';
import { supabaseVideoService, VideoData } from '../services/supabaseVideoService';
import { enhancedYouTubeService } from '../services/enhancedYoutubeService';
import toast from 'react-hot-toast';

interface VideoState {
  currentVideo: VideoData | null;
  videos: VideoData[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  isSyncing: boolean;
  categories: string[];
  selectedCategory: string;
}

export const usePersistentVideoPlayer = () => {
  const [videoState, setVideoState] = useState<VideoState>({
    currentVideo: null,
    videos: [],
    isLoading: false,
    error: null,
    isInitialized: false,
    isSyncing: false,
    categories: [],
    selectedCategory: 'All'
  });

  const subscriptionRef = useRef<any>(null);
  const currentVideoIdRef = useRef<string | null>(null);

  // Initialize videos from Supabase on component mount
  useEffect(() => {
    initializeVideos();
    setupRealtimeSubscription();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  // Restore current video from localStorage
  useEffect(() => {
    const savedCurrentVideoId = localStorage.getItem('currentVideoId');
    if (savedCurrentVideoId && videoState.videos.length > 0) {
      const savedVideo = videoState.videos.find(v => v.id === savedCurrentVideoId);
      if (savedVideo) {
        setVideoState(prev => ({ ...prev, currentVideo: savedVideo }));
      }
    }
  }, [videoState.videos]);

  // Update categories when videos change
  useEffect(() => {
    const categories = ['All', ...new Set(videoState.videos.map(v => v.category || 'General'))];
    setVideoState(prev => ({ ...prev, categories }));
  }, [videoState.videos]);

  const initializeVideos = async () => {
    setVideoState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const videos = await supabaseVideoService.getAllVideos();
      setVideoState(prev => ({
        ...prev,
        videos,
        isLoading: false,
        isInitialized: true,
        error: null
      }));
    } catch (error) {
      console.error('Failed to initialize videos:', error);
      setVideoState(prev => ({
        ...prev,
        isLoading: false,
        error: (error as Error).message,
        isInitialized: true
      }));
      toast.error('Failed to load videos');
    }
  };

  const setupRealtimeSubscription = () => {
    subscriptionRef.current = supabaseVideoService.subscribeToVideos((payload) => {
      console.log('Real-time update received:', payload);
      
      if (payload.eventType === 'INSERT') {
        const newVideo = supabaseVideoService.transformDatabaseRecord(payload.new);
        setVideoState(prev => ({
          ...prev,
          videos: [newVideo, ...prev.videos]
        }));
        toast.success('Video added successfully!');
      } else if (payload.eventType === 'UPDATE') {
        const updatedVideo = supabaseVideoService.transformDatabaseRecord(payload.new);
        setVideoState(prev => ({
          ...prev,
          videos: prev.videos.map(v => v.id === updatedVideo.id ? updatedVideo : v),
          currentVideo: prev.currentVideo?.id === updatedVideo.id ? updatedVideo : prev.currentVideo
        }));
      } else if (payload.eventType === 'DELETE' || (payload.new && !payload.new.is_active)) {
        const videoId = payload.old?.id || payload.new?.id;
        setVideoState(prev => ({
          ...prev,
          videos: prev.videos.filter(v => v.id !== videoId),
          currentVideo: prev.currentVideo?.id === videoId ? null : prev.currentVideo
        }));
        toast.success('Video removed');
      }
    });
  };

  const addVideo = useCallback(async (url: string, title = '', category = 'General'): Promise<VideoData> => {
    if (!url?.trim()) {
      const error = 'Please enter a valid URL';
      setVideoState(prev => ({ ...prev, error }));
      throw new Error(error);
    }

    setVideoState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      isSyncing: true
    }));

    try {
      const savedVideo = await enhancedYouTubeService.processAndSaveVideo(url.trim(), title, category);
      
      // Video will be added via real-time subscription, but we can set it as current immediately
      setVideoState(prev => ({
        ...prev,
        currentVideo: savedVideo,
        isLoading: false,
        isSyncing: false,
        error: null
      }));

      // Save current video selection to localStorage
      localStorage.setItem('currentVideoId', savedVideo.id!);
      currentVideoIdRef.current = savedVideo.id!;

      return savedVideo;
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to add video';
      setVideoState(prev => ({
        ...prev,
        isLoading: false,
        isSyncing: false,
        error: errorMessage
      }));
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const selectVideo = useCallback(async (video: VideoData) => {
    setVideoState(prev => ({
      ...prev,
      currentVideo: video,
      error: null
    }));

    // Persist current video selection
    localStorage.setItem('currentVideoId', video.id!);
    currentVideoIdRef.current = video.id!;

    // Update last_played timestamp in database
    try {
      await supabaseVideoService.updateVideo(video.id!, {
        metadata: {
          ...video.metadata,
          lastPlayed: new Date().toISOString()
        }
      });
    } catch (error) {
      console.warn('Failed to update last played timestamp:', error);
    }
  }, []);

  const removeVideo = useCallback(async (videoId: string) => {
    setVideoState(prev => ({ ...prev, isSyncing: true }));

    try {
      await supabaseVideoService.deleteVideo(videoId);
      
      // Clear current video if it's the one being deleted
      if (currentVideoIdRef.current === videoId) {
        localStorage.removeItem('currentVideoId');
        currentVideoIdRef.current = null;
        setVideoState(prev => ({ ...prev, currentVideo: null }));
      }

      setVideoState(prev => ({ ...prev, isSyncing: false }));
    } catch (error) {
      const errorMessage = (error as Error).message;
      setVideoState(prev => ({
        ...prev,
        error: errorMessage,
        isSyncing: false
      }));
      toast.error(errorMessage);
    }
  }, []);

  const updateVideo = useCallback(async (videoId: string, updates: Partial<VideoData>) => {
    setVideoState(prev => ({ ...prev, isSyncing: true }));

    try {
      await supabaseVideoService.updateVideo(videoId, updates);
      setVideoState(prev => ({ ...prev, isSyncing: false }));
      toast.success('Video updated successfully!');
    } catch (error) {
      const errorMessage = (error as Error).message;
      setVideoState(prev => ({
        ...prev,
        error: errorMessage,
        isSyncing: false
      }));
      toast.error(errorMessage);
    }
  }, []);

  const refreshVideos = useCallback(async () => {
    await initializeVideos();
  }, []);

  const clearCurrentVideo = useCallback(() => {
    setVideoState(prev => ({ ...prev, currentVideo: null }));
    localStorage.removeItem('currentVideoId');
    currentVideoIdRef.current = null;
  }, []);

  const filterVideosByCategory = useCallback((category: string) => {
    setVideoState(prev => ({ ...prev, selectedCategory: category }));
  }, []);

  const searchVideos = useCallback(async (query: string): Promise<VideoData[]> => {
    try {
      if (!query.trim()) {
        return videoState.videos;
      }
      return await supabaseVideoService.searchVideos(query);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
      return [];
    }
  }, [videoState.videos]);

  const getFilteredVideos = useCallback(() => {
    if (videoState.selectedCategory === 'All') {
      return videoState.videos;
    }
    return videoState.videos.filter(video => video.category === videoState.selectedCategory);
  }, [videoState.videos, videoState.selectedCategory]);

  const getVideoStats = useCallback(() => {
    const totalVideos = videoState.videos.length;
    const categoryCounts = videoState.videos.reduce((acc, video) => {
      const category = video.category || 'General';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalVideos,
      categoryCounts,
      hasCurrentVideo: !!videoState.currentVideo
    };
  }, [videoState.videos, videoState.currentVideo]);

  return {
    ...videoState,
    addVideo,
    selectVideo,
    removeVideo,
    updateVideo,
    refreshVideos,
    clearCurrentVideo,
    filterVideosByCategory,
    searchVideos,
    getFilteredVideos,
    getVideoStats
  };
};