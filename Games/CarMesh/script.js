// Get canvas and UI elements
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const distanceEl = document.getElementById("distance");
const stageEl = document.getElementById("stage");
const pauseBtn = document.getElementById("pauseBtn");

// Mobile controls
const upBtn = document.getElementById("upBtn");
const downBtn = document.getElementById("downBtn");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const stopBtn = document.getElementById("stopBtn");

// Game global variables
let gameWidth = 800;
let gameHeight = 600;
let lastTime = 0;
let obstacleTimer = 0;
let gameOver = false;
let paused = false;
let traveledDistance = 0; // in meters
let score = 0;
let stage = 1;

// Responsive canvas: resize to container keeping aspect ratio
function resizeCanvas() {
  const container = document.querySelector('.game-container');
  const containerWidth = container.clientWidth;
  // Use a different height ratio for small screens to cap canvas height
  if (containerWidth < 480) {
    gameHeight = Math.max(containerWidth * 0.55, window.innerHeight * 0.5);
  } else {
    gameHeight = containerWidth * 0.45;
  }
  gameWidth = containerWidth;
  canvas.width = gameWidth;
  canvas.height = gameHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Define the car
const car = {
  x: gameWidth / 2 - 50,
  y: gameHeight - 120,
  width: 100,
  height: 100,
  speed: 5,
  dx: 0,
  dy: 0,
};

// Load car image
const carImage = new Image();
carImage.src = "./Images/carPng.png";

// Preload obstacle images (for variety, obstacles may still use these images)
const obstacleSources = [
  "./Images/A1.png",  // obstacle resembling a car
  "./Images/A2.png",  // obstacle resembling an animal
  "./Images/A3.png",
  "./Images/A4.png",  // obstacle resembling a car
  "./Images/A5.png",  // obstacle resembling an animal
  "./Images/A6.png"    // obstacle resembling a human
];
const obstacleImages = [];
obstacleSources.forEach(src => {
  const img = new Image();
  img.src = src;
  obstacleImages.push(img);
});

// Environment will now be drawn using shapes and colors only.

// Obstacles array
let obstacles = [];
const obstacleInterval = 2000; // spawn obstacle every 2 seconds

// Update controls (keyboard for desktop)
document.addEventListener("keydown", (e) => {
  if (gameOver && e.key === "Enter") {
    restartGame();
    return;
  }
  if (e.key === "ArrowLeft") car.dx = -car.speed;
  if (e.key === "ArrowRight") car.dx = car.speed;
  if (e.key === "ArrowUp") car.dy = -car.speed;
  if (e.key === "ArrowDown") car.dy = car.speed;
});
document.addEventListener("keyup", (e) => {
  if (["ArrowLeft", "ArrowRight"].includes(e.key)) car.dx = 0;
  if (["ArrowUp", "ArrowDown"].includes(e.key)) car.dy = 0;
});

// Mobile button events – use both touch and mouse events for reliability
function addMobileControl(btn, axis, value) {
  btn.addEventListener("mousedown", () => { car[axis] = value; });
  btn.addEventListener("touchstart", () => { car[axis] = value; });
  btn.addEventListener("mouseup", () => { car[axis] = 0; });
  btn.addEventListener("touchend", () => { car[axis] = 0; });
}
addMobileControl(upBtn, "dy", -car.speed);
addMobileControl(downBtn, "dy", car.speed);
addMobileControl(leftBtn, "dx", -car.speed);
addMobileControl(rightBtn, "dx", car.speed);

stopBtn.addEventListener("mousedown", () => { car.dx = 0; car.dy = 0; });
stopBtn.addEventListener("touchstart", () => { car.dx = 0; car.dy = 0; });

// Pause/Resume button
pauseBtn.addEventListener("click", () => {
  paused = !paused;
  pauseBtn.textContent = paused ? "Resume" : "Pause";
  if (!paused) {
    lastTime = performance.now();
    requestAnimationFrame(update);
  }
});

// (Optional) Remove swipe controls from canvas to avoid conflicts on small screens
canvas.removeEventListener("touchstart", () => {});
canvas.removeEventListener("touchmove", () => {});
canvas.removeEventListener("touchend", () => {});

// Environment drawing using figures and colors
function drawEnvironment() {
  const roadWidth = gameWidth * 0.5;
  const roadX = (gameWidth - roadWidth) / 2;
  
  // Left side: draw grass using a green color
  ctx.fillStyle = "#2a9d8f"; // grassy green
  ctx.fillRect(0, 0, roadX, gameHeight);
  
  // Right side: same grassy green
  ctx.fillRect(roadX + roadWidth, 0, roadX, gameHeight);
  
  // Draw road as a darker gray
  ctx.fillStyle = "#555";
  ctx.fillRect(roadX, 0, roadWidth, gameHeight);
  
  // Draw lane markings in center
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.setLineDash([20, 15]);
  ctx.beginPath();
  ctx.moveTo(gameWidth / 2, roadY);
  ctx.lineTo(gameWidth / 2, gameHeight);
  ctx.stroke();
  ctx.setLineDash([]);
  
  // Draw decorative elements (buildings, trees, street lamps)
  drawDecorations(roadX, roadWidth, gameHeight);
}

// Draw decorations using simple shapes and colors
function drawDecorations(roadX, roadWidth, height) {
  // Buildings on the left side - represented as simple rectangles
  ctx.fillStyle = "#8a8a8a"; // gray for buildings
  ctx.fillRect(roadX * 0.1, height - 100, 50, 100); // left building
  ctx.fillRect(roadX - 60, height * 0.6, 50, 80);     // another left building
  
  // Trees on the right side - drawn as a brown trunk and green circle
  // Tree 1
  ctx.fillStyle = "#8B4513"; // brown trunk
  ctx.fillRect(roadX + roadWidth + 10 + 10, height * 0.4 + 40, 10, 40);
  ctx.fillStyle = "#228B22"; // green leaves
  ctx.beginPath();
  ctx.arc(roadX + roadWidth + 10 + 15, height * 0.4 + 30, 20, 0, Math.PI * 2);
  ctx.fill();
  // Tree 2
  ctx.fillStyle = "#8B4513";
  ctx.fillRect(roadX + roadWidth + 30 + 10, height * 0.8 + 40, 10, 40);
  ctx.fillStyle = "#228B22";
  ctx.beginPath();
  ctx.arc(roadX + roadWidth + 30 + 15, height * 0.8 + 30, 20, 0, Math.PI * 2);
  ctx.fill();
  
  // Street lamps along the road edge - drawn as a thin dark pole with a yellow circle on top
  ctx.fillStyle = "#333"; // dark pole
  ctx.fillRect(roadX - 10, height * 0.2, 5, 40);
  ctx.fillStyle = "#FFD700"; // yellow light
  ctx.beginPath();
  ctx.arc(roadX - 7, height * 0.2, 8, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = "#333"; 
  ctx.fillRect(roadX + roadWidth + 5, height * 0.2, 5, 40);
  ctx.fillStyle = "#FFD700";
  ctx.beginPath();
  ctx.arc(roadX + roadWidth + 7, height * 0.2, 8, 0, Math.PI * 2);
  ctx.fill();
}

// Road scroll variable for lane marking movement
let roadY = 0;

// Create obstacles
function createObstacle() {
  const obstacleWidth = 60;
  const obstacleHeight = 100;
  const roadWidth = gameWidth * 0.5;
  const roadX = (gameWidth - roadWidth) / 2;
  // Random x position within the road
  const x = Math.random() * (roadWidth - obstacleWidth) + roadX;
  const y = -obstacleHeight;
  const speed = 3 + Math.random() * 3;
  // Even though we preload obstacle images, you can choose whether to use them.
  // Here, we'll return obstacles with an image property only if needed.
  const randomIndex = Math.floor(Math.random() * obstacleImages.length);
  const image = obstacleImages[randomIndex];
  return { x, y, width: obstacleWidth, height: obstacleHeight, speed, image };
}

// Update obstacles: move them and check for collisions
function updateObstacles(deltaTime) {
  obstacleTimer += deltaTime;
  if (obstacleTimer > obstacleInterval) {
    obstacles.push(createObstacle());
    obstacleTimer = 0;
  }
  obstacles.forEach(obstacle => {
    obstacle.y += obstacle.speed;
  });
  obstacles = obstacles.filter(obstacle => obstacle.y <= gameHeight);
  obstacles.forEach(obstacle => {
    if (centerCollision(car, obstacle)) {
      gameOver = true;
    }
  });
}

// Collision detection (center point method)
function centerCollision(rect1, rect2) {
  const centerX = rect2.x + rect2.width / 2;
  const centerY = rect2.y + rect2.height / 2;
  return centerX > rect1.x && centerX < rect1.x + rect1.width &&
         centerY > rect1.y && centerY < rect1.y + rect1.height;
}

// Draw obstacles – if the image isn’t loaded, fallback to a red rectangle
function drawObstacles() {
  obstacles.forEach(obstacle => {
    if (obstacle.image && obstacle.image.complete) {
      ctx.drawImage(obstacle.image, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    } else {
      ctx.fillStyle = "#ff4d4d";
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
  });
}

// Update car position, ensuring it stays on road
function updateCar() {
  car.x += car.dx;
  car.y += car.dy;
  const roadWidth = gameWidth * 0.5;
  const roadX = (gameWidth - roadWidth) / 2;
  if (car.x < roadX) car.x = roadX;
  if (car.x + car.width > roadX + roadWidth) car.x = roadX + roadWidth - car.width;
  if (car.y < 0) car.y = 0;
  if (car.y + car.height > gameHeight) car.y = gameHeight - car.height;
}

// Draw the car
function drawCar() {
  if (carImage.complete) {
    ctx.drawImage(carImage, car.x, car.y, car.width, car.height);
  } else {
    ctx.fillStyle = "#f00";
    ctx.fillRect(car.x, car.y, car.width, car.height);
  }
}

// Draw game over screen overlay
function drawGameOver() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, gameWidth, gameHeight);
  ctx.fillStyle = "#fff";
  ctx.font = "48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", gameWidth / 2, gameHeight / 2);
  ctx.font = "24px Arial";
  ctx.fillText("Press Enter or Resume to Restart", gameWidth / 2, gameHeight / 2 + 40);
}

// Main game loop with delta time adjustments
function update(timestamp) {
  if (paused) return;
  if (!lastTime) lastTime = timestamp;
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  
  // Update traveled distance (adjust factor as needed)
  traveledDistance += (deltaTime / 1000) * 10;
  score = Math.floor(traveledDistance);
  stage = Math.floor(traveledDistance / 500) + 1;
  
  // Update UI
  scoreEl.textContent = "Score: " + score;
  distanceEl.textContent = "Distance: " + score + " m";
  stageEl.textContent = "Stage: " + stage;
  
  // Clear canvas
  ctx.clearRect(0, 0, gameWidth, gameHeight);
  
  // Update road lane markings scroll
  roadY += 5 * (deltaTime / 16);
  if (roadY >= 40) roadY = 0;
  
  // Draw environment and decorations
  drawEnvironment();
  
  // Update car and obstacles
  updateCar();
  updateObstacles(deltaTime);
  
  // Draw obstacles and car
  drawObstacles();
  drawCar();
  
  // Continue game loop or display game over screen
  if (!gameOver) {
    requestAnimationFrame(update);
  } else {
    drawGameOver();
  }
}

// Restart game function to reset all variables
function restartGame() {
  gameOver = false;
  obstacles = [];
  car.x = gameWidth / 2 - 50;
  car.y = gameHeight - 120;
  traveledDistance = 0;
  score = 0;
  stage = 1;
  lastTime = 0;
  obstacleTimer = 0;
  paused = false;
  pauseBtn.textContent = "Pause";
  requestAnimationFrame(update);
}

// Start the game once the car image is loaded (or immediately if cached)
carImage.onload = () => {
  requestAnimationFrame(update);
};
if (carImage.complete) {
  requestAnimationFrame(update);
}
