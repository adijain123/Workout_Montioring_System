import React, { useState } from 'react';

export default function Workout() {
  const [videoSrc, setVideoSrc] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lifting, setlifting] = useState(true);
  const [lunges, setlunges] = useState(true);
  const [jacks, setjacks] = useState(true);
  const [leglift, setleglift] = useState(true);

  const startVideo = async (key) => {
    setLoading(true);
    try {
      const response = await fetch(`https://backend-workout-monitoring.onrender.com/video_feed?key=${key}`);
      if (!response.ok) {
        throw new Error('Failed to connect to the backend');
      }
      setVideoSrc(`https://backend-workout-monitoring.onrender.com/video_feed?key=${key}`);
      setError('');
      if(key=='lifting'){ setlunges(false); setjacks(false); setleglift(false) }
      if(key=='lunges'){ setlifting(false); setjacks(false); setleglift(false)}
      if(key=='jumping_jacks'){ setlifting(false); setlunges(false); setleglift(false)}
      if(key=='double_leg_lift'){ setlifting(false); setlunges(false); setjacks(false)}
    } 
    
    catch (err) {
      setError('Failed to connect to the backend');
      setVideoSrc(null);
      setLoading(false);
    }
  };

  const endVideo = async () => {
    setLoading(true); // Show loading indicator while stopping video
    try {
      const response = await fetch('https://backend-workout-monitoring.onrender.com/stop_video_feed', {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error('Failed to stop the video feed');
      }
      setVideoSrc(null);
      setError('');
    } catch (err) {
      setError('Failed to stop the video feed');
    } finally {
      setLoading(false); // Stop loading indicator after trying to stop video
      setlifting(true)
      setlunges(true)
      setjacks(true)
      setleglift(true)
    }
  };

  const handleButtonClick = (key) => {
    if (videoSrc) {
      endVideo();
    } else {
      startVideo(key);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="md:text-6xl text-xl font-bold mb-4 md:mb-6 text-teal-300">Real-time Pose Detection</h1>
      {lifting && 
        <div className="flex items-center justify-center mb-3 md:mb-6">
        <h1 className="md:text-3xl font-bold mr-6">For Lifting</h1>
        <button
          onClick={() => handleButtonClick('lifting')}
          className="md:px-6 md:py-2 px-2 py-1 text-white bg-blue-600 hover:bg-blue-700 md:rounded-lg rounded-md transition-colors duration-300"
        >
          {videoSrc ? 'End Video' : 'Start Video'}
        </button>
      </div>
      }
      {lunges && 
           <div className="flex items-center justify-center mb-3 md:mb-6">
           <h1 className="md:text-3xl font-bold mr-6">For Lunges</h1>
           <button
             onClick={() => handleButtonClick('lunges')}
             className="md:px-6 md:py-2 px-2 py-1 text-white bg-green-600 hover:bg-green-700 md:rounded-lg rounded-md transition-colors duration-300"
           >
             {videoSrc ? 'End Video' : 'Start Video'}
           </button>
         </div>
      }

        {jacks && 
               <div className="flex items-center justify-center mb-3 md:mb-6">
               <h1 className="md:text-3xl font-bold mr-6">For Jumping Jacks</h1>
               <button
                 onClick={() => handleButtonClick('jumping_jacks')}
                 className="md:px-6 md:py-2 px-2 py-1 text-white bg-purple-600 hover:bg-purple-700 md:rounded-lg rounded-md transition-colors duration-300"
               >
                 {videoSrc ? 'End Video' : 'Start Video'}
               </button>
             </div>
          }
           {leglift && 
               <div className="flex items-center justify-center mb-3 md:mb-6">
               <h1 className="md:text-3xl font-bold mr-6">For double leg lift</h1>
               <button
                 onClick={() => handleButtonClick('double_leg_lift')}
                 className="md:px-6 md:py-2 px-2 py-1 text-white bg-red-600 hover:bg-red-700 md:rounded-lg rounded-md transition-colors duration-300"
               >
                 {videoSrc ? 'End Video' : 'Start Video'}
               </button>
             </div>
          }
      
      {loading && <p className="text-2xl text-gray-500">Processing...</p>}
      {error && <p className="text-lg text-red-600">{error}</p>}
      {videoSrc && (
        <div>
          <img
            id="video"
            src={videoSrc}
            alt="Video feed"
            className="md:rounded-lg rounded-md shadow-lg"
            onLoad={() => setLoading(false)}
          />
        </div>
      )}
    </div>
  );
}
