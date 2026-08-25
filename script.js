/* =========================================================
   SETTINGS
========================================================= */
let targetFPS = Number(localStorage.getItem('targetFPS') || 60);

function setFPS(value){
    targetFPS = value;
    localStorage.setItem('targetFPS', value);
    document.getElementById('fpsSetting').textContent = 'Сейчас: ' + value + ' FPS';
    document.querySelectorAll('.fpsValue').forEach(el => el.textContent = value);
}
setFPS(targetFPS);

/* =========================================================
   NAVIGATION
========================================================= */
function showPage(id, button){
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(id);
    if (page) page.classList.add('active');

    document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('selected'));
    if (button) button.classList.add('selected');

    window.scrollTo(0, 0);
}

function goHome(){
    showPage('home', document.querySelector('.bottom-nav button'));
}

/* =========================================================
   SOUND (UI toggle — kept lightweight, no audio assets)
========================================================= */
let sound = true;

function toggleSound(){
    sound = !sound;
    document.getElementById('soundBtn').innerHTML =
        sound ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark"></i>';
}

/* =========================================================
   RECORDS
========================================================= */
let records = JSON.parse(localStorage.getItem('records') || '{"2048":0,"snake":0,"race":0,"arkanoid":0}');

function saveRecords(){
    localStorage.setItem('records', JSON.stringify(records));
    renderRecords();
}

function renderRecords(){
    const data = [
        ['fa-border-all', 'var(--violet)', '2048', records['2048']],
        ['fa-worm', 'var(--lime)', 'Змейка', records.snake],
        ['fa-car-side', 'var(--orange)', 'Гонки', records.race],
        ['fa-cubes', 'var(--cyan)', 'Arkanoid', records.arkanoid]
    ];

    document.getElementById('recordsList').innerHTML = data.map(([icon, color, name, value]) => `
        <div class="record-row">
            <div class="r-icon" style="background:color-mix(in srgb, ${color} 18%, transparent); color:${color}">
                <i class="fa-solid ${icon}"></i>
            </div>
            <b>${name}</b>
            <strong>${Math.floor(value)}</strong>
        </div>
    `).join('');
}
renderRecords();

/* =========================================================
   GAME CARDS
========================================================= */
const games = [
    { id: 'game2048', icon: 'fa-border-all', color: 'var(--violet)', title: '2048', desc: 'Классическая головоломка.' },
    { id: 'snake', icon: 'fa-worm', color: 'var(--lime)', title: 'Змейка', desc: 'Управление сенсорным джойстиком.' },
    { id: 'guess', icon: 'fa-hashtag', color: 'var(--cyan)', title: 'Угадай число', desc: 'Попробуй найти загаданное число.' },
    { id: 'arkanoid', icon: 'fa-cubes', color: 'var(--cyan)', title: 'Arkanoid', desc: 'Разрушай блоки и проходи уровни.' },
    { id: 'race', icon: 'fa-car-side', color: 'var(--orange)', title: 'Street Race', desc: 'Реалистично прорисованные машинки.' },
    { id: 'memory', icon: 'fa-brain', color: 'var(--violet)', title: 'Память', desc: 'Найди все одинаковые пары.' },
    { id: 'casino', icon: 'fa-dice', color: 'var(--gold)', title: 'Arcade Casino', desc: 'Слоты, кубик и монетка за виртуальные монеты.' }
];

function cardsHTML(){
    return games.map(g => `
        <div class="card" style="--glow:${g.color}" onclick="showPage('${g.id}')">
            <div class="card-icon"><i class="fa-solid ${g.icon}"></i></div>
            <h3>${g.title}</h3>
            <p>${g.desc}</p>
            <div class="play"><i class="fa-solid fa-play"></i></div>
        </div>
    `).join('');
}

document.getElementById('homeGames').innerHTML = cardsHTML();
document.getElementById('gamesGrid').innerHTML = cardsHTML();

/* =========================================================
   FPS ENGINE (display only)
========================================================= */
const fpsState = { last: performance.now(), frames: 0, value: 60 };

function fpsLoop(time){
    fpsState.frames++;
    if (time - fpsState.last >= 500){
        fpsState.value = Math.round(fpsState.frames / ((time - fpsState.last) / 1000));
        fpsState.frames = 0;
        fpsState.last = time;
        document.querySelectorAll('.fpsValue').forEach(el => {
            el.textContent = Math.min(999, fpsState.value);
        });
    }
    requestAnimationFrame(fpsLoop);
}
requestAnimationFrame(fpsLoop);

/* =========================================================
   GUESS THE NUMBER
========================================================= */
let secret = 0;
let attempts = 0;

function newGuess(){
    secret = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
    document.getElementById('guessNumber').textContent = '?';
    document.getElementById('guessAttempts').textContent = '0';
    document.getElementById('guessInput').value = '';
    document.getElementById('guessResult').textContent = 'Я загадал число. Попробуй!';
}

function checkGuess(){
    const value = Number(document.getElementById('guessInput').value);

    if (value < 1 || value > 100 || !value){
        document.getElementById('guessResult').textContent = 'Введи число от 1 до 100.';
        return;
    }

    attempts++;
    document.getElementById('guessAttempts').textContent = attempts;

    if (value === secret){
        document.getElementById('guessNumber').textContent = secret;
        document.getElementById('guessResult').textContent =
            '🎉 Угадал! Я загадал ' + secret + '. Попыток: ' + attempts;
    } else {
        document.getElementById('guessResult').innerHTML =
            'Ты ввёл: <b>' + value + '</b><br>' +
            'Разница: ' + Math.abs(value - secret) + '<br>' +
            (value < secret ? 'Моё число больше.' : 'Моё число меньше.');
    }
}
newGuess();

/* =========================================================
   2048
========================================================= */
let board2048 = [];
let score2048 = 0;

function new2048(){
    document.getElementById('overlay2048').classList.remove('show');
    board2048 = Array(16).fill(0);
    score2048 = 0;
    add2048();
    add2048();
    draw2048();
}

function add2048(){
    const empty = [];
    board2048.forEach((v, i) => { if (v === 0) empty.push(i); });
    if (!empty.length) return;
    const index = empty[Math.floor(Math.random() * empty.length)];
    board2048[index] = Math.random() < 0.9 ? 2 : 4;
}

function draw2048(){
    document.getElementById('board2048').innerHTML = board2048.map(v =>
        `<div class="tile" data-v="${v}">${v || ''}</div>`
    ).join('');

    document.getElementById('score2048').textContent = score2048;

    if (score2048 > records['2048']){
        records['2048'] = score2048;
        saveRecords();
    }

    if (!hasMoves2048()){
        document.getElementById('overlay2048Text').textContent = 'Счёт: ' + score2048;
        document.getElementById('overlay2048').classList.add('show');
    }
}

function hasMoves2048(){
    if (board2048.includes(0)) return true;
    for (let r = 0; r < 4; r++){
        for (let c = 0; c < 4; c++){
            const v = board2048[r * 4 + c];
            if (c < 3 && board2048[r * 4 + c + 1] === v) return true;
            if (r < 3 && board2048[(r + 1) * 4 + c] === v) return true;
        }
    }
    return false;
}

function slide2048(row){
    row = row.filter(Boolean);
    for (let i = 0; i < row.length - 1; i++){
        if (row[i] === row[i + 1]){
            row[i] *= 2;
            score2048 += row[i];
            row[i + 1] = 0;
        }
    }
    row = row.filter(Boolean);
    while (row.length < 4) row.push(0);
    return row;
}

function move2048(dir){
    let m = [];
    for (let r = 0; r < 4; r++) m.push(board2048.slice(r * 4, r * 4 + 4));
    const old = board2048.join(',');

    if (dir === 'left') m = m.map(slide2048);
    if (dir === 'right') m = m.map(r => slide2048(r.reverse()).reverse());

    if (dir === 'up' || dir === 'down'){
        for (let c = 0; c < 4; c++){
            let col = m.map(r => r[c]);
            if (dir === 'down') col.reverse();
            col = slide2048(col);
            if (dir === 'down') col.reverse();
            for (let r = 0; r < 4; r++) m[r][c] = col[r];
        }
    }

    board2048 = m.flat();

    if (old !== board2048.join(',')){
        add2048();
        draw2048();
    }
}

let touchX = 0, touchY = 0;
const board2048El = document.getElementById('board2048');

board2048El.addEventListener('touchstart', e => {
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
}, { passive: true });

board2048El.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return;
    if (Math.abs(dx) > Math.abs(dy)) move2048(dx > 0 ? 'right' : 'left');
    else move2048(dy > 0 ? 'down' : 'up');
}, { passive: true });

document.addEventListener('keydown', e => {
    const map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
    if (map[e.key] && document.getElementById('game2048').classList.contains('active')) move2048(map[e.key]);
});

new2048();

/* =========================================================
   SNAKE
========================================================= */
const snakeCanvas = document.getElementById('snakeCanvas');
const snakeCtx = snakeCanvas.getContext('2d');

let snake = [];
let snakeDir = { x: 1, y: 0 };
let nextSnakeDir = { x: 1, y: 0 };
let snakeFood = { x: 200, y: 200 };
let snakeRunning = false;
let snakePaused = false;
let snakeScore = 0;
let snakeLast = 0;

function startSnake(){
    document.getElementById('overlaySnake').classList.remove('show');
    snake = [{ x: 200, y: 200 }, { x: 180, y: 200 }, { x: 160, y: 200 }];
    snakeDir = { x: 1, y: 0 };
    nextSnakeDir = { x: 1, y: 0 };
    snakeScore = 0;
    snakeRunning = true;
    snakePaused = false;
    snakeLast = 0;
    createFood();
    document.getElementById('snakeScore').textContent = 0;
    requestAnimationFrame(snakeLoop);
}

function pauseSnake(){
    if (snakeRunning) snakePaused = !snakePaused;
}

function createFood(){
    snakeFood = {
        x: Math.floor(Math.random() * 21) * 20,
        y: Math.floor(Math.random() * 21) * 20
    };
}

function snakeLoop(time){
    if (!snakeRunning) return;

    if (!snakePaused && (!snakeLast || time - snakeLast >= 1000 / Math.min(targetFPS, 15))){
        snakeLast = time;
        snakeTick();
    }

    drawSnake();
    if (snakeRunning) requestAnimationFrame(snakeLoop);
}

function snakeTick(){
    snakeDir = nextSnakeDir;
    const head = { x: snake[0].x + snakeDir.x * 20, y: snake[0].y + snakeDir.y * 20 };

    const hitWall = head.x < 0 || head.y < 0 || head.x > 400 || head.y > 400;
    const hitSelf = snake.some(p => p.x === head.x && p.y === head.y);

    if (hitWall || hitSelf){
        snakeRunning = false;
        document.getElementById('overlaySnakeText').textContent = 'Счёт: ' + snakeScore;
        document.getElementById('overlaySnake').classList.add('show');
        return;
    }

    snake.unshift(head);

    if (head.x === snakeFood.x && head.y === snakeFood.y){
        snakeScore++;
        document.getElementById('snakeScore').textContent = snakeScore;
        if (snakeScore > records.snake){
            records.snake = snakeScore;
            saveRecords();
        }
        createFood();
    } else {
        snake.pop();
    }
}

function drawSnake(){
    snakeCtx.fillStyle = '#080910';
    snakeCtx.fillRect(0, 0, 420, 420);

    snakeCtx.fillStyle = '#ff3f5f';
    snakeCtx.beginPath();
    snakeCtx.arc(snakeFood.x + 10, snakeFood.y + 10, 7, 0, Math.PI * 2);
    snakeCtx.fill();

    snake.forEach((p, i) => {
        snakeCtx.fillStyle = i === 0 ? '#c3ff8f' : '#9dff5c';
        const r = 5;
        snakeCtx.beginPath();
        snakeCtx.roundRect(p.x + 2, p.y + 2, 16, 16, r);
        snakeCtx.fill();
    });
}

function changeSnake(x, y){
    if (x === -snakeDir.x && y === -snakeDir.y) return;
    nextSnakeDir = { x, y };
}

document.addEventListener('keydown', e => {
    if (!document.getElementById('snake').classList.contains('active')) return;
    const map = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (map[e.key]) changeSnake(map[e.key][0], map[e.key][1]);
});

/* JOYSTICK */
const joystick = document.getElementById('joystick');
const stick = document.getElementById('stick');
let joyActive = false;

function joystickMove(e){
    const rect = joystick.getBoundingClientRect();
    let x = e.clientX - rect.left - rect.width / 2;
    let y = e.clientY - rect.top - rect.height / 2;
    const max = 42;
    const distance = Math.hypot(x, y);
    if (distance > max){ x = x / distance * max; y = y / distance * max; }
    stick.style.transform = `translate(${x}px,${y}px)`;

    if (Math.abs(x) > Math.abs(y)){
        if (Math.abs(x) > 10) changeSnake(x > 0 ? 1 : -1, 0);
    } else {
        if (Math.abs(y) > 10) changeSnake(0, y > 0 ? 1 : -1);
    }
}

joystick.addEventListener('pointerdown', e => {
    joyActive = true;
    joystick.setPointerCapture(e.pointerId);
    joystickMove(e);
});
joystick.addEventListener('pointermove', e => { if (joyActive) joystickMove(e); });
joystick.addEventListener('pointerup', () => {
    joyActive = false;
    stick.style.transform = 'translate(0,0)';
});

startSnake();

/* =========================================================
   MEMORY
========================================================= */
let memoryFirst = null;
let memoryBusy = false;
let memoryMoves = 0;

function startMemory(){
    const icons = ['fa-apple-whole', 'fa-pizza-slice', 'fa-rocket', 'fa-gamepad', 'fa-cat', 'fa-futbol', 'fa-fire', 'fa-gem'];
    const symbols = [...icons, ...icons].sort(() => Math.random() - 0.5);

    memoryFirst = null;
    memoryBusy = false;
    memoryMoves = 0;
    document.getElementById('memoryMoves').textContent = 0;

    document.getElementById('memoryBoard').innerHTML = symbols.map(s => `
        <button class="memory-card" data-symbol="${s}" onclick="flipMemory(this)">
            <i class="fa-solid fa-question"></i>
        </button>
    `).join('');
}

function flipMemory(card){
    if (memoryBusy || card === memoryFirst || card.classList.contains('done')) return;

    card.innerHTML = `<i class="fa-solid ${card.dataset.symbol}"></i>`;
    card.classList.add('open');

    if (!memoryFirst){
        memoryFirst = card;
        return;
    }

    memoryMoves++;
    document.getElementById('memoryMoves').textContent = memoryMoves;

    if (memoryFirst.dataset.symbol === card.dataset.symbol){
        memoryFirst.classList.add('done');
        card.classList.add('done');
        memoryFirst = null;

        if (document.querySelectorAll('.memory-card.done').length === 16){
            setTimeout(() => alert('🎉 Победа! Ходов: ' + memoryMoves), 300);
        }
    } else {
        memoryBusy = true;
        const first = memoryFirst;
        setTimeout(() => {
            first.innerHTML = '<i class="fa-solid fa-question"></i>';
            card.innerHTML = '<i class="fa-solid fa-question"></i>';
            first.classList.remove('open');
            card.classList.remove('open');
            memoryFirst = null;
            memoryBusy = false;
        }, 650);
    }
}

startMemory();

/* =========================================================
   ARKANOID
========================================================= */
const arkCanvas = document.getElementById('arkCanvas');
const arkCtx = arkCanvas.getContext('2d');
let ark = null;

function startArkanoid(){
    document.getElementById('overlayArk').classList.remove('show');
    ark = {
        paddleX: 335, ballX: 380, ballY: 420, dx: 4, dy: -4,
        score: 0, lives: 3, level: 1, running: true, paused: false, bricks: []
    };
    createBricks();
    document.getElementById('arkScore').textContent = 0;
    renderLives();
    requestAnimationFrame(arkLoop);
}

function renderLives(){
    let html = '';
    for (let i = 0; i < 3; i++){
        html += `<i class="fa-solid fa-heart ${i < ark.lives ? '' : 'lost'}"></i>`;
    }
    document.getElementById('arkLives').innerHTML = html;
}

function createBricks(){
    ark.bricks = [];
    const rows = Math.min(8, 4 + ark.level);
    const brickColors = ['#33e0ff', '#b681ff', '#ff3f7f', '#ff8a4d'];

    for (let r = 0; r < rows; r++){
        for (let c = 0; c < 10; c++){
            ark.bricks.push({
                x: 15 + c * 75, y: 25 + r * 26, w: 64, h: 17,
                hp: r < 2 ? 2 : 1,
                color: brickColors[r % brickColors.length]
            });
        }
    }
}

function pauseArkanoid(){
    if (ark) ark.paused = !ark.paused;
}

function drawArk(){
    arkCtx.fillStyle = '#080910';
    arkCtx.fillRect(0, 0, 760, 480);
    if (!ark) return;

    ark.bricks.forEach(b => {
        if (b.hp <= 0) return;
        arkCtx.globalAlpha = b.hp === 2 ? 1 : 0.75;
        arkCtx.fillStyle = b.color;
        arkCtx.beginPath();
        arkCtx.roundRect(b.x, b.y, b.w, b.h, 4);
        arkCtx.fill();
        arkCtx.globalAlpha = 1;
    });

    arkCtx.fillStyle = '#f4f5f9';
    arkCtx.beginPath();
    arkCtx.roundRect(ark.paddleX, 455, 90, 10, 5);
    arkCtx.fill();

    arkCtx.fillStyle = '#ffcf4d';
    arkCtx.beginPath();
    arkCtx.arc(ark.ballX, ark.ballY, 7, 0, Math.PI * 2);
    arkCtx.fill();
}

function arkLoop(time){
    if (!ark || !ark.running) return;

    if (!ark.paused){
        const dt = Math.min(1.7, (ark.lastTime ? time - ark.lastTime : 16.6) / 16.6);
        ark.lastTime = time;

        ark.ballX += ark.dx * dt;
        ark.ballY += ark.dy * dt;

        if (ark.ballX < 7 || ark.ballX > 753) ark.dx *= -1;
        if (ark.ballY < 7) ark.dy *= -1;

        if (ark.ballY > 445 && ark.ballX > ark.paddleX && ark.ballX < ark.paddleX + 90){
            ark.dy = -Math.abs(ark.dy);
            const hit = (ark.ballX - (ark.paddleX + 45)) / 45;
            ark.dx = hit * 5;
        }

        if (ark.ballY > 480){
            ark.lives--;
            renderLives();
            ark.ballX = 380; ark.ballY = 420; ark.dx = 4; ark.dy = -4;

            if (ark.lives <= 0){
                ark.running = false;
                records.arkanoid = Math.max(records.arkanoid, ark.score);
                saveRecords();
                document.getElementById('overlayArkText').textContent = 'Очки: ' + ark.score;
                document.getElementById('overlayArk').classList.add('show');
                drawArk();
                return;
            }
        }

        for (const b of ark.bricks){
            if (b.hp > 0 && ark.ballX > b.x && ark.ballX < b.x + b.w && ark.ballY > b.y && ark.ballY < b.y + b.h){
                b.hp--;
                ark.dy *= -1;
                ark.score += 10;
                document.getElementById('arkScore').textContent = ark.score;
                break;
            }
        }

        if (ark.bricks.every(b => b.hp <= 0)){
            ark.level++;
            createBricks();
            ark.dx *= 1.06;
            ark.dy *= 1.06;
        }
    }

    drawArk();
    requestAnimationFrame(arkLoop);
}

arkCanvas.addEventListener('pointermove', e => {
    if (!ark) return;
    const rect = arkCanvas.getBoundingClientRect();
    ark.paddleX = Math.max(0, Math.min(670, (e.clientX - rect.left) * 760 / rect.width - 45));
});

/* =========================================================
   STREET RACE — improved physics, perspective road & controls
========================================================= */
const raceCanvas = document.getElementById('raceCanvas');
const raceCtx = raceCanvas.getContext('2d');
let race = null;

const carColors = ['#33e0ff', '#ff3f7f', '#ffcf4d', '#b681ff', '#9dff5c', '#ff8a4d'];

function resizeRaceCanvas(){
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = raceCanvas.getBoundingClientRect();
    if (!rect.width) return;
    raceCanvas.width = Math.round(420 * dpr);
    raceCanvas.height = Math.round(620 * dpr);
    raceCanvas._dpr = dpr;
    raceCtx.setTransform(dpr,0,0,dpr,0,0);
}
window.addEventListener('resize', resizeRaceCanvas);
resizeRaceCanvas();

function startRace(){
    document.getElementById('overlayRace').classList.remove('show');
    race = {
        playerX: 210, playerY: 525, score: 0, enemies: [],
        running: true, lastSpawn: performance.now(), lastTime: 0,
        roadOffset: 0, speed: 5, spawnTimer: 720,
        steer: 0, targetX: 210, bestNearMiss: 0
    };
    resizeRaceCanvas();
    document.getElementById('raceScore').textContent = '0';
    document.getElementById('raceSpeed').textContent = '1.0x';
    requestAnimationFrame(raceLoop);
}

function roundedRect(ctx,x,y,w,h,r){
    r=Math.min(r,w/2,h/2);
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
}

function drawCar(ctx, x, y, color, scale=1, player=false){
    ctx.save();
    ctx.translate(x,y);
    ctx.scale(scale,scale);

    ctx.shadowColor = player ? color : '#000';
    ctx.shadowBlur = player ? 18 : 5;
    ctx.fillStyle = color;
    roundedRect(ctx,4,4,42,70,10);
    ctx.fill();
    ctx.shadowBlur=0;

    ctx.fillStyle='#080b12';
    roundedRect(ctx,10,10,30,22,7); ctx.fill();
    ctx.fillStyle='#26354a';
    roundedRect(ctx,13,13,24,15,5); ctx.fill();

    ctx.fillStyle='#08090d';
    ctx.fillRect(-2,16,7,20); ctx.fillRect(45,16,7,20);
    ctx.fillRect(-2,52,7,20); ctx.fillRect(45,52,7,20);

    ctx.fillStyle='#eefaff';
    roundedRect(ctx,9,33,9,7,2); ctx.fill();
    roundedRect(ctx,32,33,9,7,2); ctx.fill();

    ctx.fillStyle='#ff243d';
    ctx.fillRect(10,62,9,6); ctx.fillRect(31,62,9,6);

    ctx.fillStyle='#ffffff55';
    ctx.fillRect(24,34,2,24);

    ctx.restore();
}

function roadCurve(t){
    // Subtle S-curve; t=0 horizon, t=1 bottom.
    return Math.sin((t * 1.35 + race.roadOffset * .0007) * Math.PI) * 26 * t;
}

function roadBounds(y){
    const t=Math.max(0,Math.min(1,(y-100)/520));
    const half=75 + 120*t;
    const center=210 + roadCurve(t);
    return {left:center-half,right:center+half,center};
}

function drawRoad(){
    const w=420,h=620;
    raceCtx.clearRect(0,0,w,h);

    const sky=raceCtx.createLinearGradient(0,0,0,180);
    sky.addColorStop(0,'#080a14'); sky.addColorStop(1,'#18253b');
    raceCtx.fillStyle=sky; raceCtx.fillRect(0,0,w,180);

    // skyline / distant lights
    for(let i=0;i<24;i++){
        const x=i*19+(i%3)*4;
        const bh=18+(i*31)%65;
        raceCtx.fillStyle=i%2?'#171d2b':'#20283a';
        raceCtx.fillRect(x,125-bh,15,bh);
        raceCtx.fillStyle='#ffcf4d99';
        if(i%3===0) raceCtx.fillRect(x+4,112-bh,3,5);
    }

    // grass/shoulder
    raceCtx.fillStyle='#0b1713'; raceCtx.fillRect(0,130,w,490);

    // road trapezoid
    raceCtx.beginPath();
    raceCtx.moveTo(135,105); raceCtx.lineTo(285,105);
    raceCtx.lineTo(405,620); raceCtx.lineTo(15,620);
    raceCtx.closePath();
    const road=raceCtx.createLinearGradient(0,0,420,0);
    road.addColorStop(0,'#1c202a'); road.addColorStop(.5,'#303440'); road.addColorStop(1,'#1a1e28');
    raceCtx.fillStyle=road; raceCtx.fill();

    // edge strips
    raceCtx.lineWidth=6;
    raceCtx.strokeStyle='#d9dde8';
    raceCtx.beginPath(); raceCtx.moveTo(135,105); raceCtx.lineTo(15,620); raceCtx.moveTo(285,105); raceCtx.lineTo(405,620); raceCtx.stroke();

    // red/white kerbs
    for(let y=-80;y<650;y+=42){
        const yy=(y+race.roadOffset*2.2)%730-80;
        const t=Math.max(0,Math.min(1,(yy-100)/520));
        const b=roadBounds(Math.max(100,yy));
        const stripe=11+17*t;
        raceCtx.fillStyle='#ff3f5f';
        raceCtx.fillRect(b.left-stripe,yy, stripe, 18+14*t);
        raceCtx.fillRect(b.right,yy, stripe, 18+14*t);
    }

    // lane markings with perspective
    for(let lane=1;lane<3;lane++){
        for(let y=-30;y<650;y+=75){
            const yy=(y+race.roadOffset*1.8)%720-70;
            const t=Math.max(.03,Math.min(1,(yy-100)/520));
            const b=roadBounds(Math.max(100,yy));
            const x=b.left+(b.right-b.left)*lane/3;
            raceCtx.fillStyle='#e8ebf4cc';
            raceCtx.fillRect(x-2,yy,4,12+24*t);
        }
    }

    // speed streaks
    raceCtx.globalAlpha=.16;
    for(let i=0;i<12;i++){
        const x=(i*67+race.roadOffset*1.5)%420;
        raceCtx.fillStyle='#ffffff';
        raceCtx.fillRect(x,150+(i*53)%360,1,18);
    }
    raceCtx.globalAlpha=1;
}

function spawnEnemy(){
    const y=90;
    const b=roadBounds(430);
    const lane=Math.floor(Math.random()*3);
    const x=b.left+(b.right-b.left)*(lane+.5)/3;
    race.enemies.push({
        x,y, lane, color:carColors[Math.floor(Math.random()*carColors.length)],
        speed:0.82+Math.random()*.28, scale:.52, passed:false
    });
}

function raceLoop(time){
    if(!race || !race.running) return;
    const dt=race.lastTime ? Math.min(2.2,(time-race.lastTime)/16.67):1;
    race.lastTime=time;

    race.speed=Math.min(15,5+race.score/180);
    race.roadOffset+=race.speed*dt*2.5;
    race.spawnTimer-=16.67*dt;

    drawRoad();

    if(race.spawnTimer<=0){
        spawnEnemy();
        race.spawnTimer=Math.max(380,820-race.score*1.8)+Math.random()*260;
    }

    for(const e of race.enemies){
        e.y += race.speed*dt*(1.05+e.speed*.35);
        const t=Math.max(0,Math.min(1,(e.y-100)/520));
        e.scale=.52+.55*t;
        const b=roadBounds(e.y);
        const laneWidth=(b.right-b.left)/3;
        e.x=b.left+laneWidth*(e.lane+.5);

        drawCar(raceCtx,e.x,e.y,e.color,e.scale,false);

        if(!e.passed && e.y>race.playerY+70){
            e.passed=true;
            race.score+=12;
            race.bestNearMiss++;
        }
    }

    race.enemies=race.enemies.filter(e=>e.y<700);

    // player follows target with acceleration instead of teleporting
    const dx=race.targetX-race.playerX;
    race.steer += dx*.018*dt;
    race.steer *= Math.pow(.72,dt);
    race.playerX += race.steer*dt;
    const pb=roadBounds(race.playerY+55);
    race.playerX=Math.max(pb.left+27,Math.min(pb.right-27,race.playerX));

    drawCar(raceCtx,race.playerX,race.playerY,'#33e0ff',1,true);

    // precise circle-ish hitbox
    for(const e of race.enemies){
        const ex=e.x, ey=e.y+36;
        const px=race.playerX, py=race.playerY+36;
        const dist=Math.hypot(ex-px,ey-py);
        if(dist < 45*e.scale + 31){
            finishRace();
            return;
        }
    }

    race.score+=.12*dt*(1+race.speed/12);
    document.getElementById('raceScore').textContent=Math.floor(race.score);
    document.getElementById('raceSpeed').textContent=(race.speed/5).toFixed(1)+'x';

    requestAnimationFrame(raceLoop);
}

function finishRace(){
    race.running=false;
    const score=Math.floor(race.score);
    records.race=Math.max(records.race,score);
    saveRecords();
    document.getElementById('overlayRaceText').textContent='Очки: '+score+' · Рекорд: '+records.race;
    document.getElementById('overlayRace').classList.add('show');
}

function setRaceTarget(clientX){
    if(!race) return;
    const rect=raceCanvas.getBoundingClientRect();
    const x=(clientX-rect.left)*420/rect.width;
    race.targetX=Math.max(70,Math.min(350,x));
}

raceCanvas.addEventListener('pointerdown',e=>{
    raceCanvas.setPointerCapture?.(e.pointerId);
    setRaceTarget(e.clientX);
});
raceCanvas.addEventListener('pointermove',e=>{
    if(e.pointerType==='mouse' && e.buttons!==1) return;
    setRaceTarget(e.clientX);
});
window.addEventListener('keydown',e=>{
    if(!race || !race.running) return;
    if(['ArrowLeft','a','A'].includes(e.key)){e.preventDefault(); race.targetX-=55;}
    if(['ArrowRight','d','D'].includes(e.key)){e.preventDefault(); race.targetX+=55;}
    race.targetX=Math.max(70,Math.min(350,race.targetX));
});

function nudgeRace(dir){
    if(!race || !race.running) return;
    race.targetX=Math.max(70,Math.min(350,race.targetX+dir*55));
}
document.getElementById('raceLeft')?.addEventListener('pointerdown',()=>nudgeRace(-1));
document.getElementById('raceRight')?.addEventListener('pointerdown',()=>nudgeRace(1));

/* =========================================================
   CASINO
========================================================= */
let coins = Number(localStorage.getItem('arcadeCoins') || 1000);

function saveCoins(){
    localStorage.setItem('arcadeCoins', coins);
    updateBalance();
}

function updateBalance(){
    document.getElementById('balance').innerHTML =
        '<i class="fa-solid fa-coins"></i> ' + coins.toLocaleString('ru-RU');
}

const slotSymbols = [
    { key: 'cherry', html: '<span class="cherry"><i class="fa-solid fa-heart"></i></span>' },
    { key: 'star', html: '<i class="fa-solid fa-star" style="color:var(--gold)"></i>' },
    { key: 'bell', html: '<i class="fa-solid fa-bell"></i>' },
    { key: 'seven', html: '<span class="seven">7</span>' },
    { key: 'gem', html: '<i class="fa-solid fa-gem"></i>' },
    { key: 'clover', html: '<i class="fa-solid fa-clover"></i>' }
];

function randomSlot(){
    return slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
}

function casinoTab(type, button){
    document.querySelectorAll('.casino-tabs button').forEach(b => b.classList.remove('active'));
    button.classList.add('active');

    let html = '';

    if (type === 'slots'){
        html = `
            <div class="center">
                <div class="reels">
                    <div class="reel" id="reel1">${slotSymbols[0].html}</div>
                    <div class="reel" id="reel2">${slotSymbols[3].html}</div>
                    <div class="reel" id="reel3">${slotSymbols[4].html}</div>
                </div>
                <div id="slotResult" class="result-text">Ставка: 25 монет</div>
                <button class="btn btn-primary" onclick="spinSlots()"><i class="fa-solid fa-dice"></i> Крутить · 25</button>
            </div>
        `;
    }

    if (type === 'dice'){
        html = `
            <div class="center">
                <div class="dice-area">
                    <div class="dice" id="dice"><i class="fa-solid fa-dice-six"></i></div>
                </div>
                <div class="result-text" id="diceResult">Кубик готов к броску.</div>
                <button class="btn btn-primary" onclick="rollDice()"><i class="fa-solid fa-dice"></i> Бросить · 20</button>
            </div>
        `;
    }

    if (type === 'coin'){
        html = `
            <div class="center">
                <div class="coin-face" id="coinResult">О</div>
                <div class="result-text" id="coinText">Выбери сторону.</div>
                <div class="btn-row">
                    <button class="btn btn-primary" onclick="flipCoin('Орёл')">Орёл · 20</button>
                    <button class="btn btn-primary" onclick="flipCoin('Решка')">Решка · 20</button>
                </div>
            </div>
        `;
    }

    document.getElementById('casinoContent').innerHTML = html;
    updateBalance();
}

function spinSlots(){
    if (coins < 25){ alert('Недостаточно виртуальных монет.'); return; }
    coins -= 25;
    saveCoins();

    const reels = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];
    reels.forEach(r => r.classList.add('spinning'));

    const timers = [1000, 1500, 2000];
    const results = [];

    reels.forEach((reel, i) => {
        const interval = setInterval(() => { reel.innerHTML = randomSlot().html; }, 75);

        setTimeout(() => {
            clearInterval(interval);
            const result = randomSlot();
            reel.innerHTML = result.html;
            reel.classList.remove('spinning');
            results[i] = result.key;
            if (i === 2) finishSlots(results);
        }, timers[i]);
    });
}

function finishSlots(results){
    let win = 0;

    if (results[0] === results[1] && results[1] === results[2]){
        if (results[0] === 'gem') win = 500;
        else if (results[0] === 'seven') win = 350;
        else win = 250;
    } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]){
        win = 50;
    }

    coins += win;
    document.getElementById('slotResult').textContent = win ? '🎉 Выигрыш +' + win + ' монет!' : 'Повезёт в следующий раз.';
    saveCoins();
}

function rollDice(){
    if (coins < 20){ alert('Недостаточно виртуальных монет.'); return; }
    coins -= 20;
    saveCoins();

    const dice = document.getElementById('dice');
    const result = Math.floor(Math.random() * 6) + 1;
    const faceIcons = ['', 'fa-dice-one', 'fa-dice-two', 'fa-dice-three', 'fa-dice-four', 'fa-dice-five', 'fa-dice-six'];

    dice.classList.remove('falling');
    void dice.offsetWidth;
    dice.innerHTML = '<i class="fa-solid fa-dice-six"></i>';
    dice.classList.add('falling');

    setTimeout(() => {
        dice.innerHTML = `<i class="fa-solid ${faceIcons[result]}"></i>`;
        let win = 0;

        if (result >= 4){
            win = 40;
            coins += win;
        }

        document.getElementById('diceResult').textContent =
            win ? '🎉 Выпало ' + result + '! +' + win + ' монет.' : 'Выпало ' + result + '. Попробуй ещё.';
        saveCoins();
    }, 1700);
}

function flipCoin(choice){
    if (coins < 20){ alert('Недостаточно виртуальных монет.'); return; }
    coins -= 20;

    const result = Math.random() < 0.5 ? 'Орёл' : 'Решка';
    const element = document.getElementById('coinResult');
    element.style.transform = 'rotateY(720deg)';

    setTimeout(() => {
        element.textContent = result === 'Орёл' ? 'О' : 'Р';
        element.style.transform = '';

        if (choice === result){
            coins += 40;
            document.getElementById('coinText').textContent = '🎉 Угадал! +40 монет.';
        } else {
            document.getElementById('coinText').textContent = 'Выпало: ' + result;
        }

        saveCoins();
    }, 700);
}

/* =========================================================
   CONTACT LINKS
========================================================= */
const instaUser = '1_x_k_s_k_o_s_t_y_a';
const tgUser = 'Help_Verif';

document.getElementById('instaLink').href = 'https://www.instagram.com/' + instaUser + '/';
document.getElementById('tgLink').href = 'https://t.me/' + tgUser;

/* =========================================================
   RESET
========================================================= */
function resetAll(){
    if (confirm('Точно удалить все рекорды и монеты?')){
        localStorage.clear();
        location.reload();
    }
}

/* =========================================================
   START
========================================================= */
updateBalance();
casinoTab('slots', document.querySelector('.casino-tabs button'));
