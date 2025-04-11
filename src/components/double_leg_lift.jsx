let counter = 0;
let stage = null;
let cooldown = false;
const VISIBILITY_THRESHOLD = 0.5;
let startTime = null;
let elapsedTime = 0;

function distanceY(a, b) {
  return b[1] - a[1]; // vertical distance: positive if knee is below hip
}

export function initLegLift(videoElement, canvasElement, updateRepsStage, updateTime) {
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
    modelComplexity: 0,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
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
      const getCoord = (lm) => [lm.x * canvasElement.width, lm.y * canvasElement.height];

      const leftHip = getCoord(lm[POSE_LANDMARKS.LEFT_HIP]);
      const leftKnee = getCoord(lm[POSE_LANDMARKS.LEFT_KNEE]);
      const rightHip = getCoord(lm[POSE_LANDMARKS.RIGHT_HIP]);
      const rightKnee = getCoord(lm[POSE_LANDMARKS.RIGHT_KNEE]);

      const leftVisible = lm[POSE_LANDMARKS.LEFT_HIP].visibility > VISIBILITY_THRESHOLD &&
                          lm[POSE_LANDMARKS.LEFT_KNEE].visibility > VISIBILITY_THRESHOLD;
      const rightVisible = lm[POSE_LANDMARKS.RIGHT_HIP].visibility > VISIBILITY_THRESHOLD &&
                           lm[POSE_LANDMARKS.RIGHT_KNEE].visibility > VISIBILITY_THRESHOLD;

      let leftLifted = false;
      let rightLifted = false;

      if (leftVisible) {
        const dy = distanceY(leftHip, leftKnee);
        leftLifted = dy < -40; // knee is 40px above hip
      }

      if (rightVisible) {
        const dy = distanceY(rightHip, rightKnee);
        rightLifted = dy < -40;
      }

      const isLifted = leftLifted || rightLifted;

      if (!isLifted) {
        if (stage !== "down") {
          stage = "down";
          cooldown = false;
        }
      } else if (isLifted && stage === "down" && !cooldown) {
        stage = "up";
        counter++;
        cooldown = true;
        setTimeout(() => { cooldown = false; }, 1000);
      }

      updateRepsStage(counter, stage || '---');
    }

    ctx.restore();

    // Overlay info
    const drawText = (text, x, y, color) => {
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      ctx.shadowColor = 'transparent';
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
