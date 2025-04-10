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

export function initJumpingJacks(videoElement, canvasElement, updateRepsStage, updateTime) {
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
        const leftHipVis = lm[poseDetection.POSE_LANDMARKS.LEFT_HIP].visibility;
        const leftKneeVis = lm[poseDetection.POSE_LANDMARKS.LEFT_KNEE].visibility;
        const leftAnkleVis = lm[poseDetection.POSE_LANDMARKS.LEFT_ANKLE].visibility;
        
        const rightHipVis = lm[poseDetection.POSE_LANDMARKS.RIGHT_HIP].visibility;
        const rightKneeVis = lm[poseDetection.POSE_LANDMARKS.RIGHT_KNEE].visibility;
        const rightAnkleVis = lm[poseDetection.POSE_LANDMARKS.RIGHT_ANKLE].visibility;
        
        const leftShoulderVis = lm[poseDetection.POSE_LANDMARKS.LEFT_SHOULDER].visibility;
        const leftElbowVis = lm[poseDetection.POSE_LANDMARKS.LEFT_ELBOW].visibility;
        const rightShoulderVis = lm[poseDetection.POSE_LANDMARKS.RIGHT_SHOULDER].visibility;
        const rightElbowVis = lm[poseDetection.POSE_LANDMARKS.RIGHT_ELBOW].visibility;
        
        // Only process if landmarks are visible enough
        if (leftHipVis > VISIBILITY_THRESHOLD && 
            rightHipVis > VISIBILITY_THRESHOLD &&
            leftShoulderVis > VISIBILITY_THRESHOLD &&
            rightShoulderVis > VISIBILITY_THRESHOLD &&
            leftElbowVis > VISIBILITY_THRESHOLD &&
            rightElbowVis > VISIBILITY_THRESHOLD) {
          
          // Get coordinates for leg landmarks
          const leftHip = getCoord(lm[poseDetection.POSE_LANDMARKS.LEFT_HIP]);
          const leftKnee = getCoord(lm[poseDetection.POSE_LANDMARKS.LEFT_KNEE]);
          const leftAnkle = getCoord(lm[poseDetection.POSE_LANDMARKS.LEFT_ANKLE]);
          
          const rightHip = getCoord(lm[poseDetection.POSE_LANDMARKS.RIGHT_HIP]);
          const rightKnee = getCoord(lm[poseDetection.POSE_LANDMARKS.RIGHT_KNEE]);
          const rightAnkle = getCoord(lm[poseDetection.POSE_LANDMARKS.RIGHT_ANKLE]);
          
          // Get coordinates for upper body landmarks
          const rightShoulder = getCoord(lm[poseDetection.POSE_LANDMARKS.RIGHT_SHOULDER]);
          const rightElbow = getCoord(lm[poseDetection.POSE_LANDMARKS.RIGHT_ELBOW]);
          
          const leftShoulder = getCoord(lm[poseDetection.POSE_LANDMARKS.LEFT_SHOULDER]);
          const leftElbow = getCoord(lm[poseDetection.POSE_LANDMARKS.LEFT_ELBOW]);
          
          // Calculate angles
          const rightKneeRightHipLeftHip = calculateAngle(rightKnee, rightHip, leftHip);
          const leftKneeLeftHipRightHip = calculateAngle(leftKnee, leftHip, rightHip);
          const rightElbowRightShoulderRightHip = calculateAngle(rightElbow, rightShoulder, rightHip);
          const leftElbowLeftShoulderLeftHip = calculateAngle(leftElbow, leftShoulder, leftHip);
          
          // Counter logic for jumping jacks
          if (rightElbowRightShoulderRightHip >= 160 && leftElbowLeftShoulderLeftHip >= 160) {
            if (stage !== "down") {
              stage = "down";
              exerciseCooldown = false; // Reset cooldown when arms are down
            }
          }
          
          if (rightElbowRightShoulderRightHip <= 20 && leftElbowLeftShoulderLeftHip <= 20 && 
              stage === "down" && !exerciseCooldown) {
            stage = "up";
            counter += 1;
            exerciseCooldown = true;
            
            // Set a cooldown timer to prevent rapid counting
            setTimeout(() => {
              exerciseCooldown = false;
            }, 1000); // 1 second cooldown
          }
          
          // Display angles on the screen (for debugging)
          ctx.font = '12px Arial';
          ctx.fillStyle = '#FFFFFF';
          
          const displayAngle = (angle, position, offsetX = 0, offsetY = 0) => {
            ctx.fillText(
              Math.round(angle).toString(), 
              position[0] + offsetX, 
              position[1] + offsetY
            );
          };
          
          displayAngle(rightKneeRightHipLeftHip, rightKnee);
          displayAngle(leftKneeLeftHipRightHip, leftKnee);
          displayAngle(rightElbowRightShoulderRightHip, rightElbow);
          displayAngle(leftElbowLeftShoulderLeftHip, leftElbow);
        }
      } catch (error) {
        console.error("Error processing landmarks:", error);
      }

      // Update the reps and stage
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