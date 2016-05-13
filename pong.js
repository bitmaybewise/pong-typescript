var Statuses;
(function (Statuses) {
    Statuses[Statuses["Stopped"] = 0] = "Stopped";
    Statuses[Statuses["Running"] = 1] = "Running";
    Statuses[Statuses["GameOver"] = 2] = "GameOver";
})(Statuses || (Statuses = {}));
;
var KEYS = { LEFT: 37, RIGHT: 39 };
var Ball = (function () {
    function Ball() {
        this.speed = 5;
        this.x = 135;
        this.y = 100;
        this.directionX = -1;
        this.directionY = -1;
    }
    return Ball;
}());
var Pong = (function () {
    function Pong() {
        this.status = Statuses.Stopped;
        this.pressedKeys = [];
        this.score = 0;
        this.ball = new Ball();
    }
    Pong.prototype.isRunning = function () {
        return this.status === Statuses.Running;
    };
    return Pong;
}());
var pong = new Pong();
function moveRacket(racketHTML, pong) {
    var left = racketHTML.offsetLeft;
    if (pong.pressedKeys[KEYS.LEFT]) {
        return left - 5;
    }
    else if (pong.pressedKeys[KEYS.RIGHT]) {
        return left + 5;
    }
    return left;
}
function drawRacket(racketHTML, pixelPos) {
    racketHTML.style.left = pixelPos + 'px';
}
function nextPosition(currentPosition, speed, direction) {
    return currentPosition + speed * direction;
}
function moveBallDirectionX(playgroundHTML, ball) {
    var width = playgroundHTML.offsetWidth, directionX = ball.directionX;
    var positionX = nextPosition(ball.x, ball.speed, ball.directionX);
    if (positionX > width) {
        directionX = -1;
    }
    if (positionX < 0) {
        directionX = 1;
    }
    return directionX;
}
function moveBallDirectionY(playgroundHTML, ball) {
    var height = playgroundHTML.offsetHeight, directionY = ball.directionY;
    var positionY = nextPosition(ball.y, ball.speed, ball.directionY);
    if (positionY > height) {
        directionY = -1;
    }
    if (positionY < 0) {
        directionY = 1;
    }
    return directionY;
}
function moveBallPosition(ball, direction) {
    return ball.speed * direction;
}
function changeBallPosition(ball, dirX, posX, dirY, posY) {
    ball.directionX = dirX;
    ball.directionY = dirY;
    ball.x += posX;
    ball.y += posY;
}
function drawBall(ballHTML, ball) {
    ballHTML.style.left = ball.x + 'px';
    ballHTML.style.top = ball.y + 'px';
}
function racketPositionY(racketHTML, ballHTML) {
    var ballSize = ballHTML.offsetHeight;
    return racketHTML.offsetTop - ballSize / 2;
}
function isRacketHit(racketHTML, ballHTML, ball) {
    var racketBorderLeft = racketHTML.offsetLeft;
    var racketBorderRight = racketBorderLeft + racketHTML.offsetWidth;
    var posX = nextPosition(ball.x, ball.speed, ball.directionX);
    var posY = nextPosition(ball.y, ball.speed, ball.directionY);
    var racketPosY = racketPositionY(racketHTML, ballHTML);
    return (posX >= racketBorderLeft &&
        posX <= racketBorderRight &&
        posY >= racketPosY);
}
function counter(racketHTML, ballHTML, ball) {
    return isRacketHit(racketHTML, ballHTML, ball);
}
function computeScore(hit, score) {
    return (hit ? score + 1 : score);
}
function changeScore(pong, newScore) {
    pong.score = newScore;
}
function drawScore(scoreHTML, score) {
    scoreHTML.innerHTML = score.toString();
}
function changeDirectionY(ball, hit) {
    if (hit) {
        ball.directionY = -1;
    }
}
function isGameOver(racketHTML, ballHTML, ball) {
    var bottomPos = racketHTML.offsetHeight;
    var posY = nextPosition(ball.y, ball.speed, ball.directionY) - bottomPos;
    var racketPosY = racketPositionY(racketHTML, ballHTML);
    return posY > racketPosY;
}
function endGame(pong, isOver) {
    if (isOver) {
        pong.status = Statuses.GameOver;
    }
}
function drawEndGame(gameOverHTML, isOver) {
    if (isOver) {
        gameOverHTML.style.display = 'block';
    }
}
function loop(playgroundHTML, racketHTML, ballHTML, scoreHTML, gameOverHTML) {
    if (pong.isRunning()) {
        var ball = pong.ball, score = pong.score;
        var newDirX = moveBallDirectionX(playgroundHTML, ball);
        var newDirY = moveBallDirectionY(playgroundHTML, ball);
        var newPosX = moveBallPosition(ball, newDirX);
        var newPosY = moveBallPosition(ball, newDirY);
        changeBallPosition(ball, newDirX, newPosX, newDirY, newPosY);
        drawBall(ballHTML, ball);
        var pixelPos = moveRacket(racketHTML, pong);
        drawRacket(racketHTML, pixelPos);
        var hit = counter(racketHTML, ballHTML, ball);
        var newScore = computeScore(hit, score);
        changeDirectionY(ball, hit);
        changeScore(pong, newScore);
        drawScore(scoreHTML, pong.score);
        var isOver = isGameOver(racketHTML, ballHTML, ball);
        endGame(pong, isOver);
        drawEndGame(gameOverHTML, isOver);
    }
}
function load() {
    var playgroundHTML = document.getElementById('playground'), racketHTML = document.getElementById('racket'), ballHTML = document.getElementById('ball'), scoreHTML = document.getElementById('score'), startHTML = document.getElementById('start-message'), GameOverHTML = document.getElementById('game-over');
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
    document.addEventListener('keyup', function markAsNotPressed(event) {
        pong.pressedKeys[event.which] = false;
    });
}
window.onload = load;
