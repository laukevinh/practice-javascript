function Shape(x, y, velX, velY, exists) {
  this.x = x;
  this.y = y;
  this.velX = velX;
  this.velY = velY;
  this.exists = exists;
  this.canvas = null;
  this.ctx = null;
}

Shape.prototype.setCanvas = function (canvas) {
  this.canvas = canvas;
}

Shape.prototype.setCtx = function (ctx) {
  this.ctx = ctx;
}

function Ball(x, y, velX, velY, color, size, exists) {
  Shape.call(this, x, y, velX, velY, exists);

  this.color = color;
  this.size = size;
}

Ball.prototype = Object.create(Shape.prototype);
Object.defineProperty(Ball, 'constructor', {
  value: Ball,
  enumerable: false,
  writable: true
});

Ball.prototype.draw = function () {
  this.ctx.beginPath();
  this.ctx.fillStyle = this.color;
  this.ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
  this.ctx.fill();
  this.ctx.closePath();
}

Ball.prototype.update = function () {
  this.x += this.velX;
  this.y += this.velY;
}

Ball.prototype.collisionDetect = function (game) {
  let paddle = game.paddle;
  let bricks = game.bricks;
  let canvas = game.canvas;
  // check collision with left or right wall
  if (this.x - this.size <= 0 || canvas.width <= this.x + this.size) {
    this.velX = -this.velX;
  }
  // check collision with top wall
  if (this.y - this.size <= 0) {
    this.velY = -this.velY;
  }
  // check collision with paddle. Check direction of ball. This
  // prevents ball from bouncing multiple times if it stays in
  // paddle hit box i.e. area
  if (0 < this.velY
    && paddle.y <= this.y + this.size && this.y + this.size <= paddle.y + paddle.height
    && paddle.x <= this.x && this.x <= paddle.x + paddle.width) {
    this.velY = -this.velY;
  }
  // check collision with bricks.
  for (let c = 0; c < bricks.length; c++) {
    let row = bricks[c];
    for (let r = 0; r < row.length; r++) {
      let b = bricks[c][r];
      if (b.exists) {
        if (b.x <= this.x && this.x <= b.x + b.width
          && b.y <= this.y && this.y <= b.y + b.height) {
          b.exists = false;
          this.velY = -this.velY
          game.score++;
        }
      }
    }
  }
}

function Paddle(x, y, velX, velY, color, width, height, exists) {
  Shape.call(this, x, y, velX, velY, exists);

  this.color = color;
  this.height = height;
  this.width = width;
  this.rightPressed = false;
  this.leftPressed = false;
}

Paddle.prototype = Object.create(Shape.prototype);
Object.defineProperty(Paddle, 'constructor', {
  value: Paddle,
  enumerable: false,
  writable: true
});

Paddle.prototype.draw = function () {
  this.ctx.beginPath();
  this.ctx.rect(this.x, this.y, this.width, this.height);
  this.ctx.fillStyle = this.color;
  this.ctx.fill();
  this.ctx.closePath();
}

Paddle.prototype.update = function (canvas) {
  if (this.rightPressed && this.x + this.width <= canvas.width) {
    this.x += this.velX;
  } else if (this.leftPressed && 0 <= this.x) {
    this.x -= this.velX;
  }
}

Paddle.prototype.setControls = function (canvas) {
  let _this = this;

  function keyDownHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
      _this.rightPressed = true;
    }
    else if (e.key == "Left" || e.key == "ArrowLeft") {
      _this.leftPressed = true;
    }
  }

  function keyUpHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
      _this.rightPressed = false;
    }
    else if (e.key == "Left" || e.key == "ArrowLeft") {
      _this.leftPressed = false;
    }
  }

  function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
      _this.x = relativeX - _this.width / 2;
    }
  }

  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);
  document.addEventListener("mousemove", mouseMoveHandler, false);
}

function Brick(x, y, color, width, height, exists) {
  Shape.call(this, x, y, 0, 0, exists);

  this.color = color;
  this.width = width;
  this.height = height;
}

Brick.prototype = Object.create(Brick.prototype);
Object.defineProperty(Brick, 'constructor', {
  value: Brick,
  enumerable: false,
  writable: true
});

Brick.prototype.draw = function () {
  this.ctx.beginPath();
  this.ctx.rect(this.x, this.y, this.width, this.height);
  this.ctx.fillStyle = this.color;
  this.ctx.fill();
  this.ctx.closePath();
}

function Game(canvasElementID) {
  this.canvas = document.getElementById(canvasElementID);
  this.ctx = this.canvas.getContext('2d');

  this.settings = {
    canvasElementID: canvasElementID,
    score: 0,
    lives: 3,
    brickColor: 'blue',
    brickWidth: 75,
    brickHeight: 20,
    brickRowCount: 5,
    brickColumnCount: 3,
    brickPadding: 10,
    brickOffsetTop: 30,
    brickOffsetLeft: 30,
    paddleColor: 'blue',
    paddleWidth: 25,
    paddleHeight: 10,
    paddleVelX: 5,
    paddleStartX: this.canvas.width / 2,
    paddleStartY: this.canvas.height - 30,
    ballStartX: this.canvas.width / 2,
    ballStartY: this.canvas.height - 50,
    ballVelX: 2,
    ballVelY: -2,
    ballColor: "#0095DD",
    ballSize: 10,
  }

  this.lives = null;
  this.score = null;
  this.paddle = null;
  this.ball = null;
  this.bricks = null;
  this.intervalID = null;
}

Game.prototype.initialize = function () {
  this.lives = this.settings.lives;
  this.score = this.settings.score;

  this.paddle = new Paddle(
    this.settings.paddleStartX,
    this.settings.paddleStartY,
    this.settings.paddleVelX,
    0,
    this.settings.paddleColor,
    this.settings.paddleWidth,
    this.settings.paddleHeight,
    true
  );
  this.paddle.setControls(this.canvas);
  this.paddle.setCanvas(this.canvas);
  this.paddle.setCtx(this.ctx);

  this.ball = new Ball(
    this.settings.ballStartX,
    this.settings.ballStartY,
    this.settings.ballVelX,
    this.settings.ballVelY,
    this.settings.ballColor,
    this.settings.ballSize,
    true
  );
  this.ball.setCanvas(this.canvas);
  this.ball.setCtx(this.ctx);

  this.bricks = Game.prototype.initializeBricks(
    this.settings.brickColor,
    this.settings.brickWidth,
    this.settings.brickHeight,
    this.settings.brickRowCount,
    this.settings.brickColumnCount,
    this.settings.brickPadding,
    this.settings.brickOffsetTop,
    this.settings.brickOffsetLeft,
    this.canvas,
    this.ctx
  );
}

Game.prototype.initializeBricks = function (
  brickColor,
  brickWidth,
  brickHeight,
  brickRowCount,
  brickColumnCount,
  brickPadding,
  brickOffsetTop,
  brickOffsetLeft,
  canvas,
  ctx,
) {
  let bricks = Array(brickColumnCount);

  for (let col = 0; col < brickColumnCount; col++) {
    bricks[col] = Array(brickRowCount);
    for (let row = 0; row < brickRowCount; row++) {
      let x = brickOffsetLeft + (row * (brickWidth + brickPadding));
      let y = brickOffsetTop + (col * (brickHeight + brickPadding));
      let brick = new Brick(x, y, brickColor, brickWidth, brickHeight, true);
      // using the set functions seems to refer to global this.
      // brick.setCanvas(canvas);
      // brick.setCtx(ctx);
      // so set it directly for now
      brick.canvas = canvas;
      brick.ctx = ctx;
      bricks[col][row] = brick;
    }
  }
  return bricks;
}

Game.prototype.drawBricks = function () {
  let bricks = this.bricks;

  for (let c = 0; c < bricks.length; c++) {
    let row = bricks[c];
    for (let r = 0; r < row.length; r++) {
      let brick = bricks[c][r];
      if (brick.exists) {
        brick.draw();
      }
    }
  }
}

Game.prototype.detectGameOver = function () {
  let canvas = this.canvas;
  let ball = this.ball;
  let paddle = this.paddle;
  let brickColumnCount = this.settings.brickColumnCount;
  let brickRowCount = this.settings.brickRowCount;
  let intervalId = this.intervalID;

  if (canvas.height <= ball.y + ball.size) {
    if (this.lives === 0) {
      alert('Game Over');
      clearInterval(intervalId);
    } else {
      this.lives--;
      ball.x = this.settings.ballStartX;
      ball.y = this.settings.ballStartY;
      ball.velX = this.settings.ballVelX;
      ball.velY = this.settings.ballVelY;
      paddle.x = (canvas.width - game.paddle.width) / 2;
    }
  }
  if (this.score === brickColumnCount * brickRowCount) {
    alert('You win!');
    clearInterval(intervalId);
  }
}

Game.prototype.drawScore = function () {
  this.ctx.font = "16px Arial";
  this.ctx.fillStyle = "#0095DD";
  this.ctx.fillText("Score: " + this.score, 8, 20);
}

Game.prototype.drawLives = function () {
  this.ctx.font = "16px Arial";
  this.ctx.fillStyle = "#0095DD";
  this.ctx.fillText("Lives: " + this.lives, this.canvas.width - 65, 20);
}

Game.prototype.next = function (_this) {
  _this.ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
  _this.ball.draw();
  _this.paddle.draw();
  _this.ball.collisionDetect(_this);
  _this.ball.update();
  _this.paddle.update(_this.canvas);
  _this.drawBricks();
  _this.drawScore();
  _this.drawLives();
  _this.detectGameOver();
}

Game.prototype.loop = function () {
  this.intervalID = setInterval(this.next, 10, this);
}

function createOptions(settings) {
  let maxLives = settings.lives;
  let lives = document.querySelector("#lives");
  for (let i = 0; i < maxLives + 1; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.innerText = i;
    lives.appendChild(option);
  }

  let paddleWidth = settings.paddleWidth;
  let paddleSize = document.querySelector("#paddleSize");
  for (let i = paddleWidth; i < paddleWidth * 4; i += paddleWidth) {
    const option = document.createElement('option');
    option.value = i;
    option.innerText = i;
    paddleSize.appendChild(option);
  }

  let ballVelX = settings.ballVelX;
  let ballVel = document.querySelector("#ballVel");
  for (let i = ballVelX; i < ballVelX * 4; i += ballVelX) {
    const option = document.createElement('option');
    option.value = i;
    option.innerText = i;
    ballVel.appendChild(option);
  }

  let color = document.querySelector("#color");
  ['blue', 'green', 'red', 'purple'].forEach(c => {
    const option = document.createElement('option');
    option.value = c;
    option.innerText = c;
    color.appendChild(option);
  })
}

function getSettings() {
  let lives = document.querySelector("#lives");
  let paddleSize = document.querySelector("#paddleSize");
  let ballVel = document.querySelector("#ballVel");
  let color = document.querySelector("#color");

  return {
    lives: Number(lives.value),
    paddleWidth: Number(paddleSize.value),
    ballVelX: Number(ballVel.value),
    ballVelY: -(Number(ballVel.value)),
    brickColor: color.value,
    paddleColor: color.value
  }
}

function setSettings(newSettings, game) {
  Object.keys(newSettings).forEach(key => {
    game.settings[key] = newSettings[key];
  })
}

function handleStart(e) {
  setSettings(getSettings(), game);
  game.initialize();
  game.loop();
}

function showPreview(game) {
  game.initialize();
  game.next(game);
}

let game = new Game("myCanvas");
let startButton = document.querySelector("#start-button");
createOptions(game.settings);
startButton.addEventListener("click", handleStart);
showPreview(game);