import React, { useState } from 'react';
import { useEffect } from 'react';
import { Edit3, MapPin, Calendar, Award, TrendingUp, Users, Heart, MessageCircle, Camera, Settings, FileText, Palette, LogOut, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import ProfileEditModal from '../components/ProfileEditModal';
import HealthRecordsModal from '../components/HealthRecordsModal';

const Profile = () => {
  const [activeTab, setActiveTab] = useState<'about' | 'activity' | 'achievements'>('about');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHealthRecords, setShowHealthRecords] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [userSettings, setUserSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user, signOut, deleteAccount } = useAuth();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (user) {
      loadProfile();
      loadUserSettings();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadUserSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUserSettings(data);
    } catch (error) {
      console.error('Error loading user settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile: any) => {
    setProfile(updatedProfile);
  };

  const updateTheme = async (theme: string) => {
    setTheme(theme as any);
    toast.success('Theme updated!');
  };

  const handleDeleteProfile = async () => {
    if (window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
      try {
        await deleteAccount();
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  const userStats = [
    { label: 'Recovery Progress', value: '87%', color: 'text-teal-600' },
    { label: 'Sessions Completed', value: '34', color: 'text-blue-600' },
    { label: 'Current Streak', value: '12 days', color: 'text-orange-600' },
    { label: 'Average Accuracy', value: '89%', color: 'text-green-600' }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'exercise',
      title: 'Completed Wall Sit Exercise',
      details: '3 sets, 89% accuracy',
      time: '2 hours ago',
      icon: TrendingUp
    },
    {
      id: 2,
      type: 'achievement',
      title: 'Earned "Perfect Form" badge',
      details: 'Achieved 95%+ accuracy',
      time: '1 day ago',
      icon: Award
    },
    {
      id: 3,
      type: 'message',
      title: 'Message from Dr. Mitchell',
      details: 'Great progress on your recovery!',
      time: '2 days ago',
      icon: MessageCircle
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Cover Photo */}
            <div className="h-32 bg-gradient-to-r from-teal-500 to-green-500 relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-4 right-4 bg-white/20 text-white p-2 rounded-lg hover:bg-white/30 transition-colors"
              >
                <Camera className="h-4 w-4" />
              </motion.button>
            </div>

            {/* Profile Picture */}
            <div className="relative px-6 pb-6">
              <div className="flex items-end justify-between -mt-16">
                <div className="relative">
                  <img
                    src="https://images.pexels.com/photos/3768114/pexels-photo-3768114.jpeg?auto=compress&cs=tinysrgb&w=400"
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-green-400 border-2 border-white w-6 h-6 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEditModal(true)}
                  className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors flex items-center space-x-2"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit</span>
                </motion.button>
              </div>

              <div className="mt-4">
                <h1 className="text-2xl font-bold text-gray-900">{profile?.name || 'User'}</h1>
                <p className="text-gray-600">{profile?.injury_type ? `${profile.injury_type} Recovery` : 'Amateur Athlete'}</p>
                
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile?.location || 'Location not set'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(profile?.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Recovery Status */}
                <div className="mt-4 bg-teal-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-teal-700">Current Recovery</span>
                    <span className="text-sm text-teal-600">Week 8</span>
                  </div>
                  <h3 className="font-semibold text-teal-900">{profile?.injury_type || 'General'} Rehabilitation</h3>
                  <div className="mt-2 bg-teal-200 rounded-full h-2">
                    <div className="bg-teal-500 h-2 rounded-full w-4/5"></div>
                  </div>
                  <p className="text-xs text-teal-600 mt-1">80% Complete</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              {userStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-600">{stat.label}</span>
                  <span className={`font-bold ${stat.color}`}>{stat.value}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setShowAccountSettings(!showAccountSettings)}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3"
              >
                <Settings className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">Account Settings</span>
              </button>
              
              {showAccountSettings && (
                <div className="ml-8 space-y-2 border-l-2 border-gray-200 pl-4">
                  <button 
                    onClick={() => setShowHealthRecords(true)}
                    className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-900">Health Records</span>
                  </button>
                  
                  <div className="p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Palette className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-900">Theme</span>
                      </div>
                      <select
                        value={theme}
                        onChange={(e) => updateTheme(e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleDeleteProfile}
                    className="w-full text-left p-2 rounded-lg hover:bg-red-50 transition-colors flex items-center space-x-3 text-red-600">
                    <Trash2 className="h-4 w-4" />
                    <span className="text-sm">Delete Account</span>
                  </button>
                  
                  <button 
                    onClick={signOut}
                    className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3">
                    <LogOut className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-900">Sign Out</span>
                  </button>
                </div>
              )}
              
              <Link 
                to="/explore"
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3">
                <Users className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">Find Professionals</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Navigation Tabs */}
          <div className="bg-white rounded-2xl shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { key: 'about', label: 'About' },
                  { key: 'activity', label: 'Recent Activity' },
                  { key: 'achievements', label: 'Achievements' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.key
                        ? 'border-teal-500 text-teal-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            {activeTab === 'about' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">About Me</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {profile?.bio || `I'm a passionate amateur athlete currently recovering from a ${profile?.injury_type?.toLowerCase() || 'sports'} injury. I've been using RehabAI for the past 8 weeks and have seen incredible progress in my recovery journey.`}
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Recovery Goals</h3>
                  <div className="space-y-3">
                    {profile?.recovery_goals?.length > 0 ? (
                      profile.recovery_goals.map((goal: string, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">{goal}</span>
                          <span className="text-sm text-teal-600 font-medium">In Progress</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-500">No recovery goals set</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Medical Team</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      <img
                        src="https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=400"
                        alt="Dr. Mitchell"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Dr. Sarah Mitchell</h4>
                        <p className="text-sm text-gray-600">Sports Physiotherapist</p>
                      </div>
                      <button className="text-teal-600 hover:text-teal-700 font-medium text-sm">
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'activity' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="bg-teal-100 p-2 rounded-lg">
                      <activity.icon className="h-5 w-5 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{activity.title}</h4>
                      <p className="text-sm text-gray-600">{activity.details}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'achievements' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h3 className="font-bold text-gray-900 mb-4">My Achievements</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: "7-Day Streak", icon: "🔥", description: "Completed exercises for 7 days straight", earned: true },
                    { title: "Perfect Form", icon: "🎯", description: "Achieved 95%+ accuracy in a session", earned: true },
                    { title: "Early Bird", icon: "🌅", description: "Completed morning workouts 5 times", earned: true },
                    { title: "Consistency King", icon: "👑", description: "30-day exercise streak", earned: false }
                  ].map((achievement, index) => (
                    <motion.div
                      key={achievement.title}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl border-2 ${
                        achievement.earned
                          ? 'bg-gradient-to-r from-teal-50 to-green-50 border-teal-200'
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">{achievement.icon}</div>
                        <h4 className="font-bold text-gray-900 mb-1">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        {achievement.earned && (
                          <div className="mt-3">
                            <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs font-medium">
                              Earned
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-teal-500 to-green-500 rounded-xl p-6 text-white text-center">
                  <h4 className="text-xl font-bold mb-2">Level 3 Recoverer 🏆</h4>
                  <p className="text-teal-100 mb-4">You're making excellent progress on your recovery journey!</p>
                  <div className="bg-white/20 rounded-full h-2 max-w-xs mx-auto">
                    <div className="bg-white h-2 rounded-full w-3/4"></div>
                  </div>
                  <p className="text-sm text-teal-100 mt-2">750 / 1000 XP to Level 4</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <ProfileEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onProfileUpdate={handleProfileUpdate}
      />
      
      <HealthRecordsModal
        isOpen={showHealthRecords}
        onClose={() => setShowHealthRecords(false)}
      />
    </div>
  );
};

export default Profile;