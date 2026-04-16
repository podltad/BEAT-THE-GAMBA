const sfx = {
    shoot: new Audio('shoot.mp3'),
    click: new Audio('click.mp3'),
    hit: new Audio('hit.mp3'),   
    win: new Audio('win.mp3'),   
    lose: new Audio('lose.mp3')  
};

const bgMusic = new Audio('casino_music.mp3');
bgMusic.loop = true;

let musicVolume = 0.5;
let sfxVolume = 0.7;

function updateVolumes() {
    bgMusic.volume = musicVolume;
}

document.getElementById('music-slider').addEventListener('input', (e) => {
    musicVolume = e.target.value / 100;
    updateVolumes();
});
document.getElementById('sound-slider').addEventListener('input', (e) => {
    sfxVolume = e.target.value / 100;
});
updateVolumes(); // Nastavení výchozí hlasitosti při načtení

function playSound(name) {
    // Zablokuje všechny zvuky kromě výhry/prohry, pokud jsme na 0 životech nebo je konec
    if ((lives <= 0 || isGameOver) && name !== 'win' && name !== 'lose') {
        return; 
    }

    if (sfx[name] && sfxVolume > 0) {
        let soundClone = sfx[name].cloneNode();
        soundClone.volume = sfxVolume;
        soundClone.play().catch(e => {}); 
    }
}

// Spuštění hudby při první interakci s oknem
let musicStarted = false;
window.addEventListener('click', () => {
    if (!musicStarted && !isGameOver) {
        bgMusic.play().catch(e => {});
        musicStarted = true;
    }
});

// --- PŮVODNÍ KÓD HRY ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const tooltip = document.getElementById("tooltip");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const finalWaveSpan = document.getElementById("final-wave");

const MAX_WAVES = 4; 
const START_MONEY = 260;
const START_LIVES = 20;

let money = START_MONEY;
let lives = START_LIVES;
let wave = 1;
let frame = 0;
let isGameOver = false;

let selectedTowerType = null; 
let mouseX = 0; let mouseY = 0;

let waveActive = false;
let waveTimer = 8 * 60;
let enemiesToSpawn = 0;
let spawnCooldown = 0;
let bossSpawned = false;
let bossesSpawnedCount = 0;

let isPaused = false;
let currentLang = 'cz';

const textPack = {
    cz: {
        money: "KREDITY: ", lives: "ŽIVOTY: ", map: "MAPA: PUSTINA",
        math: "Matematik", tax: "Exekutor", police: "Kriminálka", banker: "Bankéř", sell: "PRODAT",
        restart: "ZNOVU DO PUSTINY", finalWave: "DOSAŽENÁ VLNA: ",
        menuTitle: "NASTAVENÍ", menuLang: "JAZYK / LANGUAGE", menuMusic: "HUDBA / MUSIC", menuSounds: "ZVUKY / SOUNDS", menuBack: "ZPĚT DO HRY",
        price: "Cena:", inflation: "Inflace", clickSell: "KLIKNI PRO PRODEJ",
        mathDesc: "Rychlopalný kanón.", taxDesc: "Těžká artilerie.", policeDesc: "Zpomaluje cíl o 50%!", bankerDesc: "+15$ každých 5s.", sellDesc: "Vrátí 50% investice.",
        nextWave: "DALŠÍ VLNA:", win: "PUSTINA JE TVOJE!", lose: "GAMBA TĚ DOSTALA"
    },
    en: {
        money: "CREDITS: ", lives: "LIVES: ", map: "MAP: WASTELAND",
        math: "Math", tax: "Taxman", police: "Police", banker: "Banker", sell: "SELL",
        restart: "BACK TO THE WASTELAND", finalWave: "WAVES CLEARED: ",
        menuTitle: "SETTINGS", menuLang: "LANGUAGE", menuMusic: "MUSIC", menuSounds: "SOUNDS", menuBack: "RESUME GAME",
        price: "Price:", inflation: "Inflation", clickSell: "CLICK TO SELL",
        mathDesc: "Rapid-fire cannon.", taxDesc: "Heavy artillery.", policeDesc: "Slows target by 50%!", bankerDesc: "+15$ every 5s.", sellDesc: "Returns 50% investment.",
        nextWave: "NEXT WAVE:", win: "WASTELAND IS YOURS!", lose: "GAMBA GOT YOU"
    }
};

function toggleLanguage() {
    playSound('click'); // Zvuk kliknutí
    currentLang = currentLang === 'cz' ? 'en' : 'cz';
    updateUI();
}

function toggleMenu() {
    if (isGameOver) return;
    playSound('click'); // Zvuk kliknutí
    isPaused = !isPaused;
    document.getElementById("settings-menu").style.display = isPaused ? "flex" : "none";
    if (!isPaused) requestAnimationFrame(loop);
}

function updateUI() {
    const t = textPack[currentLang];
    document.getElementById("lbl-money").innerText = t.money;
    document.getElementById("lbl-lives").innerText = t.lives;
    document.getElementById("map-name").innerText = t.map;
    document.getElementById("restart-btn").innerText = t.restart;
    document.getElementById("lbl-final-wave").innerText = t.finalWave;
    
    document.getElementById("lbl-math").innerText = t.math;
    document.getElementById("lbl-tax").innerText = t.tax;
    document.getElementById("lbl-police").innerText = t.police;
    document.getElementById("lbl-banker").innerText = t.banker;
    document.getElementById("lbl-sell").innerText = t.sell;

    document.getElementById("menu-title").innerText = t.menuTitle;
    document.getElementById("label-lang").innerText = t.menuLang;
    document.getElementById("label-music").innerText = t.menuMusic;
    document.getElementById("label-sounds").innerText = t.menuSounds;
    document.getElementById("close-menu-btn").innerText = t.menuBack;

    if (isGameOver) {
        let winText = wave > MAX_WAVES || enemies.length === 0 && wave === MAX_WAVES && bossesSpawnedCount >= 3;
        overlayTitle.innerText = winText ? t.win : t.lose;
    }
}

// --- GENERUJÍCÍ POZADÍ ---
const bgCanvas = document.createElement('canvas');
bgCanvas.width = 800; bgCanvas.height = 550;
const bgCtx = bgCanvas.getContext('2d');

bgCtx.fillStyle = "#120f0f"; bgCtx.fillRect(0,0,800,550);

function drawHills(ctx, color, yOffset, spikes) {
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, 550); ctx.lineTo(0, yOffset);
    for (let x = 0; x <= 800; x += 20) { let h = Math.random() * spikes; ctx.lineTo(x, yOffset - h); }
    ctx.lineTo(800, 550); ctx.fill();
}
drawHills(bgCtx, "#1a1616", 100, 40);
drawHills(bgCtx, "#221e1e", 250, 20);

function drawDeadTree(ctx, x, y) {
    ctx.strokeStyle = "#080808"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 30 - Math.random() * 20); 
    let branchH = y - 20; ctx.moveTo(x, branchH); ctx.lineTo(x - 15, branchH - 15);
    ctx.moveTo(x, branchH - 10); ctx.lineTo(x + 10, branchH - 20); ctx.stroke();
}

let placedTrees = [];
for(let i=0; i<100; i++) { 
    if(placedTrees.length >= 15) break; 
    let x = Math.random() * 760 + 20;
    let y = Math.random() * 200 + 330; 
    let overlap = false;
    for(let t of placedTrees) { if(Math.hypot(t.x - x, t.y - y) < 60) { overlap = true; break; } }
    if(!overlap) { placedTrees.push({x, y}); drawDeadTree(bgCtx, x, y); }
}

for(let i=0; i<8000; i++) {
    bgCtx.fillStyle = Math.random() < 0.5 ? "rgba(60,50,40,0.08)" : "rgba(0,0,0,0.2)";
    bgCtx.fillRect(Math.random()*800, Math.random()*550, 2, 2);
}

// PŮVODNÍ CESTA
const path = [
    {x: -50, y: 275}, {x: 150, y: 275}, {x: 150, y: 100}, {x: 450, y: 100}, {x: 450, y: 450}, {x: 700, y: 450}, {x: 700, y: -50}
];

const TOWER_DATA = {
    math: { name: "Matematik", basePrice: 130, dmg: 35, cooldown: 20, speed: "Rychlá", range: 140, desc: "Rychlopalný kanón.", color: "#3a6ea5" },
    tax: { name: "Exekutor", basePrice: 200, dmg: 100, cooldown: 80, speed: "Pomalá", range: 220, desc: "Těžká artilerie.", color: "#a53a3a" },
    police: { name: "Kriminálka", basePrice: 220, dmg: 30, cooldown: 90, speed: "Střední", range: 160, desc: "Zpomaluje cíl o 50%!", color: "#3aa55a" },
    banker: { name: "Bankéř", basePrice: 300, dmg: 0, cooldown: 0, speed: "Pasivní", range: 0, desc: "+15$ každých 5s.", color: "#c0a030" },
    sell: { name: "ODSTRANIT", basePrice: 0, dmg: 0, cooldown: 0, speed: "-", range: 0, desc: "Vrátí 50% investice.", color: "#999" }
};

const ENEMY_TYPES = [
    { name: 'Slot', hp: 100, speed: 1.2, reward: 15, draw: (c, s) => { 
        c.fillStyle="#444"; c.fillRect(-s*0.5,-s*0.7,s,s*1.4); c.strokeStyle="#222"; c.lineWidth=2; c.strokeRect(-s*0.5,-s*0.7,s,s*1.4);
        c.fillStyle="#7a3a3a"; c.fillRect(-s*0.4,-s*0.6,s*0.8,s*0.2); 
        c.fillStyle="#eee"; c.fillRect(-s*0.35,-s*0.2,s*0.2,s*0.3); c.fillRect(-s*0.1,-s*0.2,s*0.2,s*0.3); c.fillRect(s*0.15,-s*0.2,s*0.2,s*0.3);
        c.fillStyle="#c00"; c.beginPath(); c.arc(-s*0.25,-s*0.05,s*0.05,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(0,-s*0.05,s*0.05,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(s*0.25,-s*0.05,s*0.05,0,Math.PI*2); c.fill();
        c.strokeStyle="#888"; c.lineWidth=4; c.beginPath(); c.moveTo(s*0.5,-s*0.3); c.lineTo(s*0.8,-s*0.3); c.stroke(); c.fillStyle="#c00"; c.beginPath(); c.arc(s*0.8,-s*0.3,s*0.15,0,Math.PI*2); c.fill();
    }},
    { name: 'Roulette', hp: 60, speed: 2.5, reward: 20, draw: (c, s) => { 
        let r=s*0.6; c.fillStyle="#8a6a3a"; c.beginPath(); c.arc(0,0,r,0,Math.PI*2); c.fill(); c.strokeStyle="#5a3a1a"; c.lineWidth=3; c.stroke();
        let innerR=r*0.8; c.fillStyle="#a00"; c.beginPath(); c.moveTo(0,0); c.arc(0,0,innerR,0,Math.PI/2); c.fill(); c.fillStyle="#111"; c.beginPath(); c.moveTo(0,0); c.arc(0,0,innerR,Math.PI/2,Math.PI); c.fill();
        c.fillStyle="#a00"; c.beginPath(); c.moveTo(0,0); c.arc(0,0,innerR,Math.PI,Math.PI*1.5); c.fill(); c.fillStyle="#0a0"; c.beginPath(); c.moveTo(0,0); c.arc(0,0,innerR,Math.PI*1.5,Math.PI*2); c.fill();
        c.fillStyle="#d4af37"; c.beginPath(); c.arc(0,0,r*0.3,0,Math.PI*2); c.fill(); c.strokeStyle="#b48f17"; c.lineWidth=2; c.stroke();
    }},
    { name: 'Poker', hp: 350, speed: 0.7, reward: 50, draw: (c, s) => { 
        c.fillStyle="#eee"; c.fillRect(-s*0.5,-s*0.7,s,s*1.4); c.strokeStyle="#111"; c.lineWidth=2; c.strokeRect(-s*0.5,-s*0.7,s,s*1.4);
        c.fillStyle="#111"; c.beginPath(); c.moveTo(0,-s*0.3); c.bezierCurveTo(s*0.3,-s*0.1,s*0.3,s*0.2,0,s*0.3); c.bezierCurveTo(-s*0.3,s*0.2,-s*0.3,-s*0.1,0,-s*0.3); c.fill();
        c.fillRect(-s*0.05,s*0.2,s*0.1,s*0.15); c.font="bold "+(s*0.3)+"px Courier"; c.fillStyle="#111"; c.fillText("A",-s*0.4,-s*0.4);
    }},
    { name: 'Dice', hp: 40, speed: 1.8, reward: 10, draw: (c, s) => { 
        let dSize=s*0.7; c.fillStyle="#ddd"; c.fillRect(-dSize/2,-dSize/2,dSize,dSize);
        c.fillStyle="#fff"; c.fillRect(-dSize/2,-dSize/2,dSize,dSize*0.1); c.fillRect(-dSize/2,-dSize/2,dSize*0.1,dSize);
        c.fillStyle="#999"; c.fillRect(-dSize/2,dSize/2-dSize*0.1,dSize,dSize*0.1); c.fillRect(dSize/2-dSize*0.1,-dSize/2,dSize*0.1,dSize);
        c.fillStyle="#111"; let pip=dSize*0.15; c.beginPath(); c.arc(0,0,pip,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(-dSize*0.25,-dSize*0.25,pip,0,Math.PI*2); c.fill();
        c.beginPath(); c.arc(dSize*0.25,-dSize*0.25,pip,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(-dSize*0.25,dSize*0.25,pip,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(dSize*0.25,dSize*0.25,pip,0,Math.PI*2); c.fill();
    }}
];

const BOSS_TYPE = { 
    name: 'GAMBA KING', 
    hp: 0, 
    speed: 0.9, 
    reward: 500, 
    draw: (c, s) => {
        c.scale(0.7, 0.7); 
        c.fillStyle = "#b59121"; c.fillRect(-40, -50, 80, 110); c.strokeStyle = "#684f12"; c.lineWidth = 4; c.strokeRect(-40, -50, 80, 110);
        c.fillStyle = "#c00"; c.beginPath(); c.arc(0, -65, 15, 0, Math.PI*2); c.fill(); c.strokeStyle = "#500"; c.lineWidth = 2; c.stroke();
        c.fillStyle = "#222"; c.fillRect(-35, -40, 70, 55); c.strokeStyle = "#000"; c.lineWidth = 2; c.strokeRect(-35, -40, 70, 55);
        c.fillStyle = "#eee"; c.strokeStyle = "#555"; c.lineWidth = 1;
        c.fillRect(-30, -35, 18, 45); c.strokeRect(-30, -35, 18, 45); c.fillRect(-9, -35, 18, 45); c.strokeRect(-9, -35, 18, 45); c.fillRect(12, -35, 18, 45); c.strokeRect(12, -35, 18, 45);
        c.fillStyle = "#d00"; c.beginPath(); c.arc(-21, -12, 6, 0, Math.PI*2); c.fill(); c.beginPath(); c.arc(0, -12, 6, 0, Math.PI*2); c.fill(); c.beginPath(); c.arc(21, -12, 6, 0, Math.PI*2); c.fill();
        c.fillStyle = "#111"; c.fillRect(-35, 25, 70, 25); c.fillStyle = "gold"; c.font = "bold 16px Courier"; c.textAlign = "center"; c.shadowColor = "black"; c.shadowBlur = 4; c.fillText("JACKPOT", 0, 43); c.shadowBlur = 0; c.textAlign = "start";
        c.fillStyle = "#666"; c.fillRect(40, 0, 15, 30); c.strokeStyle = "#333"; c.strokeRect(40, 0, 15, 30);
        c.strokeStyle = "#aaa"; c.lineWidth = 6; c.lineCap = "round"; c.beginPath(); c.moveTo(48, 15); c.lineTo(75, -35); c.stroke();
        c.fillStyle = "#e00"; c.beginPath(); c.arc(75, -35, 14, 0, Math.PI*2); c.fill(); c.fillStyle = "#fff"; c.beginPath(); c.arc(70, -40, 5, 0, Math.PI*2); c.fill(); c.strokeStyle = "#700"; c.lineWidth = 2; c.beginPath(); c.arc(75, -35, 14, 0, Math.PI*2); c.stroke();
    }
};

let enemies = []; let towers = []; let bullets = [];

function getInflationMultiplier() {
    const increases = Math.floor((wave - 1) / 3);
    return 1 + (increases * 0.15);
}

function getPrice(type) {
    if (type === 'sell') return 0;
    const base = TOWER_DATA[type].basePrice;
    return Math.floor(base * getInflationMultiplier());
}

function restartGame() {
    playSound('click'); // Zvuk kliknutí na restart
    
    // ZDE JE ZMĚNA: Po restartu se hudba vrátí na začátek a pustí se
    if (musicStarted) {
        bgMusic.currentTime = 0; 
        bgMusic.play().catch(e=>{});
    }

    money = START_MONEY; lives = START_LIVES; wave = 1; frame = 0;
    enemies = []; towers = []; bullets = [];
    isGameOver = false; isPaused = false; waveActive = false; waveTimer = 8 * 60; 
    bossSpawned = false; bossesSpawnedCount = 0;
    
    selectedTowerType = null;
    document.querySelectorAll('.tower-slot').forEach(s => s.classList.remove('active'));

    overlay.style.display = "none";
    updateWaveUI(); loop();
}

function triggerGameOver(win) {
    isGameOver = true; 
    overlay.style.display = "flex"; 
    
    // ZDE JE ZMĚNA: Hudba se zastaví, aby byl slyšet zvuk konce hry
    bgMusic.pause();
    
    if (win) { playSound('win'); } else { playSound('lose'); }

    let displayWave = wave;
    if (win) displayWave = MAX_WAVES; 
    finalWaveSpan.innerText = displayWave + " / " + MAX_WAVES;
    
    if (win) { overlayTitle.innerText = textPack[currentLang].win; overlayTitle.style.color = "#4CAF50"; }
    else { overlayTitle.innerText = textPack[currentLang].lose; overlayTitle.style.color = "#cc3333"; }
}

function getDistToSegment(x, y, x1, y1, x2, y2) {
    const A = x - x1; const B = y - y1; const C = x2 - x1; const D = y2 - y1;
    const dot = A * C + B * D; const lenSq = C * C + D * D;
    let param = -1; if (lenSq !== 0) param = dot / lenSq;
    let xx, yy; if (param < 0) { xx = x1; yy = y1; } else if (param > 1) { xx = x2; yy = y2; } else { xx = x1 + param * C; yy = y1 + param * D; }
    const dx = x - xx; const dy = y - yy; return Math.sqrt(dx * dx + dy * dy);
}

function canBuild(x, y) {
    if (selectedTowerType === 'sell' || !selectedTowerType) return false;
    if (x < 30 || x > 770 || y < 30 || y > 520) return false;
    for (let t of towers) { if (Math.hypot(t.x - x, t.y - y) < 40) return false; } 
    const safeDistance = 55;
    for (let i = 0; i < path.length - 1; i++) {
        let d = getDistToSegment(x, y, path[i].x, path[i].y, path[i+1].x, path[i+1].y);
        if (d < safeDistance) return false;
    }
    return true;
}

function showTip(type) {
    const d = TOWER_DATA[type];
    const currentPrice = getPrice(type);
    const inflation = Math.round((getInflationMultiplier() - 1) * 100);
    tooltip.style.display = "block";
    
    const t = textPack[currentLang]; 

    let html = `<b style="color:${d.color}; font-size:14px;">${t[type]}</b><br>`;
    
    if (type !== 'sell') {
        html += `<span style="color:#888">${t.price}</span> ${currentPrice}$`;
        if (inflation > 0) html += ` <span class="inflation-text">(+${inflation}% ${t.inflation})</span>`;
        html += `<br>`;
    } else { 
        html += `<span style="color:#ccaa00">${t.clickSell}</span><br>`; 
    }
    
    if (d.dmg > 0 && d.cooldown > 0) {
        const dps = Math.round(d.dmg * (60 / d.cooldown));
        html += `<span class="dps-text">DPS: ${dps}</span><br>`;
        html += `Dmg: ${d.dmg}<br>`;
    } else if (d.dmg > 0) {
        html += `Dmg: ${d.dmg}<br>`;
    }

    html += `<i style="color:#aaa">${t[type+'Desc']}</i>`;
    tooltip.innerHTML = html;
}

function hideTip() { tooltip.style.display = "none"; }

window.onmousemove = (e) => {
    if (tooltip.style.display === "block") {
        tooltip.style.left = e.pageX + 15 + "px"; tooltip.style.top = e.pageY + 15 + "px";
    }
    const r = canvas.getBoundingClientRect(); mouseX = e.clientX - r.left; mouseY = e.clientY - r.top;
};

function selectTower(type, el) {
    playSound('click'); // Zvuk kliknutí na věž
    if (selectedTowerType === type) {
        selectedTowerType = null;
        el.classList.remove('active');
    } else {
        selectedTowerType = type;
        document.querySelectorAll('.tower-slot').forEach(s => s.classList.remove('active'));
        el.classList.add('active');
    }
}

function updateWaveUI() {
    const boxes = [
        document.getElementById("wave-curr"),
        document.getElementById("wave-next1"),
        document.getElementById("wave-next2")
    ];
    
    let displayWaves = [];
    let activeIndex = 0;

    // Zjistíme, od které vlny má UI zamrznout (jednu vlnu před posledním bossem)
    const lockWave = MAX_WAVES - 1;

    if (wave < lockWave) {
        // Normální posouvání dlaždic
        displayWaves = [wave, wave + 1, wave + 2];
        activeIndex = 0;
    } else {
        // Konec hry - dlaždice stojí, hýbe se jen žlutý rámeček
        displayWaves = [lockWave, MAX_WAVES, MAX_WAVES + 1];
        
        if (wave === lockWave) {
            activeIndex = 0;
        } else if (wave === MAX_WAVES) {
            activeIndex = 1; // Rámeček přejde na Lebku
        } else {
            activeIndex = 2; // Rámeček přejde na Pohár
        }
    }

    boxes.forEach((el, i) => {
        let wNum = displayWaves[i];
        
        // Resetujeme CSS třídy
        el.className = "wave-box"; 
        
        // Přidáme žlutý rámeček aktivní vlně
        if (i === activeIndex) el.classList.add("current");

        // Vykreslení ikon
        if (wNum > MAX_WAVES) { 
             el.innerHTML = "🏆"; 
             el.classList.add("trophy"); 
        } else if (wNum === MAX_WAVES || wNum % 5 === 0) { 
            el.innerHTML = "💀"; 
            el.classList.add("boss"); 
        } else {
            el.innerHTML = wNum; 
        }
    });
}

class Tower {
    constructor(x, y, type, pricePaid) {
        this.x = x; this.y = y; this.type = type;
        this.data = TOWER_DATA[type];
        this.pricePaid = pricePaid; 
        this.cd = 0; this.moneyTimer = 0;
        this.angle = 0;
    }
    draw() {
        ctx.fillStyle = "#111"; ctx.fillRect(this.x - 18, this.y - 18, 36, 36);
        ctx.fillStyle = this.data.color; ctx.fillRect(this.x - 16, this.y - 16, 32, 32);
        ctx.strokeStyle = "#222"; ctx.lineWidth = 2; ctx.strokeRect(this.x - 16, this.y - 16, 32, 32);
        if (this.type === 'banker') {
            ctx.fillStyle = "#111"; ctx.font="bold 20px Courier"; ctx.fillText("$", this.x-6, this.y+7); return;
        }
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.angle);
        ctx.fillStyle = "#1a1a1a"; ctx.fillRect(0, -4, 24, 8); 
        ctx.strokeStyle = this.data.color; ctx.lineWidth = 1; ctx.strokeRect(0, -4, 24, 8);
        ctx.fillStyle = this.data.color; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = "#111"; ctx.stroke(); ctx.restore();
    }
    update() {
        if (this.type === 'banker') {
            this.moneyTimer++;
            if (this.moneyTimer >= 300) { money += 15; this.moneyTimer = 0; }
            return;
        }
        if (this.cd > 0) this.cd--;
        let target = enemies.find(e => Math.hypot(e.x - this.x, e.y - this.y) < this.data.range);
        if (target) {
            this.angle = Math.atan2(target.y - this.y, target.x - this.x);
            if (this.cd <= 0) {
                playSound('shoot'); // Zvuk střelby
                bullets.push({x: this.x, y: this.y, tx: target.x, ty: target.y, life: 5, color: this.data.color});
                target.hp -= this.data.dmg;
                if (this.type === 'police') target.slowed = 120; 
                this.cd = this.data.cooldown;
            }
        }
    }
}

class Enemy {
    constructor(isBoss = false) {
        let t = isBoss ? BOSS_TYPE : ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
        this.tData = t; this.x = path[0].x; this.y = path[0].y; this.tIdx = 1; this.isBoss = isBoss;
        
        if (isBoss) { 
            if (wave === 5) {
                this.hp = 8000;
            } else {
                this.hp = 10000 + (wave * 800);
            }
            this.baseSpeed = t.speed; 
        } else { 
            this.hp = t.hp + (wave * 50); 
            this.baseSpeed = t.speed + (wave * 0.08); 
        }
        this.maxHp = this.hp; this.slowed = 0;
    }
    update() {
        let currentSpeed = this.slowed > 0 ? this.baseSpeed * 0.5 : this.baseSpeed;
        if (this.slowed > 0) this.slowed--;
        let target = path[this.tIdx];
        let dx = target.x - this.x; let dy = target.y - this.y;
        let dist = Math.hypot(dx, dy);
        
        if (dist < currentSpeed) {
            this.tIdx++; 
            if (this.tIdx >= path.length) { 
                lives -= (this.isBoss ? 5 : 1); 
                this.hp = 0; 
                if (lives > 0) {
                    playSound('hit');
                }
            }
        } else {
            this.x += (dx/dist)*currentSpeed; this.y += (dy/dist)*currentSpeed;
        }
    }
    draw() {
        ctx.save(); ctx.translate(this.x, this.y);
        let size = this.isBoss ? 50 : 30;
        this.tData.draw(ctx, size);
        ctx.restore();
        
        let barWidth = this.isBoss ? 60 : 30;
        ctx.fillStyle = "#220000"; ctx.fillRect(this.x - barWidth/2, this.y - 38, barWidth, 6);
        ctx.fillStyle = this.isBoss ? "#8a3a3a" : "#3aa55a"; 
        ctx.fillRect(this.x - barWidth/2, this.y - 38, barWidth * (this.hp/this.maxHp), 6);
    }
}

canvas.addEventListener("click", () => {
    if (isGameOver || isPaused || !selectedTowerType) return; 

    if (selectedTowerType === 'sell') {
        for (let i = 0; i < towers.length; i++) {
            let t = towers[i];
            if (Math.hypot(t.x - mouseX, t.y - mouseY) < 25) {
                let refund = Math.floor(t.pricePaid / 2);
                money += refund; towers.splice(i, 1); break; 
            }
        }
    } else {
        const currentPrice = getPrice(selectedTowerType);
        if (money >= currentPrice && canBuild(mouseX, mouseY)) {
            towers.push(new Tower(mouseX, mouseY, selectedTowerType, currentPrice));
            money -= currentPrice;
        }
    }
});

function loop() {
    if (isGameOver || isPaused) return;

    ctx.drawImage(bgCanvas, 0, 0);
    
    ctx.strokeStyle = "#0a0a0a"; ctx.lineWidth = 62; ctx.lineJoin = "round"; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(path[0].x, path[0].y); path.forEach(p => ctx.lineTo(p.x, p.y)); ctx.stroke();
    ctx.strokeStyle = "#222"; ctx.lineWidth = 48; ctx.stroke();
    ctx.strokeStyle = "#443a2a"; ctx.lineWidth = 2; ctx.setLineDash([20, 30]); ctx.stroke(); ctx.setLineDash([]);

    towers.forEach(t => { t.update(); t.draw(); });
    enemies.forEach((e, i) => { e.update(); e.draw(); if(e.hp <= 0) { if(e.tIdx < path.length) money += e.tData.reward; enemies.splice(i, 1); }});
    bullets.forEach((b, i) => { ctx.strokeStyle = b.color; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.tx, b.ty); ctx.stroke(); b.life--; if(b.life <= 0) bullets.splice(i, 1); });

    if (selectedTowerType) {
        if (selectedTowerType !== 'sell') {
            const currentPrice = getPrice(selectedTowerType);
            const isValid = canBuild(mouseX, mouseY);
            const color = isValid ? (money >= currentPrice ? "rgba(0, 255, 0, 0.5)" : "rgba(255, 50, 50, 0.5)") : "rgba(255, 0, 0, 0.5)";
            ctx.fillStyle = color; ctx.fillRect(mouseX - 16, mouseY - 16, 32, 32);
            if (selectedTowerType !== 'banker') {
                const range = TOWER_DATA[selectedTowerType].range;
                ctx.beginPath(); ctx.arc(mouseX, mouseY, range, 0, Math.PI*2);
                ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.setLineDash([5, 5]); ctx.stroke(); ctx.setLineDash([]);
            }
        } else {
            let h = towers.find(t => Math.hypot(t.x - mouseX, t.y - mouseY) < 25);
            if (h) {
                ctx.strokeStyle = "#ff3333"; ctx.lineWidth = 3; ctx.strokeRect(h.x - 20, h.y - 20, 40, 40);
                let refund = Math.floor(h.pricePaid / 2);
                ctx.fillStyle = "#00ff00"; ctx.font = "bold 16px Courier"; ctx.shadowColor = "black"; ctx.shadowBlur = 4;
                ctx.fillText("+" + refund + "$", h.x - 20, h.y - 30); ctx.shadowBlur = 0;
            }
        }
    }

    if (!waveActive) {
        waveTimer--;
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)"; ctx.fillRect(250, 10, 300, 50);
        ctx.fillStyle = "#ccaa00"; ctx.font = "bold 24px Courier"; ctx.textAlign = "center";
        
        if (wave > MAX_WAVES) { 
            if (enemies.length === 0) triggerGameOver(true); 
        } else {
            ctx.fillText(`${textPack[currentLang].nextWave} ${Math.ceil(waveTimer/60)}`, 400, 43); ctx.textAlign = "start";
            if (waveTimer <= 0) { 
                waveActive = true; 
                bossSpawned = false; 
                bossesSpawnedCount = 0;
                enemiesToSpawn = 5 + wave * 2; 
                spawnCooldown = 0; 
                updateWaveUI();
            }
        }
    } else {
        if (wave === MAX_WAVES) {
            if (bossesSpawnedCount < 3) {
                spawnCooldown--;
                if (spawnCooldown <= 0) {
                    enemies.push(new Enemy(true)); 
                    bossesSpawnedCount++;
                    spawnCooldown = 100;
                }
            } else if (enemies.length === 0) {
                waveActive = false; wave++; waveTimer = 8 * 60; updateWaveUI();
            }
        } else {
            if (enemiesToSpawn > 0) {
                spawnCooldown--;
                if (spawnCooldown <= 0) { enemies.push(new Enemy(false)); enemiesToSpawn--; spawnCooldown = Math.max(20, 55 - wave * 2); }
            } else if (wave % 5 === 0 && !bossSpawned) {
                 spawnCooldown--;
                 if (spawnCooldown <= -60) { enemies.push(new Enemy(true)); bossSpawned = true; }
            } else if (enemies.length === 0) { waveActive = false; wave++; waveTimer = 8 * 60; updateWaveUI(); }
        }
    }

    document.getElementById("money").innerText = money;
    document.getElementById("lives").innerText = lives;
    
    // Volání game over kontrolujeme zde
    if (lives <= 0) { 
        triggerGameOver(false); 
    } else if (!isGameOver) { 
        frame++; 
        requestAnimationFrame(loop); 
    }
}

updateUI();
updateWaveUI();
loop();