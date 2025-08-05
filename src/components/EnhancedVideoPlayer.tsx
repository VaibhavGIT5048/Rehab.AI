import React, { useEffect, useRef, useState } from 'react';
import { Play, AlertTriangle, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

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

interface VideoPlayerProps {
  video: Video | null;
  onPlayerReady?: () => void;
  onError?: (error: any) => void;
  className?: string;
}

interface PlayerState {
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
}

const EnhancedVideoPlayer: React.FC<VideoPlayerProps> = ({ 
  video, 
  onPlayerReady, 
  onError,
  className = '' 
}) => {
  const [playerState, setPlayerState] = useState<PlayerState>({
    isLoading: true,
    hasError: false,
    errorMessage: ''
  });

  const playerRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!video) {
      setPlayerState({
        isLoading: false,
        hasError: false,
        errorMessage: ''
      });
      return;
    }

    setPlayerState({
      isLoading: true,
      hasError: false,
      errorMessage: ''
    });

    // Reset player state when video changes
    const timer = setTimeout(() => {
      setPlayerState(prev => ({ ...prev, isLoading: false }));
      onPlayerReady?.();
    }, 1000);

    return () => clearTimeout(timer);
  }, [video?.id, onPlayerReady]);

  const handleIframeLoad = () => {
    setPlayerState(prev => ({ ...prev, isLoading: false }));
    onPlayerReady?.();
  };

  const handleVideoError = (error: any) => {
    console.error('Video player error:', error);
    setPlayerState({
      isLoading: false,
      hasError: true,
      errorMessage: 'Failed to load video. Please check the URL and try again.'
    });
    onError?.(error);
  };

  const handleVideoLoad = () => {
    setPlayerState(prev => ({ ...prev, isLoading: false }));
    onPlayerReady?.();
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (!video) {
    return (
      <div className={`bg-white rounded-2xl shadow-sm overflow-hidden ${className}`}>
        <div className="aspect-video bg-gray-900 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Video Selected</h3>
            <p className="text-gray-400">Add a video URL to start playing exercise videos</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (playerState.hasError) {
    return (
      <div className={`bg-white rounded-2xl shadow-sm overflow-hidden ${className}`}>
        <div className="aspect-video bg-gray-900 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-medium mb-2">Video Error</h3>
            <p className="text-gray-400 mb-4">{playerState.errorMessage}</p>
            <button 
              onClick={handleRetry}
              className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors flex items-center space-x-2 mx-auto"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Retry</span>
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden ${className}`}>
      {playerState.isLoading && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-white"
          >
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading video...</p>
          </motion.div>
        </div>
      )}
      
      <div className="relative aspect-video bg-gray-900">
        {video.type === 'youtube' ? (
          <iframe
            ref={iframeRef}
            className="w-full h-full"
            src={video.embedUrl}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={handleIframeLoad}
            onError={handleVideoError}
          />
        ) : (
          <video
            ref={playerRef}
            controls
            className="w-full h-full"
            onLoadedData={handleVideoLoad}
            onError={handleVideoError}
            preload="metadata"
          >
            <source src={video.embedUrl} type="video/mp4" />
            <source src={video.embedUrl} type="video/webm" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
      
      {video && (
        <div className="p-4 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-1">{video.title}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="bg-gray-100 px-2 py-1 rounded-full">
              {video.type === 'youtube' ? '📺 YouTube' : '🎬 Direct Video'}
            </span>
            {video.duration && (
              <span className="text-gray-500">• {video.duration}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedVideoPlayer;