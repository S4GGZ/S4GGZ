/**
 * @fileoverview Main script for the turn-based artillery game.
 * Handles game setup, character selection, game logic, drawing, and UI updates.
 * Includes box towers with gravity, power-ups, refined positional box type enforcement,
 * closer tower spacing, updated Spaga multiplier, and scaled/panning background.
 * @version 1.8.0 - Final Box Rules & Spacing
 * @date 2025-04-13
 */

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // DOM Element References
    // =========================================================================
    console.log("DOM Content Loaded. Finding elements...");
    const startMenu = document.getElementById('start-menu');
    const characterOptionsContainer = document.getElementById('character-select');
    const startButton = document.getElementById('start-button');
    const gameArea = document.getElementById('game-area');
    const canvas = document.getElementById('game-canvas');
    const playerHpDisplay = document.getElementById('player-hp');
    const opponentHpDisplay = document.getElementById('opponent-hp');
    const turnIndicator = document.getElementById('turn-indicator');
    const gameOverMessage = document.getElementById('game-over-message');
    const winnerMessage = document.getElementById('winner-message');
    const restartButton = document.getElementById('restart-button');
    const powerMeterContainer = document.getElementById('power-meter-container');
    const powerValueDisplay = document.getElementById('power-value');
    const powerBarFg = document.getElementById('power-bar-fg');
    const ccrMessageDisplay = document.getElementById('ccr-message');
    const popupAd = document.getElementById('popup-ad');
    const closeAdBtn = document.getElementById('close-ad-btn');

    // Function to determine if the popup should appear


    // =========================================================================
    // Essential Canvas Setup & Check
    // =========================================================================
    if (!canvas) {
        console.error("FATAL: Canvas element with ID 'game-canvas' not found!");
        alert("Error: Could not find the game canvas. The game cannot start.");
        return;
    }
    console.log("Canvas element found.");
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("FATAL: Could not get 2D rendering context.");
        alert("Error: Could not get 2D graphics context. Your browser might not support HTML5 Canvas.");
        return;
    }
    console.log("Canvas 2D context obtained.");

    // =========================================================================
    // Asset Paths & Loading Variables
    // =========================================================================
    let loadedGameImages = {};
    let loadingPromises = [];
    let backgroundImage = null; // For JS background drawing
    const backgroundImagePath = 'assets/background/CasaPoporului.png'; // For JS background
    let powerUpImage = null; // Still used for the ground power-up visual if kept
    const constiPowerUpImagePath = 'assets/characters/consti.png'; // Image for the CCR/Consti power-up effect

    // Box and Prop Image Paths
    const mysteryBoxImagePath = 'assets/props/mistery_box.png';
    const cutieArmeImagePath = 'assets/props/cutie_arme.png';
    const cutieSpagaImagePath = 'assets/props/cutie_spaga.png';
    const dosarePenaleImagePath = 'assets/props/dosare_penale.png';
    const spagaBallImagePath = 'assets/props/spaga.png'; // Image for the spaga ball powerup

    let loadedPropImages = { // Use a separate object for props/boxes/powerups
        mystery: null,
        arme: null,
        spaga: null,
        dosare: null,
        spagaBall: null,
        constiPowerUp: null
    };
    // Define the types for initial random spawn AND for top box enforcement
    const initialBoxTypes = ['arme', 'spaga', 'dosare'];
    // Define types that grant powerups when hit
    const specialBoxTypes = ['arme', 'spaga', 'dosare'];

    const characterData = [
        { id: 'basescu', name: 'Basescu', menuImage: 'assets/characters/Basescu.png', gameImage: 'assets/characters/Base.png' },
        { id: 'simion', name: 'Simion', menuImage: 'assets/characters/Simion.png', gameImage: 'assets/characters/Simi.png' },
        { id: 'nicusor', name: 'Nicusor', menuImage: 'assets/characters/Nicusor.png', gameImage: 'assets/characters/Mucusor.png' },
        { id: 'lasconi', name: 'Lasconi', menuImage: 'assets/characters/Lasconi.png', gameImage: 'assets/characters/TusaConi.png' },
        { id: 'ponta', name: 'Ciolacu', menuImage: 'assets/characters/Ciolacu.png', gameImage: 'assets/characters/Ciorapu.png' },
    ];

    // Audio & Mute State
    let characterAudio = null;
    let isMuted = false;
    let muteButton = null;
    const muteIconPath = 'assets/images/unmute.png';
    const unmuteIconPath = 'assets/images/mute.png';
    const basescuAudioPath = 'assets/audio/Basescu.mp3';
    const NormalAudioPath = 'assets/audio/background.mp3';

    // =========================================================================
    // Game State & Configuration Variables
    // =========================================================================
    let selectedCharacter = null;
    let player = null;
    let opponent = null;
    let projectiles = [];
    let isPlayerTurn = true;
    let isCharging = false;
    let chargeStartTime = 0;
    let gameOver = false;
    let aimAngle = -Math.PI / 4;
    let mousePos = { x: 0, y: 0 };
    let cameraX = 0;
    let activeProjectile = null;
    let powerUp = null; // For the original ground power-up if kept

    // Box Tower Variables
    let boxTower1 = [];
    let boxTower2 = [];
    let playerPowerUp = null; // Tracks player's next shot power-up { type: 'spaga'/'dosare'/'consti_target', multiplier: 2.5, ballImage: img }
    let opponentPowerUp = null; // Tracks opponent's next shot power-up

    // Game Constants
    const MAX_CHARGE_TIME = 1500;
    const MIN_DAMAGE = 5;
    const MAX_DAMAGE = 15;
    const GRAVITY = 0.15; // For projectiles
    const CHARACTER_WIDTH = 400 / 2.3;
    const CHARACTER_HEIGHT = 400 / 2.3;
    const PROJECTILE_RADIUS = 12;
    const PROJECTILE_BOUNCES = 2;
    const HIT_EFFECT_DURATION = 500; // Duration for hit state (bounce only now)
    const CAMERA_SMOOTHING = 0.08;
    const POWERUP_WIDTH = 50; // For original ground power-up
    const POWERUP_HEIGHT = 50; // For original ground power-up
    const POWERUP_DAMAGE_MULTIPLIER = 2.69; // For CCR/Consti effect
    const CCR_MESSAGE_DURATION = 3000;
    const BOX_WIDTH = 62; // Box size
    const BOX_HEIGHT = 62; // Box size
    const BOX_FALL_SPEED = 6; // How fast boxes fall
    const TOWER_HEIGHT = 6; // How many boxes per tower
    const TOWER_BASE_Y_OFFSET = -2; // How far boxes sit above the ground line (relative to BOX_HEIGHT=0 Y coordinate)
    const POWER_THRESHOLD = 0.99; // Ratio needed for 100% power hit (adjust if needed)
    const SPAGA_MULTIPLIER = 2.2; // UPDATED Spaga damage multiplier
    const DOSARE_MULTIPLIER = 1.2;


    // =========================================================================
    // Asset Loading Function
    // =========================================================================
    function loadImage(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = (err) => {
                console.error(`Error loading image: ${src}`, err);
                resolve(null);
            };
            if (src && typeof src === 'string') {
                img.src = src;
            } else {
                console.error(`Invalid image source provided: ${src}`);
                resolve(null);
            }
        });
    }

    // =========================================================================
    // Preload Game Assets
    // =========================================================================
    console.log("Starting asset preloading...");
    // Preload Background Image for JavaScript drawing
    loadingPromises.push(
        loadImage(backgroundImagePath).then(img => {
            if (img) {
                console.log(`Background image ${backgroundImagePath} loaded successfully.`);
                backgroundImage = img;
            } else {
                console.error(`FAILED to load background image from ${backgroundImagePath}.`);
            }
        })
    );
    // Preload Character Game Images
    characterData.forEach(char => {
        if (char.gameImage) {
            loadingPromises.push(
                loadImage(char.gameImage).then(img => {
                    if (img) {
                        console.log(`Game image ${char.gameImage} for ${char.name} loaded.`);
                        loadedGameImages[char.id] = img;
                    } else {
                         console.error(`CRITICAL: Failed to load game image for ${char.name} from ${char.gameImage}.`);
                         loadedGameImages[char.id] = null;
                    }
                })
            );
        } else {
            console.warn(`Missing gameImage path for character: ${char.name}`);
            loadedGameImages[char.id] = null;
        }
    });
     // Preload Prop/Box Images
    loadingPromises.push(loadImage(mysteryBoxImagePath).then(img => { // Still load mystery
        loadedPropImages.mystery = img;
        if(img) console.log("Mystery Box image loaded."); else console.error("Failed to load Mystery Box image.");
    }));
    loadingPromises.push(loadImage(cutieArmeImagePath).then(img => {
        loadedPropImages.arme = img;
        if(img) console.log("Cutie Arme image loaded."); else console.error("Failed to load Cutie Arme image.");
    }));
    loadingPromises.push(loadImage(cutieSpagaImagePath).then(img => {
        loadedPropImages.spaga = img;
         if(img) console.log("Cutie Spaga image loaded."); else console.error("Failed to load Cutie Spaga image.");
    }));
    loadingPromises.push(loadImage(dosarePenaleImagePath).then(img => {
        loadedPropImages.dosare = img;
         if(img) console.log("Dosare Penale image loaded."); else console.error("Failed to load Dosare Penale image.");
    }));
    loadingPromises.push(loadImage(spagaBallImagePath).then(img => {
        loadedPropImages.spagaBall = img;
         if(img) console.log("Spaga Ball image loaded."); else console.error("Failed to load Spaga Ball image.");
    }));
    // Load the existing power-up image into the new structure as well
     loadingPromises.push(
         loadImage(constiPowerUpImagePath).then(img => { // Use the correct path defined earlier
             if (img) {
                 console.log(`Consti Power-up image ${constiPowerUpImagePath} loaded successfully.`);
                 loadedPropImages.constiPowerUp = img; // Store it here
                 powerUpImage = img; // Keep the old variable if other parts of the code use it directly for ground spawn
             } else {
                 console.error(`FAILED to load Consti power-up image from ${constiPowerUpImagePath}.`);
             }
         })
     );

    // Initialize after loading attempts
    Promise.all(loadingPromises).finally(() => {
        console.log("All image loading attempts finished.");
        initializeGame();
    });

    // =========================================================================
    // Start Menu & Character Selection Logic
    // =========================================================================
    function populateCharacterSelection() {
        if (!characterOptionsContainer) return;
        characterOptionsContainer.innerHTML = '';
        characterData.forEach(char => {
            const option = document.createElement('div');
            option.className = 'character-option';
            option.setAttribute('data-char', char.id);
            const img = document.createElement('img');
            img.src = char.menuImage || 'https://placehold.co/80x80/cccccc/ffffff?text=N/A';
            img.alt = char.name;
            img.onerror = (e) => {
                console.warn(`Failed to load menu image: ${e.target.src}`);
                e.target.src = 'https://placehold.co/80x80/cccccc/ffffff?text=Error';
            };
            const nameSpan = document.createElement('span');
            nameSpan.textContent = char.name;
            option.appendChild(img);
            option.appendChild(nameSpan);
            option.addEventListener('click', () => {
                document.querySelectorAll('.character-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                selectedCharacter = char.id;
                if (startButton) startButton.disabled = false;
            });
            characterOptionsContainer.appendChild(option);
        });
        if (startButton) startButton.disabled = true;
    }

    // =========================================================================
    // Button Event Listeners
    // =========================================================================
     if (startButton) {
        startButton.addEventListener('click', () => {
            if (selectedCharacter) startGame();
            else alert("Please select a character first!");
        });
    } else { console.error("Start button not found!"); }
    if (restartButton) {
        restartButton.addEventListener('click', () => {
            if (gameOverMessage) gameOverMessage.style.display = 'none';
            if (gameArea) gameArea.style.display = 'none';
            if (startMenu) startMenu.style.display = 'flex';
            resetGame();
        });
    } else { console.error("Restart button not found!"); }

    // =========================================================================
    // Game Initialization & Reset Logic
    // =========================================================================
    function spawnBoxTowers() {
        boxTower1 = [];
        boxTower2 = [];
        const groundY = canvas.height - 10; // Base ground line
        const towerBaseActualY = groundY - TOWER_BASE_Y_OFFSET; // Top edge of where the lowest box should sit
    
        // Position towers between player and opponent
        if (!player || !opponent) {
            console.error("Cannot spawn towers...");
            return;
        }
        const playerEdge = player.x + player.width;
        const opponentEdge = opponent.x;
        const gap = opponentEdge - playerEdge;
    
        // Adjusted spacing for larger boxes
        const minGapNeeded = BOX_WIDTH * 2 + 10; // Minimum space for two towers + small padding
        let towerSpacing = Math.max(10, gap / 8); // Reduced spacing
        let tower1X = playerEdge + towerSpacing;
        let tower2X = opponentEdge - towerSpacing - BOX_WIDTH;
    
        // Prevent overlap if gap is extremely small
        if (tower1X + BOX_WIDTH > tower2X) {
            console.warn("Gap very small, towers might overlap. Adjusting positions.");
            const centerPoint = playerEdge + gap / 2;
            tower1X = centerPoint - BOX_WIDTH - 5; // Tower 1 left of center
            tower2X = centerPoint + 5; // Tower 2 right of center
        }
    
        for (let i = 0; i < TOWER_HEIGHT; i++) {
            // Box Y position calculation (stacked directly with no spacing)
            const boxY = towerBaseActualY - (i + 1) * BOX_HEIGHT - 80;
    
            // Assign random type from initialBoxTypes to ALL boxes initially
            const type1 = initialBoxTypes[Math.floor(Math.random() * initialBoxTypes.length)];
            const image1 = loadedPropImages[type1] || loadedPropImages.mystery; // Fallback
    
            boxTower1.push({
                x: tower1X,
                y: boxY,
                width: BOX_WIDTH,
                height: BOX_HEIGHT,
                vy: 0,
                img: image1,
                type: type1,
                active: true,
                isFalling: false,
            });
    
            const type2 = initialBoxTypes[Math.floor(Math.random() * initialBoxTypes.length)];
            const image2 = loadedPropImages[type2] || loadedPropImages.mystery; // Fallback
    
            boxTower2.push({
                x: tower2X,
                y: boxY,
                width: BOX_WIDTH,
                height: BOX_HEIGHT,
                vy: 0,
                img: image2,
                type: type2,
                active: true,
                isFalling: false,
            });
        }
        console.log("Box towers spawned with no spacing between boxes.");
        updateBoxTypes();
    }


    function startGame() {
        const chosenCharData = characterData.find(c => c.id === selectedCharacter);
        if (!chosenCharData) {
            console.error(`Could not find character data for ID: ${selectedCharacter}`);
            alert("Error starting game. Character data missing.");
            resetGame();
            if (startMenu) startMenu.style.display = 'flex';
            return;
        }
        if (loadedGameImages[chosenCharData.id] === null) {
             console.warn(`Game image for ${chosenCharData.name} failed to load.`);
        }
        if (startMenu) startMenu.style.display = 'none';
        if (gameArea) gameArea.style.display = 'block';
        gameOver = false; activeProjectile = null;
        if (gameOverMessage) gameOverMessage.style.display = 'none';
        powerUp = null; if (ccrMessageDisplay) ccrMessageDisplay.style.display = 'none';
        projectiles = []; isPlayerTurn = true;
        playerPowerUp = null; opponentPowerUp = null;
        const edgePadding = -75;
        player = {
            x: edgePadding, y: canvas.height - CHARACTER_HEIGHT - 10,
            width: CHARACTER_WIDTH, height: CHARACTER_HEIGHT, hp: 100,
            id: chosenCharData.id, name: chosenCharData.name,
            img: loadedGameImages[chosenCharData.id],
            isHit: false, hitStartTime: 0
        };
        const availableOpponents = characterData.filter(c => c.id !== selectedCharacter);
        const randomOpponentData = availableOpponents.length > 0
            ? availableOpponents[Math.floor(Math.random() * availableOpponents.length)] : chosenCharData;
        opponent = {
            x: canvas.width - CHARACTER_WIDTH - edgePadding, y: canvas.height - CHARACTER_HEIGHT - 10,
            width: CHARACTER_WIDTH, height: CHARACTER_HEIGHT, hp: 100,
            id: randomOpponentData.id, name: randomOpponentData.name,
            img: loadedGameImages[randomOpponentData.id],
            isHit: false, hitStartTime: 0
        };
         if (loadedGameImages[randomOpponentData.id] === null) {
            console.warn(`Game image for opponent ${randomOpponentData.name} failed to load.`);
        }
        const playerCenterX = player.x + player.width / 2;
        const opponentCenterX = opponent.x + opponent.width / 2;
        const worldMidPoint = (playerCenterX + opponentCenterX) / 2;
        cameraX = canvas.width / 2 - worldMidPoint;
        spawnBoxTowers(); // Spawn after player/opponent placed
        stopCharacterAudio(); removeMuteButton();
        let audioPathToPlay = (player.id === 'basescu') ? basescuAudioPath : NormalAudioPath;
        if (audioPathToPlay) {
            try {
                characterAudio = new Audio(audioPathToPlay);
                characterAudio.loop = true; characterAudio.muted = isMuted;
                characterAudio.play().catch(error => console.warn(`Audio playback warning:`, error));
            } catch (e) { console.error("Error playing audio:", e); characterAudio = null; }
        } else { characterAudio = null; }
        createMuteButton();
        updateUI();
        if (canvas) {
            canvas.addEventListener('mousedown', handleMouseDown);
            canvas.addEventListener('mouseup', handleMouseUp);
            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('mouseleave', handleMouseLeave);
        } else {
             console.error("FATAL: Canvas element lost during game start!");
             alert("Critical error: Game canvas disappeared!");
             return;
        }
        console.log("Game loop starting...");
        requestAnimationFrame(gameLoop);
    }

    function resetGame() {
        console.log("Resetting game state.");
        if(canvas) {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
        }
        stopCharacterAudio(); removeMuteButton();
        selectedCharacter = null; player = null; opponent = null; projectiles = [];
        isPlayerTurn = true; isCharging = false; gameOver = false;
        aimAngle = -Math.PI / 4; mousePos = { x: 0, y: 0 }; cameraX = 0;
        activeProjectile = null; powerUp = null;
        boxTower1 = []; boxTower2 = [];
        playerPowerUp = null; opponentPowerUp = null;
        if (ccrMessageDisplay) ccrMessageDisplay.style.display = 'none';
        if (startButton) startButton.disabled = true;
        document.querySelectorAll('.character-option').forEach(opt => opt.classList.remove('selected'));
        if (powerMeterContainer) powerMeterContainer.style.display = 'none';
        updateUI();
        if (turnIndicator) turnIndicator.textContent = "Select Character";
        populateCharacterSelection();
    }

    // =========================================================================
    // Audio & Mute Button Helper Functions
    // =========================================================================
    function createMuteButton() {
        if (!gameArea) return;
        removeMuteButton();
        muteButton = document.createElement('img');
        muteButton.id = 'mute-button';
        muteButton.src = isMuted ? muteIconPath : unmuteIconPath;
        muteButton.alt = isMuted ? 'Unmute' : 'Mute';
        muteButton.title = isMuted ? 'Unmute Sound' : 'Mute Sound';
        Object.assign(muteButton.style, {
            position: 'absolute', top: '15%', right: '10px',
            width: '32px', height: '32px', cursor: 'pointer',
            zIndex: '150', border: '1px solid #ccc', borderRadius: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.7)', padding: '2px'
        });
        muteButton.onerror = (e) => {
            console.error(`Failed to load mute icon: ${e.target.src}`);
            e.target.alt = "Mute/Unmute (icon error)";
        };
        muteButton.addEventListener('click', toggleMute);
        gameArea.appendChild(muteButton);
     }
    function removeMuteButton() {
        if (muteButton && muteButton.parentNode) {
            muteButton.removeEventListener('click', toggleMute);
            muteButton.parentNode.removeChild(muteButton);
        }
        muteButton = null;
     }
    function toggleMute() {
        isMuted = !isMuted;
        if (muteButton) {
            muteButton.src = isMuted ? muteIconPath : unmuteIconPath;
            muteButton.alt = isMuted ? 'Unmute' : 'Mute';
            muteButton.title = isMuted ? 'Unmute Sound' : 'Mute Sound';
        }
        if (characterAudio) characterAudio.muted = isMuted;
        console.log(`Sound ${isMuted ? 'muted' : 'unmuted'}.`);
     }
    function stopCharacterAudio() {
        if (characterAudio) {
            characterAudio.pause(); characterAudio.currentTime = 0; characterAudio = null;
        }
     }
    // =========================================================================
    // Player Input Handling
    // =========================================================================
     function handleMouseDown(event) {
        if (!isPlayerTurn || gameOver || isCharging || !player) return;
        isCharging = true; chargeStartTime = Date.now();
        updateAimAngle();
        if (powerMeterContainer) powerMeterContainer.style.display = 'flex';
        updatePowerMeter();
    }
    function handleMouseUp(event) {
        if (!isPlayerTurn || !isCharging || gameOver || !player) return;
        const chargeTime = Math.min(Date.now() - chargeStartTime, MAX_CHARGE_TIME);
        const powerRatio = chargeTime / MAX_CHARGE_TIME;
        const baseSpeed = 6; const maxAddedSpeed = 18;
        const power = baseSpeed + powerRatio * maxAddedSpeed;
        let baseDamage = Math.max(MIN_DAMAGE, Math.ceil(MIN_DAMAGE + powerRatio * (MAX_DAMAGE - MIN_DAMAGE)));
        const velocityX = Math.cos(aimAngle) * power; const velocityY = Math.sin(aimAngle) * power;
        const playerCenterX = player.x + player.width / 2; const playerCenterY = player.y + player.height / 2;
        const startOffset = player.width / 2 + PROJECTILE_RADIUS + 2;
        const startX = playerCenterX + Math.cos(aimAngle) * startOffset; const startY = playerCenterY + Math.sin(aimAngle) * startOffset;
        const newProjectile = {
            x: startX, y: startY, vx: velocityX, vy: velocityY, radius: PROJECTILE_RADIUS, owner: 'player',
            damage: baseDamage, bouncesLeft: PROJECTILE_BOUNCES, alpha: 1, powerRatio: powerRatio,
            isEmpowered: false, originalRadius: PROJECTILE_RADIUS, didHitTarget: false, customBallImage: null
        };
        if (playerPowerUp) {
            console.log(`Player using power-up: ${playerPowerUp.type}`);
            newProjectile.damage = Math.ceil(baseDamage * playerPowerUp.multiplier);
            if (playerPowerUp.ballImage) { newProjectile.customBallImage = playerPowerUp.ballImage; newProjectile.radius *= 1.3; }
            if (playerPowerUp.type === 'consti_target') showCCRMessage();
             playerPowerUp = null; // Consume
        }
        projectiles.push(newProjectile); activeProjectile = newProjectile; isCharging = false;
        if (powerMeterContainer) powerMeterContainer.style.display = 'none';
        switchTurn();
    }
    function handleMouseMove(event) {
        if (!canvas) return; const rect = canvas.getBoundingClientRect();
        mousePos.x = event.clientX - rect.left; mousePos.y = event.clientY - rect.top;
        if (isPlayerTurn && !gameOver && player) updateAimAngle();
     }
    function handleMouseLeave(event) {
        if (isCharging) {
            isCharging = false; if (powerMeterContainer) powerMeterContainer.style.display = 'none';
            console.log("Charge cancelled: Mouse left canvas.");
        }
     }
    function updateAimAngle() {
        if (!player) return; const worldMouseX = mousePos.x - cameraX; const worldMouseY = mousePos.y;
        const playerCenterX = player.x + player.width / 2; const playerCenterY = player.y + player.height / 2;
        aimAngle = Math.atan2(worldMouseY - playerCenterY, worldMouseX - playerCenterX);
     }
    function updatePowerMeter() {
        if (!isCharging || !powerValueDisplay || !powerBarFg) return; const elapsedTime = Date.now() - chargeStartTime;
        const chargeRatio = Math.min(elapsedTime / MAX_CHARGE_TIME, 1); const powerPercent = Math.round(chargeRatio * 100);
        powerValueDisplay.textContent = String(powerPercent); powerBarFg.style.width = `${powerPercent}%`;
     }

    // =========================================================================
    // Opponent AI Logic
    // =========================================================================
    function opponentTurn() {
        if (gameOver || !opponent || !player) return; if (turnIndicator) turnIndicator.textContent = "Opponent's Turn"; activeProjectile = null;
        setTimeout(() => {
            if (!player || !opponent || gameOver || isPlayerTurn) return;
            const targetX = player.x + player.width / 2; const targetY = player.y + player.height / 2;
            const opponentCenterX = opponent.x + opponent.width / 2; const opponentCenterY = opponent.y + opponent.height / 2;
            const dx = targetX - opponentCenterX; const dy = targetY - opponentCenterY; let baseAngle = Math.atan2(dy, dx);
            const inaccuracy = (Math.random() - 0.5) * (Math.PI / 10); const opponentAimAngle = baseAngle + inaccuracy;
            const chargeTime = (0.4 + Math.random() * 0.6) * MAX_CHARGE_TIME; const powerRatio = chargeTime / MAX_CHARGE_TIME;
            const baseSpeed = 6; const maxAddedSpeed = 18; const power = baseSpeed + powerRatio * maxAddedSpeed;
            let baseDamage = Math.max(MIN_DAMAGE, Math.ceil(MIN_DAMAGE + powerRatio * (MAX_DAMAGE - MIN_DAMAGE)));
            const velocityX = Math.cos(opponentAimAngle) * power; const velocityY = Math.sin(opponentAimAngle) * power;
            const startOffset = opponent.width / 2 + PROJECTILE_RADIUS + 2;
            const startX = opponentCenterX + Math.cos(opponentAimAngle) * startOffset; const startY = opponentCenterY + Math.sin(opponentAimAngle) * startOffset;
            const newProjectile = {
                x: startX, y: startY, vx: velocityX, vy: velocityY, radius: PROJECTILE_RADIUS, owner: 'opponent',
                damage: baseDamage, bouncesLeft: PROJECTILE_BOUNCES, alpha: 1, powerRatio: powerRatio,
                isEmpowered: false, originalRadius: PROJECTILE_RADIUS, didHitTarget: false, customBallImage: null
            };
            if (opponentPowerUp) {
                console.log(`Opponent using power-up: ${opponentPowerUp.type}`);
                newProjectile.damage = Math.ceil(baseDamage * opponentPowerUp.multiplier);
                 if (opponentPowerUp.ballImage) { newProjectile.customBallImage = opponentPowerUp.ballImage; newProjectile.radius *= 1.3; }
                 if (opponentPowerUp.type === 'consti_target') showCCRMessage();
                 opponentPowerUp = null; // Consume
            }
            projectiles.push(newProjectile); activeProjectile = newProjectile;
            if (!gameOver) setTimeout(() => { if (!gameOver) switchTurn(); }, 500);
        }, 1000 + Math.random() * 1000);
    }

    // =========================================================================
    // Game Loop, Physics & Collision Updates
    // =========================================================================
    function updateCamera() {
        if (!player || !opponent || !canvas) return;
        let targetWorldX, targetViewportX;
        if (activeProjectile && activeProjectile.bouncesLeft >= 0) { targetWorldX = activeProjectile.x; targetViewportX = canvas.width / 2; }
        else if (isPlayerTurn) { targetWorldX = player.x + player.width / 2; targetViewportX = canvas.width * (1/3); }
        else { targetWorldX = opponent.x + opponent.width / 2; targetViewportX = canvas.width * (2/3); }
        let desiredCameraX = targetViewportX - targetWorldX;
        let worldMinX = player?.x ?? 0; let worldMaxX = opponent?.x + opponent?.width ?? canvas.width;
        const firstTowerX = boxTower1.length > 0 && boxTower1[0] ? boxTower1[0].x : worldMinX;
        const secondTowerX = boxTower2.length > 0 && boxTower2[0] ? boxTower2[0].x : worldMaxX;
        worldMinX = Math.min(worldMinX, firstTowerX); worldMaxX = Math.max(worldMaxX, secondTowerX + BOX_WIDTH);
        const worldEdgeBuffer = 50; const minVisibleWorldX = worldMinX - worldEdgeBuffer; const maxVisibleWorldX = worldMaxX + worldEdgeBuffer;
        const maxAllowableCameraX = -(minVisibleWorldX); const minAllowableCameraX = canvas.width - maxVisibleWorldX;
        if (minAllowableCameraX < maxAllowableCameraX) desiredCameraX = Math.max(minAllowableCameraX, Math.min(maxAllowableCameraX, desiredCameraX));
        else { const worldMidPointFallback = worldMinX + (worldMaxX - worldMinX) / 2; desiredCameraX = canvas.width / 2 - worldMidPointFallback; }
        cameraX += (desiredCameraX - cameraX) * CAMERA_SMOOTHING;
     }

    function updateProjectiles() {
        for (let i = projectiles.length - 1; i >= 0; i--) {
            if (!projectiles[i]) continue; const p = projectiles[i]; p.x += p.vx; p.y += p.vy; p.vy += GRAVITY;
            const offScreenBuffer = canvas.width; const viewLeft = -cameraX - offScreenBuffer; const viewRight = -cameraX + canvas.width + offScreenBuffer;
            const viewBottom = canvas.height + offScreenBuffer * 2; const viewTop = -offScreenBuffer;
            if (p.x < viewLeft || p.x > viewRight || p.y > viewBottom || p.y < viewTop ) {
                 console.log("Projectile went out of bounds."); if (activeProjectile === p) activeProjectile = null; projectiles.splice(i, 1); continue;
            }
             if (p.bouncesLeft === -1 && Math.abs(p.vx) < 0.1 && Math.abs(p.vy) < 0.1) {
                  console.log("Projectile stopped, removing."); if (activeProjectile === p) activeProjectile = null; projectiles.splice(i, 1); continue;
             }
        }
    }

    function updateBoxPhysics() {
        const groundLevelY = canvas.height - 10; // Actual ground line
        const towerBaseRestY = groundLevelY - TOWER_BASE_Y_OFFSET; // Top edge Y where lowest box should sit

        const updateTower = (tower) => {
             for (let i = tower.length - 1; i >= 0; i--) { // Check from top down
                const box = tower[i]; if (!box.active) continue; let supported = false; const boxBottom = box.y + box.height;

                // Check ground support first
                if (boxBottom >= towerBaseRestY - 1) { // Check against resting Y pos
                    box.y = towerBaseRestY - box.height; // Snap
                    box.vy = 0; box.isFalling = false; supported = true;
                } else {
                    // Check support by boxes below
                    let supportBoxY = -1;
                    for (let j = 0; j < tower.length; j++) {
                        if (i === j) continue; const lowerBox = tower[j];
                         if (lowerBox.active && Math.abs(box.x - lowerBox.x) < 5 && boxBottom <= lowerBox.y + 1 && box.y < lowerBox.y ) {
                             if (boxBottom >= lowerBox.y - BOX_FALL_SPEED) { if(lowerBox.y > supportBoxY) supportBoxY = lowerBox.y; }
                         }
                    }
                    if(supportBoxY > -1) { box.y = supportBoxY - box.height; box.vy = 0; box.isFalling = false; supported = true; }
                }
                // If not supported, fall
                if (!supported) {
                    box.isFalling = true; box.y += BOX_FALL_SPEED;
                     // Re-check ground after falling
                     if (box.y + box.height >= towerBaseRestY) { box.y = towerBaseRestY - box.height; box.vy = 0; box.isFalling = false; }
                }
            }
        };
        updateTower(boxTower1); updateTower(boxTower2);
    }

    function updateBoxTypes() {
        const processTower = (tower) => {
            if (tower.length === 0) return;

             // Find the highest active box Y coordinate in the tower
            let highestActiveY = Infinity;
             for(const box of tower) {
                 if(box.active && box.y < highestActiveY) {
                      highestActiveY = box.y;
                 }
             }
             if (highestActiveY === Infinity) return; // No active boxes

            // Update types based on position relative to other boxes
            for (let i = 0; i < tower.length; i++) {
                const box = tower[i];
                if (!box.active) continue;

                let isHighest = (Math.abs(box.y - highestActiveY) < 1); // Is this the top active box?
                let hasActiveBoxDirectlyAbove = false;

                 // Check if any active box is directly above this one
                 for (let j = 0; j < tower.length; j++) {
                     if (i === j) continue;
                     const otherBox = tower[j];
                     if (otherBox.active &&
                         Math.abs(box.x - otherBox.x) < 5 && // Same column
                         Math.abs(otherBox.y + otherBox.height - box.y) < 5) { // Is other box's bottom just above this box's top?
                         hasActiveBoxDirectlyAbove = true;
                         break;
                     }
                 }

                 // --- Apply Rules ---
                 let targetType = box.type;
                 let typeChanged = false;

                 // Rule 1: If a box has an active box directly ABOVE it, it MUST be mystery.
                 if (hasActiveBoxDirectlyAbove) {
                     if (box.type !== 'mystery') {
                         targetType = 'mystery';
                         typeChanged = true;
                         // console.log(`Box at ${box.y.toFixed(0)} has box above, forcing MYSTERY`);
                     }
                 }
                 // Rule 2: If a box IS the highest active box, it CANNOT be mystery.
                 else if (isHighest) {
                     if (box.type === 'mystery') {
                         targetType = initialBoxTypes[Math.floor(Math.random() * initialBoxTypes.length)]; // Change from mystery
                         typeChanged = true;
                         // console.log(`Box at ${box.y.toFixed(0)} is highest, changing from MYSTERY to ${targetType}`);
                     }
                 }
                 // If neither rule applies (e.g., it's the bottom box with nothing above), it keeps its current type.

                 // Update if type changed
                 if (typeChanged) {
                     box.type = targetType;
                     box.img = loadedPropImages[targetType] || loadedPropImages.mystery;
                 }
            }
        };
        processTower(boxTower1);
        processTower(boxTower2);
    }


    function checkCollisions() {
         if (!canvas) return;
        const groundY = canvas.height - 10; // Projectile ground collision Y

        for (let i = projectiles.length - 1; i >= 0; i--) {
            if (!projectiles[i]) continue;
            const p = projectiles[i];
            let projectileRemovedThisCheck = false;

            // --- Character Collisions ---
             let targetCharacter = null;
            if (p.owner === 'player' && opponent && !opponent.isHit && isColliding(p, opponent)) targetCharacter = opponent;
            else if (p.owner === 'opponent' && player && !player.isHit && isColliding(p, player)) targetCharacter = player;

            if (targetCharacter) {
                let finalDamage = p.damage;
                 if (p.isEmpowered) { console.log(`CCR Ground Power-Up Effect Active on Hit!`); showCCRMessage(); p.isEmpowered = false; }
                targetCharacter.hp = Math.max(0, targetCharacter.hp - finalDamage);
                targetCharacter.isHit = true; targetCharacter.hitStartTime = Date.now();
                p.didHitTarget = true; if (activeProjectile === p) activeProjectile = null;
                projectiles.splice(i, 1); projectileRemovedThisCheck = true;
                updateUI(); checkGameOver(); continue;
            }

            // --- Box Collisions ---
             if (!projectileRemovedThisCheck) {
                 let hitBox = null;
                 let hitTower = null;
                 const findHitBox = (tower) => {
                    for (let j = tower.length - 1; j >= 0; j--) {
                         const box = tower[j]; if (box.active && isColliding(p, box)) return { box: box, tower: tower };
                    } return null;
                 };
                 const hitResult = findHitBox(boxTower1) || findHitBox(boxTower2);

                 if (hitResult) {
                     hitBox = hitResult.box; hitTower = hitResult.tower;
                     console.log(`Projectile hit a box of type: ${hitBox.type}`);
                     const originalType = hitBox.type; // Store original type before deactivation

                     hitBox.active = false; hitBox.vy = 0; hitBox.isFalling = false;

                     // Grant power-up only if hit box type is in specialBoxTypes and power threshold met
                     if (p.powerRatio >= POWER_THRESHOLD && specialBoxTypes.includes(originalType)) {
                         console.log(`Box hit with ~100% power! Granting power-up: ${originalType} to ${p.owner}`);
                         const hittingPlayerIsPlayer = (p.owner === 'player');
                         switch (originalType) { // Check the original type that was hit
                             case 'spaga': // Grant spaga ball if spaga box is hit
                                 if (hittingPlayerIsPlayer) playerPowerUp = { type: 'spaga', multiplier: SPAGA_MULTIPLIER, ballImage: loadedPropImages.spagaBall };
                                 else opponentPowerUp = { type: 'spaga', multiplier: SPAGA_MULTIPLIER, ballImage: loadedPropImages.spagaBall };
                                 break;
                             case 'dosare':
                                  if (hittingPlayerIsPlayer) playerPowerUp = { type: 'dosare', multiplier: DOSARE_MULTIPLIER, ballImage: null };
                                 else opponentPowerUp = { type: 'dosare', multiplier: DOSARE_MULTIPLIER, ballImage: null };
                                 break;
                             case 'arme':
                                 if (hittingPlayerIsPlayer) { console.log("Player hit ARME, Opponent gets Consti buff"); opponentPowerUp = { type: 'consti_target', multiplier: POWERUP_DAMAGE_MULTIPLIER, ballImage: null }; }
                                 else { console.log("Opponent hit ARME, Player gets Consti buff"); playerPowerUp = { type: 'consti_target', multiplier: POWERUP_DAMAGE_MULTIPLIER, ballImage: null }; }
                                 break;
                         }
                     } else if (specialBoxTypes.includes(originalType)) {
                         console.log("Special box hit, but not with enough power for power-up.");
                     }

                     if (activeProjectile === p) activeProjectile = null;
                     projectiles.splice(i, 1); projectileRemovedThisCheck = true; continue;
                 }
             }

            // --- Power-Up Collision (Ground CCR) ---
            if (!projectileRemovedThisCheck && powerUp && powerUp.active && loadedPropImages.constiPowerUp && isColliding(p, powerUp)) {
                 console.log("Projectile hit CCR ground power-up!"); powerUp.active = false; p.isEmpowered = true;
                 p.customBallImage = loadedPropImages.constiPowerUp; p.radius *= 1.5;
             }

            // --- Ground Collision ---
            if (!projectileRemovedThisCheck && p.y + p.radius >= groundY) {
                 p.y = groundY - p.radius;
                 if (p.bouncesLeft > 0) { p.bouncesLeft--; p.vy = -p.vy * 0.6; p.vx *= 0.8; if (Math.abs(p.vy) < 1 && Math.abs(p.vx) < 0.5) { p.bouncesLeft = -1; p.vy = 0; p.vx = 0; }}
                 else { p.bouncesLeft = -1; p.vy = 0; p.vx *= 0.5; if (Math.abs(p.vx) < 0.1) p.vx = 0; }
                 if (p.bouncesLeft === -1 && activeProjectile === p) activeProjectile = null;
            }
        } // End projectile loop
    }

    function isColliding(circle, rect) {
        if (!rect || !circle) return false; const rectX = rect.x; const rectY = rect.y; const rectWidth = rect.width || POWERUP_WIDTH; const rectHeight = rect.height || POWERUP_HEIGHT;
        const closestX = Math.max(rectX, Math.min(circle.x, rectX + rectWidth)); const closestY = Math.max(rectY, Math.min(circle.y, rectY + rectHeight));
        const distanceX = circle.x - closestX; const distanceY = circle.y - closestY; const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
        const collisionRadius = circle.originalRadius || circle.radius; return distanceSquared < (collisionRadius * collisionRadius);
    }

    function checkGameOver() {
        if (gameOver) return; let winner = null;
        if (player && player.hp <= 0) winner = opponent ? `${opponent.name} Wins!` : "Opponent Wins!";
        else if (opponent && opponent.hp <= 0) winner = player ? `${player.name} Wins!` : "Player Wins!";
        if (winner) endGame(winner);
    }
    function endGame(message) {
        if (gameOver) return; console.log(`Game Over: ${message}`); gameOver = true; isCharging = false; activeProjectile = null; stopCharacterAudio(); removeMuteButton();
        if (powerMeterContainer) powerMeterContainer.style.display = 'none'; if (winnerMessage) winnerMessage.textContent = message; if (gameOverMessage) gameOverMessage.style.display = 'block';
        if (turnIndicator) turnIndicator.textContent = "Game Over";
        if(canvas) { canvas.removeEventListener('mousedown', handleMouseDown); canvas.removeEventListener('mouseup', handleMouseUp); canvas.removeEventListener('mousemove', handleMouseMove); canvas.removeEventListener('mouseleave', handleMouseLeave); }
    }

    // =========================================================================
    // Power-Up Logic (Original Ground Spawn - Keep or Remove?)
    // =========================================================================
    function spawnPowerUp() { if (!powerUpImage || (powerUp && powerUp.active)) return; if (!player || !opponent) return; console.log("Spawning CCR GROUND Power-Up!"); const playerCenterX = player.x + player.width / 2; const opponentCenterX = opponent.x + opponent.width / 2; const spawnX = (playerCenterX + opponentCenterX) / 2 - POWERUP_WIDTH / 2; const spawnY = canvas.height / 2 - POWERUP_HEIGHT / 2; console.log(`Ground Power-up spawn position: X=${spawnX.toFixed(1)}, Y=${spawnY.toFixed(1)}`); powerUp = { x: spawnX, y: spawnY, width: POWERUP_WIDTH, height: POWERUP_HEIGHT, active: true }; }
     function showCCRMessage() { if (ccrMessageDisplay) { console.log("Displaying CCR Power-Up message."); ccrMessageDisplay.style.display = 'block'; setTimeout(() => { if (ccrMessageDisplay) ccrMessageDisplay.style.display = 'none'; console.log("Hiding CCR Power-Up message."); }, CCR_MESSAGE_DURATION); } else console.warn("CCR message display element not found."); }

    // =========================================================================
    // Drawing Functions
    // =========================================================================
    function shouldShowPopup() { const chance = Math.random(); return chance <= 0.01; }
    // Popup Ad Logic
     if (popupAd) { popupAd.addEventListener('click', (event) => { if (event.target.id !== 'close-ad-btn') window.open('https://youtu.be/KJ93TYw6geU?si=yu6_bJ1GfzWZhmiJ&t=10', '_blank'); }); if (shouldShowPopup()) popupAd.style.display = 'block'; else popupAd.style.display = 'none'; } if (closeAdBtn) { closeAdBtn.addEventListener('click', (event) => { event.stopPropagation(); if (popupAd) popupAd.style.display = 'none'; }); }
    function drawGround() { ctx.fillStyle = '#5d5745'; const groundWidth = canvas.width * 3; const groundStartX = -canvas.width; ctx.fillRect(groundStartX, canvas.height - 10, groundWidth, 10); }
    function drawCharacter(char) { if (!char) return; const bounceDistance = 5; const bounceDuration = 300; const currentTime = Date.now(); let drawX = char.x; let drawY = char.y; if (char.isHit && currentTime - char.hitStartTime < bounceDuration) { const elapsedTime = currentTime - char.hitStartTime; const progress = elapsedTime / bounceDuration; const bounceOffset = bounceDistance * Math.sin(progress * Math.PI); drawX += char === player ? -bounceOffset : bounceOffset; } if (char.isHit && currentTime - char.hitStartTime >= HIT_EFFECT_DURATION) char.isHit = false; const drawWidth = char.width; const drawHeight = char.height; const shouldFlip = (char === opponent); ctx.save(); if (shouldFlip) { ctx.translate(drawX + drawWidth / 2, 0); ctx.scale(-1, 1); ctx.translate(-(drawX + drawWidth / 2), 0); } if (char.img) ctx.drawImage(char.img, drawX, drawY, drawWidth, drawHeight); else { ctx.fillStyle = (char === player) ? 'rgba(0, 0, 255, 0.7)' : 'rgba(255, 0, 0, 0.7)'; ctx.fillRect(drawX, drawY, drawWidth, drawHeight); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(drawX, drawY, drawWidth, drawHeight); } ctx.restore(); const hpBarWidth = drawWidth * 0.8; const hpBarHeight = 8; const hpBarX = char.x + (drawWidth - hpBarWidth) / 2; const hpBarY = char.y - hpBarHeight - 7; const currentHp = typeof char.hp === 'number' ? Math.max(0, char.hp) : 0; const maxHp = 100; const currentHpWidth = Math.max(0,(currentHp / maxHp) * hpBarWidth); ctx.fillStyle = '#555'; ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight); ctx.fillStyle = currentHp < maxHp * 0.3 ? '#dc3545' : (currentHp < maxHp * 0.6 ? '#ffc107' : '#28a745'); if (currentHpWidth > 0) ctx.fillRect(hpBarX, hpBarY, currentHpWidth, hpBarHeight); ctx.strokeStyle = '#333'; ctx.lineWidth = 1; ctx.strokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight); }
    function drawBoxTowers(tower) { tower.forEach(box => { if (box.active) { if (box.img) ctx.drawImage(box.img, box.x, box.y, box.width, box.height); else { ctx.fillStyle = 'saddlebrown'; ctx.fillRect(box.x, box.y, box.width, box.height); ctx.strokeStyle = 'black'; ctx.strokeRect(box.x, box.y, box.width, box.height); } } }); }
    function drawProjectiles() { projectiles.forEach(p => { ctx.save(); ctx.globalAlpha = p.alpha; const drawRadius = p.radius; const drawX = p.x - drawRadius; const drawY = p.y - drawRadius; if (p.customBallImage) ctx.drawImage(p.customBallImage, drawX, drawY, drawRadius * 2, drawRadius * 2); else { ctx.fillStyle = p.owner === 'player' ? '#4ecdc4' : '#ff6b6b'; ctx.beginPath(); ctx.arc(p.x, p.y, p.originalRadius, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); }); }
    function drawAimIndicator() { if (!isPlayerTurn || gameOver || !player || isCharging) return; const arrowLength = 45; const arrowHeadSize = 10; const distanceFromCharCenter = player.width / 2 + 5; const arrowColor = 'rgba(255, 255, 255, 0.8)'; const arrowLineWidth = 2; const playerCenterX = player.x + player.width / 2; const playerCenterY = player.y + player.height / 2; const arrowBaseX = playerCenterX + Math.cos(aimAngle) * distanceFromCharCenter; const arrowBaseY = playerCenterY + Math.sin(aimAngle) * distanceFromCharCenter; const arrowTipX = arrowBaseX + Math.cos(aimAngle) * arrowLength; const arrowTipY = arrowBaseY + Math.sin(aimAngle) * arrowLength; ctx.save(); ctx.beginPath(); ctx.moveTo(arrowBaseX, arrowBaseY); ctx.lineTo(arrowTipX, arrowTipY); ctx.strokeStyle = arrowColor; ctx.lineWidth = arrowLineWidth; ctx.stroke(); ctx.translate(arrowTipX, arrowTipY); ctx.rotate(aimAngle); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-arrowHeadSize, -arrowHeadSize / 2); ctx.moveTo(0, 0); ctx.lineTo(-arrowHeadSize, arrowHeadSize / 2); ctx.strokeStyle = arrowColor; ctx.lineWidth = arrowLineWidth; ctx.stroke(); ctx.restore(); }

     // =========================================================================
     // Main Game Loop
     // =========================================================================
     function gameLoop(timestamp) {
         if (gameOver) return;

         // --- Updates ---
         updateCamera();
         updateProjectiles();
         updateBoxPhysics(); // Update box falling state FIRST
         updateBoxTypes();   // THEN update types based on new positions/support
         checkCollisions();
         if (isCharging && isPlayerTurn) updatePowerMeter();


         // --- Drawing ---
         ctx.clearRect(0, 0, canvas.width, canvas.height);
         ctx.save();
         // DO NOT TRANSLATE YET - Background drawn relative to canvas 0,0

         // --- Draw Background (Scaled Fill + Pan without showing edges) ---
         if (backgroundImage) {
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const bgW = backgroundImage.naturalWidth;
            const bgH = backgroundImage.naturalHeight;

            // Calculate scale to ensure background covers canvas dimensions
            const scale = Math.max(canvasWidth / bgW, canvasHeight / bgH);
            const scaledW = bgW * scale;
            const scaledH = bgH * scale;

             // Calculate World Bounds dynamically for panning range (incl. buffer)
            const buffer = canvasWidth * 0.1; // Small buffer
            let worldMinX = (player?.x ?? 0);
            let worldMaxX = (opponent?.x + opponent?.width ?? canvasWidth);
            const firstTowerX = boxTower1.length > 0 && boxTower1[0] ? boxTower1[0].x : worldMinX;
            const secondTowerX = boxTower2.length > 0 && boxTower2[0] ? boxTower2[0].x : worldMaxX;
            worldMinX = Math.min(worldMinX, firstTowerX) - buffer;
            worldMaxX = Math.max(worldMaxX, secondTowerX + BOX_WIDTH) + buffer;
            const worldWidth = worldMaxX - worldMinX;

            // Determine camera scroll range within the world
            const cameraScrollRange = Math.max(0, worldWidth - canvasWidth);

            // Calculate camera offset and progress (0 to 1) - clamped
            const cameraOffset = Math.max(0, Math.min(cameraScrollRange, -cameraX - worldMinX));
            const cameraProgress = (cameraScrollRange > 0) ? (cameraOffset / cameraScrollRange) : 0.5;

            // Calculate how much the SCALED background can pan
            const bgPannableWidth = Math.max(0, scaledW - canvasWidth);

            // Calculate background draw X based on camera progress
            const bgDrawX = -(cameraProgress * bgPannableWidth);

            // Calculate vertical draw position (center vertically)
            const bgDrawY = (canvasHeight - scaledH) / 2;

            // Draw the background relative to canvas 0,0
            ctx.drawImage(backgroundImage, bgDrawX, bgDrawY, scaledW, scaledH);

        } else {
             // Fallback color fills the canvas
              ctx.fillStyle = '#1c2a3e';
              ctx.fillRect(0, 0, canvas.width, canvas.height); // Relative to canvas 0,0
         }
        // --- End Draw Background ---

         // --- Draw World Elements (with camera translation NOW) ---
         ctx.translate(cameraX, 0); // Apply camera offset for world elements

         drawGround();
         if (player) drawCharacter(player);
         if (opponent) drawCharacter(opponent);
         drawBoxTowers(boxTower1);
         drawBoxTowers(boxTower2);
         if (powerUp && powerUp.active && powerUpImage) ctx.drawImage(powerUpImage, powerUp.x, powerUp.y, powerUp.width, powerUp.height);
         drawProjectiles();
         drawAimIndicator();

         ctx.restore(); // Remove camera offset

         requestAnimationFrame(gameLoop);
     }

    // =========================================================================
    // UI Update & Turn Switching
    // =========================================================================
    function updateUI() { if (playerHpDisplay) { playerHpDisplay.textContent = player ? String(Math.max(0, player.hp)) : '---'; if (player) playerHpDisplay.style.color = player.hp < 30 ? '#dc3545' : (player.hp < 60 ? '#ffc107' : 'white'); else playerHpDisplay.style.color = 'white'; } if (opponentHpDisplay) { opponentHpDisplay.textContent = opponent ? String(Math.max(0, opponent.hp)) : '---'; if (opponent) opponentHpDisplay.style.color = opponent.hp < 30 ? '#dc3545' : (opponent.hp < 60 ? '#ffc107' : 'white'); else opponentHpDisplay.style.color = 'white'; } if (turnIndicator) { if (gameOver) { turnIndicator.textContent = "Game Over"; turnIndicator.style.backgroundColor = 'grey'; } else { turnIndicator.textContent = isPlayerTurn ? "Your Turn" : "Opponent's Turn"; turnIndicator.style.backgroundColor = isPlayerTurn ? 'rgba(78, 205, 196, 0.8)' : 'rgba(255, 107, 107, 0.8)'; } } }
    function switchTurn() { if (gameOver) return; isPlayerTurn = !isPlayerTurn; activeProjectile = null; updateUI(); if (!isPlayerTurn) setTimeout(opponentTurn, 500); }

    // =========================================================================
    // Initial Setup Function
    // =========================================================================
    function initializeGame() { const elementsExist = canvas && startButton && powerMeterContainer && characterOptionsContainer && startMenu && gameArea && playerHpDisplay && opponentHpDisplay && turnIndicator && gameOverMessage && restartButton && ccrMessageDisplay && popupAd && closeAdBtn; if (elementsExist) { console.log("Essential UI elements verified. Initializing game."); resetGame(); if (startMenu) startMenu.style.display = 'flex'; if (gameArea) gameArea.style.display = 'none'; if (gameOverMessage) gameOverMessage.style.display = 'none'; } else { console.error("FATAL: Cannot initialize game - one or more essential UI elements missing!"); alert("Error initializing game UI. Critical HTML elements might be missing. Check console (F12)."); } }

    // Initialization is triggered after asset loading attempts finish.

}); // End of DOMContentLoaded Listener
