let counter = 0;
let stageLeft = null;
let stageRight = null;
let leftLegCooldown = false;
let rightLegCooldown = false;
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

export function initLunges(videoElement, canvasElement, updateRepsStage, updateTime) {
  startTime = new Date();

  const Pose = window.Pose;
  const POSE_CONNECTIONS = window.POSE_CONNECTIONS;
  const POSE_LANDMARKS = window.POSE_LANDMARKS;
  const drawingUtils = window;
  const cam = window;

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

      const leftHipVis = lm[POSE_LANDMARKS.LEFT_HIP].visibility;
      const leftKneeVis = lm[POSE_LANDMARKS.LEFT_KNEE].visibility;
      const leftAnkleVis = lm[POSE_LANDMARKS.LEFT_ANKLE].visibility;

      const rightHipVis = lm[POSE_LANDMARKS.RIGHT_HIP].visibility;
      const rightKneeVis = lm[POSE_LANDMARKS.RIGHT_KNEE].visibility;
      const rightAnkleVis = lm[POSE_LANDMARKS.RIGHT_ANKLE].visibility;

      // Check left leg
      if (leftHipVis > VISIBILITY_THRESHOLD && leftKneeVis > VISIBILITY_THRESHOLD && leftAnkleVis > VISIBILITY_THRESHOLD) {
        const leftHip = getCoord(lm[POSE_LANDMARKS.LEFT_HIP]);
        const leftKnee = getCoord(lm[POSE_LANDMARKS.LEFT_KNEE]);
        const leftAnkle = getCoord(lm[POSE_LANDMARKS.LEFT_ANKLE]);
        const leftAngle = calculateAngle(leftHip, leftKnee, leftAnkle);

        // Draw angle
        ctx.save();
        ctx.scale(-1, 1);
        ctx.font = '16px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(Math.round(leftAngle), -leftKnee[0], leftKnee[1]);
        ctx.restore();

        if (leftAngle > 170) {
          if (stageLeft !== 'down') {
            stageLeft = 'down';
            leftLegCooldown = false;
          }
        } else if (leftAngle < 110 && stageLeft === 'down' && !leftLegCooldown) {
          stageLeft = 'up';
          counter += 1;
          leftLegCooldown = true;
          setTimeout(() => { leftLegCooldown = false; }, 1500);
        }
      }

      // Check right leg
      if (rightHipVis > VISIBILITY_THRESHOLD && rightKneeVis > VISIBILITY_THRESHOLD && rightAnkleVis > VISIBILITY_THRESHOLD) {
        const rightHip = getCoord(lm[POSE_LANDMARKS.RIGHT_HIP]);
        const rightKnee = getCoord(lm[POSE_LANDMARKS.RIGHT_KNEE]);
        const rightAnkle = getCoord(lm[POSE_LANDMARKS.RIGHT_ANKLE]);
        const rightAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

        // Draw angle
        ctx.save();
        ctx.scale(-1, 1);
        ctx.font = '16px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(Math.round(rightAngle), -rightKnee[0], rightKnee[1]);
        ctx.restore();

        if (rightAngle > 170) {
          if (stageRight !== 'down') {
            stageRight = 'down';
            rightLegCooldown = false;
          }
        } else if (rightAngle < 110 && stageRight === 'down' && !rightLegCooldown) {
          stageRight = 'up';
          counter += 1;
          rightLegCooldown = true;
          setTimeout(() => { rightLegCooldown = false; }, 1500);
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

    addTextBackground(5, 30, 210, 150);

    drawText(`REPS: ${counter}`, 10, 30, '#FFFF00');
    drawText(`LEFT LEG: ${stageLeft || '---'}`, 10, 60, '#00CCFF');
    drawText(`RIGHT LEG: ${stageRight || '---'}`, 10, 90, '#FF66CC');
    drawText(`L READY: ${!leftLegCooldown ? 'YES' : 'NO'}`, 10, 120, !leftLegCooldown ? '#00FFCC' : '#FF3333');
    drawText(`R READY: ${!rightLegCooldown ? 'YES' : 'NO'}`, 10, 150, !rightLegCooldown ? '#00FFCC' : '#FF3333');
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
    camera.stop();
    clearInterval(timerInterval);

    const workoutData = {
      reps: counter,
      duration: elapsedTime,
    };

    counter = 0;
    stageLeft = null;
    stageRight = null;
    leftLegCooldown = false;
    rightLegCooldown = false;
    startTime = null;
    elapsedTime = 0;

    return workoutData;
  };
}