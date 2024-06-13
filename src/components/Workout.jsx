import React, { useState } from 'react';

export default function Workout() {
  const [videoSrc, setVideoSrc] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const startVideo = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/video_feed');
      if (!response.ok) {
        throw new Error('Failed to connect to the backend');
      }
      setVideoSrc('http://localhost:5000/video_feed');
      setError('');
    } catch (err) {
      setError('Failed to connect to the backend');
      setVideoSrc(null);
      setLoading(false);
    }
  };

  const endVideo = async () => {
    setLoading(true); // Show loading indicator while stopping video
    try {
      const response = await fetch('http://localhost:5000/stop_video_feed', {
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
    }
  };

  const handleButtonClick = () => {
    if (videoSrc) {
      endVideo();
    } else {
      startVideo();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-6 text-teal-300" >Real-time Pose Detection</h1>
      <div className="flex items-center justify-center mb-6">
        <h1 className="text-3xl font-bold mr-6">For Lifting</h1>
        <button
          onClick={handleButtonClick}
          className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-300"
        >
          {videoSrc ? 'End Video' : 'Start Video'}
        </button>
      </div>
      {loading && <p className="text-lg text-gray-600">Processing...</p>}
      {error && <p className="text-lg text-red-600">{error}</p>}
      {videoSrc && (
        <div>
          <img
            id="video"
            src={videoSrc}
            alt="Video feed"
            className="rounded-lg shadow-lg"
            onLoad={() => setLoading(false)}
          />
        </div>
      )}
    </div>
  );
}
