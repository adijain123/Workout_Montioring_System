import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from './ApiService';
import { Line } from 'react-chartjs-2';

export default function ProfileDashboard() {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Check authentication
        const authData = await ApiService.auth.checkAuth();
        
        if (authData.authenticated) {
          setUser(authData.user);
          
          // Get user progress data
          const progressData = await ApiService.workout.getUserProgress();
          setProgress(progressData.progress);
          setRecommendations(progressData.recommendations);
        } else {
          // Redirect to login if not authenticated
          navigate('/login');
        }
      } catch (err) {
        setError(err.error || 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await ApiService.auth.logout();
      navigate('/login');
    } catch (err) {
      setError(err.error || 'Failed to logout');
    }
  };

  // Format time display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate total workout stats
  const calculateStats = () => {
    if (!progress || progress.length === 0) {
      return { totalWorkouts: 0, totalReps: 0, totalDuration: 0 };
    }
    
    const totalWorkouts = progress.length;
    let totalReps = 0;
    let totalDuration = 0;
    
    progress.forEach(session => {
      totalDuration += session.duration || 0;
      session.exercises.forEach(exercise => {
        totalReps += exercise.reps || 0;
      });
    });
    
    return { totalWorkouts, totalReps, totalDuration };
  };
  
  // Prepare chart data
  const prepareChartData = () => {
    if (!progress || progress.length === 0) return null;
    
    // Sort sessions by date
    const sortedSessions = [...progress].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const labels = sortedSessions.map(session => {
      const date = new Date(session.date);
      return date.toLocaleDateString();
    });
    
    const repsData = sortedSessions.map(session => {
      return session.exercises.reduce((total, ex) => total + ex.reps, 0);
    });
    
    // Calculate 7-day moving average
    const movingAverage = [];
    for (let i = 0; i < repsData.length; i++) {
      const start = Math.max(0, i - 6);
      const values = repsData.slice(start, i + 1);
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      movingAverage.push(avg);
    }
    
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
        },
        {
          label: '7-Day Average',
          data: movingAverage,
          fill: false,
          backgroundColor: 'rgba(255, 159, 64, 0.6)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderDash: [5, 5],
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
        text: 'Workout Progress Over Time',
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

  // Format exercise type for display
  const formatExerciseType = (type) => {
    if (type === 'lifting') return 'Bicep Curls';
    if (type === 'lunges') return 'Lunges';
    return type;
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="text-teal-400 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="bg-red-800 text-white p-4 rounded-md mb-6">
            <p>{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-sm underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-teal-400">Profile Dashboard</h1>
            {user && (
              <p className="text-gray-400 mt-1">
                Welcome back, {user.firstname} {user.lastname}
              </p>
            )}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/workout')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Start Workout
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium text-gray-400 mb-2">Total Workouts</h3>
            <p className="text-3xl font-bold text-teal-400">{stats.totalWorkouts}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium text-gray-400 mb-2">Total Reps</h3>
            <p className="text-3xl font-bold text-teal-400">{stats.totalReps}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium text-gray-400 mb-2">Total Workout Time</h3>
            <p className="text-3xl font-bold text-teal-400">{formatTime(stats.totalDuration)}</p>
          </div>
        </div>
        
        {/* Progress Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-medium text-teal-400 mb-4">Progress Chart</h2>
            {progress && progress.length > 0 ? (
              <div className="bg-gray-700 p-4 rounded-lg">
                <Line data={prepareChartData()} options={chartOptions} />
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 bg-gray-700 rounded-lg">
                <p className="text-gray-400">No workout data available yet</p>
              </div>
            )}
          </div>
          
          {/* Recommendations */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-medium text-teal-400 mb-4">Recommendations</h2>
            {recommendations && recommendations.length > 0 ? (
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
        
        {/* Recent Workouts */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-medium text-teal-400 mb-4">Recent Workouts</h2>
          {progress && progress.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Exercise Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Exercises</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Reps</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {[...progress]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 5)
                    .map((session) => {
                      const totalReps = session.exercises.reduce((sum, ex) => sum + ex.reps, 0);
                      const date = new Date(session.date).toLocaleDateString();
                      const duration = formatTime(session.duration);
                      
                      // Get exercise types from session
                      const exerciseTypes = [...new Set(session.exercises.map(ex => ex.type))].join(', ');
                      
                      return (
                        <tr key={session.session_id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{duration}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {formatExerciseType(exerciseTypes)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{session.exercises.length}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{totalReps}</td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex justify-center items-center h-32 bg-gray-700 rounded-lg">
              <p className="text-gray-400">No workout history available yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}