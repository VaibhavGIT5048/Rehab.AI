import React, { useState, useRef } from 'react';
import { Upload, Video, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface VideoUploaderProps {
  onVideoUploaded?: (videoData: any) => void;
  isAdmin?: boolean;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onVideoUploaded, isAdmin = false }) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoData, setVideoData] = useState({
    title: '',
    description: '',
    category: 'exercise'
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video file must be less than 100MB');
      return;
    }

    if (!videoData.title.trim()) {
      toast.error('Please enter a video title');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      // Upload video to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file, {
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          }
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      // Save video metadata to database
      const { data: videoRecord, error: dbError } = await supabase
        .from('videos')
        .insert({
          title: videoData.title,
          description: videoData.description,
          video_url: data.publicUrl,
          file_name: file.name,
          file_size: file.size,
          category: videoData.category,
          uploaded_by: user.id,
          is_public: isAdmin
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast.success('Video uploaded successfully!');
      
      // Reset form
      setVideoData({ title: '', description: '', category: 'exercise' });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Callback with video data
      if (onVideoUploaded) {
        onVideoUploaded(videoRecord);
      }

    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Video className="h-5 w-5 text-teal-600" />
        <h3 className="font-bold text-gray-900">Upload Video</h3>
      </div>

      <div className="space-y-4">
        {/* Video Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video Title *
          </label>
          <input
            type="text"
            value={videoData.title}
            onChange={(e) => setVideoData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter video title"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={videoData.description}
            onChange={(e) => setVideoData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter video description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={videoData.category}
            onChange={(e) => setVideoData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="exercise">Exercise</option>
            <option value="education">Education</option>
            <option value="testimonial">Testimonial</option>
            <option value="marketing">Marketing</option>
          </select>
        </div>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {uploading ? (
            <div className="space-y-4">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                <Video className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <p className="text-gray-600 mb-2">Uploading video...</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-teal-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">{Math.round(uploadProgress)}%</p>
              </div>
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Click to select a video file
              </p>
              <p className="text-sm text-gray-500">
                Supports MP4, MOV, AVI files up to 100MB
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={!videoData.title.trim()}
                className="mt-4 bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Select Video
              </button>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default VideoUploader;