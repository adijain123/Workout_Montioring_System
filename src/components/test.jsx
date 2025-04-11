import React, { useEffect, useRef, useState } from 'react';
import { initLifting } from './liftingPose';
import { initLunges } from './lunges';
import { initJumpingJacks } from './jumpingJacks';
import { initLegLift } from './double_leg_lift';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Use a consistent API URL format
const API_URL = 'https://backend-workout-monitoring.onrender.com';

export default function Workout() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [show, setShow] = useState(false);
  const [reps, setReps] = useState(0);
  const [stage, setStage] = useState('');
  const [workoutTime, setWorkoutTime] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exerciseType, setExerciseType] = useState('lifting');
  const [stopExerciseFunc, setStopExerciseFunc] = useState(() => () => ({}));
  const [finalReps, setFinalReps] = useState(0);
  const [finalWorkoutTime, setFinalWorkoutTime] = useState(0);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_URL}/check-auth`, {
          withCredentials: true,
        });
        
        if (response.data.authenticated) {
          setUser(response.data.user);
          // Load user progress once authenticated
          fetchUserProgress();
        }
      } catch (err) {
        console.error("Authentication error:", err.response?.data || err.message);
      }
    };
    
    checkAuth();
  }, []);

  // Fetch user progress data
  const fetchUserProgress = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/user-progress`, {
        withCredentials: true,
      });
      
      setProgress(response.data.progress);
      setRecommendations(response.data.recommendations);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch progress data");
      setLoading(false);
    }
  };

  // Start a new workout session
  const startWorkout = async (type) => {
    try {
      setExerciseType(type);
      
      // Create a new workout session in the database
      const response = await axios.post(`${API_URL}/start-workout`, {
        exercise_type: type
      }, {
        withCredentials: true,
      });
      
      setSessionId(response.data.session_id);
      setShow(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to start workout session");
    }
  };

  // End the current workout session
  const stopWorkout = async () => {
    if (!sessionId) return;
  
    try {
      const workoutData = stopExerciseFunc();
  
      // Store final values for display
      setFinalReps(workoutData.reps);
      setFinalWorkoutTime(workoutTime);
  
      await axios.post(`${API_URL}/end-workout`, {
        session_id: sessionId,
        duration: workoutTime
      }, {
        withCredentials: true,
      });
  
      await axios.post(`${API_URL}/save-exercise`, {
        session_id: sessionId,
        type: exerciseType,
        reps: workoutData.reps
      }, {
        withCredentials: true,
      });
  
      fetchUserProgress();
  
      // Transition to results view
      setShowResults(true);
      setShow(false);
  
      // Reset main workout state
      setReps(0);
      setStage('');
      setWorkoutTime(0);
      setSessionId(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save workout data");
    }
  };
  
  // Initialize pose detection
  useEffect(() => {
    if (show && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const handleUpdate = (newReps, newStage) => {
        setReps(newReps);
        setStage(newStage);
      };
      
      const handleTimeUpdate = (timeInSeconds) => {
        setWorkoutTime(timeInSeconds);
      };
      
      let stopFunc;
      if (exerciseType === 'lunges') {
        stopFunc = initLunges(video, canvas, handleUpdate, handleTimeUpdate);
      } else if (exerciseType === 'jumping-jacks') {
        stopFunc = initJumpingJacks(video, canvas, handleUpdate, handleTimeUpdate);
      } else if (exerciseType === 'leg-lifts') {
        stopFunc = initLegLift(video, canvas, handleUpdate, handleTimeUpdate);
      } else {
        stopFunc = initLifting(video, canvas, handleUpdate, handleTimeUpdate);
      }
      
      setStopExerciseFunc(() => stopFunc);
      
      return () => {
        const data = stopFunc();
        console.log("Cleanup workout data:", data);
      };
    }
  }, [show, exerciseType]);

  // Format time display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Prepare chart data from progress
  const prepareChartData = () => {
    if (!progress || progress.length === 0) return null;
    
    const labels = progress.map(session => {
      const date = new Date(session.date);
      return date.toLocaleDateString();
    });
    
    const repsData = progress.map(session => {
      return session.exercises.reduce((total, ex) => total + ex.reps, 0);
    });
    
    return {
      labels,
      datasets: [
        {
          label: 'Reps per Session',
          data: repsData,
          fill: false,
          backgroundColor: 'rgba(56, 189, 248, 0.6)',
          borderColor: 'rgba(96, 165, 250, 1)',
          tension: 0.2
        }
      ]
    };
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e2e8f0',
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Your Workout Progress',
        color: '#e2e8f0',
        font: {
          family: "'Inter', sans-serif",
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        titleFont: {
          family: "'Inter', sans-serif"
        },
        bodyFont: {
          family: "'Inter', sans-serif"
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#cbd5e1',
          font: {
            family: "'Inter', sans-serif"
          }
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        }
      },
      x: {
        ticks: {
          color: '#cbd5e1',
          font: {
            family: "'Inter', sans-serif"
          }
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        }
      }
    }
  };

  // Function to get exercise display name
  const getExerciseDisplayName = (type) => {
    switch(type) {
      case 'lunges':
        return 'Lunges';
      case 'jumping-jacks':
        return 'Jumping Jacks';
      case 'leg-lifts':
        return 'Leg Lifts';
      case 'lifting':
      default:
        return 'Bicep Curls';
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center w-full px-6 py-16 bg-gradient-to-b from-gray-900 to-blue-950 text-gray-100 min-h-screen">
        <div className="w-full max-w-2xl bg-gradient-to-b from-gray-800 to-blue-900 p-10 rounded-xl shadow-2xl border border-blue-800">
          <h2 className="text-3xl font-bold text-blue-300 mb-6 text-center">Authentication Required</h2>
          <div className="bg-blue-900/30 p-6 rounded-lg border border-blue-800/50 mb-6">
            <p className="text-gray-200 text-lg mb-4">You need to be logged in to use the workout tracker features.</p>
            <p className="text-gray-300">Track your exercises, monitor progress, and get personalized recommendations.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <Link to="/login" className="w-full sm:w-auto">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm5 10v-2a3 3 0 116 0v2h-6z" clipRule="evenodd" />
                </svg>
                Login
              </button>
            </Link>
            <Link to="/signup" className="w-full sm:w-auto">
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                  <path d="M16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full p-6 bg-gradient-to-b from-gray-900 to-blue-950 text-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300 mb-8">Workout Progress Tracker</h1>
      
      {error && (
        <div className="w-full max-w-4xl bg-red-900/60 text-white p-4 rounded-lg mb-6 border-l-4 border-red-500 flex items-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-sm px-3 py-1 bg-red-800 hover:bg-red-700 rounded-md transition duration-200"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {!show && !showResults && (
        <div className="mb-8 w-full max-w-5xl">
          <div className="bg-gradient-to-b from-gray-800 to-blue-900 rounded-xl shadow-xl p-8 border border-blue-800/30">
            <h2 className="text-2xl font-bold text-blue-300 mb-6">Choose Your Workout</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <button
                onClick={() => startWorkout('lifting')}
                className="bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-4 rounded-lg text-lg font-medium w-full transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center h-32 border border-blue-600/30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M3 12h18M3 18h18" />
                </svg>
                Start Bicep Curls
              </button>
              
              <button
                onClick={() => startWorkout('lunges')}
                className="bg-gradient-to-br from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white px-6 py-4 rounded-lg text-lg font-medium w-full transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center h-32 border border-emerald-600/30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Start Lunges
              </button>
              
              <button
                onClick={() => startWorkout('jumping-jacks')}
                className="bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-6 py-4 rounded-lg text-lg font-medium w-full transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center h-32 border border-purple-600/30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                </svg>
                Start Jumping Jacks
              </button>
              
              <button
                onClick={() => startWorkout('leg-lifts')}
                className="bg-gradient-to-br from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white px-6 py-4 rounded-lg text-lg font-medium w-full transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center h-32 border border-amber-600/30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
                Start Leg Lifts
              </button>
            </div>
            <p className="text-center text-blue-200 mt-4 italic">
              Select an exercise to begin your tracked workout session
            </p>
          </div>
        </div>
      )}
      
      {show && (
        <div className="w-full max-w-5xl bg-gradient-to-b from-gray-800 to-blue-900 rounded-xl shadow-xl p-6 border border-blue-800/30">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-blue-900/30 p-4 rounded-lg border border-blue-800/50">
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 mb-4 sm:mb-0">
              <div className="flex items-center px-4 py-2 bg-blue-800/50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-yellow-300 font-bold">{reps} Reps</span>
              </div>
              
              <div className="flex items-center px-4 py-2 bg-blue-800/50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-blue-300 font-bold">{formatTime(workoutTime)}</span>
              </div>
              
              <div className="flex items-center px-4 py-2 bg-blue-800/50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-purple-300 font-bold">{getExerciseDisplayName(exerciseType)}</span>
              </div>
            </div>
            
            <button
              onClick={stopWorkout}
              className="flex items-center bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white px-6 py-2 rounded-lg font-medium transition duration-300 ease-in-out transform hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              End Workout
            </button>
          </div>
          
          <div className="relative mb-6 w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-blue-900">
            <video
              ref={videoRef}
              className="w-full h-[540px] rounded-lg"
              autoPlay
              muted
              playsInline
              style={{ transform: 'scaleX(-1)' }}
            />
            <canvas
              ref={canvasRef}
              width="640"
              height="480"
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
          
          <div className="bg-blue-900/30 p-6 rounded-lg border border-blue-800/50 shadow-lg">
            <h3 className="text-xl font-bold text-blue-300 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Exercise Status
            </h3>
            <p className="text-white text-lg font-medium mb-3">
              {stage || "Stand in position to begin tracking"}
            </p>
            
            <div className="bg-blue-900/50 p-4 rounded-lg border border-blue-700/50 mt-4">
              {exerciseType === 'lunges' ? (
                <div className="flex items-start text-blue-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <p>Lunges detection active. Bend both knees below 110° and return to standing to count a rep.</p>
                </div>
              ) : exerciseType === 'jumping-jacks' ? (
                <div className="flex items-start text-blue-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <p>Jumping jacks detection active. Move your arms from down position to up position to count a rep.</p>
                </div>
              ) : exerciseType === 'leg-lifts' ? (
                <div className="flex items-start text-blue-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <p>Leg lift detection active. Lift your leg up from the floor and return to count a rep.</p>
                </div>
              ) : (
                <div className="flex items-start text-blue-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <p>Bicep curl detection active. Curl your arms to count reps.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {showResults && (
        <div className="w-full max-w-5xl bg-gradient-to-b from-gray-800 to-blue-900 rounded-xl shadow-2xl p-8 border border-blue-800/30">
          <div className="flex items-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mr-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-blue-300">Workout Complete!</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-900/30 p-6 rounded-lg border border-blue-700/50 shadow-lg flex flex-col items-center">
              <div className="bg-blue-700/30 p-3 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-blue-300 mb-2">Total Reps</h3>
              <p className="text-4xl font-bold text-white">{finalReps}</p>
            </div>
            
            <div className="bg-blue-900/30 p-6 rounded-lg border border-blue-700/50 shadow-lg flex flex-col items-center">
              <div className="bg-blue-700/30 p-3 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-green-300 mb-2">Workout Time</h3>
              <p className="text-4xl font-bold text-white">{formatTime(finalWorkoutTime)}</p>
            </div>
            
            <div className="bg-blue-900/30 p-6 rounded-lg border border-blue-700/50 shadow-lg flex flex-col items-center">
              <div className="bg-blue-700/30 p-3 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-purple-300 mb-2">Exercise</h3>
              <p className="text-2xl font-bold text-white">
                {getExerciseDisplayName(exerciseType)}
              </p>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={() => setShowResults(false)}
              className="bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white px-6 py-3 rounded-lg text-lg font-medium w-full transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
      
      {!show && (
        <div className="w-full max-w-5xl mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-b from-gray-800 to-blue-900 p-6 rounded-xl shadow-xl border border-blue-800/30">
              <h2 className="text-2xl font-bold text-blue-300 mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Progress Chart
              </h2>
              {loading ? (
                <div className="flex justify-center items-center h-64 bg-blue-900/30 rounded-lg border border-blue-800/50">
                  <div className="flex flex-col items-center">
                    <svg className="animate-spin h-10 w-10 text-blue-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-blue-300">Loading data...</p>
                  </div>
                </div>
              ) : progress && progress.length > 0 ? (
                <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50 h-64">
                  <Line data={prepareChartData()} options={chartOptions} />
                </div>
              ) : (
                <div className="flex justify-center items-center h-64 bg-blue-900/30 rounded-lg border border-blue-800/50">
                  <p className="text-blue-300">No workout data available yet</p>
                </div>
              )}
            </div>
            
            <div className="bg-gradient-to-b from-gray-800 to-blue-900 p-6 rounded-xl shadow-xl border border-blue-800/30">
              <h2 className="text-2xl font-bold text-blue-300 mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Recommendations
              </h2>
              {loading ? (
                <div className="flex justify-center items-center h-64 bg-blue-900/30 rounded-lg border border-blue-800/50">
                  <div className="flex flex-col items-center">
                    <svg className="animate-spin h-10 w-10 text-blue-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-blue-300">Loading recommendations...</p>
                  </div>
                </div>
              ) : recommendations && recommendations.length > 0 ? (
                <div className="bg-blue-900/30 p-6 rounded-lg border border-blue-700/50">
                  <ul className="space-y-4">
                    {recommendations.map((rec, index) => (
                      <li key={index} className="flex">
                        <span className="text-blue-400 mr-3 mt-1">•</span>
                        <span className="text-gray-200">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="flex justify-center items-center h-64 bg-blue-900/30 rounded-lg border border-blue-800/50">
                  <p className="text-blue-300">No recommendations available yet</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8">
            <div className="bg-gradient-to-b from-gray-800 to-blue-900 p-6 rounded-xl shadow-xl border border-blue-800/30">
              <h2 className="text-2xl font-bold text-blue-300 mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Workout History
              </h2>
              {loading ? (
                <div className="flex justify-center items-center h-32 bg-blue-900/30 rounded-lg border border-blue-800/50">
                  <div className="flex flex-col items-center">
                    <svg className="animate-spin h-10 w-10 text-blue-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-blue-300">Loading history...</p>
                  </div>
                </div>
              ) : progress && progress.length > 0 ? (
                <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Exercises</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Total Reps</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {progress.map((session) => {
                        const totalReps = session.exercises.reduce((sum, ex) => sum + ex.reps, 0);
                        const date = new Date(session.date).toLocaleDateString();
                        const duration = formatTime(session.duration);
                        const exerciseTypes = [...new Set(session.exercises.map(ex => ex.type))];
                        const displayTypes = exerciseTypes.map(type => getExerciseDisplayName(type)).join(', ');
                        
                        return (
                          <tr key={session.session_id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{duration}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{displayTypes}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{session.exercises.length}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{totalReps}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex justify-center items-center h-32 bg-blue-900/30 rounded-lg border border-blue-800/50">
                  <p className="text-blue-300">No workout history available yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}