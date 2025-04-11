import React, { useEffect, useRef, useState } from 'react';
import { initLifting } from './liftingPose';
import { initLunges } from './lunges';
import { initJumpingJacks } from './jumpingJacks';
import { initLegLiftPoseEstimation } from './double_leg_lift'; // Import the new leg lift module
import { Line } from 'react-chartjs-2';
import axios from 'axios';
// Add these imports for Chart.js
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
  // Add leg-lifts to the exercise types
  const [exerciseType, setExerciseType] = useState('lifting'); // Default to lifting, can be 'lifting', 'lunges', 'jumping-jacks', or 'leg-lifts'
  const [stopExerciseFunc, setStopExerciseFunc] = useState(() => () => ({}));
  const [finalReps, setFinalReps] = useState(0);
  const [finalWorkoutTime, setFinalWorkoutTime] = useState(0);


  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_URL}/check-auth`, {
          withCredentials: true, // Explicitly include credentials
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
        withCredentials: true, // Explicitly include credentials
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
        withCredentials: true, // Explicitly include credentials
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
        // Initialize leg lift pose estimation
        stopFunc = initLegLiftPoseEstimation(video, canvas, handleUpdate, handleTimeUpdate);
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
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.1
        }
      ]
    };
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e2e8f0'  // Light color for dark theme
        }
      },
      title: {
        display: true,
        text: 'Your Workout Progress',
        color: '#e2e8f0'  // Light color for dark theme
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#e2e8f0'  // Light color for dark theme
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'  // Subtle grid lines
        }
      },
      x: {
        ticks: {
          color: '#e2e8f0'  // Light color for dark theme
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'  // Subtle grid lines
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
      <div className="flex flex-col items-center mt-8 p-6 bg-gray-900 text-gray-100 min-h-screen">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-teal-400 mb-4">Please Login</h2>
          <p className="text-gray-300">You need to be logged in to use the workout tracker.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6 bg-gray-900 text-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-teal-400 mb-6">Workout Progress Tracker</h1>
      
      {error && (
        <div className="bg-red-800 text-white p-3 rounded-md mb-4 w-full max-w-lg">
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-sm underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {!show && !showResults && (
        <div className="mb-6 w-full max-w-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => startWorkout('lifting')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg font-medium w-full"
            >
              Start Bicep Curls
            </button>
            
            <button
              onClick={() => startWorkout('lunges')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md text-lg font-medium w-full"
            >
              Start Lunges
            </button>
            
            <button
              onClick={() => startWorkout('jumping-jacks')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md text-lg font-medium w-full"
            >
              Start Jumping Jacks
            </button>
            
            <button
              onClick={() => startWorkout('leg-lifts')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-md text-lg font-medium w-full"
            >
              Start Leg Lifts
            </button>
          </div>
          <p className="text-center text-gray-400 mt-2">
            Select the type of workout you want to track
          </p>
        </div>
      )}
      
      {show && (
        <div className="w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <div className="text-xl font-medium">
              <span className="text-yellow-400">Reps: {reps}</span>
              <span className="mx-2">|</span>
              <span className="text-teal-400">Time: {formatTime(workoutTime)}</span>
              <span className="mx-2">|</span>
              <span className="text-purple-400">
                Exercise: {getExerciseDisplayName(exerciseType)}
              </span>
            </div>
            <button
              onClick={stopWorkout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              End Workout
            </button>
          </div>
          
          <div className="relative mb-6 w-full bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-[480px] rounded-lg"
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
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-teal-400 mb-2">Current Status</h3>
            <p className="text-gray-300">{stage}</p>
            {exerciseType === 'lunges' ? (
              <div className="mt-3 text-gray-400">
                <p>Lunges detection active. Bend both knees below 110° and return to standing to count a rep.</p>
              </div>
            ) : exerciseType === 'jumping-jacks' ? (
              <div className="mt-3 text-gray-400">
                <p>Jumping jacks detection active. Move your arms from down position to up position to count a rep.</p>
              </div>
            ) : exerciseType === 'leg-lifts' ? (
              <div className="mt-3 text-gray-400">
                <p>Leg lift detection active. Lift your leg up from the floor and return to count a rep.</p>
              </div>
            ) : (
              <div className="mt-3 text-gray-400">
                <p>Bicep curl detection active. Curl your arms to count reps.</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {showResults && (
        <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-teal-400 mb-4">Workout Complete!</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-400 mb-2">Total Reps</h3>
              <p className="text-3xl font-bold text-white">{finalReps}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-green-400 mb-2">Workout Time</h3>
              <p className="text-3xl font-bold text-white">{formatTime(finalWorkoutTime)}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-purple-400 mb-2">Exercise</h3>
              <p className="text-xl font-bold text-white">
                {getExerciseDisplayName(exerciseType)}
              </p>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={() => setShowResults(false)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md text-lg font-medium w-full"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
      
      {!show && (
        <div className="w-full max-w-4xl mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-medium text-teal-400 mb-4">Progress Chart</h2>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-gray-400">Loading data...</p>
                </div>
              ) : progress && progress.length > 0 ? (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <Line data={prepareChartData()} options={chartOptions} />
                </div>
              ) : (
                <div className="flex justify-center items-center h-64 bg-gray-700 rounded-lg">
                  <p className="text-gray-400">No workout data available yet</p>
                </div>
              )}
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-medium text-teal-400 mb-4">Recommendations</h2>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-gray-400">Loading recommendations...</p>
                </div>
              ) : recommendations && recommendations.length > 0 ? (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <ul className="space-y-3">
                    {recommendations.map((rec, index) => (
                      <li key={index} className="flex">
                        <span className="text-teal-400 mr-2">•</span>
                        <span className="text-gray-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="flex justify-center items-center h-64 bg-gray-700 rounded-lg">
                  <p className="text-gray-400">No recommendations available yet</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-2xl font-medium text-teal-400 mb-4">Workout History</h2>
            {loading ? (
              <div className="flex justify-center items-center h-32 bg-gray-800 rounded-lg">
                <p className="text-gray-400">Loading history...</p>
              </div>
            ) : progress && progress.length > 0 ? (
              <div className="bg-gray-800 p-4 rounded-lg shadow-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Exercises</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Reps</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {progress.map((session) => {
                      const totalReps = session.exercises.reduce((sum, ex) => sum + ex.reps, 0);
                      const date = new Date(session.date).toLocaleDateString();
                      const duration = formatTime(session.duration);
                      // Get exercise types from session
                      const exerciseTypes = [...new Set(session.exercises.map(ex => ex.type))];
                      
                      // Convert exercise types to display names
                      const displayTypes = exerciseTypes.map(type => {
                        return getExerciseDisplayName(type);
                      }).join(', ');
                      
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
              <div className="flex justify-center items-center h-32 bg-gray-800 rounded-lg">
                <p className="text-gray-400">No workout history available yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}