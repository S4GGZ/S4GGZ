/**
 * @fileoverview Main script for the turn-based artillery game.
 * Handles game setup, character selection, game logic, drawing, and UI updates.
 * @version 1.1.4 - Confirmed Hit Effect Implementation & Dynamic Background
 * @date 2025-04-12
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
    let powerUpImage = null;
    const powerUpImagePath = 'assets/characters/consti.jpg';
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
    let powerUp = null;

    // Game Constants
    const MAX_CHARGE_TIME = 1500;
    const MIN_DAMAGE = 5;
    const MAX_DAMAGE = 15;
    const GRAVITY = 0.15;
    const CHARACTER_WIDTH = 400 / 2.3;
    const CHARACTER_HEIGHT = 400 / 2.3;
    const PROJECTILE_RADIUS = 12;
    const PROJECTILE_BOUNCES = 2;
    const HIT_EFFECT_DURATION = 500; // Total duration for hit state (flash + bounce)
    const CAMERA_SMOOTHING = 0.08;
    const POWERUP_WIDTH = 50;
    const POWERUP_HEIGHT = 50;
    const POWERUP_DAMAGE_MULTIPLIER = 2.69;
    const CCR_MESSAGE_DURATION = 3000;

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

    // Preload Power-Up Image
    loadingPromises.push(
        loadImage(powerUpImagePath).then(img => {
            if (img) {
                console.log(`Power-up image ${powerUpImagePath} loaded successfully.`);
                powerUpImage = img;
            } else {
                console.error(`FAILED to load power-up image from ${powerUpImagePath}. Power-up disabled.`);
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
                if (startButton) {
                    startButton.disabled = false;
                }
            });
            characterOptionsContainer.appendChild(option);
        });

        if (startButton) {
            startButton.disabled = true;
        }
    }

    // =========================================================================
    // Button Event Listeners
    // =========================================================================
    if (startButton) {
        startButton.addEventListener('click', () => {
            if (selectedCharacter) {
                startGame();
            } else {
                alert("Please select a character first!");
            }
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

        gameOver = false;
        activeProjectile = null;
        if (gameOverMessage) gameOverMessage.style.display = 'none';
        powerUp = null;
        if (ccrMessageDisplay) ccrMessageDisplay.style.display = 'none';
        projectiles = [];
        isPlayerTurn = true;

        // Padding set to -75
        const edgePadding = -75;

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
         if (loadedGameImages[randomOpponentData.id] === null) {
            console.warn(`Game image for opponent ${randomOpponentData.name} failed to load.`);
        }

        // Initial Camera
        const playerCenterX = player.x + player.width / 2;
        const opponentCenterX = opponent.x + opponent.width / 2;
        const worldMidPoint = (playerCenterX + opponentCenterX) / 2;
        cameraX = canvas.width / 2 - worldMidPoint;

        // Audio Setup
        stopCharacterAudio();
        removeMuteButton();
        let audioPathToPlay = (player.id === 'basescu') ? basescuAudioPath : NormalAudioPath;
        if (audioPathToPlay) {
            try {
                characterAudio = new Audio(audioPathToPlay);
                characterAudio.loop = true;
                characterAudio.muted = isMuted;
                characterAudio.play().catch(error => console.warn(`Audio playback warning:`, error));
            } catch (e) { console.error("Error playing audio:", e); characterAudio = null; }
        } else { characterAudio = null; }
        createMuteButton();

        updateUI();

        // Add Input Listeners
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
        stopCharacterAudio();
        removeMuteButton();
        selectedCharacter = null;
        player = null; opponent = null; projectiles = [];
        isPlayerTurn = true; isCharging = false; gameOver = false;
        aimAngle = -Math.PI / 4; mousePos = { x: 0, y: 0 }; cameraX = 0;
        activeProjectile = null; powerUp = null;
        if (ccrMessageDisplay) ccrMessageDisplay.style.display = 'none';
        if (startButton) {
             startButton.disabled = true;
        }
        document.querySelectorAll('.character-option').forEach(opt => {
            opt.classList.remove('selected');
        });
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
        if (characterAudio) {
            characterAudio.muted = isMuted;
        }
        console.log(`Sound ${isMuted ? 'muted' : 'unmuted'}.`);
     }
    function stopCharacterAudio() {
        if (characterAudio) {
            characterAudio.pause();
            characterAudio.currentTime = 0;
            characterAudio = null;
        }
     }

    // =========================================================================
    // Player Input Handling (Power-up deactivation removed)
    // =========================================================================
    function handleMouseDown(event) {
        if (!isPlayerTurn || gameOver || isCharging || !player) return;
        isCharging = true;
        chargeStartTime = Date.now();
        updateAimAngle();
        if (powerMeterContainer) powerMeterContainer.style.display = 'flex';
        updatePowerMeter();
    }
    function handleMouseUp(event) { // Power-up deactivation is REMOVED
        if (!isPlayerTurn || !isCharging || gameOver || !player) return;
        const chargeTime = Math.min(Date.now() - chargeStartTime, MAX_CHARGE_TIME);
        const powerRatio = chargeTime / MAX_CHARGE_TIME;
        const baseSpeed = 6;
        const maxAddedSpeed = 18;
        const power = baseSpeed + powerRatio * maxAddedSpeed;
        const damage = Math.max(MIN_DAMAGE, Math.ceil(MIN_DAMAGE + powerRatio * (MAX_DAMAGE - MIN_DAMAGE)));
        const velocityX = Math.cos(aimAngle) * power;
        const velocityY = Math.sin(aimAngle) * power;
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;
        const startOffset = player.width / 2 + PROJECTILE_RADIUS + 2;
        const startX = playerCenterX + Math.cos(aimAngle) * startOffset;
        const startY = playerCenterY + Math.sin(aimAngle) * startOffset;
        const newProjectile = {
            x: startX, y: startY, vx: velocityX, vy: velocityY,
            radius: PROJECTILE_RADIUS, owner: 'player', damage: damage,
            bouncesLeft: PROJECTILE_BOUNCES, alpha: 1, isEmpowered: false,
            originalRadius: PROJECTILE_RADIUS, didHitTarget: false
        };
        projectiles.push(newProjectile);
        activeProjectile = newProjectile;
        isCharging = false;
        if (powerMeterContainer) powerMeterContainer.style.display = 'none';
        switchTurn();
    }
    function handleMouseMove(event) {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        mousePos.x = event.clientX - rect.left;
        mousePos.y = event.clientY - rect.top;
        if (isPlayerTurn && !gameOver && player) {
            updateAimAngle();
        }
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

    // =========================================================================
    // Opponent AI Logic (Power-up deactivation removed)
    // =========================================================================
    function opponentTurn() { // Power-up deactivation is REMOVED
        if (gameOver || !opponent || !player) return;
        if (turnIndicator) turnIndicator.textContent = "Opponent's Turn";
        activeProjectile = null;

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
            const startOffset = opponent.width / 2 + PROJECTILE_RADIUS + 2;
            const startX = opponentCenterX + Math.cos(opponentAimAngle) * startOffset;
            const startY = opponentCenterY + Math.sin(opponentAimAngle) * startOffset;
            const newProjectile = {
                x: startX, y: startY, vx: velocityX, vy: velocityY,
                radius: PROJECTILE_RADIUS, owner: 'opponent', damage: damage,
                bouncesLeft: PROJECTILE_BOUNCES, alpha: 1, isEmpowered: false,
                originalRadius: PROJECTILE_RADIUS, didHitTarget: false
            };
            projectiles.push(newProjectile);
            activeProjectile = newProjectile;

            if (!gameOver) {
                 setTimeout(() => {
                     if (!gameOver) switchTurn();
                 }, 500);
             }
        }, 1000 + Math.random() * 1000);
    }

    // =========================================================================
    // Game Loop, Physics & Collision Updates
    // =========================================================================
    function updateCamera() {
        if (!player || !opponent || !canvas) return;
        let targetWorldX, targetViewportX;
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
        const worldEdgeBuffer = canvas.width / 4;
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
            const offScreenBuffer = canvas.width;
            const viewLeft = -cameraX - offScreenBuffer;
            const viewRight = -cameraX + canvas.width + offScreenBuffer;
            const viewBottom = canvas.height + offScreenBuffer * 2;
            const viewTop = -offScreenBuffer;
            if (p.x < viewLeft || p.x > viewRight || p.y > viewBottom || p.y < viewTop ) {
                if (!p.didHitTarget) {
                    spawnPowerUp();
                }
                if (activeProjectile === p) activeProjectile = null;
                projectiles.splice(i, 1);
                continue;
            }
        }
     }
    function checkCollisions() {
        if (!canvas) return;
        const groundY = canvas.height - 10;
        for (let i = projectiles.length - 1; i >= 0; i--) {
            if (!projectiles[i]) continue;
            const p = projectiles[i];
            let projectileRemovedThisCheck = false;
            // Character Collisions
            let target = null;
            if (p.owner === 'player' && opponent && !opponent.isHit && isColliding(p, opponent)) {
                target = opponent;
            } else if (p.owner === 'opponent' && player && !player.isHit && isColliding(p, player)) {
                target = player;
            }
            if (target) {
                let finalDamage = p.damage;
                if (p.isEmpowered) {
                    finalDamage = Math.ceil(finalDamage * POWERUP_DAMAGE_MULTIPLIER);
                    console.log(`CCR Power-Up Hit ${target === player ? 'Player' : 'Opponent'}! Damage: ${finalDamage}`);
                    showCCRMessage();
                    p.isEmpowered = false;
                }
                target.hp = Math.max(0, target.hp - finalDamage);
                target.isHit = true; target.hitStartTime = Date.now();
                p.bouncesLeft = -1; p.didHitTarget = true;
                if (activeProjectile === p) activeProjectile = null;
                projectiles.splice(i, 1); projectileRemovedThisCheck = true;
                updateUI(); checkGameOver(); continue;
            }
            // Power-Up Collision
             if (!projectileRemovedThisCheck && powerUp && powerUp.active && isColliding(p, powerUp)) {
                 console.log("Projectile hit CCR power-up!");
                 powerUp.active = false;
                 p.isEmpowered = true;
             }
            // Ground Collision
            if (!projectileRemovedThisCheck && p.y + p.radius >= groundY) {
                p.y = groundY - p.radius;
                if (p.bouncesLeft > 0) {
                    p.bouncesLeft--;
                    p.vy = -p.vy * 0.6;
                    p.vx *= 0.8;
                    if (Math.abs(p.vy) < 1 && Math.abs(p.vx) < 0.5) {
                        p.bouncesLeft = -1; p.vy = 0; p.vx = 0;
                        if (activeProjectile === p) activeProjectile = null;
                        if (!p.didHitTarget) spawnPowerUp();
                    }
                } else {
                     p.bouncesLeft = -1; p.vy = 0; p.vx *= 0.5;
                     if (Math.abs(p.vx) < 0.1) p.vx = 0;
                     if (activeProjectile === p) activeProjectile = null;
                     if (!p.didHitTarget) spawnPowerUp();
                }
            }
            // Cleanup
            if (p.bouncesLeft === -1 && !projectileRemovedThisCheck) {
                const indexToRemove = projectiles.indexOf(p);
                if (indexToRemove > -1) {
                    projectiles.splice(indexToRemove, 1);
                }
                if (activeProjectile === p) activeProjectile = null;
            }
        }
    }
    function isColliding(circle, rect) {
        if (!rect || !circle) return false;
        const rectX = rect.x; const rectY = rect.y;
        const rectWidth = rect.width || POWERUP_WIDTH;
        const rectHeight = rect.height || POWERUP_HEIGHT;
        const closestX = Math.max(rectX, Math.min(circle.x, rectX + rectWidth));
        const closestY = Math.max(rectY, Math.min(circle.y, rectY + rectHeight));
        const distanceX = circle.x - closestX;
        const distanceY = circle.y - closestY;
        const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
        return distanceSquared < (circle.radius * circle.radius);
     }
    function checkGameOver() {
        if (gameOver) return;
        let winner = null;
        if (player && player.hp <= 0) {
            winner = opponent ? `${opponent.name} Wins!` : "Opponent Wins!";
        } else if (opponent && opponent.hp <= 0) {
            winner = player ? `${player.name} Wins!` : "Player Wins!";
        }
        if (winner) {
            endGame(winner);
        }
     }
    function endGame(message) {
        if (gameOver) return;
        console.log(`Game Over: ${message}`);
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

    // =========================================================================
    // Power-Up Logic
    // =========================================================================
    function spawnPowerUp() {
        if (!powerUpImage || (powerUp && powerUp.active)) {
            return;
        }
        if (!player || !opponent) return;
        console.log("Spawning CCR Power-Up!");
        const playerCenterX = player.x + player.width / 2;
        const opponentCenterX = opponent.x + opponent.width / 2;
        const spawnX = (playerCenterX + opponentCenterX) / 2 - POWERUP_WIDTH / 2;
        const spawnY = canvas.height / 2 - POWERUP_HEIGHT / 2;
        console.log(`Power-up spawn position: X=${spawnX.toFixed(1)}, Y=${spawnY.toFixed(1)}`);
        powerUp = {
            x: spawnX, y: spawnY,
            width: POWERUP_WIDTH, height: POWERUP_HEIGHT,
            active: true
        };
     }
     function showCCRMessage() {
        if (ccrMessageDisplay) {
            console.log("Displaying CCR Power-Up message.");
            ccrMessageDisplay.style.display = 'block'; // Or 'flex'/'inline-block' depending on CSS
            // Hide the message after a set duration
            setTimeout(() => {
                if (ccrMessageDisplay) ccrMessageDisplay.style.display = 'none';
                console.log("Hiding CCR Power-Up message.");
            }, CCR_MESSAGE_DURATION);
        } else {
            console.warn("CCR message display element not found.");
        }
     }

    // =========================================================================
    // Drawing Functions
    // =========================================================================
    function drawGround() {
        ctx.fillStyle = '#5d5745';
        const groundWidth = canvas.width * 3;
        const groundStartX = -canvas.width;
        ctx.fillRect(groundStartX, canvas.height - 10, groundWidth, 10);
     }

    /**
     * Draws a character, handling image loading fallbacks, flipping, and hit effects.
     * NOTE: The hit flash effect (using source-atop) relies on character PNGs
     * having TRUE transparent backgrounds where the flash should NOT appear.
     * If the background pixels are opaque white, the flash will cover them too.
     * @param {object} char - The character object (player or opponent).
     */
    function drawCharacter(char) {
        if (!char) return;

        const bounceDistance = 5;
        const bounceDuration = 300; // Duration of physical bounce
        const currentTime = Date.now();
        let drawX = char.x;
        let drawY = char.y;

        // Apply bounce modification
        if (char.isHit && currentTime - char.hitStartTime < bounceDuration) {
            const elapsedTime = currentTime - char.hitStartTime;
            const progress = elapsedTime / bounceDuration;
            const bounceOffset = bounceDistance * Math.sin(progress * Math.PI);
            drawX += char === player ? -bounceOffset : bounceOffset;
        }
        // Reset hit flag after TOTAL duration
        if (char.isHit && currentTime - char.hitStartTime >= HIT_EFFECT_DURATION) {
            char.isHit = false;
        }

        const drawWidth = char.width;
        const drawHeight = char.height;
        const shouldFlip = (char === opponent);

        ctx.save(); // Save context before transforms/effects

        // Apply flip if opponent
        if (shouldFlip) {
            ctx.translate(drawX + drawWidth / 2, 0);
            ctx.scale(-1, 1);
            ctx.translate(-(drawX + drawWidth / 2), 0);
        }

        // Draw Character Image or Fallback
        if (char.img) {
            ctx.drawImage(char.img, drawX, drawY, drawWidth, drawHeight);
        } else { // Fallback
            ctx.fillStyle = (char === player) ? 'rgba(0, 0, 255, 0.7)' : 'rgba(255, 0, 0, 0.7)';
            ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
            ctx.strokeRect(drawX, drawY, drawWidth, drawHeight);
        }

        // --- Hit Flash Effect ---
        if (char.isHit && currentTime - char.hitStartTime < HIT_EFFECT_DURATION) {
            const flashProgress = (currentTime - char.hitStartTime) / HIT_EFFECT_DURATION;
            const flashAlpha = Math.max(0, 0.8 * (1 - flashProgress)); // Fade out
            if (flashAlpha == 0) {
                // 'source-atop': Draw the following shape only where the existing content is opaque/semi-opaque.
                ctx.globalCompositeOperation = 'source-atop'; // <--- The key part
                ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
                ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
                ctx.globalCompositeOperation = 'source-over';
            }
        }
        // --- End Hit Flash Effect ---

        ctx.restore(); // Restore context (removes flip)

        // Draw HP Bar (after restoring context)
        const hpBarWidth = drawWidth * 0.8;
        const hpBarHeight = 8;
        const hpBarX = drawX + (drawWidth - hpBarWidth) / 2;
        const hpBarY = drawY - hpBarHeight - 7;
        const currentHp = typeof char.hp === 'number' ? Math.max(0, char.hp) : 0;
        const maxHp = 100;
        const currentHpWidth = Math.max(0,(currentHp / maxHp) * hpBarWidth);

        ctx.fillStyle = '#555';
        ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
        ctx.fillStyle = currentHp < maxHp * 0.3 ? '#dc3545' : (currentHp < maxHp * 0.6 ? '#ffc107' : '#28a745');
        if (currentHpWidth > 0) {
             ctx.fillRect(hpBarX, hpBarY, currentHpWidth, hpBarHeight);
        }
        ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
        ctx.strokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
    }

    function drawProjectiles() {
        projectiles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            if (p.isEmpowered && powerUpImage) {
                const drawRadius = p.radius * 1.5;
                const drawX = p.x - drawRadius;
                const drawY = p.y - drawRadius;
                ctx.drawImage(powerUpImage, drawX, drawY, drawRadius * 2, drawRadius * 2);
            } else {
                ctx.fillStyle = p.owner === 'player' ? '#4ecdc4' : '#ff6b6b';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });
     }
    function drawAimIndicator() {
        if (!isPlayerTurn || gameOver || !player || isCharging) return;
        const arrowLength = 45; const arrowHeadSize = 10;
        const distanceFromCharCenter = player.width / 2 + 5;
        const arrowColor = 'rgba(255, 255, 255, 0.8)'; const arrowLineWidth = 2;
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;
        const arrowBaseX = playerCenterX + Math.cos(aimAngle) * distanceFromCharCenter;
        const arrowBaseY = playerCenterY + Math.sin(aimAngle) * distanceFromCharCenter;
        const arrowTipX = arrowBaseX + Math.cos(aimAngle) * arrowLength;
        const arrowTipY = arrowBaseY + Math.sin(aimAngle) * arrowLength;
        ctx.save();
        ctx.beginPath(); ctx.moveTo(arrowBaseX, arrowBaseY); ctx.lineTo(arrowTipX, arrowTipY);
        ctx.strokeStyle = arrowColor; ctx.lineWidth = arrowLineWidth; ctx.stroke();
        ctx.translate(arrowTipX, arrowTipY); ctx.rotate(aimAngle);
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(-arrowHeadSize, -arrowHeadSize / 2);
        ctx.moveTo(0, 0); ctx.lineTo(-arrowHeadSize, arrowHeadSize / 2);
        ctx.strokeStyle = arrowColor; ctx.lineWidth = arrowLineWidth; ctx.stroke();
        ctx.restore();
     }

     // =========================================================================
     // Main Game Loop
     // =========================================================================
     function gameLoop(timestamp) {
         if (gameOver) return;
         updateCamera();
         updateProjectiles();
         checkCollisions();
         if (isCharging && isPlayerTurn) {
             updatePowerMeter();
         }
         ctx.clearRect(0, 0, canvas.width, canvas.height);
         ctx.save();
         ctx.translate(cameraX, 0);

         // Draw Background Image Dynamically
         if (backgroundImage) {
             const backgroundDrawHeight = canvas.height;
             const aspectRatio = backgroundImage.naturalWidth / backgroundImage.naturalHeight;
             const backgroundDrawWidth = backgroundDrawHeight * aspectRatio;
             let finalBackgroundWidth = backgroundDrawWidth;
             if (player && opponent) {
                 const worldWidth = (opponent.x + opponent.width) - player.x;
                 const minBgWidth = worldWidth + canvas.width * 0.6;
                 finalBackgroundWidth = Math.max(backgroundDrawWidth, minBgWidth);
             } else {
                 finalBackgroundWidth = Math.max(backgroundDrawWidth, canvas.width * 1.5);
             }
             let backgroundStartX = canvas.width / 2 - finalBackgroundWidth / 2;
             if (player && opponent) {
                const playableAreaMidX = player.x + ((opponent.x + opponent.width) - player.x) / 2;
                backgroundStartX = playableAreaMidX - finalBackgroundWidth / 2;
             }
             ctx.drawImage(backgroundImage, backgroundStartX, 0, finalBackgroundWidth, backgroundDrawHeight);
         } else { // Fallback color
              ctx.fillStyle = '#1c2a3e';
              ctx.fillRect(-canvas.width * 2, 0, canvas.width * 5, canvas.height);
         }

         // Draw World Elements
         drawGround();
         if (player) drawCharacter(player); // Calls function with hit effect logic
         if (opponent) drawCharacter(opponent); // Calls function with hit effect logic

         // Draw Power-Up if active
         if (powerUp && powerUp.active && powerUpImage) {
             const drawX = powerUp.x;
             const drawY = powerUp.y;
             ctx.drawImage(powerUpImage, drawX, drawY, powerUp.width, powerUp.height);
         }

         drawProjectiles();
         drawAimIndicator();

         ctx.restore(); // Remove camera offset

         requestAnimationFrame(gameLoop);
     }

    // =========================================================================
    // UI Update & Turn Switching
    // =========================================================================
    function updateUI() {
        if (playerHpDisplay) {
             playerHpDisplay.textContent = player ? String(Math.max(0, player.hp)) : '---';
             if (player) playerHpDisplay.style.color = player.hp < 30 ? '#dc3545' : (player.hp < 60 ? '#ffc107' : 'white');
             else playerHpDisplay.style.color = 'white';
        }
        if (opponentHpDisplay) {
             opponentHpDisplay.textContent = opponent ? String(Math.max(0, opponent.hp)) : '---';
             if (opponent) opponentHpDisplay.style.color = opponent.hp < 30 ? '#dc3545' : (opponent.hp < 60 ? '#ffc107' : 'white');
             else opponentHpDisplay.style.color = 'white';
        }
        if (turnIndicator) {
            if (gameOver) turnIndicator.textContent = "Game Over";
            else turnIndicator.textContent = isPlayerTurn ? "Your Turn" : "Opponent's Turn";
        }
     }
    function switchTurn() {
        if (gameOver) return;
        isPlayerTurn = !isPlayerTurn;
        activeProjectile = null;
        updateUI();
        if (!isPlayerTurn) {
            opponentTurn();
        }
     }

    // =========================================================================
    // Initial Setup Function
    // =========================================================================
    function initializeGame() {
        const elementsExist = canvas && startButton && powerMeterContainer &&
                              characterOptionsContainer && startMenu && gameArea &&
                              playerHpDisplay && opponentHpDisplay && turnIndicator &&
                              gameOverMessage && restartButton && ccrMessageDisplay;
        if (elementsExist) {
            console.log("Essential UI elements found. Initializing game.");
            resetGame();
            if (startMenu) startMenu.style.display = 'flex';
            if (gameArea) gameArea.style.display = 'none';
            if (gameOverMessage) gameOverMessage.style.display = 'none';
        } else {
            console.error("FATAL: Cannot initialize game - one or more essential UI elements missing!");
            alert("Error initializing game UI. Critical HTML elements might be missing. Check console (F12).");
        }
     }

    // Initialization is triggered after asset loading attempts.

}); // End of DOMContentLoaded Listener
