import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, CheckCircle, User, Activity, Target, Stethoscope } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    injury: '',
    goals: [],
    experience: '',
    preferredDoctor: ''
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  const steps = [
    {
      title: "Welcome to RehabAI",
      subtitle: "Let's get you started on your recovery journey",
      icon: User
    },
    {
      title: "Tell us about your injury",
      subtitle: "This helps us customize your experience",
      icon: Activity
    },
    {
      title: "Set your recovery goals",
      subtitle: "What would you like to achieve?",
      icon: Target
    },
    {
      title: "Connect with a professional",
      subtitle: "Choose your preferred physiotherapist",
      icon: Stethoscope
    }
  ];

  const injuryTypes = [
    { id: 'knee', label: 'Knee Injury', description: 'ACL, MCL, Meniscus' },
    { id: 'shoulder', label: 'Shoulder Injury', description: 'Rotator cuff, Dislocation' },
    { id: 'ankle', label: 'Ankle Injury', description: 'Sprain, Fracture' },
    { id: 'back', label: 'Back Injury', description: 'Lower back, Herniated disc' },
    { id: 'other', label: 'Other', description: 'Different injury type' }
  ];

  const recoveryGoals = [
    'Return to sports',
    'Pain-free daily activities',
    'Improved mobility',
    'Strength building',
    'Prevent re-injury',
    'Better balance'
  ];

  const doctors = [
    {
      id: 'mitchell',
      name: 'Dr. Sarah Mitchell',
      specialty: 'Sports Physiotherapist',
      rating: 4.9,
      experience: '12 years',
      avatar: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 'chen',
      name: 'Dr. Marcus Chen',
      specialty: 'Orthopedic Surgeon',
      rating: 4.8,
      experience: '15 years',
      avatar: 'https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 'rodriguez',
      name: 'Emma Rodriguez',
      specialty: 'Physical Therapist',
      rating: 4.9,
      experience: '8 years',
      avatar: 'https://images.pexels.com/photos/8376285/pexels-photo-8376285.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1 && !loading) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === steps.length - 1) {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Update user profile with onboarding data
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          age: formData.age ? parseInt(formData.age) : null,
          injury_type: formData.injury,
          recovery_goals: formData.goals,
          preferred_doctor: formData.preferredDoctor,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Create initial user settings
      await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          theme: 'light',
          notifications_enabled: true,
          email_notifications: true
        });

      toast.success('Profile setup complete!');
      navigate('/', { state: { selectedDoctor: formData.preferredDoctor } }); // Redirect to home/feed with doctor info
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-center"
          >
            <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
              <User className="h-12 w-12 text-teal-600" />
            </div>
            <div>
              <input
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full max-w-md mx-auto text-center text-xl p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Your age"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                className="w-32 text-center p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {injuryTypes.map((injury) => (
              <motion.button
                key={injury.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFormData(prev => ({ ...prev, injury: injury.id }))}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  formData.injury === injury.id
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{injury.label}</h3>
                    <p className="text-sm text-gray-600">{injury.description}</p>
                  </div>
                  {formData.injury === injury.id && (
                    <CheckCircle className="h-6 w-6 text-teal-500" />
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p className="text-gray-600 text-center mb-6">Select all that apply:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recoveryGoals.map((goal) => (
                <motion.button
                  key={goal}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleGoalToggle(goal)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.goals.includes(goal)
                      ? 'border-teal-500 bg-teal-50 text-teal-600'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{goal}</span>
                    {formData.goals.includes(goal) && (
                      <CheckCircle className="h-5 w-5" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {doctors.map((doctor) => (
              <motion.button
                key={doctor.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFormData(prev => ({ ...prev, preferredDoctor: doctor.id }))}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  formData.preferredDoctor === doctor.id
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={doctor.avatar}
                    alt={doctor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                    <p className="text-sm text-gray-600">{doctor.specialty}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-yellow-500">★ {doctor.rating}</span>
                      <span className="text-sm text-gray-500">• {doctor.experience}</span>
                    </div>
                  </div>
                  {formData.preferredDoctor === doctor.id && (
                    <CheckCircle className="h-6 w-6 text-teal-500" />
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.name.trim() !== '';
      case 1:
        return formData.injury !== '';
      case 2:
        return formData.goals.length > 0;
      case 3:
        return formData.preferredDoctor !== '';
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-teal-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Main Content */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              {React.createElement(steps[currentStep].icon, {
                className: "h-8 w-8 text-teal-600"
              })}
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h1>
            <p className="text-gray-600">
              {steps[currentStep].subtitle}
            </p>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back</span>
            </button>

            <button
              onClick={nextStep}
              disabled={!isStepValid() || loading}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                isStepValid() && !loading
                  ? 'bg-teal-500 text-white hover:bg-teal-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                  </span>
                  <ChevronRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Onboarding;