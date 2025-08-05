import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Trash2, 
  Search, 
  Filter, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Plus,
  Edit3,
  ExternalLink,
  Clock,
  Eye
} from 'lucide-react';
import { usePersistentVideoPlayer } from '../hooks/usePersistentVideoPlayer';
import EnhancedVideoPlayer from './EnhancedVideoPlayer';
import toast from 'react-hot-toast';

const PersistentVideoLibrary: React.FC = () => {
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('General');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const {
    currentVideo,
    videos,
    isLoading,
    error,
    isInitialized,
    isSyncing,
    categories,
    selectedCategory,
    addVideo,
    selectVideo,
    removeVideo,
    updateVideo,
    refreshVideos,
    filterVideosByCategory,
    getFilteredVideos,
    getVideoStats
  } = usePersistentVideoPlayer();

  const filteredVideos = getFilteredVideos();
  const stats = getVideoStats();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored');
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Connection lost - working offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    try {
      await addVideo(urlInput, titleInput, categoryInput);
      setUrlInput('');
      setTitleInput('');
      setCategoryInput('General');
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add video:', error);
    }
  };

  const handleUpdateVideoTitle = async (videoId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    
    try {
      await updateVideo(videoId, { title: newTitle });
      setEditingVideoId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Failed to update video title:', error);
    }
  };

  const handleRemoveVideo = async (videoId: string, videoTitle: string) => {
    if (!confirm(`Are you sure you want to remove "${videoTitle}"?`)) return;
    
    try {
      await removeVideo(videoId);
    } catch (error) {
      console.error('Failed to remove video:', error);
    }
  };

  const startEditing = (videoId: string, currentTitle: string) => {
    setEditingVideoId(videoId);
    setEditingTitle(currentTitle);
  };

  const cancelEditing = () => {
    setEditingVideoId(null);
    setEditingTitle('');
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading your exercise videos...</h3>
          <p className="text-gray-600">Syncing with database</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Connection Status */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`fixed top-20 right-4 z-50 px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 ${
          isOnline 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}
      >
        {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
        <span>{isOnline ? 'Connected' : 'Offline'}</span>
        {isSyncing && (
          <RefreshCw className="h-4 w-4 animate-spin" />
        )}
      </motion.div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Exercise Video Library</h1>
            <p className="text-gray-600">Your videos are automatically saved and synced across devices</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>{stats.totalVideos} videos saved</span>
              {stats.hasCurrentVideo && (
                <span>• Currently playing: {currentVideo?.title}</span>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Video</span>
          </button>
        </div>
      </div>

      {/* Add Video Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl shadow-sm p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Video</h3>
            <form onSubmit={handleAddVideo} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="video-url" className="block text-sm font-medium text-gray-700 mb-2">
                    Video URL *
                  </label>
                  <input
                    id="video-url"
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Enter YouTube URL or direct video link..."
                    required
                    disabled={isLoading || !isOnline}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
                
                <div>
                  <label htmlFor="video-category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    id="video-category"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="General">General</option>
                    <option value="Upper Body">Upper Body</option>
                    <option value="Lower Body">Lower Body</option>
                    <option value="Core">Core</option>
                    <option value="Flexibility">Flexibility</option>
                    <option value="Balance">Balance</option>
                    <option value="Cardio">Cardio</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="video-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Title (Optional)
                </label>
                <input
                  id="video-title"
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="Custom title for this exercise..."
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading || !urlInput.trim() || !isOnline}
                  className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving Video...' : 'Save Video'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <span className="text-red-600">❌</span>
            <span className="text-red-700">{error}</span>
          </div>
          <button 
            onClick={refreshVideos}
            className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center space-x-1"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </button>
        </motion.div>
      )}

      {/* Offline Notice */}
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center space-x-3"
        >
          <WifiOff className="h-5 w-5 text-yellow-600" />
          <span className="text-yellow-700">You're offline. Videos will sync when connection is restored.</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <EnhancedVideoPlayer
            video={currentVideo ? {
              id: parseInt(currentVideo.id!),
              url: currentVideo.originalUrl,
              title: currentVideo.title,
              type: currentVideo.type,
              embedUrl: currentVideo.embedUrl,
              thumbnail: currentVideo.thumbnail,
              addedAt: currentVideo.addedAt!
            } : null}
            onPlayerReady={() => console.log('Player ready')}
            onError={(error) => console.error('Player error:', error)}
            className="w-full"
          />
        </div>

        {/* Video List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Search and Filter */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Video Library</h3>
                <span className="text-sm text-gray-600">{filteredVideos.length} videos</span>
              </div>
              
              {/* Category Filters */}
              {categories.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => filterVideosByCategory(category)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        selectedCategory === category
                          ? 'bg-teal-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Video List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredVideos.length === 0 ? (
                <div className="p-8 text-center">
                  <Play className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {videos.length === 0 ? 'No videos added yet' : 'No videos in this category'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {videos.length === 0 ? 'Click "Add Video" to get started' : 'Try a different category'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredVideos.map((video, index) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        currentVideo?.id === video.id ? 'bg-teal-50 border-r-4 border-teal-500' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Thumbnail */}
                        <div className="relative w-16 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          {video.thumbnail ? (
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Play className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center">
                            <Play className="h-4 w-4 text-white opacity-0 hover:opacity-100 transition-opacity" />
                          </div>
                        </div>

                        {/* Video Info */}
                        <div className="flex-1 min-w-0">
                          {editingVideoId === video.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                className="w-full text-sm font-medium px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-transparent"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleUpdateVideoTitle(video.id!, editingTitle);
                                  } else if (e.key === 'Escape') {
                                    cancelEditing();
                                  }
                                }}
                                autoFocus
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleUpdateVideoTitle(video.id!, editingTitle)}
                                  className="text-xs bg-teal-500 text-white px-2 py-1 rounded hover:bg-teal-600"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h4 
                                className="font-medium text-gray-900 truncate text-sm cursor-pointer hover:text-teal-600"
                                onClick={() => selectVideo(video)}
                              >
                                {video.title}
                              </h4>
                              <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  <span className="bg-gray-100 px-2 py-1 rounded-full">
                                    {video.type === 'youtube' ? '📺 YouTube' : '🎬 Direct'}
                                  </span>
                                  {video.duration && (
                                    <span className="flex items-center space-x-1">
                                      <Clock className="h-3 w-3" />
                                      <span>{video.duration}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {video.category}
                                </span>
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => selectVideo(video)}
                                    className="p-1 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded"
                                    title="Play video"
                                  >
                                    <Play className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => startEditing(video.id!, video.title)}
                                    className="p-1 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded"
                                    title="Edit title"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </button>
                                  {video.type === 'youtube' && (
                                    <a
                                      href={video.originalUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded"
                                      title="Open in YouTube"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  )}
                                  <button
                                    onClick={() => handleRemoveVideo(video.id!, video.title)}
                                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                                    title="Remove video"
                                    disabled={isSyncing}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersistentVideoLibrary;