import React, { useState, useEffect } from 'react';
import { Play, Upload, Filter, Search, Eye, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import EnhancedVideoPlayer from '../components/EnhancedVideoPlayer';
import VideoLibrary from '../components/VideoLibrary';
import VideoUploader from '../components/VideoUploader';
import LinkUploader from '../components/LinkUploader';
import toast from 'react-hot-toast';

interface Video {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  category: string;
  views: number;
  created_at: string;
  uploaded_by: string;
}

const Media = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [showLinkUploader, setShowLinkUploader] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'library' | 'database'>('library');

  const categories = [
    { value: 'all', label: 'All Videos' },
    { value: 'exercise', label: 'Exercise' },
    { value: 'education', label: 'Education' },
    { value: 'testimonial', label: 'Testimonials' },
    { value: 'marketing', label: 'Marketing' }
  ];

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('videos')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error loading videos:', error);
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSelect = async (video: Video) => {
    setSelectedVideo(video);
    
    // Increment view count
    try {
      await supabase
        .from('videos')
        .update({ views: video.views + 1 })
        .eq('id', video.id);
      
      // Update local state
      setVideos(prev => prev.map(v => 
        v.id === video.id ? { ...v, views: v.views + 1 } : v
      ));
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  const handleVideoUploaded = (newVideo: Video) => {
    setVideos(prev => [newVideo, ...prev]);
    setShowUploader(false);
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Check if user is admin (you can modify this logic based on your admin system)
  const isAdmin = user?.email?.includes('admin') || false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Media Library</h1>
            <p className="text-gray-600">Exercise videos and educational content</p>
          </div>
          <div className="flex items-center space-x-2">
            {isAdmin && (
              <button
                onClick={() => setShowUploader(!showUploader)}
                className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Video</span>
              </button>
            )}
            <button
              onClick={() => setShowLinkUploader(!showLinkUploader)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Add Link</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('library')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'library'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Video Library
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'database'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Database Videos
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'library' ? (
        <VideoLibrary />
      ) : (
        <>
      {/* Video Uploader */}
      {showUploader && isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <VideoUploader 
            onVideoUploaded={handleVideoUploaded}
            isAdmin={isAdmin}
          />
        </motion.div>
      )}

      {/* Link Uploader */}
      {showLinkUploader && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <LinkUploader 
            onLinkUploaded={handleVideoUploaded}
          />
        </motion.div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Video Player */}
        <div className="lg:col-span-2">
          {selectedVideo ? (
            <EnhancedVideoPlayer
              video={{
                id: parseInt(selectedVideo.id),
                url: selectedVideo.video_url,
                title: selectedVideo.title,
                type: selectedVideo.video_url.includes('youtube') ? 'youtube' : 'direct',
                embedUrl: selectedVideo.video_url,
                thumbnail: selectedVideo.thumbnail_url || undefined,
                addedAt: selectedVideo.created_at
              }}
            />
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <Play className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a video to play</h3>
              <p className="text-gray-600">Choose from our library of educational content</p>
            </div>
          )}
        </div>

        {/* Video List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">Video Library</h3>
              <p className="text-sm text-gray-600">{filteredVideos.length} videos</p>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="space-y-4 p-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex space-x-3">
                        <div className="w-20 h-12 bg-gray-200 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredVideos.length === 0 ? (
                <div className="p-8 text-center">
                  <Play className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No videos found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredVideos.map((video, index) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleVideoSelect(video)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedVideo?.id === video.id ? 'bg-teal-50 border-r-4 border-teal-500' : ''
                      }`}
                    >
                      <div className="flex space-x-3">
                        <div className="relative w-20 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          {video.thumbnail_url ? (
                            <img
                              src={video.thumbnail_url}
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
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate text-sm">
                            {video.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {video.description}
                          </p>
                          <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-3 w-3" />
                              <span>{video.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(video.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
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
        </>
      )}
    </div>
  );
};

export default Media;