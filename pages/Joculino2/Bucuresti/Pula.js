// Pula.js - extracted from Pula.html
// --- DEFINIREA NIVELELOR ---
const levels = [
    // PAGINA 1 (0-7)
    // Piața Romană - Coordonate verificate din fișierul tău
    { name: "Piața Romană", img: "romana.png", items: [{t: 'bottle', x: 56, y: 50}, {t: 'bottle', x: 61, y: 51}, {t: 'bottle', x: 62, y: 22}, {t: 'bottle', x: 94, y: 30}, {t: 'bottle', x: 76, y: 55}, {t: 'bottle', x: 93, y: 81}, {t: 'bottle', x: 71, y: 86}, {t: 'bottle', x: 59, y: 98}, {t: 'bottle', x: 43, y: 92}, {t: 'bottle', x: 40, y: 99}, {t: 'bottle', x: 35, y: 95}, {t: 'bottle', x: 29, y: 98}] },
    { name: "Piața Unirii", img: "unirii.png", items: [ {t: 'bottle', x: 71, y: 67}, {t: 'bottle', x: 84, y: 89}, {t: 'bottle', x: 40, y: 84}, {t: 'bottle', x: 48, y: 84}, {t: 'bottle', x: 7, y: 66}, {t: 'bottle', x: 74, y: 90} ] },
    { name: "Piața Obor", img: "obor.png", items: [{t: 'bottle', x: 48, y: 74}, {t: 'bottle', x: 30, y: 69}, {t: 'bottle', x: 11, y: 85}, {t: 'bottle', x: 82, y: 86}, {t: 'bottle', x: 89, y: 89}, {t: 'bottle', x: 94, y: 66}] },
    { name: "Timpuri Noi", img: "timpurinoi.png", items: [ {t:'bottle', x:88, y:91}, {t:'bottle', x:87, y:77}, {t:'bottle', x:68, y:85}, {t:'bottle', x:60, y:92}, {t:'bottle', x:54, y:89}, {t:'bottle', x:41, y:66}, {t:'bottle', x:51, y:65}, {t:'bottle', x:11, y:68} ] },
    { name: "Militari", img: "militari.png", items: [ {t: 'bottle', x: 62, y: 84}, {t: 'bottle', x: 79, y: 89}, {t: 'bottle', x: 90, y: 87}, {t: 'bottle', x: 19, y: 90}, {t: 'bottle', x: 39, y: 74}, {t: 'bottle', x: 9, y: 86} ] },
    { name: "Piața Sudului", img: "sudului.png", items: [ {t:'bottle', x:70, y:82}, {t:'bottle', x:79, y:92}, {t:'bottle', x:90, y:87}, {t:'bottle', x:49, y:84}, {t:'bottle', x:43, y:81}, {t:'bottle', x:18, y:76} ] },
    { name: "Arcul de Triumf", img: "arcul.png", items: [ {t: 'bottle', x: 52, y: 63}, {t: 'bottle', x: 48, y: 63}, {t: 'bottle', x: 33, y: 62}, {t: 'bottle', x: 79, y: 64}, {t: 'bottle', x: 75, y: 86}, {t: 'bottle', x: 19, y: 92} ] },
    // Nivel Secret
    { name: "Palatul Parlamentului", img: "parliament.png", isSecret: true, items: [{t: 'bottle', x: 63, y: 51}, {t: 'bottle', x: 51, y: 56}, {t: 'bottle', x: 54, y: 64}, {t: 'bottle', x: 97, y: 58}, {t: 'bottle', x: 21, y: 91}, {t: 'bottle', x: 69, y: 89}] },

    // PAGINA 2 (8-15) - Placeholders
    { name: "Centrul Vechi", img: "centruvechi.png", items: [ {t: 'bottle', x: 92, y: 86},{t: 'bottle', x: 91, y: 65},{t: 'bottle', x: 80, y: 75},{t: 'bottle', x: 69, y: 79},{t: 'bottle', x: 39, y: 75},{t: 'bottle', x: 31, y: 85},{t: 'bottle', x: 20, y: 63},{t: 'bottle', x: 12, y: 64}] },
    { name: "Parcul Cișmigiu", img: "parculcismigiu.png", items: [  {t: 'bottle', x: 56, y: 41},{t: 'bottle', x: 79, y: 75},{t: 'bottle', x: 41, y: 79},{t: 'bottle', x: 33, y: 69},{t: 'bottle', x: 25, y: 65},{t: 'bottle', x: 20, y: 55}] },
    { name: "Gara de Nord", img: "garadenord.png", items: [ {t: 'bottle', x: 79, y: 40}, {t: 'bottle', x: 71, y: 59}, {t: 'bottle', x: 93, y: 58}, {t: 'bottle', x: 91, y: 89}, {t: 'bottle', x: 83, y: 86}, {t: 'bottle', x: 74, y: 89}, {t: 'bottle', x: 75, y: 75}, {t: 'bottle', x: 65, y: 87}, {t: 'bottle', x: 53, y: 83}, {t: 'bottle', x: 33, y: 86}, {t: 'bottle', x: 8, y: 74}, {t: 'bottle', x: 51, y: 57}, {t: 'bottle', x: 62, y: 56}] },
    { name: "Arena Națională", img: "arenanationala.png", items: [   {t: 'bottle', x: 90, y: 72},{t: 'bottle', x: 81, y: 59},{t: 'bottle', x: 55, y: 56},{t: 'bottle', x: 60, y: 66},{t: 'bottle', x: 66, y: 72},{t: 'bottle', x: 44, y: 73},{t: 'bottle', x: 14, y: 82}] },
    { name: "Metrou ", img: "metrou.png", items: [  {t: 'bottle', x: 85, y: 84},{t: 'bottle', x: 60, y: 65},{t: 'bottle', x: 45, y: 59},{t: 'bottle', x: 23, y: 44}] },
    { name: "AFI Mall", img: "afimall.png", items: [ {t: 'bottle', x: 50, y: 86},{t: 'bottle', x: 66, y: 53},{t: 'bottle', x: 82, y: 45},{t: 'bottle', x: 69, y: 84},{t: 'bottle', x: 86, y: 89},{t: 'bottle', x: 9, y: 88}] },
    { name: "Politehnica", img: "politehnica.png", items: [   {t: 'bottle', x: 76, y: 74},{t: 'bottle', x: 96, y: 95},{t: 'bottle', x: 81, y: 89},{t: 'bottle', x: 69, y: 83},{t: 'bottle', x: 63, y: 81},{t: 'bottle', x: 46, y: 80},{t: 'bottle', x: 27, y: 82},{t: 'bottle', x: 19, y: 85},{t: 'bottle', x: 14, y: 88}] },
    { name: "La Becali", img: "labecali.png", items: [{t: 'bottle', x: 71, y: 93},{t: 'bottle', x: 81, y: 77},{t: 'bottle', x: 75, y: 69},{t: 'bottle', x: 72, y: 45},{t: 'bottle', x: 57, y: 45},{t: 'bottle', x: 94, y: 77},{t: 'bottle', x: 65, y: 77},{t: 'bottle', x: 40, y: 80},{t: 'bottle', x: 30, y: 83},{t: 'bottle', x: 20, y: 71}] },

    // PAGINA 3 (16-23) - Placeholders (editează după preferințe)
    { name: "Ateneul Roman", img: "ateneulroman.png", items: [{t: 'bottle', x: 60, y: 91},{t: 'bottle', x: 88, y: 73},{t: 'bottle', x: 33, y: 78},{t: 'bottle', x: 14, y: 69},{t: 'bottle', x: 24, y: 68}] },
    { name: "Parcul Carol", img: "parculcarol.png", items: [    {t: 'bottle', x: 67, y: 92},{t: 'bottle', x: 96, y: 80},{t: 'bottle', x: 62, y: 82},{t: 'bottle', x: 56, y: 80},{t: 'bottle', x: 28, y: 87},{t: 'bottle', x: 37, y: 76},{t: 'bottle', x: 7, y: 75}] },
    { name: "Intercontinental", img: "intercontinental.png", items: [ {t: 'bottle', x: 87, y: 97},{t: 'bottle', x: 63, y: 94},{t: 'bottle', x: 45, y: 93},{t: 'bottle', x: 40, y: 90},{t: 'bottle', x: 28, y: 97},{t: 'bottle', x: 16, y: 93}] },
    { name: "Teatrul National Bucuresti", img: "TNB.png", items: [{t: 'bottle', x: 85, y: 80},{t: 'bottle', x: 83, y: 50},{t: 'bottle', x: 80, y: 58},{t: 'bottle', x: 62, y: 71},{t: 'bottle', x: 71, y: 89},{t: 'bottle', x: 34, y: 86},{t: 'bottle', x: 23, y: 68}] },
    { name: "Biblioteca Nationala", img: "bibliotecanationala.png", items: [{t: 'bottle', x: 46, y: 92},{t: 'bottle', x: 33, y: 90},{t: 'bottle', x: 37, y: 71},{t: 'bottle', x: 11, y: 66},{t: 'bottle', x: 46, y: 83},{t: 'bottle', x: 57, y: 98}] },
    { name: "Parcul Herastrau", img: "herastrau.png", items: [{t: 'bottle', x: 79, y: 77},{t: 'bottle', x: 70, y: 86},{t: 'bottle', x: 55, y: 82},{t: 'bottle', x: 40, y: 74},{t: 'bottle', x: 33, y: 65},{t: 'bottle', x: 14, y: 67},{t: 'bottle', x: 10, y: 77},{t: 'bottle', x: 4, y: 74},{t: 'bottle', x: 5, y: 65}] },
    { name: "Gradina Japoneza", img: "gradinajaponeza.png", items: [{t: 'bottle', x: 61, y: 71},{t: 'bottle', x: 87, y: 68},{t: 'bottle', x: 71, y: 86},{t: 'bottle', x: 36, y: 89},{t: 'bottle', x: 37, y: 69},{t: 'bottle', x: 24, y: 78},{t: 'bottle', x: 12, y: 87},{t: 'bottle', x: 70, y: 71}] },
    { name: "Acasa la Corporatristi", img: "corporatristi.png", items: [{t: 'bottle', x: 67, y: 92},{t: 'bottle', x: 89, y: 77},{t: 'bottle', x: 82, y: 77},{t: 'bottle', x: 51, y: 79},{t: 'bottle', x: 23, y: 75},{t: 'bottle', x: 19, y: 80},{t: 'bottle', x: 13, y: 87}] },

    // PAGINA 4 (24-31) - Placeholders (temporar) - items are sticknotes
    { name: "Lobby", img: "lobbycorpo.png", items: [ {t: 'sticknote', x: 91, y: 51},{t: 'sticknote', x: 87, y: 61},{t: 'sticknote', x: 82, y: 64},{t: 'sticknote', x: 50, y: 70},{t: 'sticknote', x: 43, y: 68},{t: 'sticknote', x: 50, y: 57},{t: 'sticknote', x: 45, y: 56}, {t: 'sticknote', x: 30, y: 61},{t: 'sticknote', x: 19, y: 52},{t: 'sticknote', x: 11, y: 49}] },
    { name: "ART", img: "living.png", items: [ {t: 'sticknote', x: 90, y: 51},{t: 'sticknote', x: 77, y: 49},{t: 'sticknote', x: 73, y: 68},{t: 'sticknote', x: 70, y: 61},{t: 'sticknote', x: 64, y: 65},{t: 'sticknote', x: 50, y: 69},{t: 'sticknote', x: 17, y: 55},{t: 'sticknote', x: 21, y: 62},{t: 'sticknote', x: 42, y: 80},{t: 'sticknote', x: 64, y: 52}] },
    { name: "Sala de conferinte mica", img: "conferinta.png", items: [{t: 'sticknote', x: 25, y: 42}, {t: 'sticknote', x: 16, y: 48}, {t: 'sicknote', x: 19, y: 67}, {t: 'sticknote', x: 20, y: 76}, {t: 'sitcknote', x: 33, y: 65}, {t: 'sticknote', x: 37, y: 71}, {t: 'sticknote', x: 50, y: 80}, {t: 'sticknote', x: 54, y: 69}, {t: 'sticknote', x: 53, y: 61}, {t: 'sticknote', x: 72, y: 67}, {t: 'sticknote', x: 82, y: 87}, {t: 'sticknote', x: 95, y: 65}] },
    { name: "Birou 1", img: "sala3.png", items: [{t: 'sticknote', x: 74, y: 82}, {t: 'sticknote', x: 71, y: 62}, {t: 'sticknote', x: 62, y: 48}, {t: 'sticknote', x: 58, y: 17}, {t: 'sticknote', x: 54, y: 58}, {t: 'sticknote', x: 45, y: 60}, {t: 'sticknote', x: 42, y: 57}, {t: 'sticknote', x: 34, y: 51}, {t: 'sticknote', x: 29, y: 53}, {t: 'sticknote', x: 22, y: 45}, {t: 'sticknote', x: 56, y: 77}, {t: 'sticknote', x: 17, y: 86}] },
    { name: "Birou 2", img: "birou1.png", items: [ {t: 'sticknote', x: 92, y: 70},{t: 'sticknote', x: 74, y: 61},{t: 'sticknote', x: 77, y: 41},{t: 'sticknote', x: 50, y: 73},{t: 'sticknote', x: 46, y: 62},{t: 'sticknote', x: 28, y: 62},{t: 'sticknote', x: 27, y: 39},{t: 'sticknote', x: 5, y: 72}] },
    { name: "La Canapea", img: "canapea.png", items: [{t: 'sticknote', x: 91, y: 50},{t: 'sticknote', x: 87, y: 44},{t: 'sticknote', x: 81, y: 41},{t: 'sticknote', x: 82, y: 48},{t: 'sticknote', x: 78, y: 54},{t: 'sticknote', x: 75, y: 49},{t: 'sticknote', x: 65, y: 65},{t: 'sticknote', x: 59, y: 74},{t: 'sticknote', x: 52, y: 64},{t: 'sticknote', x: 48, y: 75},{t: 'sticknote', x: 25, y: 42},{t: 'sticknote', x: 23, y: 53},{t: 'sticknote', x: 19, y: 41},{t: 'sticknote', x: 12, y: 40},{t: 'sticknote', x: 6, y: 49} ] },
    { name: "Birou 3", img: "sala4.png", items: [{t: 'sticknote', x: 78, y: 70},{t: 'sticknote', x: 75, y: 40},{t: 'sticknote', x: 73, y: 53},{t: 'sticknote', x: 67, y: 54},{t: 'sticknote', x: 54, y: 66},{t: 'sticknote', x: 46, y: 53},{t: 'sticknote', x: 43, y: 81},{t: 'sticknote', x: 24, y: 48} ] },
    { name: "Sala de conferinta mare", img: "conferinta2.png", items: [ {t: 'sticknote', x: 86, y: 35}, {t: 'sticknote', x: 65, y: 58}, {t: 'sticknote', x: 55, y: 51}, {t: 'sticknote', x: 56, y: 40}, {t: 'sticknote', x: 55, y: 35}, {t: 'sticknote', x: 52, y: 48}, {t: 'sticknote', x: 50, y: 47}, {t: 'sticknote', x: 23, y: 71}, {t: 'sticknote', x: 56, y: 84}, {t: 'sticknote', x: 8, y: 42}, {t: 'sticknote', x: 5, y: 32}] }
];

// --- CONFIG CUTSCENE ---
const cutsceneData = [
    { img: "cutseen0.png", audio: "cutseen0.mp3" },
    { img: "cutseen1.png", audio: "cutseen1.mp3" },
    { img: "cutseen2.png", audio: "cutseen2.mp3" },
    { img: "cutseen3.png", audio: "cutseen3.mp3" },
    { img: "cutseen4.png", audio: "cutseen4.mp3" },
    { img: "cutseen5.png", audio: "cutseen5.mp3" },
    { img: "cutseen6.png", audio: "cutseen6.mp3" },
    { img: "cutseen7.png", audio: "cutseen7.mp3" },
    { img: "cutseen8.png", audio: "cutseen8.mp3" },
    { img: "cutseen9.png", audio: "cutseen9.mp3" },
    { img: "cutseen10.png", audio: "cutseen10.mp3" },
    { img: "cutseen11.png", audio: "cutseen11.mp3" },
    { img: "cutseen12.png", audio: "cutseen12.mp3" },
    { img: "cutseen13.png", audio: "cutseen13.mp3" },
    // Placeholders for future cutscenes 14..21 (optional assets)
    { img: "cutseen14.png", audio: "cutseen14.mp3" },
    { img: "cutseen15.png", audio: "cutseen15.mp3" },
    { img: "cutseen16.png", audio: "cutseen16.mp3" },
    { img: "cutseen17.png", audio: "cutseen17.mp3" },
    { img: "cutseen18.png", audio: "cutseen18.mp3" },
    { img: "cutseen19.png", audio: "cutseen19.mp3" },
    { img: "cutseen20.png", audio: "cutseen20.mp3" },
    { img: "cutseen21.png", audio: "cutseen21.mp3" },
    { img: "cutseen22.png", audio: "cutseen22.mp3" }
];
let currentCutsceneIndex = 0;
// Când un cutscene se termina, aceste variabile definesc ce trebuie deblocat/arat
let pendingUnlockLevelOnCutsceneFinish = null;
let pendingMenuPageOnCutsceneFinish = null;
// Daca vrem să rulăm doar o porțiune a cutscene-urilor, setăm un end index
let pendingCutsceneEndIndex = null;
// Dacă vrem să ruleze secvența automat, setăm acest flag
let pendingCutsceneAutoPlay = false;

// --- STATE ---
const SAVE_KEY = "BucharestHunt_Savev3";
let playerProgress = { maxUnlockedLevel: 0, stickyNotes: 0, stickiesFoundInLevels: [] };
let currentLevelIdx = 0;
let bottlesFound = 0;
let currentLevelStickFound = 0;
let currentLevelItemType = 'bottle';
let menuPage = 0; 
let currentLevelTarget = 5; 

// Persistent background audio element (keeps playing across levels)
let bgAudio = null;
function ensureBackgroundMusicForLevel(index) {
    // Mapping of level ranges to audio files
    let desired = null;
    if (index >= 24 && index <= 31) {
        desired = 'assets/audio/night.mp3';
    } else if (index >= 16 && index <= 23) {
        desired = 'assets/audio/summer1.mp3';
    } else if (index >= 8 && index <= 15) {
        desired = 'assets/audio/summer2.mp3';
    } else if (index >= 0 && index <= 7) {
        desired = 'assets/audio/summer3.mp3';
    }
    if (!desired) return;

    try {
        // If we don't have an audio element yet, create and play (looped)
        if (!bgAudio) {
            bgAudio = new Audio(desired);
            bgAudio.loop = true;
            bgAudio.volume = 0.45;
            bgAudio.play().catch(e => console.log('bgAudio play error:', e));
            return;
        }
        // If the current src already matches desired, do nothing (preserve currentTime)
        const cur = bgAudio.src || '';
        if (cur.indexOf(desired) !== -1 || cur.endsWith(desired)) {
            // already playing this track; leave as-is so it doesn't restart
            return;
        }
        // Different track: replace src but preserve playing state
        const wasPlaying = !bgAudio.paused && !bgAudio.ended;
        try { bgAudio.pause(); } catch(e){}
        bgAudio.src = desired;
        bgAudio.loop = true;
        // Only start playing automatically if it was previously playing
        if (wasPlaying) {
            bgAudio.play().catch(e => console.log('bgAudio play error:', e));
        }
    } catch(e) {
        console.log('ensureBackgroundMusicForLevel error', e);
    }
}

// --- MENIU AUDIO ---
let menuAudio = null;
function playMenuAudio() {
    if (!menuAudio) {
        menuAudio = new Audio('assets/audio/menu.mp3');
        menuAudio.loop = true;
        menuAudio.volume = 0.45;
    }
    if (menuAudio.paused) {
        menuAudio.play().catch(e => console.log('menuAudio play error:', e));
    }
}
function pauseMenuAudio() {
    if (menuAudio && !menuAudio.paused) {
        try { menuAudio.pause(); } catch(e){}
    }
}

// --- INITIALIZARE ---
window.onload = function() {
    loadGame();
    renderMainMenu();
    // Play menu music on first load (after a short delay to allow DOM and user gesture context)
    setTimeout(() => {
        if (document.getElementById('menu-overlay').style.display === 'flex' || document.getElementById('menu-overlay').style.display === '') {
            playMenuAudio();
            if (bgAudio && !bgAudio.paused) { try { bgAudio.pause(); } catch(e){} }
        }
    }, 200);
};

// --- MENIU & PAGINARE ---
function openLevelMenu() {
    document.getElementById('menu-overlay').style.display = 'flex';
    document.getElementById('win-overlay').style.display = 'none';
    document.getElementById('cutscene-overlay').style.display = 'none';
    renderMainMenu();

    // Play menu music and pause bgAudio if needed
    playMenuAudio();
    if (bgAudio && !bgAudio.paused) { try { bgAudio.pause(); } catch(e){} }
}

function changeMenuPage(direction) {
    menuPage += direction;
    const maxPage = Math.ceil(levels.length / 8) - 1;
    if (menuPage < 0) menuPage = 0;
    if (menuPage > maxPage) menuPage = maxPage;
    renderMainMenu();
}

function renderMainMenu() {
    const grid = document.getElementById('level-grid');
    const menuOverlay = document.getElementById('menu-overlay');
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');

    // Always play menu music when menu is rendered
    playMenuAudio();
    if (bgAudio && !bgAudio.paused) { try { bgAudio.pause(); } catch(e){} }

    grid.innerHTML = "";

    let imgUrl = 'assets/menu.png';
    const maxPage = Math.ceil(levels.length / 8) - 1;
    prevBtn.style.display = menuPage === 0 ? "none" : "block";
    nextBtn.style.display = menuPage === maxPage ? "none" : "block";
    // Preload background image to detect missing files and provide fallback
    (function preloadMenuBg(url){
        const testImg = new Image();
        testImg.onload = () => { menuOverlay.style.backgroundImage = `url('${url}')`; };
        testImg.onerror = () => { console.warn('Menu background failed to load:', url); menuOverlay.style.backgroundImage = 'none'; menuOverlay.style.backgroundColor = '#ecf0f1'; showNotification('Background meniului nu a putut fi încărcat'); };
        testImg.src = url;
    })(imgUrl);

    const startIdx = menuPage * 8;
    const endIdx = startIdx + 8;
    const displayLevels = levels.slice(startIdx, endIdx);

    displayLevels.forEach((lvl, relativeIndex) => {
        const realIndex = startIdx + relativeIndex;
        const btn = document.createElement('div');
        btn.className = 'level-card';
        
        let isLocked = false;
        if (realIndex === 7 && lvl.isSecret) {
            btn.className += " secret-level";
            btn.innerHTML = "👑 " + lvl.name;
        } else {
            if (realIndex > playerProgress.maxUnlockedLevel) isLocked = true;
            btn.innerHTML = `${realIndex + 1}. ${lvl.name}`;
        }

        // Removed badge and completed styling per user request


        if (isLocked) {
            btn.classList.add('locked');
        } else {
            btn.onclick = () => startLevel(realIndex);
        }
        grid.appendChild(btn);
    });
}

// --- JOC ---
function startLevel(index) {
    currentLevelIdx = index;
    bottlesFound = 0;
    // Ensure any open sticky note is closed when a new level starts
    hideStickyNote();

    // Pause menu music and resume bg music
    pauseMenuAudio();
    // Always play bg music for this level
    ensureBackgroundMusicForLevel(index);
    if (bgAudio) {
        // Restore volume if it was faded out
        bgAudio.volume = 0.45;
        if (bgAudio.paused) {
            bgAudio.play().catch(e => console.log('bgAudio play error:', e));
        }
    }

    document.getElementById('menu-overlay').style.display = 'none';
    document.getElementById('win-overlay').style.display = 'none';
    document.getElementById('cutscene-overlay').style.display = 'none';

    document.getElementById('level-name').innerText = levels[index].name;

    // Determinăm tipul de item și câte sunt (bottles vs sticknotes)
    const bottleCount = levels[index].items.filter(i => i.t === 'bottle').length;
    const stickyCount = levels[index].items.filter(i => i.t === 'sticknote').length;
    bottlesFound = 0;
    currentLevelStickFound = 0;
    if (bottleCount > 0) {
        currentLevelItemType = 'bottle';
        currentLevelTarget = bottleCount;
    } else if (stickyCount > 0) {
        currentLevelItemType = 'sticknote';
        currentLevelTarget = stickyCount;
    } else {
        currentLevelItemType = 'bottle';
        currentLevelTarget = 0;
    }

    document.getElementById('score-icon').innerText = currentLevelItemType === 'sticknote' ? '📝' : '🍾';
    document.getElementById('score-text').innerText = "0/" + currentLevelTarget;
    
    const scene = document.getElementById('scene');
    scene.innerHTML = "";
    
    if(levels[index].img === "placeholder.png") {
        scene.style.backgroundColor = "#555";
        scene.style.backgroundImage = "none";
    } else {
        const imgUrl = `assets/${levels[index].img}`;
        (function preloadSceneBg(url){
            const testImg = new Image();
            testImg.onload = () => { scene.style.backgroundImage = `url('${url}')`; scene.style.backgroundColor = ''; };
            testImg.onerror = () => { console.warn('Level background failed to load:', url); scene.style.backgroundImage = 'none'; scene.style.backgroundColor = '#555'; showNotification('Imaginea de fundal a nivelului nu a putut fi încărcată'); };
            testImg.src = url;
        })(imgUrl);
    }

    let stickCounter = 0;
    // Create a deterministic per-level love note (assigned to exactly one sticky per level)
    const LOVE_SENDER = 'Andrei';
    const LOVE_RECIPIENT = 'Ricardo';
    const loveTemplates = [
        (s,r,l,n) => ({ title: `O notiță pentru ${r}`, note: `Dragă ${r},

Ziua mea e mai bună pentru că exiști. Abia aștept să te văd din nou.

Cu drag, ${s}` }),
        (s,r,l,n) => ({ title: `${s} pentru ${r}`, note: `${r}, fiecare clipă cu tine îmi dă curaj. Îți sunt alături.

— ${s}` }),
        (s,r,l,n) => ({ title: `Gânduri pentru ${r}`, note: `${r}, gândurile mele sunt mereu la tine. Te iubesc.

— ${s}` }),
        (s,r,l,n) => ({ title: `Răsuflare`, note: `${r}, când zâmbești lumea se oprește. Îmi luminezi zilele.

Cu iubire, ${s}` }),
        (s,r,l,n) => ({ title: `Te iubesc`, note: `${r}, te iubesc mai mult în fiecare zi. Fii al meu mereu.

— ${s}` }),
        (s,r,l,n) => ({ title: `Pentru ${r}`, note: `Dragul meu ${r}, fiecare amintire cu tine îmi umple sufletul. Te ador.

— ${s}` })
    ];
    const lvlName = levels[index].name || `Nivel ${index + 1}`;
    const chosenLove = loveTemplates[index % loveTemplates.length](LOVE_SENDER, LOVE_RECIPIENT, lvlName, index + 1);

    // Find all sticknote indices in this level
    const stickIndices = levels[index].items.map((it, idx) => it.t === 'sticknote' ? idx : -1).filter(i => i >= 0);
    let chosenStickIdx = null;
    if (stickIndices.length > 0) {
        // Deterministic 'random' pick based on level index
        const seedPos = (index * 7 + 3) % stickIndices.length;
        // Prefer a sticky that doesn't already have a custom note/title
        for (let offset = 0; offset < stickIndices.length; offset++) {
            const cand = stickIndices[(seedPos + offset) % stickIndices.length];
            const candItem = levels[index].items[cand];
            if (!candItem.note && !candItem.title) { chosenStickIdx = cand; break; }
        }
        // If all stickies already have notes/titles, we won't override any
    }

    // Templates for non-love stickies
    const timeOptions = ['09:00','09:30','10:15','11:00','13:30','14:00','15:45','16:00','17:30','18:00'];
    const dayBase = 3;
    const monthBase = 1;
    const templates = [
        { title: t => `Ședință la ora ${t}`, note: (t,d,idx,lvl) => `Ședință programată la ora ${t} (${lvl}).` },
        { title: d => `Deadline proiect ${d}`, note: (t,d,idx,lvl) => `Deadline pentru livrarea proiectului: ${d}.` },
        { title: t => `Memento: trimite raport`, note: (t,d,idx,lvl) => `Trimite raportul până la ${t} (${d}).` },
        { title: idx => `Notiță ${idx}`, note: (t,d,idx,lvl) => `Notiță ${idx} din nivelul "${lvl}".` },
        { title: d => `Verificare sistem ${d}`, note: (t,d,idx,lvl) => `Verifică serverele și backup-ul până la ${d}.` },
        { title: t => `Întâlnire cu echipa la ${t}`, note: (t,d,idx,lvl) => `Sesiune scurtă de sync la ${t} în biroul principal.` },
        { title: d => `Livrare client ${d}`, note: (t,d,idx,lvl) => `Livrare către client programată pentru ${d}.` },
        { title: idx => `Reminder ${idx}`, note: (t,d,idx,lvl) => `Reminder: verifică corespondența și actualizează task-urile.` }
    ];

    levels[index].items.forEach((item, idx) => {
        if (item.t === 'sticknote') {
            stickCounter++;
            // If this is the chosen sticky for love, assign the love message (unless user provided custom)
            if (idx === chosenStickIdx) {
                if (!item.title) item.title = chosenLove.title;
                if (!item.note) item.note = chosenLove.note;
            } else {
                // Assign a varied meeting/deadline-style message if none provided
                const tt = timeOptions[(stickCounter - 1) % timeOptions.length];
                const day = String(((stickCounter * 3) % 25) + dayBase).padStart(2, '0');
                const month = String(((stickCounter * 2) % 12) + monthBase).padStart(2, '0');
                const dateStr = `${day}.${month}.2026`;
                const tmpl = templates[(stickCounter - 1) % templates.length];
                if (!item.title) item.title = (typeof tmpl.title === 'function') ? tmpl.title(tt, dateStr, stickCounter, lvlName) : tmpl.title;
                if (!item.note) item.note = (typeof tmpl.note === 'function') ? tmpl.note(tt, dateStr, stickCounter, lvlName) : tmpl.note;
            }
        }
        const el = document.createElement('div');
        el.className = 'clickable-item';
        el.style.left = item.x + '%';
        el.style.top = item.y + '%';
        
        // Pass the whole item so we can access its `note` or other metadata
        el.onclick = () => handleItemClick(el, item);
        scene.appendChild(el);
    });
}

function handleItemClick(el, item) {
    const type = item.t;
    el.classList.add('collected');
    el.style.pointerEvents = 'none';
    // Add a red circle marker
    if (!el.querySelector('.collected-marker')) {
        const marker = document.createElement('div');
        marker.className = 'collected-marker';
        el.appendChild(marker);
    }

    if (type === 'bottle') {
        bottlesFound++;
        document.getElementById('score-text').innerText = bottlesFound + "/" + currentLevelTarget;
        try { playSound('pop'); } catch(e) {}

        // Play one random bottle audio from assets/audio/bottle1..5.mp3
        try {
            const bottleSounds = [
                'assets/audio/bottle1.mp3',
                'assets/audio/bottle2.mp3',
                'assets/audio/bottle3.mp3',
                'assets/audio/bottle4.mp3',
                'assets/audio/bottle5.mp3'
            ];
            const choice = bottleSounds[Math.floor(Math.random() * bottleSounds.length)];
            const bottleAudio = new Audio(choice);
            bottleAudio.play().catch(err => console.log('Bottle audio play error:', err));
        } catch(e) { console.log('Bottle audio error:', e); }

        if (bottlesFound >= currentLevelTarget) handleLevelWin();
    } else if (type === 'sticknote') {
        currentLevelStickFound++;
        // mark that this level has at least one sticky note found (used for menu badges)
        if (!playerProgress.stickiesFoundInLevels[currentLevelIdx]) playerProgress.stickiesFoundInLevels[currentLevelIdx] = 0;
        playerProgress.stickiesFoundInLevels[currentLevelIdx] = Math.min(playerProgress.stickiesFoundInLevels[currentLevelIdx] + 1, currentLevelTarget);
        playerProgress.stickyNotes = (playerProgress.stickyNotes || 0) + 1;
        saveGame();
        updateHud();

        // Show the sticky note panel with the note text (if provided)
        const text = item.note || '(Fără text încă — adaugă `note` în obiectul item)';
        const title = item.title || 'Sticky Note';
        showStickyNote(text, title);

        // Do not show sticky-note notification in levels 24-31
        if (!(currentLevelIdx >= 24 && currentLevelIdx <= 31)) {
            showNotification("Sticky note găsită! 📝");
        }
        // Small pop sound (existing effect)
        try { playSound('pop'); } catch(e) {}

        // Play one random sticky audio from assets/audio/sticky1..4.mp3
        try {
            const stickySounds = [
                'assets/audio/sticky1.mp3',
                'assets/audio/sticky2.mp3',
                'assets/audio/sticky3.mp3',
                'assets/audio/sticky4.mp3'
            ];
            const choice = stickySounds[Math.floor(Math.random() * stickySounds.length)];
            const stickyAudio = new Audio(choice);
            // Start playback; log if it fails
            stickyAudio.play().catch(err => console.log('Sticky audio play error:', err));
        } catch(e) { console.log('Sticky audio error:', e); }

        document.getElementById('score-text').innerText = currentLevelStickFound + "/" + currentLevelTarget;
        if (currentLevelStickFound >= currentLevelTarget) handleLevelWin();
    }
}

function handleLevelWin() {
    // Close sticky viewer at level end
    hideStickyNote();

    // --- 1. AFIȘARE UI (Prioritate Maximă) ---
    const overlay = document.getElementById('win-overlay');
    const msg = document.getElementById('win-msg');
    
    msg.innerText = (playerProgress.stickiesFoundInLevels && playerProgress.stickiesFoundInLevels[currentLevelIdx]) 
        ? "Nivel Complet! Sticky note găsit." 
        : "Nivel Complet!";
        
    // --- 2. LOGICĂ DEBLOCARE ---
    if (currentLevelIdx === playerProgress.maxUnlockedLevel && currentLevelIdx < levels.length - 1) {
        playerProgress.maxUnlockedLevel++;
        saveGame();
    } 
    
    // --- 3. LOGICĂ CUTSCENE SAU VICTORIE ---
    if (currentLevelIdx === 7) {
        // Palatul Parlamentului - pornim doar cutscene-urile 0..3 și deblocăm pagina 2
        setTimeout(() => startCutscene(0, 8, 1, 3, true), 500);
    } else if (currentLevelIdx === 15) {
        // La Becali - pornim doar cutscene-urile 5..8 și deblocăm pagina 3
        setTimeout(() => startCutscene(5, 16, 2, 8, true), 500);
    } else if (currentLevelIdx === 23) {
        // Acasa la Corporatristi - pornim doar cutscene-urile 9..13 și deblocăm pagina 4
        setTimeout(() => startCutscene(9, 24, 3, 13), 500);
    } else if (currentLevelIdx === 31) {
        // Sala de conferință mare (nivel 32) - pornim doar cutscene-urile 14..22
        setTimeout(() => startCutscene(14, null, null, 22, true), 500);
    } else {
        // Dacă e nivel normal, afișăm overlay-ul de victorie
        overlay.style.display = 'flex';
        
        // Abia la final încercăm sunetul de victorie
        try { playSound('win'); } catch(e) { console.log("Sound error (win)", e); }
    }
}

// --- CUTSCENE LOGIC ---
function startCutscene(startIndex = 0, unlockTo = null, menuPageTo = null, endIndex = null, autoPlay = false) {
    // Fade out background music during cutscenes
    if (bgAudio && !bgAudio.paused) {
        try {
            const fadeDuration = 1000; // ms
            const initialVolume = bgAudio.volume;
            const steps = 20;
            let step = 0;
            const fadeStep = () => {
                step++;
                bgAudio.volume = Math.max(0, initialVolume * (1 - step / steps));
                if (step < steps) {
                    setTimeout(fadeStep, fadeDuration / steps);
                } else {
                    bgAudio.volume = 0;
                    try { bgAudio.pause(); } catch(e){}
                }
            };
            fadeStep();
        } catch(e) { try { bgAudio.pause(); } catch(e2){} }
    }
    // Validate requested start/end indices against available cutscenes
    if (startIndex >= cutsceneData.length) {
        showNotification(`Cutscene ${startIndex} nu există.`);
        setTimeout(() => { openLevelMenu(); }, 600);
        return;
    }
    currentCutsceneIndex = startIndex;
    pendingUnlockLevelOnCutsceneFinish = unlockTo;
    pendingMenuPageOnCutsceneFinish = menuPageTo;
    pendingCutsceneEndIndex = (typeof endIndex === 'number') ? Math.min(endIndex, cutsceneData.length - 1) : null;
    pendingCutsceneAutoPlay = !!autoPlay;
    // If endIndex requested is beyond available range, inform user
    if (typeof endIndex === 'number' && endIndex > cutsceneData.length - 1) {
        showNotification(`Unele cutscene-uri cerute nu sunt disponibile; rulez ${startIndex}–${pendingCutsceneEndIndex}.`);
    }
    // Ensure end index is not before start
    if (pendingCutsceneEndIndex !== null && pendingCutsceneEndIndex < currentCutsceneIndex) pendingCutsceneEndIndex = currentCutsceneIndex;
    document.getElementById('cutscene-overlay').style.display = 'flex';
    showCutsceneFrame();
}

function showCutsceneFrame() {
    // If we have an end index for the cutscene range, finish when we pass it
    if (pendingCutsceneEndIndex !== null) {
        if (currentCutsceneIndex > pendingCutsceneEndIndex) {
            // Final Cutscene (range)
            document.getElementById('cutscene-overlay').style.display = 'none';
            if (pendingUnlockLevelOnCutsceneFinish !== null) {
                if (playerProgress.maxUnlockedLevel < pendingUnlockLevelOnCutsceneFinish) {
                    playerProgress.maxUnlockedLevel = pendingUnlockLevelOnCutsceneFinish;
                    saveGame();
                }
            }
            if (pendingMenuPageOnCutsceneFinish !== null) {
                menuPage = pendingMenuPageOnCutsceneFinish;
            } else {
                if (playerProgress.maxUnlockedLevel >= 8) menuPage = 1;
            }
            pendingUnlockLevelOnCutsceneFinish = null;
            pendingMenuPageOnCutsceneFinish = null;
            pendingCutsceneEndIndex = null;
            openLevelMenu();
            return;
        }
    }

    if (currentCutsceneIndex >= cutsceneData.length) {
        // Final Cutscene
        document.getElementById('cutscene-overlay').style.display = 'none';
        if (pendingUnlockLevelOnCutsceneFinish !== null) {
            if (playerProgress.maxUnlockedLevel < pendingUnlockLevelOnCutsceneFinish) {
                playerProgress.maxUnlockedLevel = pendingUnlockLevelOnCutsceneFinish;
                saveGame();
            }
        }
        if (pendingMenuPageOnCutsceneFinish !== null) {
            menuPage = pendingMenuPageOnCutsceneFinish;
        } else {
            if (playerProgress.maxUnlockedLevel >= 8) menuPage = 1;
        }
        pendingUnlockLevelOnCutsceneFinish = null;
        pendingMenuPageOnCutsceneFinish = null;
        openLevelMenu();
        return;
    }

    const data = cutsceneData[currentCutsceneIndex];
    const imgEl = document.getElementById('cutscene-img');
    
    imgEl.src = `assets/cutseen/${data.img}`;
    
    if(window.currentAudio) { window.currentAudio.pause(); window.currentAudio.onended = null; }
    window.currentAudio = new Audio(`assets/cutseen/${data.audio}`);
    if (pendingCutsceneAutoPlay) {
        window.currentAudio.onended = () => {
            currentCutsceneIndex++;
            showCutsceneFrame();
        };
    }
    window.currentAudio.play().catch(e => console.log("Audio err:", e));
}

function nextCutsceneFrame() {
    currentCutsceneIndex++;
    showCutsceneFrame();
}

function nextLevelOrMenu() {
    if (currentLevelIdx < levels.length - 1) {
        startLevel(currentLevelIdx + 1);
    } else {
        openLevelMenu();
    }
}

// --- UTILS ---
function saveGame() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(playerProgress)); } catch(e){}
}
function loadGame() {
    try {
        const data = localStorage.getItem(SAVE_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            // migrate old egg keys to sticky notes
            if (parsed.easterEggs !== undefined || parsed.eggsFoundInLevels !== undefined) {
                parsed.stickyNotes = parsed.stickyNotes || parsed.easterEggs || 0;
                parsed.stickiesFoundInLevels = parsed.stickiesFoundInLevels || parsed.eggsFoundInLevels || [];
                delete parsed.easterEggs;
                delete parsed.eggsFoundInLevels;
            }
            playerProgress = parsed;
        }
        if (!playerProgress.stickiesFoundInLevels) playerProgress.stickiesFoundInLevels = [];
        if (playerProgress.stickiesFoundInLevels.length < levels.length) playerProgress.stickiesFoundInLevels.length = levels.length;
    } catch(e) { playerProgress = { maxUnlockedLevel: 0, stickyNotes: 0, stickiesFoundInLevels: [] }; }
    updateHud();
}
function resetProgress() {
    if(confirm("Ștergi tot progresul?")) { localStorage.removeItem(SAVE_KEY); location.reload(); }
}
function updateHud() { document.getElementById('stick-text').innerText = playerProgress.stickyNotes || 0; }
function showNotification(text) {
    const n = document.getElementById('notification');
    n.innerText = text; n.style.opacity = 1;
    setTimeout(() => n.style.opacity = 0, 3000);
}
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(t) {
    if(audioCtx.state==='suspended') audioCtx.resume();
    const o=audioCtx.createOscillator(), g=audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    if(t==='pop'){o.freq=800;g.gain.expRampToValueAtTime(0.01,audioCtx.currentTime+0.1);o.stop(audioCtx.currentTime+0.1);}
    else if(t==='win'){o.type='triangle';o.freq=500;g.gain.linearRampToValueAtTime(0,audioCtx.currentTime+1);o.stop(audioCtx.currentTime+1);}
    o.start();
}

// --- STICKY NOTE PANEL API ---
function showStickyNote(text, title) {
    const panel = document.getElementById('sticky-note-panel');
    const tEl = document.getElementById('sticky-note-text');
    const hEl = document.getElementById('sticky-note-title');
    if (!panel || !tEl || !hEl) return;
    hEl.innerText = title || 'Sticky Note';
    tEl.innerText = text || '';
    panel.classList.remove('hidden');
    panel.setAttribute('aria-hidden', 'false');
}
function hideStickyNote() {
    const panel = document.getElementById('sticky-note-panel');
    if (!panel) return;
    panel.classList.add('hidden');
    panel.setAttribute('aria-hidden', 'true');
}
