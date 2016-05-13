enum Statuses { Stopped, Running, GameOver };

const KEYS = { LEFT: 37, RIGHT: 39 };

class Ball {
  speed: number = 5;
  x: number = 135;
  y: number = 100;
  directionX: number = -1;
  directionY: number = -1;
}

class Pong {
  status: Statuses = Statuses.Stopped;
  pressedKeys: Array<boolean> = [];
  score: number = 0;
  ball: Ball = new Ball();

  isRunning(): boolean {
    return this.status === Statuses.Running;
  }
}

const pong = new Pong();

function moveRacket(racketHTML: HTMLElement, pong: Pong): number {
  let left = racketHTML.offsetLeft;
  if (pong.pressedKeys[KEYS.LEFT]) {
    return left - 5;
  }
  else if (pong.pressedKeys[KEYS.RIGHT]) {
    return left + 5;
  }
  return left;
}

function drawRacket(racketHTML: HTMLElement, pixelPos: number): void {
  racketHTML.style.left = pixelPos + 'px';
}

function nextPosition(currentPosition: number, speed: number, direction: number): number {
  return currentPosition + speed * direction;
}

function moveBallDirectionX(playgroundHTML: HTMLElement, ball: Ball): number {
  let width = playgroundHTML.offsetWidth, directionX = ball.directionX;
  let positionX = nextPosition(ball.x, ball.speed, ball.directionX);
  if(positionX > width) { directionX = -1; }
  if(positionX < 0) { directionX = 1; }
  return directionX;
}

function moveBallDirectionY(playgroundHTML: HTMLElement, ball: Ball): number {
  let height = playgroundHTML.offsetHeight, directionY = ball.directionY;
  let positionY = nextPosition(ball.y, ball.speed, ball.directionY);
  if(positionY > height) { directionY = -1; }
  if(positionY < 0) { directionY = 1; }
  return directionY;
}

function moveBallPosition(ball: Ball, direction: number): number {
  return ball.speed * direction;
}

function changeBallPosition(ball: Ball, dirX: number, posX: number, dirY: number, posY: number): void {
  ball.directionX = dirX;
  ball.directionY = dirY;
  ball.x += posX;
  ball.y += posY;
}

function drawBall(ballHTML: HTMLElement, ball: Ball): void {
  ballHTML.style.left = ball.x + 'px';
  ballHTML.style.top  = ball.y + 'px';
}

function racketPositionY(racketHTML: HTMLElement, ballHTML: HTMLElement): number {
  let ballSize = ballHTML.offsetHeight;
  return racketHTML.offsetTop - ballSize / 2; // subtracting size of ball for doesn't pass through racket
}

function isRacketHit(racketHTML: HTMLElement, ballHTML: HTMLElement, ball: Ball): boolean {
  let racketBorderLeft  = racketHTML.offsetLeft;
  let racketBorderRight = racketBorderLeft + racketHTML.offsetWidth;
  let posX              = nextPosition(ball.x, ball.speed, ball.directionX);
  let posY              = nextPosition(ball.y, ball.speed, ball.directionY);
  let racketPosY        = racketPositionY(racketHTML, ballHTML);
  return (posX >= racketBorderLeft &&
          posX <= racketBorderRight &&
          posY >= racketPosY);
}

function counter(racketHTML: HTMLElement, ballHTML: HTMLElement, ball: Ball): boolean {
  return isRacketHit(racketHTML, ballHTML, ball);
}

function computeScore(hit: boolean, score: number): number {
  return (hit ? score + 1 : score);
}

function changeScore(pong: Pong, newScore: number): void {
  pong.score = newScore;
}

function drawScore(scoreHTML: HTMLElement, score: number): void {
  scoreHTML.innerHTML = score.toString();
}

function changeDirectionY(ball: Ball, hit: boolean): void {
  if (hit) {
    ball.directionY = -1;
  }
}

function isGameOver(racketHTML: HTMLElement, ballHTML: HTMLElement, ball: Ball): boolean {
  let bottomPos  = racketHTML.offsetHeight;
  let posY       = nextPosition(ball.y, ball.speed, ball.directionY) - bottomPos;
  let racketPosY = racketPositionY(racketHTML, ballHTML);
  return posY > racketPosY;
}

function endGame(pong: Pong, isOver: boolean): void {
  if (isOver) {
    pong.status = Statuses.GameOver;
  }
}

function drawEndGame(gameOverHTML: HTMLElement, isOver: boolean): void {
  if (isOver) {
    gameOverHTML.style.display = 'block';
  }
}

function loop(playgroundHTML: HTMLElement, racketHTML: HTMLElement, ballHTML: HTMLElement, scoreHTML: HTMLElement, gameOverHTML: HTMLElement): void {
  if (pong.isRunning()) {
    let ball = pong.ball, score = pong.score;
    let newDirX  = moveBallDirectionX(playgroundHTML, ball);
    let newDirY  = moveBallDirectionY(playgroundHTML, ball);
    let newPosX  = moveBallPosition(ball, newDirX);
    let newPosY  = moveBallPosition(ball, newDirY);
    changeBallPosition(ball, newDirX, newPosX, newDirY, newPosY);
    drawBall(ballHTML, ball);
    let pixelPos = moveRacket(racketHTML, pong);
    drawRacket(racketHTML, pixelPos);
    let hit      = counter(racketHTML, ballHTML, ball);
    let newScore = computeScore(hit, score);
    changeDirectionY(ball, hit);
    changeScore(pong, newScore);
    drawScore(scoreHTML, pong.score);
    let isOver = isGameOver(racketHTML, ballHTML, ball);
    endGame(pong, isOver);
    drawEndGame(gameOverHTML, isOver);
  }
}

function load(): void {
  const playgroundHTML = document.getElementById('playground'),
        racketHTML     = document.getElementById('racket'),
        ballHTML       = document.getElementById('ball'),
        scoreHTML      = document.getElementById('score'),
        startHTML      = document.getElementById('start-message'),
        GameOverHTML   = document.getElementById('game-over');

  setInterval(function executeLoop() {
    loop(playgroundHTML, racketHTML, ballHTML, scoreHTML, GameOverHTML);
  }, 16);

  document.addEventListener('keydown', function markAsPressed(event) {
    pong.pressedKeys[event.which] = true;
  });

  document.addEventListener('keydown', function startGame(event) {
    if (pong.status === Statuses.Stopped) {
      pong.status = Statuses.Running;
      startHTML.style.display = 'none';
    }
  });

  document.addEventListener('keyup',function markAsNotPressed(event) {
    pong.pressedKeys[event.which] = false;
  });
}

window.onload = load;
