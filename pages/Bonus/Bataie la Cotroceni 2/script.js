document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
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
    const ccrMessageDisplay = document.getElementById('ccr-message'); // Added CCR message element

    // --- Essential Canvas Check ---
    if (!canvas) {
        console.error("Canvas element not found!");
        alert("Error: Could not find game canvas. Please check HTML.");
        return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("Could not get 2D context");
        alert("Error: Could not get 2D graphics context. Your browser might not support it.");
        return;
    }

    // --- Image Loading Variables ---
    let loadedGameImages = {};
    let loadingPromises = [];
    let backgroundImage = null;
    const backgroundImagePath = 'assets/background/CasaPoporului.png';
    let powerUpImage = null; // Added for power-up
    const powerUpImagePath = 'assets/images/consti.jpg'; // Added for power-up (CHECK PATH)

    // --- Character Data ---
    const characterData = [
        { id: 'basescu', name: 'Basescu', menuImage: 'assets/characters/Basescu.png', gameImage: 'assets/characters/Base.png' },
        { id: 'simion', name: 'Simion', menuImage: 'assets/characters/Simion.png', gameImage: 'assets/characters/Simi.png' },
        { id: 'nicusor', name: 'Nicusor', menuImage: 'assets/characters/Nicusor.png', gameImage: 'assets/characters/Mucusor.png' },
        { id: 'lasconi', name: 'Lasconi', menuImage: 'assets/characters/Lasconi.png', gameImage: 'assets/characters/TusaConi.png' },
        { id: 'ponta', name: 'Ciolacu', menuImage: 'assets/characters/Ciolacu.png', gameImage: 'assets/characters/Ciorapu.png' },
    ];

    // --- Audio & Mute State ---
    let characterAudio = null;
    let isMuted = false;
    let muteButton = null;
    const muteIconPath = 'assets/images/unmute.png';
    const unmuteIconPath = 'assets/images/mute.png';
    const basescuAudioPath = 'assets/audio/Basescu.mp3';
    const NormalAudioPath = 'assets/audio/background.mp3';

    // --- Game State & Config ---
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
    let powerUp = null; // { x, y, width, height, active } - Added for power-up

    // Constants
    const MAX_CHARGE_TIME = 1500;
    const MIN_DAMAGE = 5;
    const MAX_DAMAGE = 15;
    const GRAVITY = 0.15;
    const CHARACTER_WIDTH = 400 / 2.3;
    const CHARACTER_HEIGHT = 400 / 2.3;
    const PROJECTILE_RADIUS = 12;
    const PROJECTILE_BOUNCES = 2;
    const HIT_EFFECT_DURATION = 500;
    const CAMERA_SMOOTHING = 0.08;
    const POWERUP_WIDTH = 50; // Added for power-up
    const POWERUP_HEIGHT = 50; // Added for power-up
    const POWERUP_DAMAGE_MULTIPLIER = 1.8; // Added for power-up
    const CCR_MESSAGE_DURATION = 3000; // Added for power-up


    // --- loadImage Function ---
    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = (err) => {
                console.error(`Error loading image: ${src}`, err);
                reject(new Error(`Failed to load image: ${src}`));
            };
            img.src = src;
        });
    }

    // --- Preload Background Image ---
    const bgPromise = loadImage(backgroundImagePath)
        .then(img => {
            console.log(`Background image ${backgroundImagePath} loaded successfully.`);
            backgroundImage = img;
        })
        .catch(error => {
            console.error(`FAILED to load background image from ${backgroundImagePath}. Fallback color will be used.`, error);
        });
    loadingPromises.push(bgPromise);

    // --- Preload Power-Up Image --- (Added)
    const powerUpPromise = loadImage(powerUpImagePath)
        .then(img => {
            console.log(`Power-up image ${powerUpImagePath} loaded successfully.`);
            powerUpImage = img;
        })
        .catch(error => {
            console.error(`FAILED to load power-up image from ${powerUpImagePath}. Power-up disabled.`, error);
        });
    loadingPromises.push(powerUpPromise); // Add power-up promise

    // --- Preload Character Game Images ---
    characterData.forEach(char => {
        if (char.gameImage) {
            const promise = loadImage(char.gameImage)
                .then(img => {
                    console.log(`Game image ${char.gameImage} loaded successfully.`);
                    loadedGameImages[char.id] = img;
                })
                .catch(error => {
                    console.error(`CRITICAL: Failed to load game image for ${char.name} from ${char.gameImage}.`, error);
                });
            loadingPromises.push(promise);
        } else {
            console.warn(`Missing gameImage path for character: ${char.name}`);
        }
    });

    // --- Wait for all images ---
    Promise.all(loadingPromises.map(p => p.catch(e => e)))
        .then((results) => {
            console.log("All image loading attempts finished.");
            populateCharacterSelection();
        })
        .catch(error => {
            console.error("Unexpected error during image loading finalization.", error);
            populateCharacterSelection();
        });


    // --- Start Menu Logic ---
    function populateCharacterSelection() {
        if (!characterOptionsContainer) {
            console.error("Character options container (#character-select) not found!");
            return;
        }
        characterOptionsContainer.innerHTML = ''; // Clear

        characterData.forEach(char => {
            const option = document.createElement('div');
            option.classList.add('character-option');
            option.setAttribute('data-char', char.id);

            const img = document.createElement('img');
            img.src = char.menuImage || '';
            img.alt = char.name;
            img.onerror = () => {
                console.warn(`Failed to load menu image: ${char.menuImage || '(path missing)'}`);
                const fallbackText = document.createElement('div');
                fallbackText.textContent = char.name.substring(0, 3);
                fallbackText.classList.add('image-fallback');
                 const nameSpan = option.querySelector('span');
                 if(nameSpan && nameSpan.parentNode === option){
                     option.insertBefore(fallbackText, nameSpan);
                 } else {
                     option.appendChild(fallbackText);
                 }
                img.remove();
            };

            const nameSpan = document.createElement('span');
            nameSpan.textContent = char.name;

            option.appendChild(img);
            option.appendChild(nameSpan);

            option.addEventListener('click', () => {
                document.querySelectorAll('.character-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                selectedCharacter = char.id;
                if (startButton) {
                    startButton.disabled = false;
                }
            });
            characterOptionsContainer.appendChild(option);
        });
    }

    // --- Button Listeners ---
    if (startButton) {
        startButton.addEventListener('click', () => {
            if (selectedCharacter) {
                startGame();
            } else {
                alert("Please select a character first!");
            }
        });
    }

    if (restartButton) {
        restartButton.addEventListener('click', () => {
            if (gameOverMessage) gameOverMessage.style.display = 'none';
            if (gameArea) gameArea.style.display = 'none';
            if (startMenu) startMenu.style.display = 'flex'; // Use flex for start menu display
            resetGame();
        });
    }

    // --- Game Initialization ---
    function startGame() {
        const chosenCharData = characterData.find(c => c.id === selectedCharacter);
        if (!chosenCharData) {
            console.error("Could not find character data for:", selectedCharacter);
            alert("Error: Selected character data not found.");
            resetGame();
            if (startMenu) startMenu.style.display = 'flex';
            return;
        }
        if (!loadedGameImages[chosenCharData.id]) {
            console.warn(`Game image for ${chosenCharData.name} has not loaded. Fallback will be drawn.`);
        }

        if (startMenu) startMenu.style.display = 'none';
        if (gameArea) gameArea.style.display = 'block';
        gameOver = false;
        activeProjectile = null;
        if (gameOverMessage) gameOverMessage.style.display = 'none';
        powerUp = null; // Added: Reset power-up on start
        if (ccrMessageDisplay) ccrMessageDisplay.style.display = 'none'; // Added: Hide message

        const edgePadding = 15;

        player = {
            x: edgePadding,
            y: canvas.height - CHARACTER_HEIGHT - 10,
            width: CHARACTER_WIDTH, height: CHARACTER_HEIGHT, hp: 100,
            id: chosenCharData.id, name: chosenCharData.name,
            img: loadedGameImages[chosenCharData.id],
            isHit: false, hitStartTime: 0
        };

        const availableOpponents = characterData.filter(c => c.id !== selectedCharacter);
        const randomOpponentData = availableOpponents.length > 0
            ? availableOpponents[Math.floor(Math.random() * availableOpponents.length)]
            : chosenCharData;

        opponent = {
            x: canvas.width - CHARACTER_WIDTH - edgePadding,
            y: canvas.height - CHARACTER_HEIGHT - 10,
            width: CHARACTER_WIDTH, height: CHARACTER_HEIGHT, hp: 100,
            id: randomOpponentData.id, name: randomOpponentData.name,
            img: loadedGameImages[randomOpponentData.id],
            isHit: false, hitStartTime: 0
        };

        if (!loadedGameImages[randomOpponentData.id]) {
            console.warn(`Game image for opponent ${randomOpponentData.name} has not loaded.`);
        }

        const playerCenterX = player.x + player.width / 2;
        const opponentCenterX = opponent.x + opponent.width / 2;
        const worldMidPoint = (playerCenterX + opponentCenterX) / 2;
        cameraX = canvas.width / 2 - worldMidPoint;

        projectiles = [];
        isPlayerTurn = true;

        // --- AUDIO & MUTE BUTTON SETUP ---
        stopCharacterAudio();
        removeMuteButton();
        let audioPathToPlay = (player.id === 'basescu') ? basescuAudioPath : NormalAudioPath;
        if (audioPathToPlay) {
            try {
                characterAudio = new Audio(audioPathToPlay);
                characterAudio.loop = true;
                characterAudio.muted = isMuted;
                characterAudio.play().catch(error => console.warn(`Audio playback warning for ${audioPathToPlay}:`, error));
            } catch (e) { console.error("Error creating or playing audio:", e); characterAudio = null; }
        } else { characterAudio = null; }
        createMuteButton();
        // --- END AUDIO & MUTE BUTTON SETUP ---

        updateUI();

        if (canvas) {
            canvas.addEventListener('mousedown', handleMouseDown);
            canvas.addEventListener('mouseup', handleMouseUp);
            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('mouseleave', handleMouseLeave);
        } else {
             console.error("Canvas not found, cannot add game input listeners.");
        }

        requestAnimationFrame(gameLoop);
    }

    // --- resetGame function ---
    function resetGame() {
        if(canvas) {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
        }

        stopCharacterAudio();
        removeMuteButton();

        selectedCharacter = null;
        player = null; opponent = null; projectiles = [];
        isPlayerTurn = true; isCharging = false; gameOver = false;
        aimAngle = -Math.PI / 4;
        mousePos = { x: 0, y: 0 };
        cameraX = 0;
        activeProjectile = null;
        powerUp = null; // Added: Reset power-up
        if (ccrMessageDisplay) ccrMessageDisplay.style.display = 'none'; // Added: Hide message

        if (startButton) startButton.disabled = true;
        document.querySelectorAll('.character-option').forEach(opt => opt.classList.remove('selected'));
        if (powerMeterContainer) powerMeterContainer.style.display = 'none';
        updateUI();
        if (turnIndicator) turnIndicator.textContent = "Select Character";

        populateCharacterSelection();
    }

    // --- Audio & Mute Button Helpers ---
    function createMuteButton() {
        if (!gameArea) return;
        removeMuteButton();
        muteButton = document.createElement('img');
        muteButton.id = 'mute-button';
        muteButton.src = isMuted ? muteIconPath : unmuteIconPath;
        muteButton.alt = isMuted ? 'Unmute' : 'Mute';
        muteButton.title = isMuted ? 'Unmute Sound' : 'Mute Sound';
        muteButton.style.position = 'absolute';
        muteButton.style.top = '15%';
        muteButton.style.right = '10px';
        muteButton.style.width = '32px';
        muteButton.style.height = '32px';
        muteButton.style.cursor = 'pointer';
        muteButton.style.zIndex = '150';
        muteButton.style.border = 'none';
        muteButton.style.background = 'transparent';
        muteButton.style.padding = '0';
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
        if (characterAudio) {
            characterAudio.muted = isMuted;
        }
    }

    function stopCharacterAudio() {
        if (characterAudio) {
            characterAudio.pause();
            characterAudio.currentTime = 0;
            characterAudio = null;
        }
    }

    // --- Input Handling ---
    function handleMouseDown(event) {
        if (!isPlayerTurn || gameOver || isCharging || !player) return;
        isCharging = true;
        chargeStartTime = Date.now();
        updateAimAngle(); // Update angle immediately on click
        if (powerMeterContainer) powerMeterContainer.style.display = 'block'; // Show meter
        updatePowerMeter(); // Update meter display
    }

    function handleMouseUp(event) {
        if (!isPlayerTurn || !isCharging || gameOver || !player) return;

        if (powerUp) powerUp.active = false; // Deactivate existing power-up on shot

        const chargeTime = Math.min(Date.now() - chargeStartTime, MAX_CHARGE_TIME);
        const powerRatio = chargeTime / MAX_CHARGE_TIME;
        const baseSpeed = 6;
        const maxAddedSpeed = 18;
        const power = baseSpeed + powerRatio * maxAddedSpeed;
        const damage = Math.max(MIN_DAMAGE, Math.ceil(MIN_DAMAGE + powerRatio * (MAX_DAMAGE - MIN_DAMAGE)));

        const velocityX = Math.cos(aimAngle) * power;
        const velocityY = Math.sin(aimAngle) * power;

        const startX = player.x + player.width / 2 + Math.cos(aimAngle) * (player.width / 2 + PROJECTILE_RADIUS + 2);
        const startY = player.y + player.height / 2 + Math.sin(aimAngle) * (player.height / 2 + PROJECTILE_RADIUS + 2);

        const newProjectile = {
            x: startX, y: startY, vx: velocityX, vy: velocityY,
            radius: PROJECTILE_RADIUS,
            owner: 'player',
            damage: damage,
            bouncesLeft: PROJECTILE_BOUNCES,
            alpha: 1,
            isEmpowered: false,
            originalRadius: PROJECTILE_RADIUS,
            didHitTarget: false // <<< Added flag
        };
        projectiles.push(newProjectile);
        activeProjectile = newProjectile;

        isCharging = false;
        if (powerMeterContainer) powerMeterContainer.style.display = 'none'; // Hide meter

        switchTurn();
    }

    function handleMouseMove(event) {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        mousePos.x = event.clientX - rect.left;
        mousePos.y = event.clientY - rect.top;

        // Always update aim angle if player's turn and game active
        if (isPlayerTurn && !gameOver && player) {
            updateAimAngle();
        }
        // Power meter update is handled by gameLoop while isCharging is true
    }

    function handleMouseLeave(event) {
        if (isCharging) {
            isCharging = false;
            if (powerMeterContainer) powerMeterContainer.style.display = 'none';
            console.log("Charge cancelled: Mouse left canvas.");
        }
    }

    function updateAimAngle() {
        if (!player) return;
        const worldMouseX = mousePos.x - cameraX;
        const worldMouseY = mousePos.y;
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;
        aimAngle = Math.atan2(worldMouseY - playerCenterY, worldMouseX - playerCenterX);
    }

    function updatePowerMeter() {
        if (!isCharging || !powerValueDisplay || !powerBarFg) return;
        const elapsedTime = Date.now() - chargeStartTime;
        const chargeRatio = Math.min(elapsedTime / MAX_CHARGE_TIME, 1);
        const powerPercent = Math.round(chargeRatio * 100);
        powerValueDisplay.textContent = String(powerPercent);
        powerBarFg.style.width = `${powerPercent}%`;
    }


    // --- Opponent AI ---
    function opponentTurn() {
        if (gameOver || !opponent || !player) return;
        if (turnIndicator) turnIndicator.textContent = "Opponent's Turn";
        activeProjectile = null;

        if (powerUp) powerUp.active = false; // Deactivate existing power-up on AI turn

        setTimeout(() => {
            if (!player || !opponent || gameOver || isPlayerTurn) return;

            const targetX = player.x + player.width / 2;
            const targetY = player.y + player.height / 2;
            const opponentCenterX = opponent.x + opponent.width / 2;
            const opponentCenterY = opponent.y + opponent.height / 2;
            const dx = targetX - opponentCenterX;
            const dy = targetY - opponentCenterY;
            let baseAngle = Math.atan2(dy, dx);
            const inaccuracy = (Math.random() - 0.5) * (Math.PI / 10);
            const opponentAimAngle = baseAngle + inaccuracy;

            const chargeTime = (0.4 + Math.random() * 0.6) * MAX_CHARGE_TIME;
            const powerRatio = chargeTime / MAX_CHARGE_TIME;
            const baseSpeed = 6;
            const maxAddedSpeed = 18;
            const power = baseSpeed + powerRatio * maxAddedSpeed;
            const damage = Math.max(MIN_DAMAGE, Math.ceil(MIN_DAMAGE + powerRatio * (MAX_DAMAGE - MIN_DAMAGE)));

            const velocityX = Math.cos(opponentAimAngle) * power;
            const velocityY = Math.sin(opponentAimAngle) * power;

            const startX = opponent.x + opponent.width / 2 + Math.cos(opponentAimAngle) * (opponent.width / 2 + PROJECTILE_RADIUS + 2);
            const startY = opponent.y + opponent.height / 2 + Math.sin(opponentAimAngle) * (opponent.height / 2 + PROJECTILE_RADIUS + 2);

            const newProjectile = {
                x: startX, y: startY, vx: velocityX, vy: velocityY,
                radius: PROJECTILE_RADIUS,
                owner: 'opponent',
                damage: damage,
                bouncesLeft: PROJECTILE_BOUNCES,
                alpha: 1,
                isEmpowered: false,
                originalRadius: PROJECTILE_RADIUS,
                didHitTarget: false // <<< Added flag
            };
            projectiles.push(newProjectile);
            activeProjectile = newProjectile;

            if (!gameOver) {
                 setTimeout(() => {
                    if (!gameOver) switchTurn();
                }, 500); // Small delay after firing
            }
        }, 1000 + Math.random() * 1000);
    }

    // --- Game Loop & Updates ---
    function updateCamera() {
        if (!player || !opponent || !canvas) return;
        let targetWorldX;
        let targetViewportX;

        if (activeProjectile && activeProjectile.bouncesLeft >= 0) {
            targetWorldX = activeProjectile.x;
            targetViewportX = canvas.width / 2;
        } else if (isPlayerTurn) {
            targetWorldX = player.x + player.width / 2;
            targetViewportX = canvas.width * (1/3);
        } else {
            targetWorldX = opponent.x + opponent.width / 2;
            targetViewportX = canvas.width * (2/3);
        }

        let desiredCameraX = targetViewportX - targetWorldX;

        const worldEdgeBuffer = canvas.width / 5;
        const minVisibleWorldX = player.x - worldEdgeBuffer;
        const maxVisibleWorldX = opponent.x + opponent.width + worldEdgeBuffer;
        const maxAllowableCameraX = -minVisibleWorldX;
        const minAllowableCameraX = canvas.width - maxVisibleWorldX;

        if (minAllowableCameraX < maxAllowableCameraX) {
             desiredCameraX = Math.max(minAllowableCameraX, Math.min(maxAllowableCameraX, desiredCameraX));
        } else {
             const worldMidPointFallback = (player.x + (opponent.x + opponent.width)) / 2;
             desiredCameraX = canvas.width / 2 - worldMidPointFallback;
        }
        cameraX += (desiredCameraX - cameraX) * CAMERA_SMOOTHING;
    }


    // --- UPDATED updateProjectiles (Includes Off-Screen Miss Check) ---
    function updateProjectiles() {
        for (let i = projectiles.length - 1; i >= 0; i--) {
            if (!projectiles[i]) continue;
            const p = projectiles[i];

            if (activeProjectile === p && p.bouncesLeft < 0) {
                activeProjectile = null;
            }

            p.x += p.vx;
            p.y += p.vy;
            p.vy += GRAVITY;

            // --- Remove Projectile if Far Off-Screen ---
            const buffer = canvas.width; // Generous buffer
            const viewLeft = -cameraX - buffer;
            const viewRight = -cameraX + canvas.width + buffer;
            const viewBottom = canvas.height + buffer; // Check significantly below canvas too
            const viewTop = -buffer; // Check significantly above canvas

            if (p.x < viewLeft || p.x > viewRight || p.y < viewTop || p.y > viewBottom) {
                // console.log("Projectile removed (off-screen). Pos:", p.x.toFixed(0), p.y.toFixed(0));

                // *** Check for MISS here (off-screen) ***
                if (!p.didHitTarget) { // <<< CHECK PROJECTILE FLAG
                    // console.log("Off-screen miss detected, attempting spawn.");
                    spawnPowerUp();
                }

                if (activeProjectile === p) activeProjectile = null; // Stop camera tracking
                projectiles.splice(i, 1); // Remove the projectile
                continue; // Skip rest of checks for this (now removed) projectile
            }
        }
    }


    // --- UPDATED checkCollisions (Includes Ground/Settle Miss Check) ---
    function checkCollisions() {
        if (!canvas) return;
        const groundY = canvas.height - 10;

        for (let i = projectiles.length - 1; i >= 0; i--) {
            if (!projectiles[i]) continue;
            const p = projectiles[i];
            let projectileRemovedThisCheck = false;
            // Removed loop-local hitTarget variable

            // --- Check Collision with Characters ---
            if (p.owner === 'player' && opponent && !opponent.isHit && isColliding(p, opponent)) {
                let finalDamage = p.damage;
                if (p.isEmpowered) {
                    finalDamage = Math.ceil(finalDamage * POWERUP_DAMAGE_MULTIPLIER);
                    console.log(`CCR Power-Up Hit Opponent! Damage: ${finalDamage}`);
                    showCCRMessage();
                    p.isEmpowered = false;
                }
                opponent.hp = Math.max(0, opponent.hp - finalDamage);
                opponent.isHit = true;
                opponent.hitStartTime = Date.now();
                p.bouncesLeft = -1;
                p.didHitTarget = true; // <<< SET FLAG ON HIT
                if (activeProjectile === p) activeProjectile = null;
                projectiles.splice(i, 1);
                projectileRemovedThisCheck = true;
                updateUI();
                checkGameOver();
                continue;
            }
            else if (p.owner === 'opponent' && player && !player.isHit && isColliding(p, player)) {
               let finalDamage = p.damage;
               if (p.isEmpowered) {
                  finalDamage = Math.ceil(finalDamage * POWERUP_DAMAGE_MULTIPLIER);
                  console.log(`CCR Power-Up Hit Player! Damage: ${finalDamage}`);
                  showCCRMessage();
                  p.isEmpowered = false;
               }
                player.hp = Math.max(0, player.hp - finalDamage);
                player.isHit = true;
                player.hitStartTime = Date.now();
                p.bouncesLeft = -1;
                p.didHitTarget = true; // <<< SET FLAG ON HIT
                if (activeProjectile === p) activeProjectile = null;
                projectiles.splice(i, 1);
                projectileRemovedThisCheck = true;
                updateUI();
                checkGameOver();
                continue;
            }

            // --- Check Collision with Power-Up ---
             if (!projectileRemovedThisCheck && powerUp && powerUp.active && isColliding(p, powerUp)) {
                 console.log("Projectile hit CCR power-up!");
                 powerUp.active = false;
                 p.isEmpowered = true;
                 // p.radius = POWERUP_WIDTH / 2; // Optional visual change
             }


            // --- Check Collision with Ground ---
            if (!projectileRemovedThisCheck && p.y + p.radius >= groundY) {
                p.y = groundY - p.radius;

                if (p.bouncesLeft > 0) {
                    p.bouncesLeft--;
                    p.vy = -p.vy * 0.6;
                    p.vx *= 0.8;
                    if (Math.abs(p.vy) < 1 && Math.abs(p.vx) < 0.5) { // Settled after bounce
                        p.bouncesLeft = -1; // Mark for removal NEXT cycle
                        p.vy = 0; p.vx = 0;
                        if (activeProjectile === p) activeProjectile = null;
                        // console.log("Projectile settled after bounce.");
                        // *** Check for MISS here (settled) ***
                        if (!p.didHitTarget) { // <<< CHECK PROJECTILE FLAG
                             // console.log("Settled miss detected, attempting spawn.");
                            spawnPowerUp();
                        }
                    }
                } else if (p.bouncesLeft === 0) { // Hit ground with no bounces left
                     p.bouncesLeft = -1; // Mark for removal NEXT cycle
                     p.vy = 0; p.vx *= 0.5;
                     if (Math.abs(p.vx) < 0.1) p.vx = 0;
                     if (activeProjectile === p) activeProjectile = null;
                     // console.log("Projectile stopped on ground.");
                     // *** Check for MISS here (stopped on ground) ***
                     if (!p.didHitTarget) { // <<< CHECK PROJECTILE FLAG
                        // console.log("Stopped miss detected, attempting spawn.");
                        spawnPowerUp();
                     }
                }
            }

             // --- Clean up projectiles marked for removal (settled/stopped) ---
             // Projectiles removed by character hit or off-screen are handled above
             if (p.bouncesLeft === -1 && !projectileRemovedThisCheck) {
                 // Miss check happened when bouncesLeft was set to -1 above
                 const indexToRemove = projectiles.indexOf(p);
                 if (indexToRemove > -1) {
                    // console.log("Cleaning up projectile marked -1");
                    projectiles.splice(indexToRemove, 1);
                 }
             }
        } // End projectile loop
    }


    // Circle-Rectangle collision detection
    function isColliding(circle, rect) {
        if (!rect || !circle) return false;
        const rectX = rect.x; const rectY = rect.y;
        const rectWidth = rect.width || POWERUP_WIDTH;
        const rectHeight = rect.height || POWERUP_HEIGHT;
        const closestX = Math.max(rectX, Math.min(circle.x, rectX + rectWidth));
        const closestY = Math.max(rectY, Math.min(circle.y, rectY + rectHeight));
        const distanceX = circle.x - closestX; const distanceY = circle.y - closestY;
        const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
        return distanceSquared < (circle.radius * circle.radius);
    }


    function checkGameOver() {
        if (gameOver) return;
        let winner = null;
        if (player && player.hp <= 0) { winner = "Opponent Wins!"; }
        else if (opponent && opponent.hp <= 0) { winner = "Player Wins!"; }
        if (winner) { endGame(winner); }
    }

    function endGame(message) {
        if (gameOver) return;
        gameOver = true; isCharging = false; activeProjectile = null;
        stopCharacterAudio(); removeMuteButton();
        if (powerMeterContainer) powerMeterContainer.style.display = 'none';
        if (winnerMessage) winnerMessage.textContent = message;
        if (gameOverMessage) gameOverMessage.style.display = 'block';
        if (turnIndicator) turnIndicator.textContent = "Game Over";
        if(canvas) {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
        }
    }

    // --- NEW Function: Spawn Power-Up ---
    function spawnPowerUp() {
        if (!powerUpImage || (powerUp && powerUp.active)) {
            // console.log("Power-up spawn blocked (image missing or already active).");
            return; // Don't spawn if image missing or one is already active
        }
        console.log("Spawning CCR Power-Up!");
        // Spawn in world coordinates
        const playerCenterX = player ? player.x + player.width / 2 : canvas.width / 4;
        const opponentCenterX = opponent ? opponent.x + opponent.width / 2 : canvas.width * 3 / 4;
        const midWorldX = (playerCenterX + opponentCenterX) / 2;
        const spawnX = midWorldX - POWERUP_WIDTH / 2; // Center between players approx
        const spawnY = canvas.height / 2 - POWERUP_HEIGHT / 2 + 50; // Middle vertically, slightly lower

        powerUp = {
            x: spawnX, y: spawnY,
            width: POWERUP_WIDTH, height: POWERUP_HEIGHT,
            active: true
        };
    }

     // --- NEW Function: Show CCR Message ---
     function showCCRMessage() {
         if (ccrMessageDisplay) {
             ccrMessageDisplay.style.display = 'block'; // Or 'inline-block' etc.
             setTimeout(() => {
                 if (ccrMessageDisplay) {
                     ccrMessageDisplay.style.display = 'none';
                 }
             }, CCR_MESSAGE_DURATION);
         }
     }

    // --- Drawing Functions ---
    function drawGround() {
        ctx.fillStyle = '#8B4513'; // Brown
        const groundWidth = canvas.width * 3; // Make it wide enough for scrolling
        const groundStartX = -canvas.width; // Start off-screen left relative to potential camera pos
        ctx.fillRect(groundStartX, canvas.height - 10, groundWidth, 10);
    }

    function drawCharacter(char) {
        if (!char) return;
        const drawX = char.x; const drawY = char.y;
        const drawWidth = char.width; const drawHeight = char.height;
        const shouldFlip = (char === opponent);
        ctx.save();
        if (shouldFlip) { ctx.translate(drawX + drawWidth / 2, 0); ctx.scale(-1, 1); ctx.translate(-(drawX + drawWidth / 2), 0); }
        if (char.img) { ctx.drawImage(char.img, drawX, drawY, drawWidth, drawHeight); }
        else { ctx.fillStyle = (char === player) ? 'rgba(0, 0, 255, 0.7)' : 'rgba(255, 0, 0, 0.7)'; ctx.fillRect(drawX, drawY, drawWidth, drawHeight); ctx.strokeStyle = '#fff'; ctx.strokeRect(drawX, drawY, drawWidth, drawHeight); }
        if (char.isHit && (Date.now() - char.hitStartTime < HIT_EFFECT_DURATION)) { ctx.globalAlpha = 0.5; ctx.fillStyle = 'red'; ctx.fillRect(drawX, drawY, drawWidth, drawHeight); }
        else if (char.isHit) { char.isHit = false; }
        ctx.restore(); // Restore before drawing HP bar

        // Draw HP Bar (after restore)
        const hpBarWidth = drawWidth * 0.8; const hpBarHeight = 8;
        const hpBarX = drawX + (drawWidth - hpBarWidth) / 2; const hpBarY = drawY - hpBarHeight - 7;
        const currentHp = typeof char.hp === 'number' ? Math.max(0, char.hp) : 0; const maxHp = 100;
        const currentHpWidth = (currentHp / maxHp) * hpBarWidth;
        ctx.fillStyle = '#555'; ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
        ctx.fillStyle = currentHp < maxHp * 0.3 ? '#dc3545' : (currentHp < maxHp * 0.6 ? '#ffc107' : '#28a745');
        ctx.fillRect(hpBarX, hpBarY, currentHpWidth, hpBarHeight);
        ctx.strokeStyle = '#333'; ctx.lineWidth = 1; ctx.strokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
    }

    // --- Modified drawProjectiles ---
    function drawProjectiles() {
        projectiles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;

            if (p.isEmpowered && powerUpImage) {
                // Draw consti.jpg instead of the ball
                const drawRadius = p.radius; // Use current radius
                const drawX = p.x - drawRadius; // Adjust x for image top-left from center
                const drawY = p.y - drawRadius; // Adjust y for image top-left from center
                ctx.drawImage(powerUpImage, drawX, drawY, drawRadius * 2, drawRadius * 2);
            } else {
                // Draw regular projectile
                ctx.fillStyle = p.owner === 'player' ? '#4ecdc4' : '#ff6b6b';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); // Use current radius
                ctx.fill();
                // Optional outline
                ctx.strokeStyle = 'rgba(0,0,0,0.3)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            ctx.restore();
        });
    }

    function drawAimIndicator() {
        if (!isPlayerTurn || gameOver || !player || isCharging) return;
        const arrowLength = 40; const arrowHeadSize = 10;
        const distanceFromCharCenter = player.width / 2 + 10;
        const arrowColor = 'rgba(255, 255, 255, 0.7)'; const arrowLineWidth = 2;
        const playerCenterX = player.x + player.width / 2; const playerCenterY = player.y + player.height / 2;
        const arrowBaseX = playerCenterX + Math.cos(aimAngle) * distanceFromCharCenter;
        const arrowBaseY = playerCenterY + Math.sin(aimAngle) * distanceFromCharCenter;
        const arrowTipX = arrowBaseX + Math.cos(aimAngle) * arrowLength;
        const arrowTipY = arrowBaseY + Math.sin(aimAngle) * arrowLength;
        ctx.save();
        ctx.beginPath(); ctx.moveTo(arrowBaseX, arrowBaseY); ctx.lineTo(arrowTipX, arrowTipY);
        ctx.strokeStyle = arrowColor; ctx.lineWidth = arrowLineWidth; ctx.stroke();
        ctx.beginPath(); ctx.translate(arrowTipX, arrowTipY); ctx.rotate(aimAngle);
        ctx.moveTo(0, 0); ctx.lineTo(-arrowHeadSize, -arrowHeadSize / 2);
        ctx.moveTo(0, 0); ctx.lineTo(-arrowHeadSize, arrowHeadSize / 2);
        ctx.strokeStyle = arrowColor; ctx.lineWidth = arrowLineWidth; ctx.stroke();
        ctx.restore();
    }

     // --- Main Game Loop ---
    function gameLoop(timestamp) {
        if (gameOver || !canvas) return;

        updateCamera();
        updateProjectiles(); // Handles off-screen check & miss spawn
        checkCollisions();   // Handles ground/settle check & miss spawn, hits, etc.

        // Update power meter continuously if charging
        if (isCharging && isPlayerTurn) {
            updatePowerMeter();
        }

        // --- Drawing ---
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear viewport
        ctx.save();
        ctx.translate(cameraX, 0); // Apply camera translation

        // Draw world-space elements
        if (backgroundImage) { // Draw Background
            const bgHeight = canvas.height;
            const aspect = backgroundImage.naturalWidth / backgroundImage.naturalHeight;
            // Ensure background is wide enough for typical character positions + camera movement
            const minBgWidth = opponent && player ? (opponent.x + opponent.width - player.x) + canvas.width * 0.6 : canvas.width * 1.5;
            const aspectDerivedWidth = bgHeight * aspect;
            const bgWidth = Math.max(minBgWidth, aspectDerivedWidth);

            // Center the background roughly behind the midpoint of the initial character positions
            const initialPlayerOpponentMid = player && opponent ? (player.x + (opponent.x + opponent.width)) / 2 : canvas.width/2;
            const bgStartX = initialPlayerOpponentMid - (bgWidth / 2);
            ctx.drawImage(backgroundImage, bgStartX, 0, bgWidth, bgHeight);
        } else { // Fallback background color if image fails
             ctx.fillStyle = '#1c2a3e';
             // Draw a very wide rectangle to cover potential camera movement
             ctx.fillRect(-canvas.width * 2, 0, canvas.width * 5, canvas.height);
        }

        drawGround(); // Draw ground after background
        if (player) drawCharacter(player);     // Draw player
        if (opponent) drawCharacter(opponent); // Draw opponent

        // --- Draw Power-Up --- (Added)
        if (powerUp && powerUp.active && powerUpImage) {
            ctx.drawImage(powerUpImage, powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        }

        drawProjectiles();    // Draw projectiles (normal or empowered)
        drawAimIndicator();   // Draw aim indicator if applicable

        ctx.restore(); // Remove camera translation

        // Screen-space UI is handled by DOM elements, not drawn on canvas

        requestAnimationFrame(gameLoop); // Continue the loop
    }

    // --- Utility Functions ---
    function updateUI() {
        if (playerHpDisplay) { playerHpDisplay.textContent = player ? String(Math.max(0, player.hp)) : '---'; }
        if (opponentHpDisplay) { opponentHpDisplay.textContent = opponent ? String(Math.max(0, opponent.hp)) : '---'; }
        if (!gameOver && turnIndicator) { turnIndicator.textContent = isPlayerTurn ? "Your Turn" : "Opponent's Turn"; }
    }

    function switchTurn() {
        if (gameOver) return;
        isPlayerTurn = !isPlayerTurn;
        activeProjectile = null;
        // console.log(`Turn switched. Player's turn: ${isPlayerTurn}`);
        updateUI();
        if (!isPlayerTurn) { opponentTurn(); }
        else { /* Actions on player turn start? */ }
    }

    // --- Initial Setup Call ---
    // Ensure all necessary DOM elements exist before trying to use them
    if (canvas && startButton && powerMeterContainer && characterOptionsContainer && startMenu && gameArea && playerHpDisplay && opponentHpDisplay && turnIndicator && gameOverMessage && restartButton && ccrMessageDisplay) {
        console.log("Essential UI elements found. Initializing game state.");
        resetGame(); // Set initial state
        if (startMenu) startMenu.style.display = 'flex'; // Show start menu
        if (gameArea) gameArea.style.display = 'none'; // Hide game area
        if (gameOverMessage) gameOverMessage.style.display = 'none'; // Hide game over message
    } else {
        // Provide more detailed error logging if setup fails
        console.error("Cannot initialize game - one or more essential UI elements missing!", {
             canvas: !!canvas, startButton: !!startButton, powerMeterContainer: !!powerMeterContainer,
             characterOptionsContainer: !!characterOptionsContainer, startMenu: !!startMenu, gameArea: !!gameArea,
             playerHpDisplay: !!playerHpDisplay, opponentHpDisplay: !!opponentHpDisplay, turnIndicator: !!turnIndicator,
             gameOverMessage: !!gameOverMessage, restartButton: !!restartButton, ccrMessageDisplay: !!ccrMessageDisplay
         });
        alert("Error initializing game UI. Some elements might be missing in the HTML. Please check the browser console (F12) for details.");
    }

}); // End of DOMContentLoaded
// --- Game Initialization ---
function startGame() {
    const chosenCharData = characterData.find(c => c.id === selectedCharacter);
    if (!chosenCharData) {
        // ... (error handling) ...
        console.error("Could not find character data for:", selectedCharacter);
        alert("Error: Selected character data not found.");
        resetGame();
        if (startMenu) startMenu.style.display = 'block';
        return;
    }
    if (!loadedGameImages[chosenCharData.id]) {
         console.warn(`Game image for ${chosenCharData.name} has not loaded.`);
    }


    if (startMenu) startMenu.style.display = 'none';
    if (gameArea) gameArea.style.display = 'block';
    gameOver = false;
    activeProjectile = null;
    if (gameOverMessage) gameOverMessage.style.display = 'none';

    // --- Define Padding from Screen Edge ---
    // Use a small value to be very close to the edge
    const edgePadding = 15; // <<< TRY A SMALLER VALUE

    // Create player object near the left edge
    player = {
        x: edgePadding, // Position player 'edgePadding' pixels from the left
        y: canvas.height - CHARACTER_HEIGHT - 10,
        width: CHARACTER_WIDTH,
        height: CHARACTER_HEIGHT,
        hp: 100,
        id: chosenCharData.id, name: chosenCharData.name,
        img: loadedGameImages[chosenCharData.id],
        isHit: false, hitStartTime: 0
    };

    // Select opponent
    const availableOpponents = characterData.filter(c => c.id !== selectedCharacter);
    const randomOpponentData = availableOpponents.length > 0
        ? availableOpponents[Math.floor(Math.random() * availableOpponents.length)]
        : chosenCharData;

    // Create opponent object near the right edge
    opponent = {
        x: canvas.width - CHARACTER_WIDTH - edgePadding, // Position near right edge
        y: canvas.height - CHARACTER_HEIGHT - 10,
        width: CHARACTER_WIDTH,
        height: CHARACTER_HEIGHT,
        hp: 100,
        id: randomOpponentData.id, name: randomOpponentData.name,
        img: loadedGameImages[randomOpponentData.id],
        isHit: false, hitStartTime: 0
    };

    // --- REVISED Initial Camera Position ---
    // Calculate the center point *between* the player's center and opponent's center
    const playerCenterX = player.x + player.width / 2;
    const opponentCenterX = opponent.x + opponent.width / 2;
    const worldMidPoint = (playerCenterX + opponentCenterX) / 2;

    // Set cameraX so this midpoint is centered in the viewport (canvas.width / 2)
    // cameraX = viewportCenter - worldTarget
    cameraX = canvas.width / 2 - worldMidPoint;

    // The game loop's updateCamera will handle smoothing and clamping from this point.

    // --- Reset state & setup ---
    projectiles = [];
    isPlayerTurn = true;
    stopCharacterAudio(); // Stop previous audio
    removeMuteButton(); // Remove previous button
    if (player.id === 'basescu') { // Start audio if Basescu
        try {
            characterAudio = new Audio(basescuAudioPath);
            characterAudio.loop = true;
            characterAudio.muted = isMuted;
            characterAudio.play().catch(error => console.warn(`Audio playback warning:`, error));
        } catch (e) { console.error("Error creating audio:", e); characterAudio = null; }
    } else {
         characterAudio = null;
    }
    createMuteButton(); // Add the mute button
    updateUI();

    // Add gameplay event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Start the main game loop
    requestAnimationFrame(gameLoop);
}
    function resetGame() {
        // Remove game-specific event listeners
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);

        // Reset state variables
        selectedCharacter = null;
        player = null;
        opponent = null;
        projectiles = [];
        isPlayerTurn = true;
        isCharging = false;
        gameOver = false;
        cameraX = 0;
        activeProjectile = null;

        // Reset UI elements
        if (startButton) startButton.disabled = true;
        document.querySelectorAll('.character-option').forEach(opt => opt.classList.remove('selected'));
        if (powerMeterContainer) powerMeterContainer.style.display = 'none';
        updateUI(); // Reset HP displays etc. via UI update
        if (turnIndicator) turnIndicator.textContent = "Select Character";

         // Repopulate character options in case images failed before
         populateCharacterSelection();
    }


    // --- Input Handling ---
 // *** MODIFIED handleMouseMove ***
function handleMouseMove(event) {
    if (!canvas) return; // Ensure canvas exists

    // Always update global mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    mousePos.x = event.clientX - rect.left;
    mousePos.y = event.clientY - rect.top;

    // --- Always update aim angle if it's player's turn and game is active ---
    // This ensures the aiming indicator follows the mouse even when not charging
    if (isPlayerTurn && !gameOver && player) {
        updateAimAngle(); // Update the angle based on the new mouse position
    }

    // --- REMOVED power meter update from mouse move ---
    // The gameLoop will now handle updating the power meter display while charging.
    // if (isCharging && isPlayerTurn) {
    //      updatePowerMeter(); // REMOVED
    // }
}

    function handleMouseUp(event) {
        if (!isPlayerTurn || !isCharging || gameOver || !player) return;

        const chargeTime = Math.min(Date.now() - chargeStartTime, MAX_CHARGE_TIME);
        const powerRatio = chargeTime / MAX_CHARGE_TIME;

        const baseSpeed = 6; // Adjusted base speed
        const maxAddedSpeed = 18; // Adjusted max speed
        const power = baseSpeed + powerRatio * maxAddedSpeed;
        const damage = Math.max(MIN_DAMAGE, Math.ceil(MIN_DAMAGE + powerRatio * (MAX_DAMAGE - MIN_DAMAGE)));

        // Calculate velocity using the *current* aimAngle (updated by mousemove)
        const velocityX = Math.cos(aimAngle) * power;
        const velocityY = Math.sin(aimAngle) * power;

        const startX = player.x + player.width / 2 + Math.cos(aimAngle) * (player.width / 2 + PROJECTILE_RADIUS + 2);
        const startY = player.y + player.height / 2 + Math.sin(aimAngle) * (player.height / 2 + PROJECTILE_RADIUS + 2);

        const newProjectile = {
            x: startX, y: startY, vx: velocityX, vy: velocityY,
            radius: PROJECTILE_RADIUS,
            owner: 'player',
            damage: damage,
            bouncesLeft: PROJECTILE_BOUNCES, // Add bounce counter
            alpha: 1 // For potential future fading
        };
        projectiles.push(newProjectile);
        activeProjectile = newProjectile; // Track this projectile for camera

        isCharging = false;
        if (powerMeterContainer) powerMeterContainer.style.display = 'none';

        switchTurn();
    }

    function handleMouseMove(event) {
        const rect = canvas.getBoundingClientRect();
        mousePos.x = event.clientX - rect.left;
        mousePos.y = event.clientY - rect.top;

        // Only update aim if charging during player's turn
        if (isCharging && isPlayerTurn) {
            updateAimAngle(event); // Update angle based on current mouse pos
            updatePowerMeter(); // Update power display
        }
    }

     function handleMouseLeave(event) {
         // Optional: Cancel charge on mouse leave
         if (isCharging) {
             isCharging = false;
             if (powerMeterContainer) powerMeterContainer.style.display = 'none';
             console.log("Charge cancelled: Mouse left canvas.");
         }
     }


    /** Updates aimAngle based on mouse position relative to player *in world coordinates*. */
    function updateAimAngle(event) {
        if (!player) return;

        // Calculate mouse position in world space considering camera offset
        const worldMouseX = mousePos.x - cameraX;
        const worldMouseY = mousePos.y; // Y is not affected by horizontal camera

        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;

        aimAngle = Math.atan2(worldMouseY - playerCenterY, worldMouseX - playerCenterX);
    }

    function updatePowerMeter() {
        if (!isCharging || !powerValueDisplay || !powerBarFg) return;
        const elapsedTime = Date.now() - chargeStartTime;
        const chargeRatio = Math.min(elapsedTime / MAX_CHARGE_TIME, 1);
        const powerPercent = Math.round(chargeRatio * 100);
        powerValueDisplay.textContent = String(powerPercent);
        powerBarFg.style.width = `${powerPercent}%`;
    }


    // --- Opponent AI ---
    function opponentTurn() {
        if (gameOver || !opponent || !player) return; // Added checks
        if (turnIndicator) turnIndicator.textContent = "Opponent's Turn";
        activeProjectile = null; // Clear projectile tracking for camera

        setTimeout(() => {
            if (!player || !opponent || gameOver || isPlayerTurn) return; // Re-check state

            // 1. Aiming Logic
            const targetX = player.x + player.width / 2;
            const targetY = player.y + player.height / 2;
            const opponentCenterX = opponent.x + opponent.width / 2;
            const opponentCenterY = opponent.y + opponent.height / 2;
            const dx = targetX - opponentCenterX;
            const dy = targetY - opponentCenterY;
            let baseAngle = Math.atan2(dy, dx);
            const inaccuracy = (Math.random() - 0.5) * (Math.PI / 10); // +/- ~9 degrees inaccuracy
            const opponentAimAngle = baseAngle + inaccuracy;

            // 2. Power Logic
            const chargeTime = (0.4 + Math.random() * 0.6) * MAX_CHARGE_TIME; // Charge between 40% and 100%
            const powerRatio = chargeTime / MAX_CHARGE_TIME;
            const baseSpeed = 6;
            const maxAddedSpeed = 18;
            const power = baseSpeed + powerRatio * maxAddedSpeed;
            const damage = Math.max(MIN_DAMAGE, Math.ceil(MIN_DAMAGE + powerRatio * (MAX_DAMAGE - MIN_DAMAGE)));

            // 3. Velocity
            const velocityX = Math.cos(opponentAimAngle) * power;
            const velocityY = Math.sin(opponentAimAngle) * power;

            // 4. Fire Projectile
            const startX = opponent.x + opponent.width / 2 + Math.cos(opponentAimAngle) * (opponent.width / 2 + PROJECTILE_RADIUS + 2);
            const startY = opponent.y + opponent.height / 2 + Math.sin(opponentAimAngle) * (opponent.height / 2 + PROJECTILE_RADIUS + 2);

            const newProjectile = {
                 x: startX, y: startY, vx: velocityX, vy: velocityY,
                 radius: PROJECTILE_RADIUS,
                 owner: 'opponent',
                 damage: damage,
                 bouncesLeft: PROJECTILE_BOUNCES, // Add bounce counter
                 alpha: 1
            };
            projectiles.push(newProjectile);
            activeProjectile = newProjectile; // Track for camera

            // 5. Switch Turn back
            if (!gameOver) {
                switchTurn();
            }
        }, 1000 + Math.random() * 1000); // Delay
    }

    // --- Game Loop & Updates ---

    /** Calculates desired camera position and clamps it */
    function updateCamera() {
         if (!player || !opponent) return; // Need players for reference

         let targetX;

         if (activeProjectile) {
             // Follow the active projectile
             targetX = activeProjectile.x;
         } else if (isPlayerTurn) {
             // Center on the player
             targetX = player.x + player.width / 2;
         } else {
              // Center on the opponent
             targetX = opponent.x + opponent.width / 2;
         }

         // Calculate desired camera position to center the target
         let desiredCameraX = canvas.width / 2 - targetX;

         // Clamp camera X to prevent showing too much empty space beyond players
         // Define world boundaries (can be adjusted)
         const minWorldX = player.x - canvas.width / 4; // Allow seeing a bit left of player
         const maxWorldX = opponent.x + opponent.width + canvas.width / 4; // Allow seeing a bit right of opponent

         // Calculate corresponding min/max cameraX values
         const maxCameraX = canvas.width / 20 - minWorldX;
         const minCameraX = canvas.width / 20 - maxWorldX;

         // Clamp the desired position
         desiredCameraX = Math.max(minCameraX, Math.min(maxCameraX, desiredCameraX));


         // Smoothly move the camera towards the desired position
         cameraX += (desiredCameraX - cameraX) * CAMERA_SMOOTHING;
    }


    function gameLoop(timestamp) {
        if (gameOver) return;

        // --- Update State ---
        updateCamera(); // Update camera position first
        updateProjectiles();
        checkCollisions(); // This also checks game over

         // Update hit effect timers
         if (player && player.isHit && Date.now() - player.hitStartTime > HIT_EFFECT_DURATION) {
             player.isHit = false;
         }
         if (opponent && opponent.isHit && Date.now() - opponent.hitStartTime > HIT_EFFECT_DURATION) {
             opponent.isHit = false;
         }

        // --- Drawing ---
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear viewport

        // Apply camera translation
        ctx.save();
        ctx.translate(cameraX, 0);

        // Draw elements in world space
        drawGround();
        if (player) drawCharacter(player);
        if (opponent) drawCharacter(opponent);
        drawProjectiles();
        if (isPlayerTurn && !isCharging && player) {
            drawAimIndicator(); // Draws relative to player in world space
        }

        // Restore context to remove camera translation for next frame clear
        ctx.restore();

        // Update power meter continuously if charging (drawn in screen space - not affected by camera)
        if (isCharging && isPlayerTurn) { updatePowerMeter(); }

        // Request next frame
        requestAnimationFrame(gameLoop);
    }


    function updateProjectiles() {
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const p = projectiles[i];

             // If projectile becomes inactive for camera (e.g., after bounces/hit)
             if (activeProjectile === p && p.bouncesLeft < 0) { // Using < 0 as a flag for removal state
                activeProjectile = null;
             }


            p.x += p.vx;
            p.y += p.vy;
            p.vy += GRAVITY;

            // Remove if far off-screen (Y check is important too)
            const buffer = 2000;
            if (p.x < -buffer - Math.abs(cameraX) || p.x > canvas.width + buffer - cameraX || p.y > canvas.height + buffer) {
                if (activeProjectile === p) activeProjectile = null; // Stop camera if it goes way off
                projectiles.splice(i, 1);
            }
        }
    }

    function checkCollisions() {
         const groundY = canvas.height - 10; // Ground position

        for (let i = projectiles.length - 1; i >= 0; i--) {
            // Ensure projectile exists at this index
            if (!projectiles[i]) continue;
            const p = projectiles[i];
            let projectileRemoved = false; // Flag specific to this projectile in this iteration

            // Check collision with opponent
            if (p.owner === 'player' && opponent && isColliding(p, opponent)) {
                opponent.hp = Math.max(0, opponent.hp - p.damage);
                opponent.isHit = true; // Trigger hit effect
                opponent.hitStartTime = Date.now();
                if (activeProjectile === p) activeProjectile = null; // Stop camera tracking on hit
                projectiles.splice(i, 1);
                projectileRemoved = true;
                updateUI();
                checkGameOver(); // Check immediately after HP change
            }
            // Check collision with player
            else if (p.owner === 'opponent' && player && isColliding(p, player)) {
                player.hp = Math.max(0, player.hp - p.damage);
                player.isHit = true; // Trigger hit effect
                player.hitStartTime = Date.now();
                if (activeProjectile === p) activeProjectile = null; // Stop camera tracking on hit
                projectiles.splice(i, 1);
                projectileRemoved = true;
                updateUI();
                checkGameOver(); // Check immediately
            }

            // If projectile wasn't removed by hitting a player, check ground
             if (!projectileRemoved && p.y + p.radius >= groundY) {
                 p.y = groundY - p.radius; // Correct position to be exactly on ground

                 if (p.bouncesLeft > 0) {
                     p.bouncesLeft--;
                     p.vy = -p.vy * 0.6; // Reverse Y velocity and dampen
                     // Apply friction to horizontal velocity on bounce
                     p.vx *= 0.8;
                     // If velocity becomes very small after bounce, stop bouncing
                     if (Math.abs(p.vy) < 1 && Math.abs(p.vx) < 0.5) {
                         p.bouncesLeft = 0; // Stop further bounces
                         p.vy = 0;
                         p.vx = 0;
                          // Set flag for removal on next frame or after a short delay
                         p.bouncesLeft = -1; // Use -1 to signal it should be removed soon
                          if (activeProjectile === p) activeProjectile = null; // Stop camera tracking
                         // Simple removal after last bounce hits ground:
                         // projectiles.splice(i, 1);
                         // projectileRemoved = true;
                         // if (activeProjectile === p) activeProjectile = null;
                     }
                 } else {
                      // No bounces left, remove the projectile
                      projectiles.splice(i, 1);
                      projectileRemoved = true;
                      if (activeProjectile === p) activeProjectile = null; // Stop tracking if removed
                 }
             }
             // Clean up projectiles marked for removal (e.g., after bounce settles)
             if(!projectileRemoved && p.bouncesLeft === -1) {
                 projectiles.splice(i, 1);
                 projectileRemoved = true;
                 if (activeProjectile === p) activeProjectile = null;
             }

        }
    }

    function isColliding(projectile, character) {
        if (!character) return false;
        // Find closest point on rect to circle center
        const closestX = Math.max(character.x, Math.min(projectile.x, character.x + character.width));
        const closestY = Math.max(character.y, Math.min(projectile.y, character.y + character.height));
        // Calc distance squared
        const distanceX = projectile.x - closestX;
        const distanceY = projectile.y - closestY;
        const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
        // Check collision
        return distanceSquared < (projectile.radius * projectile.radius);
    }

    function checkGameOver() {
        if (gameOver) return; // Already ended

        if (player && player.hp <= 0) {
            endGame("Opponent Wins!");
        } else if (opponent && opponent.hp <= 0) {
            endGame("Player Wins!");
        }
    }
    // Add background loading
const bgPromise = loadImage(backgroundImagePath)
.then(img => {
    console.log(`Background image ${backgroundImagePath} loaded successfully.`);
    backgroundImage = img; // Store the loaded image
})
.catch(error => {
    console.error(`FAILED to load background image from ${backgroundImagePath}. Fallback color will be used.`, error);
    // backgroundImage remains null
});
loadingPromises.push(bgPromise); // Add background promise to the list

// Preload all *game* images needed (Keep character loading as is)
characterData.forEach(char => {
// ... (existing character image loading logic) ...
});

// Wait for all images (including background)
Promise.all(loadingPromises)
.then(() => {
    console.log("All essential game & background images preloaded (or failed).");
    // ... (rest of the Promise.all .then block) ...
})
.catch(error => {
     // This catch might not be strictly necessary if individual catches handle errors
    console.error("Some images failed to load.", error);
    // ... (rest of the Promise.all .catch block) ...
     populateCharacterSelection();
});
// Modify the gameLoop function

function gameLoop(timestamp) {
    if (gameOver) return;

    // --- Update State ---
    updateCamera();
    updateProjectiles();
    checkCollisions();
    // ... (update hit effect timers) ...

    // --- Drawing ---
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear viewport

    // Apply camera translation
    ctx.save();
    ctx.translate(cameraX, 0);

    // --- Draw Background FIRST (within translated context) ---
    if (backgroundImage) {
        // Determine the width the background should cover in the world
        // Make it wider than the canvas to allow scrolling. Adjust as needed.
        const backgroundWorldWidth = backgroundImage.width > canvas.width * 1.5 ? backgroundImage.width : canvas.width * 1.5; // Use image width or 1.5x canvas width
        const backgroundDrawHeight = canvas.height; // Fit height to canvas

        // Calculate aspect ratio to draw correctly if height is constrained
        const aspectRatio = backgroundImage.width / backgroundImage.height;
        const backgroundDrawWidth = backgroundDrawHeight * aspectRatio;

        // Adjust width if calculated width is too small
        const finalBackgroundWidth = Math.max(backgroundWorldWidth, backgroundDrawWidth)

        // Calculate starting X position for the background
        // To center it roughly behind the playable area:
        const playableAreaWidth = opponent.x + opponent.width - player.x; // Approx width of action
        const backgroundStartX = (playableAreaWidth / 2) - (finalBackgroundWidth / 2) + player.x; // Center background behind action area

        // Draw the background image, scaled to fit height, potentially wider
        ctx.drawImage(backgroundImage, backgroundStartX, 0, finalBackgroundWidth, backgroundDrawHeight);

    } else {
        // Optional: Draw fallback color if image didn't load (though CSS handles this now)
        // ctx.fillStyle = '#0d1a2e';
        // ctx.fillRect(0, 0, canvas.width * 2, canvas.height); // Draw wide enough
    }

    // --- Draw other elements in world space ---
    drawGround(); // Draw ground AFTER background
    if (player) drawCharacter(player);
    if (opponent) drawCharacter(opponent);
    drawProjectiles();
    if (isPlayerTurn && !isCharging && player) {
        drawAimIndicator();
    }

    // Restore context to remove camera translation
    ctx.restore();

    // --- Draw screen-space UI ---
    if (isCharging && isPlayerTurn) { updatePowerMeter(); }

    // Request next frame
    requestAnimationFrame(gameLoop);
}

// ALSO: Modify drawGround slightly if needed
function drawGround() {
    ctx.fillStyle = '#8B4513'; // Brown
    // Draw the ground across the entire potential background width or a very large area
    // Needs to be drawn within the translated context to scroll with the world.
    const groundWidth = 3000; // Or backgroundWorldWidth used above. Make it wide.
    const groundStartX = -groundWidth / 2 + canvas.width / 2; // Center it roughly
    ctx.fillRect(groundStartX, canvas.height - 10, groundWidth, 10);
}


    function endGame(message) {
        gameOver = true;
        isCharging = false;
        activeProjectile = null; // Stop camera tracking
        if (powerMeterContainer) powerMeterContainer.style.display = 'none';
        if (winnerMessage) winnerMessage.textContent = message;
        if (gameOverMessage) gameOverMessage.style.display = 'block';
        if (turnIndicator) turnIndicator.textContent = "Game Over";
         // Remove listeners to prevent actions after game over
         canvas.removeEventListener('mousedown', handleMouseDown);
         canvas.removeEventListener('mouseup', handleMouseUp);
         // Keep mousemove for potential future menu interactions? Maybe remove too.
         // canvas.removeEventListener('mousemove', handleMouseMove);
         canvas.removeEventListener('mouseleave', handleMouseLeave);
    }


    // --- Drawing Functions ---

    function drawGround() {
        ctx.fillStyle = 'rgba(139, 69, 19, 0.5)'; // Brown color with 50% transparency
        ctx.fillRect(0, canvas.height - 10, canvas.width, 10); // Draw the ground
    }

    function drawCharacter(char) {
        if (!char) return;

        const drawX = char.x;
        const drawY = char.y;
        const drawWidth = char.width;
        const drawHeight = char.height;

        // --- Flipping Logic ---
        // Flip opponent (assuming opponent is always on the right side relative to player)
        const shouldFlip = (char === opponent);

        ctx.save(); // Save context state before potential transform/filter

        if (shouldFlip) {
            // Translate to the center of the character, scale, then translate back (or draw offset)
            ctx.translate(drawX + drawWidth / 2, 0); // Move origin to center X
            ctx.scale(-1, 1); // Flip horizontally
            ctx.translate(-(drawX + drawWidth / 2), 0); // Move origin back
        }

        // --- Draw Character Image or Fallback ---
        if (char.img) {
            ctx.drawImage(char.img, drawX, drawY, drawWidth, drawHeight);
        } else {
            // Fallback rectangle if image failed to load
            console.warn("Drawing fallback for character:", char.id);
            ctx.fillStyle = (char === player) ? 'blue' : 'red'; // Simple color distinction
            ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
        }

         // Restore context to remove flip transform *before* drawing HP/filter
         // Important: Or draw HP/filter *inside* the save/restore block if they should also be flipped (usually not)
         // Let's restore here, HP bar and filter drawn after.
         // ctx.restore(); // Moved after filter

        // --- Hit Effect (Red Tint) ---
        if (char.isHit) {
            // Apply semi-transparent red overlay
            ctx.globalAlpha = 0.4; // Adjust transparency
            ctx.fillStyle = 'red';
            ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
            // ctx.globalAlpha = 1.0; // Reset alpha (done by final ctx.restore())
        }

        // --- Restore Flip/Filter ---
        ctx.restore(); // Restores state saved before flip and filter


        // --- Draw HP Bar (Drawn *after* restoring flip, so it's not flipped) ---
        const hpBarWidth = drawWidth;
        const hpBarHeight = 6;
        const hpBarX = drawX;
        const hpBarY = drawY - hpBarHeight - 5; // Position above character
        const currentHp = typeof char.hp === 'number' ? char.hp : 0;
        const maxHp = 100; // Assuming max HP is 100
        const currentHpWidth = Math.max(0, (currentHp / maxHp) * hpBarWidth);

        // Background
        ctx.fillStyle = '#e0e0e0'; // Light grey background
        ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
        // Current HP Fill
        ctx.fillStyle = currentHp < maxHp * 0.3 ? '#dc3545' : '#28a745'; // Red if low HP, else Green
        ctx.fillRect(hpBarX, hpBarY, currentHpWidth, hpBarHeight);
    }


    function drawProjectiles() {
        projectiles.forEach(p => {
            ctx.save(); // Save for potential alpha changes (fading)
            // ctx.globalAlpha = p.alpha; // Uncomment if using alpha fading later

            ctx.fillStyle = 'red'; // Changed to red
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();

            // Optional: Add outline
            // ctx.strokeStyle = '#000000';
            // ctx.lineWidth = 1;
            // ctx.stroke();

            ctx.restore(); // Restore alpha state
        });
    }

    function drawAimIndicator() {
        if (!isPlayerTurn || gameOver || !player) return;

        // Starts from player center (world coordinates)
        const startX = player.x + player.width / 2;
        const startY = player.y + player.height / 2;
        const length = 50; // Increased length

        // End point based on aimAngle (world coordinates)
        const endX = startX + Math.cos(aimAngle) * length;
        const endY = startY + Math.sin(aimAngle) * length;

        // Style and draw (already in translated world space due to camera)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }

    // --- Utility Functions ---
    function updateUI() {
        if (playerHpDisplay) playerHpDisplay.textContent = player ? String(player.hp) : '100';
        if (opponentHpDisplay) playerHpDisplay.textContent = opponent ? String(opponent.hp) : '100';

        if (!gameOver && turnIndicator) {
            turnIndicator.textContent = isPlayerTurn ? "Your Turn" : "Opponent's Turn";
        }
    }

    function switchTurn() {
        if (gameOver) return;
        isPlayerTurn = !isPlayerTurn;
        activeProjectile = null; // Reset projectile tracking when turn switches naturally
        updateUI();
        if (!isPlayerTurn) {
            opponentTurn();
        } else {
             // Optional: Slightly refocus camera on player when their turn starts
             // No need if updateCamera handles it based on isPlayerTurn
        }
    }

    // --- Initial Setup ---
    if (canvas && startButton && powerMeterContainer && characterOptionsContainer) {
        resetGame(); // Initialize menu state, populate characters
        if (startMenu) startMenu.style.display = 'block'; // Ensure menu is visible initially
        if (gameArea) gameArea.style.display = 'none'; // Ensure game area is hidden
    } else {
        console.error("Cannot initialize game - essential UI elements missing.");
        alert("Error initializing game UI. Please check console and HTML structure (e.g., #character-options container).");
    }
