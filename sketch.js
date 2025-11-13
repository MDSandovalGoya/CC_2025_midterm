// this is my somwhat final version of my midterm for my adjective, fretful. what I changed so far is separate my classes and objects 
// so I can import it and edit it easier. I also added some moving bars so I can actually make this live up the word fretful
// I know you asked for refrences so I'll put some video links that got me to most of this because I had a lot of help from youtube
// I also got help from threads and documentation from the books, and the p5js website
// https://www.youtube.com/watch?v=dJNFPv9Mj-Y
// https://www.youtube.com/watch?v=4aoQcEiDYjk
// https://www.youtube.com/results?search_query=p5js+collision+detection 
// https://www.youtube.com/watch?v=gUTeWOfwECc 
// the rainbow effect was something I semi figured out but it was from the documentation and I feel really proud of it so please take a look(its the same I am just putting emphasis on it).


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

// Flippers
let leftFlipper, rightFlipper;
let topLeftFlipper, topRightFlipper;
let topFlippersActive = false;

// Colors
let ballColors = ["#ff4d4d","#4d94ff","#4dff4d","#ffb84d","#ff4dff","#4dffff"];

function setup() {
  createCanvas(900, 600);
  gravity = createVector(0, 0.3);
  bar = new Bar(width/2, height/2, 360);
  spawnBalls(1);

  // bottom flippers
  let bottomY = height - 70;
  leftFlipper = new Flipper(140, bottomY, 160, "left");
  rightFlipper = new Flipper(width-140, bottomY, 160, "right");
}

function draw() {
  background(18);

  // main bar & flippers
  if (gamePhase !== "rainbow") {
    bar.update(); bar.show();
    handleCollisions();

    leftFlipper.update(balls.length); rightFlipper.update(balls.length);
    leftFlipper.show(); rightFlipper.show();

    if (topFlippersActive || balls.length >= 3) {
      if (!topFlippersActive) activateTopFlippers();
      topLeftFlipper.update(balls.length, true); topRightFlipper.update(balls.length, true);
      topLeftFlipper.show(); topRightFlipper.show();
    }
  }

  // balls
  for (let i = balls.length-1; i >= 0; i--) {
    const b = balls[i];
    b.applyForce(gravity); b.update();

    // bounce walls
    if (b.pos.x - b.r/2 < 0) { b.pos.x = b.r/2; b.vel.x*=-0.9; }
    else if (b.pos.x + b.r/2 > width) { b.pos.x = width - b.r/2; b.vel.x*=-0.9; }

    if (gamePhase !== "rainbow") {
      b.checkBar(bar);
      leftFlipper.checkHit(b); rightFlipper.checkHit(b);
      if (topFlippersActive) { topLeftFlipper.checkHit(b); topRightFlipper.checkHit(b); }
    }

    b.show();

    // remove off-screen balls
    if (b.pos.y - b.r > height+50) {
      lastDropTimes.push(millis());
      waves.push(new Wave(b.color));
      balls.splice(i,1);
    }
  }

  // waves
  if (gamePhase !== "rainbow") {
    for (let i = waves.length-1; i>=0; i--) {
      const w = waves[i]; w.update(); w.show();
      if (w.finished()) waves.splice(i,1);
    }
    if (balls.length===0 && waves.length===0) nextPhase();
  }

  // rainbow mode
  if (gamePhase === "rainbow") {
    if (!rainbowWave) rainbowWave = new RainbowFillWave();
    rainbowWave.update(); rainbowWave.show();

    if (millis() - rainbowStartTime > rainbowDuration) rainbowWave.startFadeOut();
    if (rainbowWave.isDone()) resetGame();
  }
}

// Game Logic

function nextPhase() {
  if (gamePhase===1) { gamePhase=2; spawnBalls(2); }
  else if (gamePhase===2) { gamePhase=3; spawnBalls(3); }
  else if (gamePhase===3) {
    if (lastDropTimes.length>=3) {
      const last3 = lastDropTimes.slice(-3);
      if (last3[2]-last3[0]<1000) { startRainbowMode(); return; }
    }
    spawnBalls(3);
  }
}

function spawnBalls(n) {
  balls = [];
  for (let i=0; i<n; i++) {
    const x = bar.x + random(-bar.len/2.5, bar.len/2.5);
    const y = bar.y - 100;
    const col = color(ballColors[i%ballColors.length]);
    balls.push(new Ball(x,y,col));
  }
}

function activateTopFlippers() {
  topFlippersActive = true;
  let topY = height - 180;
  topLeftFlipper = new Flipper(200, topY, 140, "left");
  topRightFlipper = new Flipper(width-200, topY, 140, "right");
}

function startRainbowMode() {
  gamePhase = "rainbow";
  balls=[]; waves=[]; rainbowWave = new RainbowFillWave();
  rainbowStartTime = millis();
}

function resetGame() {
  gamePhase = 1; topFlippersActive=false; balls=[]; waves=[]; rainbowWave=null; lastDropTimes=[];
  colorShift=0; bar = new Bar(width/2,height/2,360);
  spawnBalls(1);

  let bottomY = height-70;
  leftFlipper = new Flipper(140,bottomY,160,"left");
  rightFlipper = new Flipper(width-140,bottomY,160,"right");
}

// Mouse Control

function mousePressed() { dragging=true; }
function mouseReleased() { dragging=false; }

function mouseDragged() {
  if (gamePhase !== "rainbow" && dragging) {
    bar.angle += (pmouseY - mouseY)*0.004;
    bar.angle = constrain(bar.angle, -PI/4, PI/4);
  }
  if (gamePhase === "rainbow") colorShift += (mouseY - pmouseY)*0.005;
}

// Ball–Ball Collisions

function handleCollisions() {
  for (let i=0; i<balls.length; i++) {
    for (let j=i+1; j<balls.length; j++) {
      const b1=balls[i], b2=balls[j];
      const distBetween = p5.Vector.dist(b1.pos,b2.pos);
      const minDist = (b1.r+b2.r)/2;

      if (distBetween<minDist) {
        const overlap = (minDist-distBetween)/2;
        const dir = p5.Vector.sub(b1.pos,b2.pos).normalize();
        b1.pos.add(dir.copy().mult(overlap));
        b2.pos.sub(dir.copy().mult(overlap));

        const relVel = p5.Vector.sub(b1.vel,b2.vel);
        const velAlongNormal = relVel.dot(dir);
        if (velAlongNormal>0) continue;

        const restitution = 0.8;
        const impulse = -(1+restitution)*velAlongNormal/2;
        const impulseVec = dir.copy().mult(impulse);

        b1.vel.add(impulseVec);
        b2.vel.sub(impulseVec);
      }
    }
  }
}
