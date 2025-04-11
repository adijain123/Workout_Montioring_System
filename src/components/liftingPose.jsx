// Use these imports - they should work in both localhost and Vercel
import { Pose as MediaPipePose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { Camera as MediaPipeCamera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

let counter = 0;
let stageLeft = null;
let stageRight = null;
let leftArmCooldown = false;
let rightArmCooldown = false;
const VISIBILITY_THRESHOLD = 0.6;
let startTime = null;
let elapsedTime = 0;

function calculateAngle(a, b, c) {
  const radians = Math.atan2(c[1] - b[1], c[0] - b[0]) - 
                  Math.atan2(a[1] - b[1], a[0] - b[0]);
  let angle = Math.abs(radians * (180.0 / Math.PI));
  return angle > 180 ? 360 - angle : angle;
}

export function initLifting(videoElement, canvasElement, updateRepsStage, updateTime) {
  console.log('Initializing pose detection...'); // Debug log
  
  // Initialize pose detection
  const pose = new MediaPipePose({
    locateFile: (file) => {
      console.log('Loading MediaPipe file:', file); // Debug log
      return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    }
  });

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6
  });

  // Timer setup
  startTime = new Date();
  const timerInterval = setInterval(() => {
    elapsedTime = Math.floor((new Date() - startTime) / 1000);
    updateTime(elapsedTime);
  }, 1000);

  pose.onResults((results) => {
    const ctx = canvasElement.getContext('2d');
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Mirror the video and drawings
    ctx.save();
    ctx.translate(canvasElement.width, 0);
    ctx.scale(-1, 1);

    // Draw video frame
    ctx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.poseLandmarks) {
      // Draw pose landmarks and connections
      drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, 
        { color: '#00FF00', lineWidth: 3 });
      drawLandmarks(ctx, results.poseLandmarks, 
        { color: '#FF0000', lineWidth: 2 });

      // Get landmark coordinates
      const getCoord = (landmark) => [
        landmark.x * canvasElement.width,
        landmark.y * canvasElement.height
      ];

      // Process left arm
      if (results.poseLandmarks[11] && results.poseLandmarks[13] && results.poseLandmarks[15]) {
        const lShoulder = getCoord(results.poseLandmarks[11]);
        const lElbow = getCoord(results.poseLandmarks[13]);
        const lWrist = getCoord(results.poseLandmarks[15]);
        const lAngle = calculateAngle(lShoulder, lElbow, lWrist);

        if (lAngle > 150) {
          stageLeft = 'down';
          leftArmCooldown = false;
        } else if (lAngle < 40 && stageLeft === 'down' && !leftArmCooldown) {
          stageLeft = 'up';
          counter++;
          leftArmCooldown = true;
          setTimeout(() => leftArmCooldown = false, 1500);
        }
      }

      // Process right arm
      if (results.poseLandmarks[12] && results.poseLandmarks[14] && results.poseLandmarks[16]) {
        const rShoulder = getCoord(results.poseLandmarks[12]);
        const rElbow = getCoord(results.poseLandmarks[14]);
        const rWrist = getCoord(results.poseLandmarks[16]);
        const rAngle = calculateAngle(rShoulder, rElbow, rWrist);

        if (rAngle > 150) {
          stageRight = 'down';
          rightArmCooldown = false;
        } else if (rAngle < 40 && stageRight === 'down' && !rightArmCooldown) {
          stageRight = 'up';
          counter++;
          rightArmCooldown = true;
          setTimeout(() => rightArmCooldown = false, 1500);
        }
      }

      updateRepsStage(counter, `Left: ${stageLeft || '---'} | Right: ${stageRight || '---'}`);
    }

    ctx.restore(); // Restore canvas state

    // Draw UI elements
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(5, 5, 200, 150);
    ctx.font = '16px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`REPS: ${counter}`, 10, 30);
    ctx.fillText(`LEFT: ${stageLeft || '---'}`, 10, 60);
    ctx.fillText(`RIGHT: ${stageRight || '---'}`, 10, 90);
  });

  // Initialize camera
  const camera = new MediaPipeCamera(videoElement, {
    onFrame: async () => {
      try {
        await pose.send({ image: videoElement });
      } catch (error) {
        console.error('Error processing frame:', error);
      }
    },
    width: 640,
    height: 480
  });

  camera.start();

  // Cleanup function
  return () => {
    camera.stop();
    clearInterval(timerInterval);
    return {
      reps: counter,
      duration: elapsedTime
    };
  };
}