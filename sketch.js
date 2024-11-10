
let img;
let emptyCard;
let otterButtonCard;
let helpCard;
let helpCardCompleted;

let scl = 50; // for scaling elements appropriate to the window. Unit = circle
let darkblue = '#201050';
let cream = '#edd9be';
let red = '#fc4c69';
let green = '#4cfcad';

let card;
let game;

// for tracking the dragging
let pressX, pressY;
let dragX, dragY;

// map location
let mapX=0, mapY=0;
let mapAnchorX, mapAnchorY; // for dragging
let mapW, mapH; // map dimensions

// pointer location as a ratio of the map dimensions
let pointerX;
let pointerY;


// Preload the map image for the game
function preload() {
  img = loadImage('./media/helsinki3.jpg');//loadImage('https://cataas.com/cat?type=small&t=$rnd');

  emptyCard = new Card('hello!');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(155);

  scl = max(windowWidth/10, windowHeight/10);

  game = new Game();

  // start from image center
  centerMap();

}

function draw() {
  background(darkblue);

  drawMap(mapX, mapY);
  game.draw();
  drawCard();
}

function drawMap(dx, dy) {
  let ratio = img.height/img.width;
  mapW = 3*windowWidth;
  mapH = ratio*mapW;
  constrainMapLocation();
  image(img, dx, dy, mapW, mapH);
  // where in map does the center of the screen fall?
  pointerX = (-dx+windowWidth/2)/mapW;
  pointerY = (-dy+windowHeight/2)/mapH;
  //console.log(pointerX, pointerY);
}

function centerMap() {
  let ratio = img.height/img.width;
  let w = 3*windowWidth;
  let h = ratio*w;
  mapX = -w/3;
  mapY = -h/3*ratio;
}

function constrainMapLocation() {
  mapX = min(mapX, windowWidth/2);
  mapY = min(mapY, windowHeight/2);
  mapX = max(mapX, -mapW + windowWidth/2);
  mapY = max(mapY, -mapH + windowHeight/2);
}

function drawCard() {
  if (!card) return;
  card.draw();
}

class Game {
  
  constructor() {
    this.initCards();
    this.finished = false;

    this.targets = [
      new Target(0.4534, 0.6381, 'This is Kaapelitehdas and there is a hackathon just about to start. I wonder what will happen.'),
      new Target(0.1770, 0.1908, 'Otaniemi campus is a prime spot for spotting birds and odd items and traditions.'),
      new Target(0.6055, 0.4363, 'The analogue clocks on the railway station never run properly, giving the impression of late sunset.'),
      new Target(0.9020, 0.1312, 'Helsinki is spotted with little forests where all kinds of creatures are free to mind their own business.'),
      new Target(0.8076, 0.9456, 'Cruise ships pass the impossibly narrow strait in Suomenlinna. Passengers come on deck and wave at peoople.'),
    ];

    this.targets[0].card.addImage(loadImage('./media/hackathon.png'));
    this.targets[1].card.addImage(loadImage('./media/otaniemi.png'));
    this.targets[2].card.addImage(loadImage('./media/train.png'));
    this.targets[3].card.addImage(loadImage('./media/forest.png'));
    this.targets[4].card.addImage(loadImage('./media/ship.png'));

    this.tolerance = .02;
    this.loadingFound = 0; // in degrees
    this.otter = loadImage('./media/otter.png');
    this.question = loadImage('./media/question.png');
  }

  draw() {
    this.drawTargets();
    this.checkTargets();
    this.drawTargetCircles();
    this.drawViewCircle();
    this.drawHelpButton();
    this.drawOtterButton();
  }

  checkTargets() {
    for (let i = 0; i < this.targets.length; i++) {
      if (!this.targets[i].found && this.targets[i].onTarget(this.tolerance)) {
        //console.log('found target', i);
        this.loadingFound +=3;
        if(this.loadingFound >360){
          this.loadingFound = 0;
          this.targets[i].found = true;
          card = this.targets[i].card;
          this.checkIfFinished();
        }
        return;
      }
    }
    this.loadingFound = 0;
  }

  checkIfFinished() {
    for (let i = 0; i < this.targets.length; i++) {
      if (!this.targets[i].found) {
        return;
      }
    }
    this.finished = true;
  }

  drawViewCircle() {
    noFill();
    strokeWeight(scl/15);
    stroke(red);
    circle(width/2, height/2, scl);
    stroke(green);
    arc(width/2, height/2, scl, scl, -HALF_PI, this.loadingFound/360*TWO_PI-HALF_PI);
  }

  drawTargets() {
    for (let i = 0; i < this.targets.length; i++) {
      if (!this.targets[i].found) {continue;}
      stroke(darkblue);
      fill(red);
      //console.log(-mapX+this.targets[i].x*mapW, -mapY+this.targets[i].y*mapH);
      ellipse(+mapX+this.targets[i].x*mapW, +mapY+this.targets[i].y*mapH, scl/8, scl/8);
    }
  }

  drawTargetCircles() { // the row in the bottom edge
    let leftMarigin = (windowWidth-((this.targets.length-1)*scl*1.2))/2;
    for (let i = 0; i < this.targets.length; i++) {
      this.targets[i].drawImage((i)*1.2*scl+leftMarigin, windowHeight-.6*scl)
      stroke(darkblue);
      if (this.targets[i].found) stroke(green);
      noFill();
      circle((i)*1.2*scl+leftMarigin, windowHeight-.6*scl, scl);
    }
  }

  drawOtterButton() {
    fill(cream);
    noStroke();
    circle(.7*scl, .7*scl, scl);
    image(this.otter, .18*scl, .2*scl, scl, scl);
  }

  drawHelpButton() {
    fill(cream);
    noStroke();
    circle(width-.7*scl, .7*scl, scl);
    image(this.question, width-1.2*scl, .2*scl, scl, scl);
  }

  onOtterButton(x, y) {
    return dist(x, y, .7*scl, .7*scl) < .5*scl;
  }

  onHelpButton(x, y) {
    return dist(x, y, width-.7*scl, .7*scl) < .5*scl;
  }

  checkTargetClick(x, y) {
    let leftMarigin = (windowWidth-((this.targets.length-1)*scl*1.2))/2;
    for (let i = 0; i < this.targets.length; i++) {
      let x2 = (i)*1.2*scl+leftMarigin;
      let y2 = windowHeight-.6*scl;
      if (this.targets[i].found && dist(x, y, x2, y2)<scl/2) {
        card = this.targets[i].card;
      }
    }
  }

  initCards() {
    otterButtonCard = new Card("Otter Plotter is a daily challenge of places and stories. If you have a story to tell, please get in touch!");
    otterButtonCard.addImage(loadImage('./media/otter.png'));
    helpCard = new Card("Welcome to Otter Plotter! Move the map by dragging, find the places you see in the bottom of the page, and discover the hidden stories!");
    helpCardCompleted = new Card("Congratulations! You found all the hidden stories. Please come back tomorrow for a brand new challenge! ");
    card = helpCard;
    console.log(helpCard.msg);
  }

}

class Target {
  constructor(x, y, msg) {
    this.x = x;
    this.y = y;
    this.msg = msg;
    this.found = false;
    this.snapImage();

    this.card = new Card(this.msg)
  }

  onTarget(tolerance) {
    return dist(this.x, this.y, pointerX, pointerY) < tolerance
  }

  found() {
    return this.found;
  }

  drawImage(x, y) {
    image(this.img, x-scl*.5, y-scl*.5, scl, scl);
  }

  snapImage(){
    //copy(srcImage, sx, sy, sw, sh, dx, dy, dw, dh)
    this.img = createImage(200, 200);
    let a = img.width/40; // offset to the corner corresponding to the circle
    this.img.copy(img, this.x*img.width-a, this.y*img.height-a ,2*a, 2*a, 0, 0, 200, 200)

    // make transparent outside of circle
    this.img.loadPixels();
    for (let y = 0; y < 200; y++) {
      for (let x = 0; x < 200; x++) {
        if (dist(100, 100, x, y) > 100) {
          let pixelIndex = (200*y+x)*4+3;
          this.img.pixels[pixelIndex] = 0;
        }
      }
    }
    this.img.updatePixels();
  }
}

class Card {

  constructor(msg) {
    this.msg = msg;
  }

  x() {return (windowWidth-this.w())/2;}
  y() {return lerp(0, windowHeight, .1);}
  h() {return lerp(0, windowHeight, .8);}
  w() {return lerp(0, this.h(), .56);}

  addImage(img) {
    this.img = img;
  }

  draw() {
    noStroke();
    fill(0, 100);
    rect(0, 0, windowWidth, windowHeight); // dim other parts
    fill(cream);
    rect(this.x(), this.y(), this.w(), this.h(), 5);
    
    this.drawMessage();
  }

  drawMessage() {
    fill(darkblue);
    textSize(this.h()*.04);
    textAlign(CENTER, CENTER);
    if (this.img) {
      let w = this.w()-.4*scl
      let h = this.img.height/this.img.width * w;
      image(this.img, this.x()+.2*scl, this.y()+.2*scl, w, h);
      text(this.msg, this.x()+.2*scl, this.y()+h+.5*scl, this.w()-.4*scl, this.h()-1.5*scl-h);
    } else if (this.msg) {
      text(this.msg, this.x()+.2*scl, this.y()+scl, this.w()-.4*scl, this.h()-1.5*scl);
    }
  }

  onCard(x, y) {
    return (x>this.x() && x<this.x()+this.w() && y>this.y() && y<this.y()+this.h());
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed(event) {
  //console.log(event);
  specialClick(mouseX, mouseY);
  pressX = mouseX;
  pressY = mouseY;
  mapAnchorX = mapX;
  mapAnchorY = mapY;
}

function mouseDragged(event) {
  dragX = mouseX - pressX;
  dragY = mouseY - pressY;
  mapX = mapAnchorX + dragX;
  mapY = mapAnchorY + dragY;
}

function touchStarted(event) {
  //console.log(event); 
  specialClick(touches[0].x, touches[0].y);
  pressX = touches[0].x;
  pressY = touches[0].y;
  mapAnchorX = mapX;
  mapAnchorY = mapY;
}

function touchMoved(event) {
  event.preventDefault(); // stop the window from dragging around
  dragX = touches[0].x - pressX;
  dragY = touches[0].y - pressY;
  mapX = mapAnchorX + dragX;
  mapY = mapAnchorY + dragY;
}

function specialClick(x, y) {
  // if card is open, click on map closes card
  if (card && !card.onCard(x, y)) {
    card = null;
  }
  
  // clicking help
  if (game.onHelpButton(x, y)){
    if (game.finished) {
      card = helpCardCompleted;
    } else {
      card = helpCard;
    }
    return;
  }
  // clicking otter button
  if (game.onOtterButton(x, y)){
    card = otterButtonCard;
    return;
  }

  game.checkTargetClick(x, y);
}




