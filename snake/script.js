const canvasElement = document.querySelector("canvas");
const ctx = canvasElement.getContext("2d");
let gameInterval; // we need this because we want to change the interval not just in the forEach (line 50)

// VARIABLES
// field width and height only change in html :((((((
const snakeSize = 30; // snake width and height (not length) ((better not to change this))
const canvasWidth = canvasElement.width; // width of the field where the snake runs
const canvasHeight = canvasElement.height; // height of the field where the snake runs
let milliseconds = 150; // was `const Mseconds = 250;` — make it `let` only if you plan to change speed later
let snakeX = 0; // horizontal snake coordinates
let snakeY = canvasHeight / 2 - snakeSize / 2; // vertical snake coordinates (math used to center it)
let direction = "right"; // current snake direction
let nextDirection = direction; // buffered desired direction
let directionLocked = false; // prevent multiple changes before next move
let snakeLength = 4; // snake length in squares
let speedBoost = 0.8;

// tail/body
let history = [{ x: snakeX, y: snakeY }];

// apple variables:

// 1. apple coordinates
let appleX = 0;
let appleY = 0;

// 2. needed to track if the apple is eaten
let appleExists = false;

// start screen
function setDifficulty(ms, boost) {
  milliseconds = ms;
  speedBoost = boost;
}

const buttons = document.querySelectorAll(".difficulty");

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    gameInterval = setInterval(moveSnake, milliseconds);
  });
});

// apple functions

// function responsible for ensuring the apple is not on the snake
function isOnSnake(x, y) {
  return history.some((part) => part.x === x && part.y === y);
}

function getRandomAppleCoords() {
  let attempts = 0; // these 2 funcs are here to prevent infinite loop
  const maxAttempts = 1000; // (caused by the isOnSnake func)
  let x, y;
  do {
    x = Math.floor(Math.random() * (canvasWidth / snakeSize)) * snakeSize;
    y = Math.floor(Math.random() * (canvasHeight / snakeSize)) * snakeSize;
    attempts++;
  } while (isOnSnake(x, y) && attempts < maxAttempts);

  appleX = x;
  appleY = y;
}

function drawApple() {
  if (!appleExists) return;
  ctx.fillStyle = "red";
  ctx.fillRect(appleX, appleY, snakeSize, snakeSize);
}

// SNAKE
function drawSnake() {
  ctx.fillStyle = "green";
  history.forEach((snakePart) => {
    ctx.fillRect(snakePart.x, snakePart.y, snakeSize, snakeSize);
  });
}

// func to check if snake crashed into itself
function isCrashed(x, y) {
  return history.some((part) => part.x === x && part.y === y);
}

// "main" function called every tick
function moveSnake() {
  // apply buffered direction once per tick
  direction = nextDirection;

  let nextX = snakeX;
  let nextY = snakeY;
  switch (direction) {
    case "right":
      nextX += snakeSize;
      break;
    case "up":
      nextY -= snakeSize;
      break;
    case "left":
      nextX -= snakeSize;
      break;
    case "down":
      nextY += snakeSize;
      break;
  }

  // check self-collision BEFORE adding the new head
  if (isCrashed(nextX, nextY)) {
    clearInterval(gameInterval);
    deathScreen();
    return;
  }

  // update head coords and body
  snakeX = nextX;
  snakeY = nextY;
  history.push({ x: snakeX, y: snakeY });
  history = history.slice(-snakeLength);

  drawField();

  if (!appleExists) {
    getRandomAppleCoords();
    appleExists = true;
  }
  drawApple();
  drawSnake();

  // checking if snake captured apple
  if (snakeX === appleX && snakeY === appleY) {
    appleExists = false;
    snakeLength++;
  }
  if (
    snakeX < 0 ||
    snakeX >= canvasWidth ||
    snakeY < 0 ||
    snakeY >= canvasHeight
  ) {
    clearInterval(gameInterval);
    deathScreen();
  }
  // allow direction changes again for next tick
  directionLocked = false;
}

// move snake directions
function moveSnakeRight() {
  snakeX += snakeSize;
}
function moveSnakeUp() {
  snakeY -= snakeSize;
}
function moveSnakeLeft() {
  snakeX -= snakeSize;
}
function moveSnakeDown() {
  snakeY += snakeSize;
}

// FIELD
function drawField() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.fillStyle = "lightgrey";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

// controls snake
// listens for key presses
document.addEventListener("keydown", (e) => {
  if (directionLocked) return; // ignore extra rapid presses until next move

  const upPressed = e.code === "KeyW";
  const downPressed = e.code === "KeyS";
  const leftPressed = e.code === "KeyA";
  const rightPressed = e.code === "KeyD";

  // pick intended direction but prevent direct reverse of current direction
  if (upPressed && direction !== "down") nextDirection = "up";
  else if (downPressed && direction !== "up") nextDirection = "down";
  else if (leftPressed && direction !== "right") nextDirection = "left";
  else if (rightPressed && direction !== "left") nextDirection = "right";

  // lock until moveSnake runs
  directionLocked = true;
});

// adding food
function addFood() {
  milliseconds = Math.ceil(milliseconds * speedBoost);

  getRandomAppleCoords();

  // mark apple as present; drawing happens in drawApple() each frame
  appleExists = true;
}

// DEATH SCREEN

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function deathScreen() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight); // clear screen

  ctx.fillStyle = "white"; // use a visible color
  ctx.font = "60px Garamond";
  ctx.textAlign = "center"; // centers text automatically
  ctx.fillText("Game Over", canvasWidth / 2, canvasHeight / 2 - 40);

  ctx.font = "36px Garamond";
  ctx.fillText(
    `Score: ${snakeLength - 4}`,
    canvasWidth / 2,
    canvasHeight / 2 + 20,
  );

  // wait 1 second
  await wait(1000);

  // draw extra message
  ctx.font = "28px Garamond";
  ctx.fillText(
    "Choose difficulty to restart",
    canvasWidth / 2,
    canvasHeight / 2 + 100,
  );

  // wait for click to reload
  document.addEventListener("click", () => {
    location.reload();
  });
}
