

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

  // Fade
  update() { 
    this.t += 0.001 + colorShift * 0.0003; 

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

      arc(width / 2, height, r * 2, r * 2, PI, TWO_PI);
    }
    pop(); //restores 
  }

  startFadeOut() { this.fade = true; }

  isDone() {
    // makes sure that it actually Sends
    return this.fade && this.alpha <= 0.005; 
  }
}
