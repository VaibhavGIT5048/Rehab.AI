import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, Award, Target, Calendar, Flame, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const weeklyData = [
  { day: 'Mon', accuracy: 78, duration: 15, exercises: 3 },
  { day: 'Tue', accuracy: 82, duration: 18, exercises: 4 },
  { day: 'Wed', accuracy: 85, duration: 20, exercises: 3 },
  { day: 'Thu', accuracy: 88, duration: 22, exercises: 5 },
  { day: 'Fri', accuracy: 91, duration: 25, exercises: 4 },
  { day: 'Sat', accuracy: 87, duration: 30, exercises: 6 },
  { day: 'Sun', accuracy: 89, duration: 20, exercises: 3 }
];

const monthlyProgress = [
  { month: 'Jan', score: 65 },
  { month: 'Feb', score: 72 },
  { month: 'Mar', score: 78 },
  { month: 'Apr', score: 85 },
  { month: 'May', score: 89 },
  { month: 'Jun', score: 92 }
];

const radarData = [
  { subject: 'Flexibility', A: 85, fullMark: 100 },
  { subject: 'Strength', A: 78, fullMark: 100 },
  { subject: 'Balance', A: 92, fullMark: 100 },
  { subject: 'Endurance', A: 88, fullMark: 100 },
  { subject: 'Form', A: 90, fullMark: 100 },
  { subject: 'Consistency', A: 95, fullMark: 100 }
];

const achievements = [
  { id: 1, title: "7-Day Streak", description: "Completed exercises for 7 days straight", icon: "🔥", earned: true },
  { id: 2, title: "Perfect Form", description: "Achieved 95%+ accuracy in a session", icon: "🎯", earned: true },
  { id: 3, title: "Early Bird", description: "Completed morning workouts 5 times", icon: "🌅", earned: true },
  { id: 4, title: "Consistency King", description: "30-day exercise streak", icon: "👑", earned: false },
  { id: 5, title: "Form Master", description: "90%+ average accuracy over a month", icon: "🥋", earned: false },
  { id: 6, title: "Marathon", description: "100 total exercise sessions", icon: "🏃", earned: false }
];

const Progress = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'achievements'>('overview');

  const stats = [
    {
      title: "Current Streak",
      value: "12 days",
      icon: Flame,
      color: "text-orange-600",
      bg: "bg-orange-50",
      change: "+3 from last week"
    },
    {
      title: "Average Accuracy",
      value: "87%",
      icon: Target,
      color: "text-green-600",
      bg: "bg-green-50",
      change: "+5% from last week"
    },
    {
      title: "Total Sessions",
      value: "34",
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-50",
      change: "+8 this week"
    },
    {
      title: "Recovery Score",
      value: "92/100",
      icon: TrendingUp,
      color: "text-teal-600",
      bg: "bg-teal-50",
      change: "+12 points"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Recovery Progress</h1>
        <p className="text-gray-600">Track your rehabilitation journey and celebrate your achievements</p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'detailed', label: 'Detailed Analytics' },
              { key: 'achievements', label: 'Achievements' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Weekly Accuracy Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Accuracy Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="#14b8a6" 
                    strokeWidth={3}
                    dot={{ fill: '#14b8a6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#14b8a6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Exercise Duration Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Exercise Duration</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Bar dataKey="duration" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Recent Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recent Achievements</h3>
              <button
                onClick={() => setActiveTab('achievements')}
                className="text-teal-600 hover:text-teal-700 font-medium text-sm"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.filter(a => a.earned).slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="bg-gradient-to-r from-teal-50 to-green-50 rounded-xl p-4 border border-teal-100">
                  <div className="text-2xl mb-2">{achievement.icon}</div>
                  <h4 className="font-semibold text-gray-900 mb-1">{achievement.title}</h4>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Detailed Analytics Tab */}
      {activeTab === 'detailed' && (
        <div className="space-y-8">
          {/* Monthly Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">6-Month Recovery Progress</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#14b8a6" 
                  strokeWidth={4}
                  dot={{ fill: '#14b8a6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#14b8a6', strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Performance Radar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Analysis</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                  name="Performance"
                  dataKey="A"
                  stroke="#14b8a6"
                  fill="#14b8a6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Detailed Stats Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Day</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Accuracy</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Duration</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Exercises</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyData.map((day, index) => (
                    <tr key={day.day} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900">{day.day}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-900">{day.accuracy}%</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-teal-500 h-2 rounded-full"
                              style={{ width: `${day.accuracy}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900">{day.duration} min</td>
                      <td className="py-3 px-4 text-gray-900">{day.exercises}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          day.accuracy >= 90 ? 'bg-green-100 text-green-700' :
                          day.accuracy >= 80 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {day.accuracy >= 90 ? 'Excellent' : day.accuracy >= 80 ? 'Good' : 'Needs Work'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-6">Achievement Gallery</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    achievement.earned
                      ? 'bg-gradient-to-r from-teal-50 to-green-50 border-teal-200 shadow-sm'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">{achievement.icon}</div>
                    <h4 className={`font-bold mb-2 ${
                      achievement.earned ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {achievement.title}
                    </h4>
                    <p className={`text-sm ${
                      achievement.earned ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {achievement.description}
                    </p>
                    {achievement.earned && (
                      <div className="mt-4">
                        <div className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-medium inline-flex items-center space-x-1">
                          <Trophy className="h-3 w-3" />
                          <span>Earned</span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Progress Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-teal-500 to-green-500 rounded-2xl shadow-sm p-6 text-white"
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Keep Up the Great Work! 🎉</h3>
              <p className="text-teal-100 mb-6">
                You've earned {achievements.filter(a => a.earned).length} out of {achievements.length} achievements
              </p>
              <div className="bg-white/20 rounded-full h-3 max-w-md mx-auto">
                <div 
                  className="bg-white h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${(achievements.filter(a => a.earned).length / achievements.length) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-teal-100 mt-2">
                {Math.round((achievements.filter(a => a.earned).length / achievements.length) * 100)}% Complete
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Progress;