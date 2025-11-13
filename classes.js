
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
    this.vel.mult(0.985); 
  }

  checkBar(bar) {
    let dx = this.pos.x - bar.x;
    if (abs(dx) > bar.len / 2) return;

    let yAtX = bar.y + sin(bar.angle) * dx;
    let bottom = this.pos.y + this.r / 2;
    let distance = bottom - yAtX;

    if (this.vel.y > 0 && distance > -5 && distance < 12) {
      this.pos.y = yAtX - this.r / 2;
      this.vel.y *= -0.4;
      this.vel.x += sin(bar.angle) * 0.8 + random(-0.2, 0.2);
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
    stroke(red(this.col), green(this.col), blue(this.col), this.alpha);
    strokeWeight(3);
    arc(width / 2, height, this.radius * 2, this.radius * 2, PI, TWO_PI);
  }

  finished() { return this.alpha <= 0; }
}

// Rainbow Fill Wave Class

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
    this.t += 0.001 + colorShift * 0.0003;
    if (this.fade) {
      this.fadeProgress = min(this.fadeProgress + 0.012, 1);
      this.alpha = 1.0 * (1 - pow(this.fadeProgress, 2.3));
    }
  }

  show() {
    push();
    colorMode(HSB, 360, 100, 100, 1);
    noFill();
    strokeWeight(1.5);
    for (let i = 0; i < this.arcCount; i++) {
      let inter = i / this.arcCount;
      let radiusOffset = (this.t * this.waveSpeed) % 2;
      let r = this.maxRadius * (inter + radiusOffset - 1);
      let hue = (r / this.maxRadius) * 360 + (this.t * 3);
      hue = (hue + colorShift * 50) % 360;
      if (hue < 0) hue += 360;
      let posFromCenter = abs(inter - 0.5) * 2;
      let opacity = pow(1 - posFromCenter, 2.5);
      let c = color(hue, 80, 90, opacity * this.alpha);
      stroke(c);
      arc(width / 2, height, r * 2, r * 2, PI, TWO_PI);
    }
    pop();
  }

  startFadeOut() { this.fade = true; }
  isDone() { return this.fade && this.alpha <= 0.005; }
}

// Flipper Class

class Flipper {
  constructor(x, y, len, side) {
    this.x = x;
    this.y = y;
    this.len = len;
    this.side = side; 
    this.angle = side === "left" ? -PI / 6 : PI / 6;
    this.restAngle = this.angle;
    this.range = PI / 5;
  }

  update(ballCount, counter = false) {
    let speed = ballCount >= 3 ? 0.12 : 0.06;
    let flap = sin(frameCount * speed) * this.range;
    if (counter) flap *= -1;
    this.angle = this.restAngle + flap;
  }

  checkHit(ball) {
    let halfLen = this.len / 2;
    let x1 = this.x - cos(this.angle) * halfLen;
    let y1 = this.y - sin(this.angle) * halfLen;
    let x2 = this.x + cos(this.angle) * halfLen;
    let y2 = this.y + sin(this.angle) * halfLen;

    let t = constrain(
      ((ball.pos.x - x1) * (x2 - x1) + (ball.pos.y - y1) * (y2 - y1)) /
        ((x2 - x1) ** 2 + (y2 - y1) ** 2),
      0,
      1
    );
    let closestX = x1 + t * (x2 - x1);
    let closestY = y1 + t * (y2 - y1);
    let d = dist(ball.pos.x, ball.pos.y, closestX, closestY);

    if (d < ball.r / 2 + 6 && ball.pos.y > this.y - 40) {
      let normal = createVector(ball.pos.x - this.x, ball.pos.y - this.y).normalize();
      let bounceForce = p5.Vector.mult(normal, 4);
      bounceForce.y = -abs(bounceForce.y) * 1.2;
      ball.vel.add(bounceForce);
      ball.pos.y -= 5;
    }
  }

  show() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    stroke(255);
    strokeWeight(10);
    line(-this.len / 2, 0, this.len / 2, 0);
    pop();
  }
}
