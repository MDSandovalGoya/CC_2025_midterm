//This is my midterm for the adjective fretful. I made this off the idea that you might be stressed doing an action or doing work, but if you finish, you will be satisfied
//The game essentially represents this because by dropping the balls off the plank as fast as possible, you will see a rainbow. Fretfulness often feels that way
// some updates that I will do: separate this into a class file and a game file, figure out how I can do this even more fretful and make the code itself less complicated

let balls = [];
let waves = [];
let rainbowWave = null;
let bar;
let gravity;
let gamePhase = 1;
let lastDropTimes = [];
let rainbowStartTime = 0;
let rainbowDuration = 12000;
let colorShift = 0;
let dragging = false;

// distinct colors
let ballColors = [
  "#ff4d4d", "#4d94ff", "#4dff4d",
  "#ffb84d", "#ff4dff", "#4dffff"
];

function setup() {
  createCanvas(900, 600);
  gravity = createVector(0, 0.3);
  bar = new Bar(width / 2, height / 2, 360);
  spawnBalls(1);
}

function draw() {
  background(18);

  // Draw bar if not in rainbow phase
  if (gamePhase !== "rainbow") {
    bar.update();
    bar.show();
    handleCollisions();
  }

  // Update and draw balls
  for (let i = balls.length - 1; i >= 0; i--) {
    const b = balls[i];
    b.applyForce(gravity);
    b.update();
    if (gamePhase !== "rainbow") b.checkBar(bar);
    b.show();

    // Remove ball if it falls below screen
    if (b.pos.y - b.r > height + 50) {
      lastDropTimes.push(millis());
      waves.push(new Wave(b.color));
      balls.splice(i, 1);
    }
  }

  // Handle waves
  if (gamePhase !== "rainbow") {
    for (let i = waves.length - 1; i >= 0; i--) {
      const w = waves[i];
      w.update();
      w.show();
      if (w.finished()) waves.splice(i, 1);
    }

    if (balls.length === 0 && waves.length === 0) nextPhase();
  }

  // Rainbow phase
  if (gamePhase === "rainbow") {
    if (!rainbowWave) rainbowWave = new RainbowFillWave();

    rainbowWave.update();
    rainbowWave.show();

    if (millis() - rainbowStartTime > rainbowDuration) {
      rainbowWave.startFadeOut();
    }

    if (rainbowWave.isDone()) resetGame();
  }
}

// ============================
// Game Logic
// ============================

function nextPhase() {
  if (gamePhase === 1) {
    gamePhase = 2;
    spawnBalls(2);
  } else if (gamePhase === 2) {
    gamePhase = 3;
    spawnBalls(3);
  } else if (gamePhase === 3) {
    if (lastDropTimes.length >= 3) {
      const last3 = lastDropTimes.slice(-3);
      if (last3[2] - last3[0] < 1000) {
        startRainbowMode();
        return;
      }
    }
    spawnBalls(3);
  }
}

function spawnBalls(n) {
  balls = [];
  for (let i = 0; i < n; i++) {
    const x = bar.x + random(-bar.len / 2.5, bar.len / 2.5);
    const y = bar.y - 100;
    const col = color(ballColors[i % ballColors.length]);
    balls.push(new Ball(x, y, col));
  }
}

function startRainbowMode() {
  gamePhase = "rainbow";
  balls = [];
  waves = [];
  rainbowWave = new RainbowFillWave();
  rainbowStartTime = millis();
}

function resetGame() {
  gamePhase = 1;
  balls = [];
  waves = [];
  rainbowWave = null;
  lastDropTimes = [];
  colorShift = 0;
  bar = new Bar(width / 2, height / 2, 360);
  spawnBalls(1);
}

// ============================
// Mouse Control
// ============================

function mousePressed() { dragging = true; }
function mouseReleased() { dragging = false; }

function mouseDragged() {
  if (gamePhase !== "rainbow" && dragging) {
    bar.angle += (pmouseY - mouseY) * 0.004;
    bar.angle = constrain(bar.angle, -PI / 4, PI / 4);
  }
  if (gamePhase === "rainbow") {
    // Made colorShift effect more subtle in the new animation
    colorShift += (mouseY - pmouseY) * 0.005;
  }
}

// ============================
// Handle Ball Collisions
// ============================

function handleCollisions() {
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const b1 = balls[i];
      const b2 = balls[j];
      const distBetween = p5.Vector.dist(b1.pos, b2.pos);
      const minDist = (b1.r + b2.r) / 2;

      if (distBetween < minDist) {
        const overlap = (minDist - distBetween) / 2;
        const dir = p5.Vector.sub(b1.pos, b2.pos).normalize();
        b1.pos.add(dir.copy().mult(overlap));
        b2.pos.sub(dir.copy().mult(overlap));

        const relVel = p5.Vector.sub(b1.vel, b2.vel);
        const velAlongNormal = relVel.dot(dir);
        if (velAlongNormal > 0) continue;

        const restitution = 0.8;
        const impulse = -(1 + restitution) * velAlongNormal / 2;
        const impulseVec = dir.copy().mult(impulse);

        b1.vel.add(impulseVec);
        b2.vel.sub(impulseVec);
      }
    }
  }
}
