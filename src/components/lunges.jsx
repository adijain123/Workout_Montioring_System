import * as poseDetection from '@mediapipe/pose';
import * as cam from '@mediapipe/camera_utils';
import * as drawingUtils from '@mediapipe/drawing_utils';

let counter = 0;
let stage = null;
// Add visibility threshold
const VISIBILITY_THRESHOLD = 0.6;
// Track workout duration
let startTime = null;
let elapsedTime = 0;

function calculateAngle(a, b, c) {
  const radians = Math.atan2(c[1] - b[1], c[0] - b[0]) -
                  Math.atan2(a[1] - b[1], a[0] - b[0]);
  let angle = Math.abs(radians * (180.0 / Math.PI));
  if (angle > 180) angle = 360 - angle;
  return angle;
}

export function initLunges(videoElement, canvasElement, updateRepsStage, updateTime) {
  // Initialize start time
  startTime = new Date();
  
  const pose = new poseDetection.Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
  });

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6,
  });

  // Timer function to update elapsed time
  const updateTimer = () => {
    if (startTime) {
      const now = new Date();
      elapsedTime = Math.floor((now - startTime) / 1000);
      updateTime(elapsedTime);
    }
  };
  
  // Start timer interval
  const timerInterval = setInterval(updateTimer, 1000);

  pose.onResults((results) => {
    const ctx = canvasElement.getContext('2d');
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Mirror canvas
    ctx.save();
    ctx.translate(canvasElement.width, 0);
    ctx.scale(-1, 1);

    // Draw mirrored video
    ctx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    // Draw mirrored landmarks
    if (results.poseLandmarks) {
      drawingUtils.drawConnectors(ctx, results.poseLandmarks, poseDetection.POSE_CONNECTIONS, {
        color: '#00FF00', lineWidth: 3
      });
      drawingUtils.drawLandmarks(ctx, results.poseLandmarks, {
        color: '#FF0000', lineWidth: 2
      });

      const lm = results.poseLandmarks;

      const getCoord = (landmark) => [
        landmark.x * canvasElement.width,
        landmark.y * canvasElement.height,
      ];
      
      // Check if key landmarks are visible
      const lHipVis = lm[poseDetection.POSE_LANDMARKS.LEFT_HIP].visibility;
      const lKneeVis = lm[poseDetection.POSE_LANDMARKS.LEFT_KNEE].visibility;
      const lAnkleVis = lm[poseDetection.POSE_LANDMARKS.LEFT_ANKLE].visibility;
      
      const rHipVis = lm[poseDetection.POSE_LANDMARKS.RIGHT_HIP].visibility;
      const rKneeVis = lm[poseDetection.POSE_LANDMARKS.RIGHT_KNEE].visibility;
      const rAnkleVis = lm[poseDetection.POSE_LANDMARKS.RIGHT_ANKLE].visibility;

      // Only process if landmarks are visible enough
      if (lHipVis > VISIBILITY_THRESHOLD && lKneeVis > VISIBILITY_THRESHOLD && lAnkleVis > VISIBILITY_THRESHOLD &&
          rHipVis > VISIBILITY_THRESHOLD && rKneeVis > VISIBILITY_THRESHOLD && rAnkleVis > VISIBILITY_THRESHOLD) {
        
        // Get coordinates for left leg
        const leftHip = getCoord(lm[poseDetection.POSE_LANDMARKS.LEFT_HIP]);
        const leftKnee = getCoord(lm[poseDetection.POSE_LANDMARKS.LEFT_KNEE]);
        const leftAnkle = getCoord(lm[poseDetection.POSE_LANDMARKS.LEFT_ANKLE]);
        
        // Get coordinates for right leg
        const rightHip = getCoord(lm[poseDetection.POSE_LANDMARKS.RIGHT_HIP]);
        const rightKnee = getCoord(lm[poseDetection.POSE_LANDMARKS.RIGHT_KNEE]);
        const rightAnkle = getCoord(lm[poseDetection.POSE_LANDMARKS.RIGHT_ANKLE]);
        
        // Calculate angles
        const leftAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
        const rightAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
        
        // Display angles on knees (mirrored)
        ctx.font = '16px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(Math.round(leftAngle), leftKnee[0], leftKnee[1]);
        ctx.fillText(Math.round(rightAngle), rightKnee[0], rightKnee[1]);
        
        // Lunge counter logic
        if (leftAngle > 170 && rightAngle > 170) {
          if (stage !== 'down') {
            stage = 'down';
          }
        } else if (leftAngle < 110 && rightAngle < 110 && stage === 'down') {
          stage = 'up';
          counter += 1;
        }
      }

      // Update the counter and stage
      updateRepsStage(counter, stage || '---');
    }

    ctx.restore(); // Stop mirroring

    // Draw readable text with improved visibility (unmirrored)
    const drawText = (text, x, y, color) => {
      // Add text shadow for better contrast against any background
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      
      // Reset shadow for next drawings
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    };

    // Add semi-transparent background behind text for better readability
    const addTextBackground = (x, y, width, height) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(x - 5, y - 25, width, height);
    };

    // Text display area
    addTextBackground(5, 30, 200, 100);
    
    // Display text with better colors
    drawText(`REPS: ${counter}`, 10, 30, '#FFFF00'); // Yellow for reps
    drawText(`STAGE: ${stage || '---'}`, 10, 60, '#00CCFF'); // Blue for stage
  });

  const camera = new cam.Camera(videoElement, {
    onFrame: async () => {
      await pose.send({ image: videoElement });
    },
    width: 640,
    height: 480,
  });

  camera.start();

  return () => {
    // Clean up
    camera.stop();
    clearInterval(timerInterval);
    
    // Return workout data
    const workoutData = {
      reps: counter,
      duration: elapsedTime,
    };
    
    // Reset variables
    counter = 0;
    stage = null;
    startTime = null;
    elapsedTime = 0;
    
    return workoutData;
  };
}