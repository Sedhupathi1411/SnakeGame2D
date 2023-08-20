const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const scoreElt = document.getElementById("score") as HTMLElement;

// Constants
const X = 0, Y = 1;
const bSize = 30;
const rows = Math.floor((innerHeight - 45) / bSize);
const cols = Math.floor((innerWidth < 700 ? (innerWidth - 10) : 690) / bSize);
const cWidth = canvas.width = cols * bSize;
const cHeight = canvas.height = rows * bSize;
const frameTime = 150;
var interval = 0;

const isMobileDevice = navigator.userAgent.match(/Android/i)
    || navigator.userAgent.match(/webOS/i)
    || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i)
    || navigator.userAgent.match(/iPod/i)
    || navigator.userAgent.match(/BlackBerry/i)
    || navigator.userAgent.match(/Windows Phone/i);

// Types
type Vec2 = [number, number];

// Variables
var snake: Vec2[] = [[3, 2], [2, 2], [1, 2]];
var dir: Vec2 = [1, 0];
var fruits: Vec2[] = [];
var score = 0;

// Update Function
function update() {
    ctx.clearRect(0, 0, cWidth, cHeight);

    // Moving the snake
    snake.unshift([snake[0][X] + dir[X], snake[0][Y] + dir[Y]]);
    snake.pop();

    for (let j = 0; j < fruits.length; j++) {
        // Draw Fruit
        ctx.fillStyle = "red";
        ctx.beginPath();
        let extra = bSize * 0.1;
        ctx.roundRect(
            (fruits[j][X] * bSize) - extra, (fruits[j][Y] * bSize) - extra,
            bSize + (2 * extra), bSize + (2 * extra), 10
        );
        // ctx.arc((fruits[j][X] * bSize) + r, fruits[j][Y] * bSize + r, r, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();

        // Ate fruit?
        if (snake[0][X] == fruits[j][X] && snake[0][Y] == fruits[j][Y]) {
            fruits.splice(j, 1);
            score += 1;
            scoreElt.innerHTML = "Score: " + score;
            generateFruit();
            growSnake();
        }
    }

    let g = 200;

    for (let i = 0; i < snake.length; i++) {
        // Check collision with itself
        if (i > 0) if (snake[0][X] == snake[i][X] && snake[0][Y] == snake[i][Y]) gameOver();

        // Teleport snake
        if (snake[i][X] >= cols) snake[i][X] %= cols;
        else if (snake[i][X] < 0) snake[i][X] += cols;
        else if (snake[i][Y] >= rows) snake[i][Y] %= rows;
        else if (snake[i][Y] < 0) snake[i][Y] += rows;

        // Draw Snake
        if (i == 0) ctx.fillStyle = "rgb(0,255,0)";
        else ctx.fillStyle = "rgb(0," + g + ",0)";
        // ctx.fillRect(snake[i][X] * bSize, snake[i][Y] * bSize, bSize, bSize);
        let radius = bSize * 2 / 3;
        ctx.beginPath();
        ctx.arc((snake[i][X] * bSize) + radius, (snake[i][Y] * bSize) + radius, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();

        if (g >= 100) g -= 20;
    }
}

// Keydown event
window.onkeydown = (e) => {
    if (e.key == "ArrowRight" && dir[X] != -1) dir = [1, 0];
    else if (e.key == "ArrowLeft" && dir[X] != 1) dir = [-1, 0];
    else if (e.key == "ArrowDown" && dir[Y] != -1) dir = [0, 1];
    else if (e.key == "ArrowUp" && dir[Y] != 1) dir = [0, -1];
}

// Touch Event (for mobiles)
{
    let sx = 0, sy = 0;

    document.body.ontouchstart = (e) => {
        sx = e.changedTouches[0].screenX;
        sy = e.changedTouches[0].screenY;
    }

    document.body.ontouchend = (e) => {
        let x = e.changedTouches[0].screenX - sx;
        let y = e.changedTouches[0].screenY - sy;

        let mod = (n: number) => Math.sign(n) * n;

        if (mod(x) > mod(y)) dir = [dir[X] || Math.sign(x), 0];
        else if (mod(x) < mod(y)) dir = [0, dir[Y] || Math.sign(y)];
    }
}


// Generate fruit at a random place
function generateFruit() {
    let rdm = (max: number) => Math.floor(Math.random() * max);
    let x = rdm(cols), y = rdm(rows);

    for (let i in snake)
        if (snake[i][X] == x && snake[i][Y] == y) {
            generateFruit();
            return;
        }
    fruits.push([x, y]);
}

function growSnake() {
    let n = snake.length - 1;
    snake.push([
        snake[n][X] - dir[X],
        snake[n][Y] - dir[Y]
    ]);
}

function gameOver() {
    clearInterval(interval);
    document.body.innerHTML = "<div id='Over'>Game Over!<br /><em>Score: " + score + "</em></div>";
    window.onclick = window.onkeydown = () => window.location.reload();
}

function initiate() {
    document.body.appendChild(canvas);
    generateFruit();
    if (isMobileDevice) document.body.requestFullscreen();
    document.body.removeChild(document.getElementById("Over") as HTMLElement);
    interval = setInterval(update, frameTime);
}