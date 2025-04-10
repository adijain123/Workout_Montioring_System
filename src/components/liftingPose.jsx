import * as poseDetection from '@mediapipe/pose';
import * as cam from '@mediapipe/camera_utils';
import * as drawingUtils from '@mediapipe/drawing_utils';

let counter = 0;
let stageLeft = null;
let stageRight = null;
// Add cooldown timers to prevent rapid counting
let leftArmCooldown = false;
let rightArmCooldown = false;
// Add confidence thresholds
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

export function initLifting(videoElement, canvasElement, updateRepsStage, updateTime) {
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
      const lShoulderVis = lm[poseDetection.POSE_LANDMARKS.LEFT_SHOULDER].visibility;
      const lElbowVis = lm[poseDetection.POSE_LANDMARKS.LEFT_ELBOW].visibility;
      const lWristVis = lm[poseDetection.POSE_LANDMARKS.LEFT_WRIST].visibility;
      
      const rShoulderVis = lm[poseDetection.POSE_LANDMARKS.RIGHT_SHOULDER].visibility;
      const rElbowVis = lm[poseDetection.POSE_LANDMARKS.RIGHT_ELBOW].visibility;
      const rWristVis = lm[poseDetection.POSE_LANDMARKS.RIGHT_WRIST].visibility;

      // LEFT HAND - only process if landmarks are visible enough
      if (lShoulderVis > VISIBILITY_THRESHOLD && lElbowVis > VISIBILITY_THRESHOLD && lWristVis > VISIBILITY_THRESHOLD) {
        const lShoulder = getCoord(lm[poseDetection.POSE_LANDMARKS.LEFT_SHOULDER]);
        const lElbow = getCoord(lm[poseDetection.POSE_LANDMARKS.LEFT_ELBOW]);
        const lWrist = getCoord(lm[poseDetection.POSE_LANDMARKS.LEFT_WRIST]);
        const lAngle = calculateAngle(lShoulder, lElbow, lWrist);

        // Tracking left arm with more robust thresholds
        if (lAngle > 150) {
          if (stageLeft !== 'down') {
            stageLeft = 'down';
            leftArmCooldown = false; // Reset cooldown when arm is down
          }
        } else if (lAngle < 40 && stageLeft === 'down' && !leftArmCooldown) {
          stageLeft = 'up';
          counter += 1;
          leftArmCooldown = true;
          
          // Set a cooldown timer to prevent rapid counting
          setTimeout(() => {
            leftArmCooldown = false;
          }, 1500); // 1.5 second cooldown
        }
      }

      // RIGHT HAND - only process if landmarks are visible enough
      if (rShoulderVis > VISIBILITY_THRESHOLD && rElbowVis > VISIBILITY_THRESHOLD && rWristVis > VISIBILITY_THRESHOLD) {
        const rShoulder = getCoord(lm[poseDetection.POSE_LANDMARKS.RIGHT_SHOULDER]);
        const rElbow = getCoord(lm[poseDetection.POSE_LANDMARKS.RIGHT_ELBOW]);
        const rWrist = getCoord(lm[poseDetection.POSE_LANDMARKS.RIGHT_WRIST]);
        const rAngle = calculateAngle(rShoulder, rElbow, rWrist);

        // Tracking right arm with more robust thresholds
        if (rAngle > 150) {
          if (stageRight !== 'down') {
            stageRight = 'down';
            rightArmCooldown = false; // Reset cooldown when arm is down
          }
        } else if (rAngle < 40 && stageRight === 'down' && !rightArmCooldown) {
          stageRight = 'up';
          counter += 1;
          rightArmCooldown = true;
          
          // Set a cooldown timer to prevent rapid counting
          setTimeout(() => {
            rightArmCooldown = false;
          }, 1500); // 1.5 second cooldown
        }
      }

      // Display stages individually
      const stageInfo = `Left: ${stageLeft || '---'} | Right: ${stageRight || '---'}`;
      updateRepsStage(counter, stageInfo);
    }

    ctx.restore(); // Stop mirroring

    // Draw readable text with improved visibility (unmirrored) - DARK THEME
    const drawText = (text, x, y, color) => {
      // Add text shadow for better contrast against any background
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      ctx.font = 'bold 24px Arial'; // Increased font size
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
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; // Darker background for better visibility
      ctx.fillRect(x - 5, y - 25, width, height);
    };

    // Text display area
    addTextBackground(5, 30, 200, 150);
    
    // Display text with better colors
    drawText(`REPS: ${counter}`, 10, 30, '#FFFF00'); // Yellow for reps
    drawText(`LEFT ARM: ${stageLeft || '---'}`, 10, 60, '#00CCFF'); // Bright blue for left arm
    drawText(`RIGHT ARM: ${stageRight || '---'}`, 10, 90, '#FF66CC'); // Pink for right arm
    
    // Show cooldown status with improved colors
    drawText(`L READY: ${!leftArmCooldown ? 'YES' : 'NO'}`, 10, 120, 
             !leftArmCooldown ? '#00FFCC' : '#FF3333'); // Teal when ready, red when not
    drawText(`R READY: ${!rightArmCooldown ? 'YES' : 'NO'}`, 10, 150, 
             !rightArmCooldown ? '#00FFCC' : '#FF3333'); // Teal when ready, red when not
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
    stageLeft = null;
    stageRight = null;
    leftArmCooldown = false;
    rightArmCooldown = false;
    startTime = null;
    elapsedTime = 0;
    
    return workoutData;
  };
}