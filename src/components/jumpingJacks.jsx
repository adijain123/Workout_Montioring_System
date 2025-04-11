let counter = 0;
let stage = null;
let cooldown = false;
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

export function initJumpingJacks(videoElement, canvasElement, updateRepsStage, updateTime) {
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

      // Get visibility values
      const leftHipVis = lm[POSE_LANDMARKS.LEFT_HIP].visibility;
      const leftKneeVis = lm[POSE_LANDMARKS.LEFT_KNEE].visibility;
      const rightHipVis = lm[POSE_LANDMARKS.RIGHT_HIP].visibility;
      const rightKneeVis = lm[POSE_LANDMARKS.RIGHT_KNEE].visibility;
      const leftShoulderVis = lm[POSE_LANDMARKS.LEFT_SHOULDER].visibility;
      const leftElbowVis = lm[POSE_LANDMARKS.LEFT_ELBOW].visibility;
      const rightShoulderVis = lm[POSE_LANDMARKS.RIGHT_SHOULDER].visibility;
      const rightElbowVis = lm[POSE_LANDMARKS.RIGHT_ELBOW].visibility;

      let rightElbowRightShoulderRightHip = 0;
      let leftElbowLeftShoulderLeftHip = 0;

      // Check if arms are visible
      if (rightShoulderVis > VISIBILITY_THRESHOLD && 
          rightElbowVis > VISIBILITY_THRESHOLD && 
          rightHipVis > VISIBILITY_THRESHOLD) {
        
        const rightShoulder = getCoord(lm[POSE_LANDMARKS.RIGHT_SHOULDER]);
        const rightElbow = getCoord(lm[POSE_LANDMARKS.RIGHT_ELBOW]);
        const rightHip = getCoord(lm[POSE_LANDMARKS.RIGHT_HIP]);
        
        rightElbowRightShoulderRightHip = calculateAngle(rightElbow, rightShoulder, rightHip);
        
        // Draw angle
        ctx.save();
        ctx.scale(-1, 1);
        ctx.font = '16px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(Math.round(rightElbowRightShoulderRightHip), -rightElbow[0], rightElbow[1]);
        ctx.restore();
      }
      
      if (leftShoulderVis > VISIBILITY_THRESHOLD && 
          leftElbowVis > VISIBILITY_THRESHOLD && 
          leftHipVis > VISIBILITY_THRESHOLD) {
        
        const leftShoulder = getCoord(lm[POSE_LANDMARKS.LEFT_SHOULDER]);
        const leftElbow = getCoord(lm[POSE_LANDMARKS.LEFT_ELBOW]);
        const leftHip = getCoord(lm[POSE_LANDMARKS.LEFT_HIP]);
        
        leftElbowLeftShoulderLeftHip = calculateAngle(leftElbow, leftShoulder, leftHip);
        
        // Draw angle
        ctx.save();
        ctx.scale(-1, 1);
        ctx.font = '16px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(Math.round(leftElbowLeftShoulderLeftHip), -leftElbow[0], leftElbow[1]);
        ctx.restore();
      }
      
      // Also calculate leg angles for additional measurements
      let rightKneeRightHipLeftHip = 0;
      let leftKneeLeftHipRightHip = 0;
      
      if (rightKneeVis > VISIBILITY_THRESHOLD && 
          rightHipVis > VISIBILITY_THRESHOLD && 
          leftHipVis > VISIBILITY_THRESHOLD) {
        
        const rightKnee = getCoord(lm[POSE_LANDMARKS.RIGHT_KNEE]);
        const rightHip = getCoord(lm[POSE_LANDMARKS.RIGHT_HIP]);
        const leftHip = getCoord(lm[POSE_LANDMARKS.LEFT_HIP]);
        
        rightKneeRightHipLeftHip = calculateAngle(rightKnee, rightHip, leftHip);
        
        // Draw angle
        ctx.save();
        ctx.scale(-1, 1);
        ctx.font = '16px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(Math.round(rightKneeRightHipLeftHip), -rightKnee[0], rightKnee[1]);
        ctx.restore();
      }
      
      if (leftKneeVis > VISIBILITY_THRESHOLD && 
          leftHipVis > VISIBILITY_THRESHOLD && 
          rightHipVis > VISIBILITY_THRESHOLD) {
        
        const leftKnee = getCoord(lm[POSE_LANDMARKS.LEFT_KNEE]);
        const leftHip = getCoord(lm[POSE_LANDMARKS.LEFT_HIP]);
        const rightHip = getCoord(lm[POSE_LANDMARKS.RIGHT_HIP]);
        
        leftKneeLeftHipRightHip = calculateAngle(leftKnee, leftHip, rightHip);
        
        // Draw angle
        ctx.save();
        ctx.scale(-1, 1);
        ctx.font = '16px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(Math.round(leftKneeLeftHipRightHip), -leftKnee[0], leftKnee[1]);
        ctx.restore();
      }

      // Jumping jacks counter logic
      if (rightElbowRightShoulderRightHip >= 160 && leftElbowLeftShoulderLeftHip >= 160) {
        if (stage !== "down") {
          stage = "down";
          cooldown = false;
        }
      } else if (rightElbowRightShoulderRightHip <= 20 && leftElbowLeftShoulderLeftHip <= 20 && stage === "down" && !cooldown) {
        stage = "up";
        counter += 1;
        cooldown = true;
        setTimeout(() => { cooldown = false; }, 1000);
      }

      updateRepsStage(counter, stage || '---');
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

    addTextBackground(5, 30, 180, 90);

    drawText(`REPS: ${counter}`, 10, 30, '#FFFF00');
    drawText(`STAGE: ${stage || '---'}`, 10, 60, '#00CCFF');
    drawText(`READY: ${!cooldown ? 'YES' : 'NO'}`, 10, 90, !cooldown ? '#00FFCC' : '#FF3333');
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
    stage = null;
    cooldown = false;
    startTime = null;
    elapsedTime = 0;

    return workoutData;
  };
}