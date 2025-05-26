let video;
let facemesh;
let handpose;
let predictions = [];
let handPredictions = [];
let circlePosIndex = 94; // 預設鼻子
let logoImg;

function preload() {
  logoImg = loadImage('https://upload.wikimedia.org/wikipedia/commons/4/47/PNGTRANSPARENT-com-logo.png');
}

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on('predict', results => {
    predictions = results;
  });

  handpose = ml5.handpose(video, handModelReady);
  handpose.on('predict', results => {
    handPredictions = results;
  });
}

function modelReady() {
  // FaceMesh模型載入完成
}

function handModelReady() {
  // Handpose模型載入完成
}

function draw() {
  image(video, 0, 0, width, height);

  // 根據手勢決定圓圈位置
  if (handPredictions.length > 0) {
    const hand = handPredictions[0];
    const fingersUp = countFingersUp(hand);

    // 石頭：0根手指（拳頭）→ 額頭
    // 剪刀：2根手指（食指中指）→ 左右眼
    // 布：5根手指（全張開）→ 左右臉頰
    if (fingersUp === 0) {
      circlePosIndex = 10; // 額頭（大約在第10點）
    } else if (fingersUp === 2) {
      circlePosIndex = 'eyes'; // 左右眼
    } else if (fingersUp === 5) {
      circlePosIndex = 'cheeks'; // 左右臉頰
    } else {
      circlePosIndex = 94; // 預設鼻子
    }
  }

  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;

    stroke(255, 0, 0);
    strokeWeight(4);
    noFill();

    if (circlePosIndex === 'eyes') {
      // 左右眼（33, 263）
      const [x1, y1] = keypoints[33];
      const [x2, y2] = keypoints[263];
      imageMode(CENTER);
      image(logoImg, x1, y1, 50, 50);
      image(logoImg, x2, y2, 50, 50);
    } else if (circlePosIndex === 'cheeks') {
      // 左右臉頰（234, 454）
      const [x1, y1] = keypoints[234];
      const [x2, y2] = keypoints[454];
      imageMode(CENTER);
      image(logoImg, x1, y1, 50, 50);
      image(logoImg, x2, y2, 50, 50);
    } else {
      // 額頭或鼻子
      const [x, y] = keypoints[circlePosIndex];
      imageMode(CENTER);
      image(logoImg, x, y, 50, 50);
    }
  }
}

// 簡單判斷手指數量（只看指尖是否高於手掌）
function countFingersUp(hand) {
  // 指尖在 landmarks 的 index: [8, 12, 16, 20, 4]（食指到小指+大拇指）
  const tips = [8, 12, 16, 20, 4];
  let count = 0;
  const palmY = hand.landmarks[0][1]; // 手腕y座標
  for (let i = 0; i < 5; i++) {
    if (hand.landmarks[tips[i]][1] < palmY - 20) { // 指尖高於手腕
      count++;
    }
  }
  return count;
}
