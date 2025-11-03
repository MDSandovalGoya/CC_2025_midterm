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

  if (gamePhase !== "rainbow") {
    bar.update();
    bar.show();
  }

  if (gamePhase !== "rainbow") handleCollisions();

  // update balls
  for (let i = balls.length - 1; i >= 0; i--) {
    let b = balls[i];
    b.applyForce(gravity);
    b.update();
    if (gamePhase !== "rainbow") b.checkBar(bar);
    b.show();

    if (b.pos.y - b.r > height + 50) {
      lastDropTimes.push(millis());
      waves.push(new Wave(b.color));
      balls.splice(i, 1);
    }
  }

  // overlapping waves
  if (gamePhase !== "rainbow") {
    for (let i = waves.length - 1; i >= 0; i--) {
      let w = waves[i];
      w.update();
      w.show();
      if (w.finished()) waves.splice(i, 1);
    }

    if (balls.length === 0 && waves.length === 0) nextPhase();
  }

  // rainbow phase
  if (gamePhase === "rainbow") {
    if (!rainbowWave) rainbowWave = new RainbowFillWave();

    rainbowWave.update();
    rainbowWave.show();

    if (millis() - rainbowStartTime > rainbowDuration) {
      rainbowWave.startFadeOut();
    }

    if (rainbowWave.isDone()) {
      resetGame();
    }
  }
}

// Game Logic

function nextPhase() {
  if (gamePhase === 1) {
    gamePhase = 2;
    spawnBalls(2);
  } else if (gamePhase === 2) {
    gamePhase = 3;
    spawnBalls(3);
  } else if (gamePhase === 3) {
    if (lastDropTimes.length >= 3) {
      let last3 = lastDropTimes.slice(-3);
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
    let x = bar.x + random(-bar.len / 2.5, bar.len / 2.5);
    let y = bar.y - 100;
    let col = color(ballColors[i % ballColors.length]);
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

// Mouse Control

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

// Handle Ball Collisions

function handleCollisions() {
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      let b1 = balls[i];
      let b2 = balls[j];
      let distBetween = p5.Vector.dist(b1.pos, b2.pos);
      let minDist = (b1.r + b2.r) / 2;

      if (distBetween < minDist) {
        let overlap = (minDist - distBetween) / 2;
        let dir = p5.Vector.sub(b1.pos, b2.pos).normalize();
        b1.pos.add(dir.copy().mult(overlap));
        b2.pos.sub(dir.copy().mult(overlap));

        let relVel = p5.Vector.sub(b1.vel, b2.vel);
        let velAlongNormal = relVel.dot(dir);
        if (velAlongNormal > 0) continue;

        let restitution = 0.8;
        let impulse = -(1 + restitution) * velAlongNormal / 2;
        let impulseVec = dir.copy().mult(impulse);

        b1.vel.add(impulseVec);
        b2.vel.sub(impulseVec);
      }
    }
  }
}

// Ball Class

class Ball {
  constructor(x, y, col) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-1, 1), random(-1, 0));
    this.acc = createVector(0, 0);
    this.r = random(18, 32);
    this.color = col;
  }

  applyForce(force) { this.acc.add(force); }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.vel.mult(0.995);
  }

  checkBar(bar) {
    let dx = this.pos.x - bar.x;
    if (abs(dx) <= bar.len / 2) {
      let yAtX = bar.y + sin(bar.angle) * dx;
      if (this.pos.y + this.r / 2 > yAtX) {
        this.pos.y = yAtX - this.r / 2;
        this.vel.y *= -0.6;
        this.vel.x += sin(bar.angle) * 3;
      }
    }
  }

  show() {
    noStroke();
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, this.r);
    fill(255, 255, 255, 30);
    ellipse(this.pos.x - this.r * 0.18, this.pos.y - this.r * 0.18, this.r * 0.35);
  }
}

// Bar Class

class Bar {
  constructor(x, y, len) {
    this.x = x;
    this.y = y;
    this.len = len;
    this.angle = 0;
  }

  update() { this.angle *= 0.995; }

  show() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    stroke(255);
    strokeWeight(6);
    line(-this.len / 2, 0, this.len / 2, 0);
    noStroke();
    fill(255, 70, 70);
    ellipse(0, 0, 24);
    pop();
  }
}


// Wave Class 

class Wave {
  constructor(col) {
    this.col = col;
    this.radius = 0;
    this.growth = 8;
    this.alpha = 255;
  }

  update() {
    this.radius += this.growth;
    this.alpha -= 3;
  }

  show() {
    noFill();
    // RGB colors 
    stroke(red(this.col), green(this.col), blue(this.col), this.alpha);
    strokeWeight(3);
    // Draws the bottom arc
    arc(width / 2, height, this.radius * 2, this.radius * 2, PI, TWO_PI);
  }

  finished() { return this.alpha <= 0; }
}

// Rainbow Fill Wave class
class RainbowFillWave {
  constructor() {
    this.t = 0;            
    this.fade = false;     
    this.fadeProgress = 0; 
    this.alpha = 1.0; 
    this.maxRadius = sqrt(sq(width / 2) + sq(height)); 
    this.waveSpeed = 0.05; 
    this.arcCount = 120;   
  }

  update() {
    // 1. Slower motion: 
    this.t += 0.001 + colorShift * 0.0003; 

    // ease-out fade
    if (this.fade) {
      this.fadeProgress = min(this.fadeProgress + 0.012, 1);
      this.alpha = 1.0 * (1 - pow(this.fadeProgress, 2.3));
    }
  }

  show() {
    push();
    // hsb mode to make sure the color fill actually works for the final wave 
    colorMode(HSB, 360, 100, 100, 1);
    noFill();
    strokeWeight(1.5);

    // for loop for the fill
    for (let i = 0; i < this.arcCount; i++) {
      let inter = i / this.arcCount;

      // Calculate radius: 
      let radiusOffset = (this.t * this.waveSpeed) % 2; 
      let r = this.maxRadius * (inter + radiusOffset - 1); 

      // Calculate hue:
      let hue = (r / this.maxRadius) * 360 + (this.t * 3);
      hue = (hue + colorShift * 50) % 360; 
      if (hue < 0) hue += 360;

      // Calculate opacity:
      let opacity = 1.0;
      let posFromCenter = abs(inter - 0.5) * 2; 
      opacity = pow(1 - posFromCenter, 2.5); 

      let c = color(hue, 80, 90, opacity * this.alpha);
      stroke(c);

      // arc 
      arc(width / 2, height, r * 2, r * 2, PI, TWO_PI);
    }
    pop(); //restores 
  }

  startFadeOut() {
    this.fade = true;
  }

  isDone() {
    // makes sure that it ends
    return this.fade && this.alpha <= 0.005; 
  }
}