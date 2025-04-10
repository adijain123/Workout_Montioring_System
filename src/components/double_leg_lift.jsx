import * as poseDetection from '@mediapipe/pose';
import * as cam from '@mediapipe/camera_utils';
import * as drawingUtils from '@mediapipe/drawing_utils';

let counter = 0;
let stage = null;
// Add cooldown timer to prevent rapid counting
let exerciseCooldown = false;
// Add confidence threshold
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

export function initLegLiftPoseEstimation(videoElement, canvasElement, updateRepsStage, updateTime) {
  // Initialize start time
  startTime = new Date();
  
  const pose = new poseDetection.Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
  });

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
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
      
      try {
        // Check if key landmarks are visible
        const rShoulderVis = lm[poseDetection.POSE_LANDMARKS.RIGHT_SHOULDER].visibility;
        const rHipVis = lm[poseDetection.POSE_LANDMARKS.RIGHT_HIP].visibility;
        const rKneeVis = lm[poseDetection.POSE_LANDMARKS.RIGHT_KNEE].visibility;
        const rAnkleVis = lm[poseDetection.POSE_LANDMARKS.RIGHT_ANKLE].visibility;

        // Only process if landmarks are visible enough
        if (rShoulderVis > VISIBILITY_THRESHOLD && rHipVis > VISIBILITY_THRESHOLD && 
            rKneeVis > VISIBILITY_THRESHOLD && rAnkleVis > VISIBILITY_THRESHOLD) {
          
          const rShoulder = getCoord(lm[poseDetection.POSE_LANDMARKS.RIGHT_SHOULDER]);
          const rHip = getCoord(lm[poseDetection.POSE_LANDMARKS.RIGHT_HIP]);
          const rKnee = getCoord(lm[poseDetection.POSE_LANDMARKS.RIGHT_KNEE]);
          const rAnkle = getCoord(lm[poseDetection.POSE_LANDMARKS.RIGHT_ANKLE]);

          // Calculate angles
          const angleShoulderHipKnee = calculateAngle(rShoulder, rHip, rKnee);
          const angleHipKneeAnkle = calculateAngle(rHip, rKnee, rAnkle);

          // Display angles on screen (optional)
          const displayAngles = (angle, position, label) => {
            ctx.font = '14px Arial';
            ctx.fillStyle = 'white';
            ctx.fillText(`${Math.round(angle)}°`, position[0], position[1]);
          };

          displayAngles(angleShoulderHipKnee, rKnee, 'Hip-Knee');
          displayAngles(angleHipKneeAnkle, rAnkle, 'Knee-Ankle');

          // Leg lift counter logic with same thresholds as Python version
          if (angleShoulderHipKnee > 170 && angleHipKneeAnkle >= 160) {
            if (stage !== 'down') {
              stage = 'down';
              exerciseCooldown = false; // Reset cooldown when leg is down
            }
          } else if (angleShoulderHipKnee < 100 && stage === 'down' && 
                    angleHipKneeAnkle >= 160 && !exerciseCooldown) {
            stage = 'up';
            counter += 1;
            exerciseCooldown = true;
            
            // Set a cooldown timer to prevent rapid counting
            setTimeout(() => {
              exerciseCooldown = false;
            }, 1500); // 1.5 second cooldown
          }
        }
      } catch (error) {
        console.error(error);
      }

      // Update UI with rep count and stage info
      updateRepsStage(counter, stage || '---');
    }

    ctx.restore(); // Stop mirroring

    // Draw readable text with improved visibility (unmirrored) - DARK THEME
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
    drawText(`STAGE: ${stage || '---'}`, 10, 60, '#00CCFF'); // Bright blue for stage
    drawText(`READY: ${!exerciseCooldown ? 'YES' : 'NO'}`, 10, 90, 
             !exerciseCooldown ? '#00FFCC' : '#FF3333'); // Teal when ready, red when not
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
    exerciseCooldown = false;
    startTime = null;
    elapsedTime = 0;
    
    return workoutData;
  };
}