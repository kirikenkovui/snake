const canvasElement = document.querySelector('canvas');
const ctx = canvasElement.getContext('2d');
let gameInterval; // toto potrebujeme pretoze chceme menit interval nie len v fotEach (line 50)
// PREMENNE
// sirka a vyska pola sa meni len v html :(((((( 
const snakeSize = 30; // sirka a vyska snake (nie aka je dlha) ((toto lepsie nemenit))
const canvasWidth = canvasElement.width; // sirka pola kde bezi snake
const canvasHeight = canvasElement.height; // vyska pola kde bezi sknake
let Mseconds = 150; // was `const Mseconds = 250;` — make it `let` only if you plan to change speed later
let snakeX = 0; // coordinates of snake horizontaly
let snakeY = canvasHeight/2 - snakeSize/2; // coordinates of snake verticaly (math becouse want it be at center right)
let direction = 'right'; // kam teraz ide snake
let nextDirection = direction; // buffered desired direction
let directionLocked = false;   // prevent multiple changes before next move
let snakeLength = 4; // dlzka snake v kockach
let speedBoost = 0.8;
// hvost
let pamat = [{x: snakeX, y: snakeY}]; 

// premenne jablka:

// 1. coords jablka
let XJablka = 0;
let YJablka = 0;

// 2. toto potrebujeme na zjedenie jablka
let jablkoExists = false;

// start screen

function startGameAsEasy() {
    Mseconds = 200;
    speedBoost = 0.8;
}

function startGameAsMedium() {
    Mseconds = 100;
    speedBoost = 0.8;
}

function startGameAsHard() {
    Mseconds = 50;
    speedBoost = 0.8;
}

function startGameAsTurbo() {
    Mseconds = 200;
    speedBoost = 0.6;
    
}

const buttons = document.querySelectorAll('.difficulty');

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
        gameInterval = setInterval(moveSnake, Mseconds);

  });
});



// funkcie jablka

// funkcia ktora je zodpovedna za to jablko neni na snake
function isOnSnake(x, y) {
    return pamat.some(part => part.x === x && part.y === y);
}

function getRandomCoordsJablka() {
    let attempts = 0;                   //this 2 funcs are here to prevent infinite loop 
    const maxAttempts = 1000;           //(that is caused because of the isOnSnake func)
    let x, y;
    do {
        x = Math.floor(Math.random() * (canvasWidth / snakeSize)) * snakeSize;
        y = Math.floor(Math.random() * (canvasHeight / snakeSize)) * snakeSize;
        attempts++;
    } while (isOnSnake(x, y) && attempts < maxAttempts);

    XJablka = x;
    YJablka = y;
}

function drawApple() {
    if (!jablkoExists) return;
        ctx.fillStyle = 'red';
        ctx.fillRect(XJablka, YJablka, snakeSize, snakeSize);
    
}





//SNAKE
function drawSnake() {
    ctx.fillStyle = 'green';
    pamat.forEach(snakePart => {           
        ctx.fillRect(snakePart.x, snakePart.y, snakeSize, snakeSize);    
    });
        
}

//func na check ci snake crashol do seba
function isCrashed(x, y) {
    return pamat.some(part => part.x === x && part.y === y);
}

// "hlavna" funkcia ktora sa vola kazdy tick"
function moveSnake() {
    // apply buffered direction once per tick
    direction = nextDirection;

    let nextX = snakeX;
    let nextY = snakeY;
    switch (direction) {
        case 'right': nextX += snakeSize; break;
        case 'up':    nextY -= snakeSize; break;
        case 'left':  nextX -= snakeSize; break;
        case 'down':  nextY += snakeSize; break;
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
    pamat.push({x: snakeX, y: snakeY});
    pamat = pamat.slice(-snakeLength);

    drawField();

    if (!jablkoExists) {
        getRandomCoordsJablka();
        jablkoExists = true;
    }
    drawApple();
    drawSnake();

    // checking if snake captured jablko
    if (snakeX === XJablka && snakeY === YJablka){
        jablkoExists = false;
        snakeLength++;
    }
    if (snakeX < 0 || snakeX >= canvasWidth || snakeY < 0 || snakeY >= canvasHeight) {
        clearInterval(gameInterval);
        deathScreen();
        
    }
    // allow direction changes again for next tick
    directionLocked = false;
}


// move snake directions    
function moveSnakeRight() { snakeX += snakeSize; }
function moveSnakeUp()    { snakeY -= snakeSize; }
function moveSnakeLeft()  { snakeX -= snakeSize; }
function moveSnakeDown()  { snakeY += snakeSize; }


// POLE 
function drawField() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = 'lightgrey'; 
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

// controlls snake
// listens for key presses

document.addEventListener('keydown', (e) => {

    if (directionLocked) return; // ignore extra rapid presses until next move

    const upPressed = e.code === 'KeyW';
    const downPressed = e.code === 'KeyS';
    const leftPressed = e.code === 'KeyA';
    const rightPressed = e.code === 'KeyD';

    // pick intended direction but prevent direct reverse of current direction
    if (upPressed && direction !== 'down') nextDirection = 'up';
    else if (downPressed && direction !== 'up') nextDirection = 'down';
    else if (leftPressed && direction !== 'right') nextDirection = 'left';
    else if (rightPressed && direction !== 'left') nextDirection = 'right';

    // lock until moveSnake runs
    directionLocked = true;
});

// pridanie jablka
function pridatJedlo(){
    Mseconds = Math.ceil(Mseconds * speedBoost); 
    
    
    getRandomCoordsJablka();

    // mark apple as present; drawing happens in drawApple() each frame
    jablkoExists = true;
}

// DEATH SCREEN

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function deathScreen() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight); // clear screen

  ctx.fillStyle = 'white'; // use a visible color
  ctx.font = '60px Garamond';
  ctx.textAlign = 'center'; // centers text automatically
  ctx.fillText('Game Over', canvasWidth / 2, canvasHeight / 2 - 40);

  ctx.font = '36px Garamond';
  ctx.fillText(`Score: ${snakeLength - 4}`, canvasWidth / 2, canvasHeight / 2 + 20);

  // wait 1 second
  await wait(1000);

  // draw extra message
  ctx.font = '28px Garamond';
  ctx.fillText('Choose difficulty to restart', canvasWidth / 2, canvasHeight / 2 + 100);

  // wait for key press once
  document.addEventListener('click', () => {
    location.reload();
  });
}

// helper wait function
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
