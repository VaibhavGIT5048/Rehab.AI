import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Star, MapPin, Clock, Video, MessageCircle, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Professional {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  experience: string;
  location: string;
  price: string;
  avatar: string;
  verified: boolean;
  available: boolean;
  specialties: string[];
  bio: string;
}

const professionals: Professional[] = [
  {
    id: 1,
    name: "Dr. Sarah Mitchell",
    specialty: "Sports Physiotherapist",
    rating: 4.9,
    reviews: 127,
    experience: "12 years",
    location: "San Francisco, CA",
    price: "$120/session",
    avatar: "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=400",
    verified: true,
    available: true,
    specialties: ["ACL Recovery", "Sports Injuries", "Movement Analysis"],
    bio: "Specialized in sports rehabilitation with extensive experience in ACL recovery programs."
  },
  {
    id: 2,
    name: "Dr. Marcus Chen",
    specialty: "Orthopedic Surgeon",
    rating: 4.8,
    reviews: 89,
    experience: "15 years",
    location: "Los Angeles, CA",
    price: "$200/consultation",
    avatar: "https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=400",
    verified: true,
    available: false,
    specialties: ["Joint Surgery", "Trauma Care", "Minimally Invasive Procedures"],
    bio: "Board-certified orthopedic surgeon specializing in joint replacement and sports medicine."
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    specialty: "Physical Therapist",
    rating: 4.9,
    reviews: 156,
    experience: "8 years",
    location: "New York, NY",
    price: "$95/session",
    avatar: "https://images.pexels.com/photos/8376285/pexels-photo-8376285.jpeg?auto=compress&cs=tinysrgb&w=400",
    verified: true,
    available: true,
    specialties: ["Manual Therapy", "Post-Surgical Rehab", "Pain Management"],
    bio: "Passionate about helping patients regain mobility and strength through personalized therapy."
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    specialty: "Sports Medicine Doctor",
    rating: 4.7,
    reviews: 203,
    experience: "20 years",
    location: "Chicago, IL",
    price: "$150/session",
    avatar: "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=400",
    verified: true,
    available: true,
    specialties: ["Athletic Performance", "Injury Prevention", "Concussion Management"],
    bio: "Former team physician with expertise in optimizing athletic performance and injury recovery."
  },
  {
    id: 5,
    name: "Dr. Lisa Park",
    specialty: "Rehabilitation Specialist",
    rating: 4.8,
    reviews: 91,
    experience: "10 years",
    location: "Seattle, WA",
    price: "$110/session",
    avatar: "https://images.pexels.com/photos/8376285/pexels-photo-8376285.jpeg?auto=compress&cs=tinysrgb&w=400",
    verified: true,
    available: true,
    specialties: ["Neurological Rehab", "Stroke Recovery", "Balance Training"],
    bio: "Dedicated to helping patients overcome neurological challenges and regain independence."
  },
  {
    id: 6,
    name: "Michael Thompson",
    specialty: "Certified Personal Trainer",
    rating: 4.6,
    reviews: 74,
    experience: "6 years",
    location: "Austin, TX",
    price: "$80/session",
    avatar: "https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=400",
    verified: false,
    available: true,
    specialties: ["Corrective Exercise", "Functional Movement", "Strength Training"],
    bio: "Focuses on corrective exercise and functional movement patterns for injury recovery."
  }
];

const Explore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  const specialties = ['All', 'Sports Physiotherapist', 'Orthopedic Surgeon', 'Physical Therapist', 'Sports Medicine Doctor', 'Rehabilitation Specialist', 'Certified Personal Trainer'];

  const filteredProfessionals = professionals
    .filter(prof => {
      const matchesSearch = prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prof.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prof.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSpecialty = selectedSpecialty === 'All' || prof.specialty === selectedSpecialty;
      return matchesSearch && matchesSpecialty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'reviews':
          return b.reviews - a.reviews;
        case 'price':
          return parseInt(a.price.replace(/\D/g, '')) - parseInt(b.price.replace(/\D/g, ''));
        default:
          return 0;
      }
    });

  const toggleFavorite = (id: number) => {
    const newFavorites = new Set(favoriteIds);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavoriteIds(newFavorites);
  };

  const handleConnect = async (professionalId: number) => {
    if (!user) {
      toast.error('Please sign in to connect with professionals');
      return;
    }

    try {
      // Find the professional
      const professional = professionals.find(p => p.id === professionalId);
      if (!professional) return;

      // Map professional to doctor ID (you might want to store this mapping in your database)
      const doctorIdMap: Record<string, string> = {
        'Dr. Sarah Mitchell': 'mitchell',
        'Dr. Marcus Chen': 'chen',
        'Emma Rodriguez': 'rodriguez',
        'Dr. James Wilson': 'wilson',
        'Dr. Lisa Park': 'park',
        'Michael Thompson': 'thompson'
      };

      const doctorId = doctorIdMap[professional.name];
      if (!doctorId) {
        // For professionals not in the chat system, create a generic doctor ID
        const genericDoctorId = `doctor_${professionalId}`;
        
        // Create conversation with generic ID
        const { error } = await supabase
          .from('chat_conversations')
          .insert({
            user_id: user.id,
            doctor_id: genericDoctorId
          });

        if (error && error.code !== '23505') throw error; // Ignore duplicate key errors
        
        toast.success(`Connected with ${professional.name}!`);
        navigate('/chat');
        return;
      }

      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('doctor_id', doctorId)
        .maybeSingle();

      if (!existingConv) {
        // Create new conversation
        const { error } = await supabase
          .from('chat_conversations')
          .insert({
            user_id: user.id,
            doctor_id: doctorId
          });

        if (error && error.code !== '23505') throw error; // Ignore duplicate key errors
      }

      toast.success(`Connected with ${professional.name}!`);
      navigate('/chat');
    } catch (error) {
      console.error('Error connecting with professional:', error);
      toast.error('Failed to connect with professional');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Healthcare Professionals</h1>
        <p className="text-gray-600">Connect with verified physiotherapists, doctors, and specialists</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, specialty, or expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Specialty Filter */}
          <div className="relative">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white"
            >
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="rating">Sort by Rating</option>
              <option value="reviews">Sort by Reviews</option>
              <option value="price">Sort by Price</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProfessionals.map((professional, index) => (
          <motion.div
            key={professional.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            {/* Card Header */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <img
                      src={professional.avatar}
                      alt={professional.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    {professional.available && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{professional.name}</h3>
                      {professional.verified && (
                        <div className="bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs font-medium">
                          Verified
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{professional.specialty}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{professional.rating} ({professional.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{professional.experience}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleFavorite(professional.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    favoriteIds.has(professional.id)
                      ? 'text-red-500 bg-red-50'
                      : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${favoriteIds.has(professional.id) ? 'fill-current' : ''}`} />
                </motion.button>
              </div>

              {/* Location and Price */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{professional.location}</span>
                </div>
                <div className="text-lg font-bold text-teal-600">
                  {professional.price}
                </div>
              </div>

              {/* Bio */}
              <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                {professional.bio}
              </p>

              {/* Specialties */}
              <div className="flex flex-wrap gap-2 mt-4">
                {professional.specialties.slice(0, 3).map((specialty) => (
                  <span
                    key={specialty}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {specialty}
                  </span>
                ))}
                {professional.specialties.length > 3 && (
                  <span className="text-gray-500 text-xs">
                    +{professional.specialties.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Card Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleConnect(professional.id)}
                  className="flex-1 bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Connect</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center space-x-2"
                >
                  <Video className="h-4 w-4" />
                  <span>Video Call</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* No Results */}
      {filteredProfessionals.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No professionals found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters</p>
        </motion.div>
      )}

      {/* Results Count */}
      {filteredProfessionals.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Showing {filteredProfessionals.length} of {professionals.length} professionals
          </p>
        </div>
      )}
    </div>
  );
};

export default Explore;