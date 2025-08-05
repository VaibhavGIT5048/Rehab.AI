import React, { useState } from 'react';
import { Link as LinkIcon, Upload, X, Check, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface LinkUploaderProps {
  onLinkUploaded?: (linkData: any) => void;
}

interface LinkMetadata {
  title: string;
  description: string;
  thumbnail: string;
  url: string;
}

const LinkUploader: React.FC<LinkUploaderProps> = ({ onLinkUploaded }) => {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [linkData, setLinkData] = useState({
    title: '',
    description: '',
    category: 'education'
  });

  const fetchLinkMetadata = async (url: string): Promise<LinkMetadata> => {
    try {
      // Use a CORS proxy to fetch Open Graph data
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();
      const html = data.contents;

      // Parse HTML to extract Open Graph data
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const getMetaContent = (property: string) => {
        const meta = doc.querySelector(`meta[property="${property}"]`) || 
                     doc.querySelector(`meta[name="${property}"]`);
        return meta?.getAttribute('content') || '';
      };

      const title = getMetaContent('og:title') || 
                   doc.querySelector('title')?.textContent || 
                   'Untitled';

      const description = getMetaContent('og:description') || 
                         getMetaContent('description') || 
                         'No description available';

      const thumbnail = getMetaContent('og:image') || 
                       getMetaContent('twitter:image') || 
                       '';

      return {
        title: title.trim(),
        description: description.trim(),
        thumbnail,
        url
      };
    } catch (error) {
      console.error('Error fetching metadata:', error);
      // Fallback metadata
      return {
        title: 'External Link',
        description: 'Educational resource',
        thumbnail: '',
        url
      };
    }
  };

  const handleUrlSubmit = async () => {
    if (!url.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setLoading(true);
    try {
      const fetchedMetadata = await fetchLinkMetadata(url);
      setMetadata(fetchedMetadata);
      setLinkData(prev => ({
        ...prev,
        title: fetchedMetadata.title,
        description: fetchedMetadata.description
      }));
    } catch (error) {
      console.error('Error fetching link metadata:', error);
      toast.error('Failed to fetch link information');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLink = async () => {
    if (!user || !metadata) return;

    setLoading(true);
    try {
      const { data: linkRecord, error } = await supabase
        .from('videos')
        .insert({
          title: linkData.title,
          description: linkData.description,
          video_url: metadata.url,
          thumbnail_url: metadata.thumbnail,
          file_name: 'external-link',
          file_size: 0,
          category: linkData.category,
          uploaded_by: user.id,
          is_public: true
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Link added successfully!');
      
      // Reset form
      setUrl('');
      setMetadata(null);
      setLinkData({ title: '', description: '', category: 'education' });

      if (onLinkUploaded) {
        onLinkUploaded(linkRecord);
      }
    } catch (error) {
      console.error('Error saving link:', error);
      toast.error('Failed to save link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center space-x-2 mb-4">
        <LinkIcon className="h-5 w-5 text-teal-600" />
        <h3 className="font-bold text-gray-900">Add Educational Link</h3>
      </div>

      <div className="space-y-4">
        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resource URL *
          </label>
          <div className="flex space-x-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <button
              onClick={handleUrlSubmit}
              disabled={loading || !url.trim()}
              className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Fetching...' : 'Fetch'}
            </button>
          </div>
        </div>

        {/* Preview */}
        {metadata && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-start space-x-4">
              {metadata.thumbnail && (
                <img
                  src={metadata.thumbnail}
                  alt="Link preview"
                  className="w-20 h-20 rounded-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">External Link</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">{metadata.title}</h4>
                <p className="text-sm text-gray-600">{metadata.description}</p>
              </div>
            </div>

            {/* Edit Fields */}
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={linkData.title}
                  onChange={(e) => setLinkData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={linkData.description}
                  onChange={(e) => setLinkData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={linkData.category}
                  onChange={(e) => setLinkData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="education">Education</option>
                  <option value="exercise">Exercise</option>
                  <option value="testimonial">Testimonials</option>
                  <option value="research">Research</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setMetadata(null);
                  setUrl('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLink}
                disabled={loading}
                className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <Check className="h-4 w-4" />
                <span>Add Link</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LinkUploader;