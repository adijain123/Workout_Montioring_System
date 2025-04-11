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
        // Check authentication using ApiService
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
          return;
        }
      } catch (err) {
        setError(err.error || 'Failed to load user data, try login/signup');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);

  // Handle logout using ApiService
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
          backgroundColor: 'rgba(56, 189, 248, 0.6)', // Sky blue for better contrast
          borderColor: 'rgba(56, 189, 248, 1)',
          tension: 0.1
        },
        {
          label: '7-Day Average',
          data: movingAverage,
          fill: false,
          backgroundColor: 'rgba(168, 85, 247, 0.6)', // Purple accent
          borderColor: 'rgba(168, 85, 247, 1)',
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
          color: '#cbd5e1' // Slate color for text
        }
      },
      title: {
        display: true,
        text: 'Workout Progress Over Time',
        color: '#cbd5e1',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#cbd5e1'
        },
        grid: {
          color: 'rgba(71, 85, 105, 0.2)' // Subtle slate grid lines
        }
      },
      x: {
        ticks: {
          color: '#cbd5e1'
        },
        grid: {
          color: 'rgba(71, 85, 105, 0.2)'
        }
      }
    }
  };

  // Format exercise type for display
  const formatExerciseType = (type) => {
    if (type === 'lifting') return 'Bicep Curls';
    if (type === 'lunges') return 'Lunges';
    return type.charAt(0).toUpperCase() + type.slice(1); // Capitalize first letter
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-950">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-sky-500 animate-pulse"></div>
          <div className="w-4 h-4 rounded-full bg-sky-500 animate-pulse delay-75"></div>
          <div className="w-4 h-4 rounded-full bg-sky-500 animate-pulse delay-150"></div>
          <span className="text-sky-400 text-lg ml-2">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6">
      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="bg-red-900/80 text-white p-4 rounded-lg mb-6 shadow-lg border-l-4 border-red-500 animate-fadeIn">
            <div className="flex justify-between items-center">
              <p>{error}</p>
              <button 
                onClick={() => setError(null)}
                className="text-sm bg-red-800 hover:bg-red-700 px-2 py-1 rounded transition-colors duration-200"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-purple-500 bg-clip-text text-transparent">
              Profile Dashboard
            </h1>
            {user && (
              <p className="text-slate-400 mt-1">
                Welcome back, {user.firstname} {user.lastname}
              </p>
            )}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/workout')}
              className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white px-5 py-2 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Start Workout
            </button>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/70 backdrop-blur p-6 rounded-lg shadow-lg border border-slate-800 transform transition-transform hover:scale-105">
            <h3 className="text-lg font-medium text-slate-400 mb-2">Total Workouts</h3>
            <p className="text-3xl font-bold text-sky-400">{stats.totalWorkouts}</p>
          </div>
          <div className="bg-slate-900/70 backdrop-blur p-6 rounded-lg shadow-lg border border-slate-800 transform transition-transform hover:scale-105">
            <h3 className="text-lg font-medium text-slate-400 mb-2">Total Reps</h3>
            <p className="text-3xl font-bold text-sky-400">{stats.totalReps}</p>
          </div>
          <div className="bg-slate-900/70 backdrop-blur p-6 rounded-lg shadow-lg border border-slate-800 transform transition-transform hover:scale-105">
            <h3 className="text-lg font-medium text-slate-400 mb-2">Total Workout Time</h3>
            <p className="text-3xl font-bold text-sky-400">{formatTime(stats.totalDuration)}</p>
          </div>
        </div>
        
        {/* Progress Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-slate-900/70 backdrop-blur p-6 rounded-lg shadow-lg border border-slate-800">
            <h2 className="text-2xl font-medium text-sky-400 mb-4">Progress Chart</h2>
            {progress && progress.length > 0 ? (
              <div className="bg-slate-800/80 p-4 rounded-lg">
                <Line data={prepareChartData()} options={chartOptions} />
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 bg-slate-800/80 rounded-lg border border-slate-700">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-slate-400">No workout data available yet</p>
                  <button 
                    onClick={() => navigate('/workout')} 
                    className="mt-3 text-sm text-sky-400 hover:text-sky-300 underline"
                  >
                    Start your first workout
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Recommendations */}
          <div className="bg-slate-900/70 backdrop-blur p-6 rounded-lg shadow-lg border border-slate-800">
            <h2 className="text-2xl font-medium text-sky-400 mb-4">Recommendations</h2>
            {recommendations && recommendations.length > 0 ? (
              <div className="bg-slate-800/80 p-4 rounded-lg">
                <ul className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-purple-400 mr-2 mt-1">•</span>
                      <span className="text-slate-300">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 bg-slate-800/80 rounded-lg border border-slate-700">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p className="text-slate-400">No recommendations available yet</p>
                  <p className="text-sm text-slate-500 mt-1">Complete more workouts to get personalized tips</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Recent Workouts */}
        <div className="bg-slate-900/70 backdrop-blur p-6 rounded-lg shadow-lg border border-slate-800">
          <h2 className="text-2xl font-medium text-sky-400 mb-4">Recent Workouts</h2>
          {progress && progress.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700/50">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Exercise Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Exercises</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Total Reps</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {[...progress]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 5)
                    .map((session, idx) => {
                      const totalReps = session.exercises.reduce((sum, ex) => sum + ex.reps, 0);
                      const date = new Date(session.date).toLocaleDateString();
                      const duration = formatTime(session.duration);
                      
                      // Get exercise types from session
                      const exerciseTypes = [...new Set(session.exercises.map(ex => ex.type))].join(', ');
                      
                      return (
                        <tr 
                          key={session.session_id || idx} 
                          className="hover:bg-slate-800/50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{duration}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            {formatExerciseType(exerciseTypes)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-sky-400 font-medium">{session.exercises.length}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-400 font-medium">{totalReps}</td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
              {progress.length > 5 && (
                <div className="mt-4 text-right">
                  
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center items-center h-32 bg-slate-800/80 rounded-lg border border-slate-700">
              <div className="text-center">
                <p className="text-slate-400">No workout history available yet</p>
                <button 
                  onClick={() => navigate('/workout')} 
                  className="mt-2 text-sm text-sky-400 hover:text-sky-300 underline"
                >
                  Start your first workout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}