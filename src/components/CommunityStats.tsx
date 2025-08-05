import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Heart, TrendingUp, Award, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface CommunityStatsData {
  totalUsers: number;
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  activeToday: number;
  userStreak: number;
}

const CommunityStats: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<CommunityStatsData>({
    totalUsers: 0,
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    activeToday: 0,
    userStreak: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCommunityStats();
    }
  }, [user]);

  const loadCommunityStats = async () => {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_public', true);

      // Get total posts
      const { count: totalPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_public', true);

      // Get total likes
      const { count: totalLikes } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true });

      // Get total comments
      const { count: totalComments } = await supabase
        .from('post_comments')
        .select('*', { count: 'exact', head: true });

      // Get active users today (simplified - users who posted today)
      const today = new Date().toISOString().split('T')[0];
      const { count: activeToday } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lte('created_at', `${today}T23:59:59.999Z`);

      // Calculate user streak (simplified - days with posts)
      let userStreak = 0;
      if (user) {
        const { data: userPosts } = await supabase
          .from('posts')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(30);

        if (userPosts && userPosts.length > 0) {
          const dates = userPosts.map(post => 
            new Date(post.created_at).toISOString().split('T')[0]
          );
          const uniqueDates = [...new Set(dates)].sort().reverse();
          
          // Calculate consecutive days
          const today = new Date().toISOString().split('T')[0];
          let currentDate = new Date(today);
          
          for (const dateStr of uniqueDates) {
            const postDate = new Date(dateStr);
            const diffTime = currentDate.getTime() - postDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 1) {
              userStreak++;
              currentDate = postDate;
            } else {
              break;
            }
          }
        }
      }

      setStats({
        totalUsers: totalUsers || 0,
        totalPosts: totalPosts || 0,
        totalLikes: totalLikes || 0,
        totalComments: totalComments || 0,
        activeToday: activeToday || 0,
        userStreak
      });
    } catch (error) {
      console.error('Error loading community stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statItems = [
    {
      label: 'Community Members',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      change: '+12 this week'
    },
    {
      label: 'Posts Shared',
      value: stats.totalPosts,
      icon: MessageCircle,
      color: 'text-green-600',
      bg: 'bg-green-100',
      change: '+8 today'
    },
    {
      label: 'Likes Given',
      value: stats.totalLikes,
      icon: Heart,
      color: 'text-red-600',
      bg: 'bg-red-100',
      change: '+24 today'
    },
    {
      label: 'Active Today',
      value: stats.activeToday,
      icon: Activity,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      change: 'online now'
    },
    {
      label: 'Your Streak',
      value: stats.userStreak,
      icon: Award,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      change: 'days active'
    },
    {
      label: 'Engagement',
      value: Math.round((stats.totalLikes + stats.totalComments) / Math.max(stats.totalPosts, 1) * 10) / 10,
      icon: TrendingUp,
      color: 'text-teal-600',
      bg: 'bg-teal-100',
      change: 'avg per post'
    }
  ];

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-8"
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statItems.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 ${stat.bg} rounded-lg mb-3`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value.toLocaleString()}
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {stat.label}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {stat.change}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default CommunityStats;