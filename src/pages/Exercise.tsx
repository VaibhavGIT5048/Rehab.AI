import React, { useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Play, Pause, RotateCcw, CheckCircle, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';

const EXERCISE_OPTIONS = [
  { value: 'squat', label: 'Squat' },
  { value: 'knee_extension', label: 'Seated Knee Extension (Left Leg)' },
  { value: 'shoulder_abduction', label: 'Shoulder Abduction/Flexion (Left Arm)' },
  { value: 'march', label: 'Standing March (Left Knee)' },
];

const EXERCISE_DETAILS = {
  squat: {
    name: 'Squat',
    sets: 3,
    reps: 30,
    description: 'Keep your feet shoulder-width apart. Lower your body. Stand back up.',
    image: 'https://images.pexels.com/photos/2261482/pexels-photo-2261482.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  knee_extension: {
    name: 'Seated Knee Extension (Left Leg)',
    sets: 3,
    reps: 15,
    description: 'While seated, extend your left knee straight then lower.',
    image: 'https://images.pexels.com/photos/3757957/pexels-photo-3757957.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  shoulder_abduction: {
    name: 'Shoulder Abduction/Flexion (Left Arm)',
    sets: 3,
    reps: 20,
    description: 'Lift your left arm to shoulder height then lower.',
    image: 'https://images.pexels.com/photos/247587/pexels-photo-247587.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  march: {
    name: 'Standing March (Left Knee)',
    sets: 3,
    reps: 40,
    description: 'Stand and march raising your left knee up then lower.',
    image: 'https://images.pexels.com/photos/466242/pexels-photo-466242.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
};

type ExerciseKey = keyof typeof EXERCISE_DETAILS;

const socket = io('http://192.168.1.4:5001');

const Exercise: React.FC = () => {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseKey>('squat');
  const [isActive, setIsActive] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [restTime, setRestTime] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [aiDetected, setAiDetected] = useState(true);
  const [repCount, setRepCount] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(EXERCISE_DETAILS[selectedExercise].reps);

  // Reset on exercise change
  useEffect(() => {
    setIsActive(false);
    setCurrentSet(1);
    setRestTime(0);
    setSessionComplete(false);
    setRepCount(0);
    setFeedback('');
    setTimeRemaining(EXERCISE_DETAILS[selectedExercise].reps);
  }, [selectedExercise]);

  // Socket listeners
  useEffect(() => {
    socket.on('exercise_update', (data) => {
      setRepCount(data.rep_count ?? 0);
      setFeedback(data.feedback ?? '');
    });
    return () => {
      socket.off('exercise_update');
    };
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeRemaining > 0 && restTime === 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (repCount >= EXERCISE_DETAILS[selectedExercise].reps) {
              if (currentSet < EXERCISE_DETAILS[selectedExercise].sets) {
                setCurrentSet((prevSet) => prevSet + 1);
                setRestTime(60);
                setTimeRemaining(EXERCISE_DETAILS[selectedExercise].reps);
                return EXERCISE_DETAILS[selectedExercise].reps;
              } else {
                setSessionComplete(true);
                setIsActive(false);
                return 0;
              }
            }
            return EXERCISE_DETAILS[selectedExercise].reps;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (restTime > 0) {
      interval = setInterval(() => {
        setRestTime((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeRemaining, restTime, repCount, currentSet, selectedExercise]);

  const startExercise = () => {
    setIsActive(true);
    setAiDetected(true);
  };

  const pauseExercise = () => setIsActive(false);

  const resetExercise = () => {
    setIsActive(false);
    setCurrentSet(1);
    setRestTime(0);
    setSessionComplete(false);
    setRepCount(0);
    setFeedback('');
    setTimeRemaining(EXERCISE_DETAILS[selectedExercise].reps);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center space-x-4">
        <label htmlFor="exercise" className="font-semibold text-lg">Choose Exercise:</label>
        <select
          id="exercise"
          className="border border-gray-300 rounded px-3 py-2"
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value as ExerciseKey)}
          disabled={isActive}
        >
          {EXERCISE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-4 relative">
          <h2 className="text-xl font-bold mb-4">AI Exercise Tracker</h2>
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-900">
            <Webcam
              audio={false}
              mirrored
              videoConstraints={{ facingMode: "user" }}
              className="w-full h-full object-cover"
            />
            {aiDetected && feedback && (
              <div className="absolute top-4 left-4 right-4 bg-white bg-opacity-80 text-black font-semibold p-2 rounded">
                {feedback}
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-2xl font-bold">{EXERCISE_DETAILS[selectedExercise].name}</h3>
            <p className="text-gray-600">{EXERCISE_DETAILS[selectedExercise].description}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 mb-6 text-center">
            <p className="text-3xl font-bold">{timeRemaining}</p>
            <p>{restTime > 0 ? 'Rest Time' : 'Seconds Remaining'}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 mb-6 text-center grid grid-cols-3 gap-4">
            <div>
              <p>Set {currentSet}</p>
              <p className="font-bold text-xl">{currentSet}</p>
            </div>
            <div>
              <p>Reps Completed</p>
              <p className="font-bold text-xl">{repCount}</p>
            </div>
            <div>
              <p>Total Sets</p>
              <p className="font-bold text-xl">{EXERCISE_DETAILS[selectedExercise].sets}</p>
            </div>
          </div>
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-teal-600 h-4 rounded-full transition-all"
                style={{
                  width: `${((currentSet - 1) * EXERCISE_DETAILS[selectedExercise].reps + repCount) / (EXERCISE_DETAILS[selectedExercise].sets * EXERCISE_DETAILS[selectedExercise].reps) * 100}%`
                }}
              />
            </div>
          </div>
          <div className="flex space-x-4 justify-center">
            {!isActive ? (
              <button
                onClick={startExercise}
                className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700 transition"
              >
                <Play className="inline-block mr-2" /> Start
              </button>
            ) : (
              <button
                onClick={pauseExercise}
                className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600 transition"
              >
                <Pause className="inline-block mr-2" /> Pause
              </button>
            )}
            <button
              onClick={resetExercise}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
            >
              <RotateCcw className="inline-block mr-2" /> Reset
            </button>
          </div>
          {sessionComplete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full text-center shadow-lg">
                <Trophy className="mx-auto mb-4 text-teal-600" size={48} />
                <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
                <p>You finished your {EXERCISE_DETAILS[selectedExercise].name} session.</p>
                <button
                  onClick={() => setSessionComplete(false)}
                  className="mt-4 bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Exercise;
