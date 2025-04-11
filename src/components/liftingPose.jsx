import { Pose, POSE_CONNECTIONS, POSE_LANDMARKS } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import * as drawingUtils from '@mediapipe/drawing_utils';

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
  if (angle > 180) angle = 360 - angle;
  return angle;
}

export function initLifting(videoElement, canvasElement, updateRepsStage, updateTime) {
  startTime = new Date();
  
  const pose = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
  });

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6,
  });

  const updateTimer = () => {
    if (startTime) {
      const now = new Date();
      elapsedTime = Math.floor((now - startTime) / 1000);
      updateTime(elapsedTime);
    }
  };

  const timerInterval = setInterval(updateTimer, 1000);

  pose.onResults((results) => {
    const ctx = canvasElement.getContext('2d');
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    ctx.save();
    ctx.translate(canvasElement.width, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.poseLandmarks) {
      drawingUtils.drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
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

      const lShoulderVis = lm[POSE_LANDMARKS.LEFT_SHOULDER].visibility;
      const lElbowVis = lm[POSE_LANDMARKS.LEFT_ELBOW].visibility;
      const lWristVis = lm[POSE_LANDMARKS.LEFT_WRIST].visibility;

      const rShoulderVis = lm[POSE_LANDMARKS.RIGHT_SHOULDER].visibility;
      const rElbowVis = lm[POSE_LANDMARKS.RIGHT_ELBOW].visibility;
      const rWristVis = lm[POSE_LANDMARKS.RIGHT_WRIST].visibility;

      if (lShoulderVis > VISIBILITY_THRESHOLD && lElbowVis > VISIBILITY_THRESHOLD && lWristVis > VISIBILITY_THRESHOLD) {
        const lShoulder = getCoord(lm[POSE_LANDMARKS.LEFT_SHOULDER]);
        const lElbow = getCoord(lm[POSE_LANDMARKS.LEFT_ELBOW]);
        const lWrist = getCoord(lm[POSE_LANDMARKS.LEFT_WRIST]);
        const lAngle = calculateAngle(lShoulder, lElbow, lWrist);

        if (lAngle > 150) {
          if (stageLeft !== 'down') {
            stageLeft = 'down';
            leftArmCooldown = false;
          }
        } else if (lAngle < 40 && stageLeft === 'down' && !leftArmCooldown) {
          stageLeft = 'up';
          counter += 1;
          leftArmCooldown = true;
          setTimeout(() => {
            leftArmCooldown = false;
          }, 1500);
        }
      }

      if (rShoulderVis > VISIBILITY_THRESHOLD && rElbowVis > VISIBILITY_THRESHOLD && rWristVis > VISIBILITY_THRESHOLD) {
        const rShoulder = getCoord(lm[POSE_LANDMARKS.RIGHT_SHOULDER]);
        const rElbow = getCoord(lm[POSE_LANDMARKS.RIGHT_ELBOW]);
        const rWrist = getCoord(lm[POSE_LANDMARKS.RIGHT_WRIST]);
        const rAngle = calculateAngle(rShoulder, rElbow, rWrist);

        if (rAngle > 150) {
          if (stageRight !== 'down') {
            stageRight = 'down';
            rightArmCooldown = false;
          }
        } else if (rAngle < 40 && stageRight === 'down' && !rightArmCooldown) {
          stageRight = 'up';
          counter += 1;
          rightArmCooldown = true;
          setTimeout(() => {
            rightArmCooldown = false;
          }, 1500);
        }
      }

      const stageInfo = `Left: ${stageLeft || '---'} | Right: ${stageRight || '---'}`;
      updateRepsStage(counter, stageInfo);
    }

    ctx.restore();

    const drawText = (text, x, y, color) => {
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    };

    const addTextBackground = (x, y, width, height) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(x - 5, y - 25, width, height);
    };

    addTextBackground(5, 30, 200, 150);
    drawText(`REPS: ${counter}`, 10, 30, '#FFFF00');
    drawText(`LEFT ARM: ${stageLeft || '---'}`, 10, 60, '#00CCFF');
    drawText(`RIGHT ARM: ${stageRight || '---'}`, 10, 90, '#FF66CC');
    drawText(`L READY: ${!leftArmCooldown ? 'YES' : 'NO'}`, 10, 120, 
             !leftArmCooldown ? '#00FFCC' : '#FF3333');
    drawText(`R READY: ${!rightArmCooldown ? 'YES' : 'NO'}`, 10, 150, 
             !rightArmCooldown ? '#00FFCC' : '#FF3333');
  });

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await pose.send({ image: videoElement });
    },
    width: 640,
    height: 480,
  });

  camera.start();

  return () => {
    camera.stop();
    clearInterval(timerInterval);

    const workoutData = {
      reps: counter,
      duration: elapsedTime,
    };

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
