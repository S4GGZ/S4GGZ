/**
 * @fileoverview Main script for the turn-based artillery game.
 * Handles game setup, character selection, game logic, drawing, and UI updates.
 * Includes box towers with gravity, power-ups, refined positional box type enforcement,
 * closer tower spacing, updated Spaga multiplier, and scaled/panning background.
 * Adjusted constants and fixed popup logic based on user input.
 * Formatted for readability.
 * @version 1.9.2 - Enhanced Readability (Shorter Lines)
 * @date 2025-04-13 // Assuming continuation from previous version date
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
    const ccrMessageDisplay = document.getElementById('ccr-message'); // Displays Consti power-up msg
    const popupAd = document.getElementById('popup-ad');
    const closeAdBtn = document.getElementById('close-ad-btn');
    const basescuAudioPath = './assets/audio/Basescu.mp3'; // Path to Traian Băsescu's audio
    const NormalAudioPath = './assets/audio/background.mp3';   // Path to normal background audio
    const preloadBasescu = new Audio(basescuAudioPath);
    preloadBasescu.preload = 'auto';
    const preloadNormal = new Audio(NormalAudioPath);
    preloadNormal.preload = 'auto';
    // =========================================================================
    // Popup Ad Logic
    // =========================================================================

    // Function to determine if the popup should appear
    function shouldShowPopup(chance = 0.00001) { // 0.001% chance (0.001 / 100)
        const randomValue = Math.random(); // Generate a random number between 0 and 1
        return randomValue <= chance; // Return true if within the chance threshold
    }

    // Show the popup ad if the chance condition is met
    if (popupAd) {
        if (shouldShowPopup()) {
            console.log("Popup condition met. Showing ad."); // Added console log for debugging
            popupAd.style.display = 'block'; // Show the popup
        } else {
            console.log("Popup condition not met."); // Added console log for debugging
            popupAd.style.display = 'none'; // Hide the popup
        }

        // Open the specified link when the popup (but not the close button) is clicked
        popupAd.addEventListener('click', (event) => {
            // Ensure the click wasn't directly on the close button itself
            if (event.target.id !== 'close-ad-btn') {
                console.log("Popup clicked (not close button), redirecting..."); // Added console log
                // Open the specific link in a new tab
                window.open('https://youtu.be/KJ93TYw6geU?si=436xWRxOvuIm9cET&t=10', '_blank');
            } else {
                 console.log("Close button clicked, redirect prevented."); // Added console log
            }
        });

        // Close button functionality
        if (closeAdBtn) {
            closeAdBtn.addEventListener('click', (event) => {
                console.log("Close button explicit click handler triggered."); // Added console log
                event.stopPropagation(); // VERY IMPORTANT: Prevent triggering the popup's click listener
                popupAd.style.display = 'none'; // Hide the popup
            });
        }
    } else {
        console.warn("Popup Ad container element not found.");
    }
    // =========================================================================
    // Essential Canvas Setup & Check
    // =========================================================================
    if (!canvas) {
        console.error("FATAL: Canvas element with ID 'game-canvas' not found!");
        alert("Error: Could not find the game canvas. The game cannot start.");
        return; // Stop execution if canvas is missing
    }
    console.log("Canvas element found.");

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("FATAL: Could not get 2D rendering context.");
        alert("Error: Could not get 2D graphics context. Your browser might not support HTML5 Canvas.");
        return; // Stop execution if context fails
    }
    console.log("Canvas 2D context obtained.");

    // =========================================================================
    // Asset Paths & Loading Variables
    // =========================================================================
    let loadedGameImages = {}; // Stores loaded character game images { id: ImageObject }
    let loadingPromises = []; // Array to hold all image loading promises
    let backgroundImage = null;
    const backgroundImagePath = 'assets/background/CasaPoporului.png';
    let powerUpImage = null; // Image for the ground 'Consti' power-up
    const constiPowerUpImagePath = 'assets/characters/consti.png';

    // Box and Prop Image Paths
    const mysteryBoxImagePath = 'assets/props/mistery_box.png';
    const cutieArmeImagePath = 'assets/props/cutie_arme.png';
    const cutieSpagaImagePath = 'assets/props/cutie_spaga.png';
    const dosarePenaleImagePath = 'assets/props/dosare_penale.png';
    const spagaBallImagePath = 'assets/props/spaga.png'; // Projectile image for Spaga powerup

    let loadedPropImages = {
        mystery: null,
        arme: null,
        spaga: null,
        dosare: null,
        spagaBall: null,
        constiPowerUp: null
    };
    // Types for initial random spawn AND for top box enforcement (non-mystery)
    const initialBoxTypes = ['arme', 'spaga', 'dosare'];
    // Types that grant powerups when hit with sufficient force
    const specialBoxTypes = ['arme', 'spaga', 'dosare'];

    const characterData = [
        { id: 'basescu', name: 'Basescu', menuImage: 'assets/characters/Basescu.png', gameImage: 'assets/characters/Base.png' },
        { id: 'simion', name: 'Simion', menuImage: 'assets/characters/Simion.png', gameImage: 'assets/characters/Simi.png' },
        { id: 'nicusor', name: 'Nicusor', menuImage: 'assets/characters/Nicusor.png', gameImage: 'assets/characters/Mucusor.png' },
        { id: 'lasconi', name: 'Lasconi', menuImage: 'assets/characters/Lasconi.png', gameImage: 'assets/characters/TusaConi.png' },
        { id: 'ponta', name: 'Ciolacu', menuImage: 'assets/characters/Ciolacu.png', gameImage: 'assets/characters/Ciorapu.png' },
        { id: 'monta', name: 'Monta', menuImage: 'assets/characters/Monta.png', gameImage: 'assets/characters/Ponta.png' }, // Added Monta
        { id: 'ove', name: 'Ove', menuImage: 'assets/characters/Ove.png', gameImage: 'assets/characters/Ovidiu.png' }       // Added Ove // Note: ID vs Name difference
    ];

    // Audio & Mute State
    let characterAudio = null; // Holds the current background audio object
    let isMuted = false;       // Tracks mute state
    let muteButton = null;     // Reference to the mute button DOM element
    const muteIconPath = 'assets/images/unmute.png'; // Icon when muted
    const unmuteIconPath = 'assets/images/mute.png';   // Icon when not muted
    // Specific audio paths (example)
   
    // =========================================================================
    // Game State & Configuration Variables
    // =========================================================================
    let selectedCharacter = null; // ID of the player's chosen character
    let player = null;            // Player character object
    let opponent = null;          // Opponent character object
    let projectiles = [];         // Array of active projectiles
    let isPlayerTurn = true;      // Tracks whose turn it is
    let isCharging = false;       // True if player is holding mouse down to charge
    let chargeStartTime = 0;      // Timestamp when charging started
    let gameOver = false;         // True if the game has ended
    let aimAngle = -Math.PI / 4;  // Current aiming angle for the player
    let mousePos = { x: 0, y: 0 }; // Mouse position relative to the canvas
    let cameraX = 0;              // Camera's horizontal offset (world scrolls under it)
    let activeProjectile = null;  // Reference to the currently flying projectile (for camera focus)
    let powerUp = null;           // Ground power-up object { x, y, width, height, active }

    // Box Tower Variables
    let boxTower1 = [];           // Array of box objects for the first tower
    let boxTower2 = [];           // Array of box objects for the second tower
    let playerPowerUp = null;     // Holds power-up info for the player's next shot
    let opponentPowerUp = null;   // Holds power-up info for the opponent's next shot

    // Game Constants (User Provided Values Applied)
    const MAX_CHARGE_TIME = 1500;     // ms for full power charge
    const MIN_DAMAGE = 5;           // Minimum damage per hit
    const MAX_DAMAGE = 15;          // Max damage at full power (base, before multipliers)
    const GRAVITY = 0.15;           // Projectile vertical acceleration
    const CHARACTER_WIDTH = 400 / 2.3; // Character sprite width
    const CHARACTER_HEIGHT = 400 / 2.3;// Character sprite height
    const PROJECTILE_RADIUS = 12;     // Base radius of projectiles
    const PROJECTILE_BOUNCES = 2;     // Max bounces before projectile stops/fades
    const HIT_EFFECT_DURATION = 500;  // ms for character hit visual effect
    const CAMERA_SMOOTHING = 0.08;    // Factor for smooth camera movement (lower = smoother)
    const POWERUP_WIDTH = 50;       // Width of the ground power-up item
    const POWERUP_HEIGHT = 50;      // Height of the ground power-up item
    const POWERUP_DAMAGE_MULTIPLIER = 2.69; // Damage multiplier for CCR/Consti effect
    const CCR_MESSAGE_DURATION = 3000; // ms the CCR power-up message is shown
    const BOX_WIDTH = 62;             // Width of tower boxes
    const BOX_HEIGHT = 62;            // Height of tower boxes
    const BOX_FALL_SPEED = 6;         // Pixels per frame boxes fall due to gravity
    const TOWER_HEIGHT = 6;           // Number of boxes vertically in each tower
    const TOWER_BASE_Y_OFFSET = 0;   // Pixels ground is offset for box base (neg = below)
    const POWER_THRESHOLD = 0.99;     // Min power ratio (e.g., 0.99 = 99%) to trigger box power-up
    const SPAGA_MULTIPLIER = 2.2;     // Damage multiplier for 'Spaga' box power-up
    const DOSARE_MULTIPLIER = 1.2;    // Damage multiplier for 'Dosare' box power-up


    // =========================================================================
    // Asset Loading Function
    // =========================================================================
    function loadImage(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img); // Resolve with the loaded image object
            img.onerror = (err) => {
                console.error(`Error loading image: ${src}`, err);
                resolve(null); // Resolve with null if loading fails
            };
            // Ensure src is a valid string before setting
            if (src && typeof src === 'string') {
                img.src = src;
            } else {
                console.error(`Invalid image source provided: ${src}`);
                resolve(null); // Resolve with null for invalid source
            }
        });
    }

    // =========================================================================
    // Preload Game Assets
    // =========================================================================
    console.log("Starting asset preloading...");
    // Load background
    loadingPromises.push(
        loadImage(backgroundImagePath)
            .then(img => {
                backgroundImage = img;
                if (!img) console.error(`FAILED background load: ${backgroundImagePath}`);
            })
    );
    // Load character game images
    characterData.forEach(char => {
        if (char.gameImage) {
            loadingPromises.push(
                loadImage(char.gameImage)
                    .then(img => {
                        loadedGameImages[char.id] = img;
                        if (!img) console.error(`FAILED char load: ${char.gameImage}`);
                    })
            );
        } else {
            console.warn(`Missing gameImage path for character: ${char.name}`);
            loadedGameImages[char.id] = null; // Mark as null if path is missing
        }
    });
    // Load prop/box images
    loadingPromises.push(loadImage(mysteryBoxImagePath).then(img => { loadedPropImages.mystery = img; if (!img) console.error("FAILED mystery box load"); }));
    loadingPromises.push(loadImage(cutieArmeImagePath).then(img => { loadedPropImages.arme = img; if (!img) console.error("FAILED arme box load"); }));
    loadingPromises.push(loadImage(cutieSpagaImagePath).then(img => { loadedPropImages.spaga = img; if (!img) console.error("FAILED spaga box load"); }));
    loadingPromises.push(loadImage(dosarePenaleImagePath).then(img => { loadedPropImages.dosare = img; if (!img) console.error("FAILED dosare box load"); }));
    loadingPromises.push(loadImage(spagaBallImagePath).then(img => { loadedPropImages.spagaBall = img; if (!img) console.error("FAILED spaga ball load"); }));
    loadingPromises.push(loadImage(constiPowerUpImagePath).then(img => { loadedPropImages.constiPowerUp = img; powerUpImage = img; if (!img) console.error("FAILED consti powerup load"); }));

    // Wait for all loading attempts to finish (resolve or reject)
    Promise.all(loadingPromises).finally(() => {
        console.log("All image loading attempts finished.");
        initializeGame(); // Initialize the game setup after assets attempt to load
    });

    // =========================================================================
    // Start Menu & Character Selection Logic
    // =========================================================================
    function populateCharacterSelection() {
        if (!characterOptionsContainer) {
            console.error("Character selection container not found.");
            return;
        }
        characterOptionsContainer.innerHTML = ''; // Clear previous options

        characterData.forEach(char => {
            const option = document.createElement('div');
            option.className = 'character-option';
            option.setAttribute('data-char', char.id);

            const img = document.createElement('img');
            // Use placeholder if menu image is missing
            img.src = char.menuImage || 'https://placehold.co/80x80/cccccc/ffffff?text=N/A';
            img.alt = char.name;
            // Fallback for image loading errors
            img.onerror = (e) => { e.target.src = 'https://placehold.co/80x80/cccccc/ffffff?text=Error'; };

            const nameSpan = document.createElement('span');
            nameSpan.textContent = char.name;

            option.appendChild(img);
            option.appendChild(nameSpan);

            // Handle character selection click
            option.addEventListener('click', () => {
                // Deselect previously selected option
                document.querySelectorAll('.character-option')
                    .forEach(opt => opt.classList.remove('selected'));
                // Select the clicked option
                option.classList.add('selected');
                selectedCharacter = char.id;
                // Enable start button only when a character is selected
                if (startButton) startButton.disabled = false;
            });
            characterOptionsContainer.appendChild(option);
        });

        // Disable start button initially
        if (startButton) startButton.disabled = true;
    }

    // =========================================================================
    // Button Event Listeners
    // =========================================================================
    if (startButton) {
        startButton.addEventListener('click', () => {
            if (selectedCharacter) {
                startGame(); // Start the game if a character is chosen
            } else {
                alert("Please select a character first!");
            }
        });
    } else {
        console.error("Start button element not found!");
    }

    if (restartButton) {
        restartButton.addEventListener('click', () => {
            // Hide game over screen and game area
            if (gameOverMessage) gameOverMessage.style.display = 'none';
            if (gameArea) gameArea.style.display = 'none';
            // Show start menu
            if (startMenu) startMenu.style.display = 'flex';
            // Reset game state and repopulate character select
            resetGame();
        });
    } else {
        console.error("Restart button element not found!");
    }

    // =========================================================================
    // Game Initialization & Reset Logic
    // =========================================================================

    /** Spawns the two towers of boxes between the players. */
    function spawnBoxTowers() {
        boxTower1 = [];
        boxTower2 = [];
        const groundY = canvas.height - 20; // Ground level
        const towerBaseActualY = groundY - TOWER_BASE_Y_OFFSET; // Y position for the bottom-most box

        if (!player || !opponent) {
            console.error("Cannot spawn towers: Player or opponent object is missing.");
            return;
        }

        // Calculate positions based on player/opponent locations
        const playerEdge = player.x + player.width;
        const opponentEdge = opponent.x;
        const gap = opponentEdge - playerEdge; // Space between characters

        // Increase the gap between the towers
        const minTowerGap = 500;
        const desiredTowerGap = Math.max(minTowerGap, gap / 6);
        const totalTowerWidth = BOX_WIDTH * 2 + desiredTowerGap;
        let tower1X, tower2X;

        if (gap >= totalTowerWidth) {
            const groupStartX = playerEdge + (gap - totalTowerWidth) / 2;
            tower1X = groupStartX;
            tower2X = groupStartX + BOX_WIDTH + desiredTowerGap;
        } else {
            console.warn("Gap between players is very small for towers. Placing tightly.");
            const centerPoint = playerEdge + gap / 2;
            tower1X = centerPoint - BOX_WIDTH - (minTowerGap / 2);
            tower2X = centerPoint + (minTowerGap / 2);
        }

        // --- ADAUGĂM SUPRAPUNERE ---
        const overlap = -3; // Suprapunere de 1 pixel

        // Create boxes for each tower from bottom to top
        for (let i = 0; i < TOWER_HEIGHT; i++) {
            // --- MODIFICĂM CALCULUL LUI boxY ---
            // Fiecare cutie (cu excepția i=0) va fi plasată cu 'i * overlap' pixeli mai jos
            const boxY = towerBaseActualY - (i + 1) * BOX_HEIGHT - i * overlap;

            // Assign random initial types for Tower 1
            const type1 = initialBoxTypes[Math.floor(Math.random() * initialBoxTypes.length)];
            const image1 = loadedPropImages[type1] || loadedPropImages.mystery; // Fallback to mystery img
            boxTower1.push({
                x: tower1X, y: boxY, // Folosim boxY modificat
                width: BOX_WIDTH, height: BOX_HEIGHT,
                vy: 0, // Initial vertical velocity
                img: image1, type: type1,
                active: true, // Box is part of the game
                isFalling: false // Box starts stationary
            });

            // Assign random initial types for Tower 2
            const type2 = initialBoxTypes[Math.floor(Math.random() * initialBoxTypes.length)];
            const image2 = loadedPropImages[type2] || loadedPropImages.mystery;
            boxTower2.push({
                x: tower2X, y: boxY, // Folosim boxY modificat
                width: BOX_WIDTH, height: BOX_HEIGHT,
                vy: 0, img: image2, type: type2,
                active: true, isFalling: false
            });
        }

        console.log(`Box towers spawned (Gap: ${gap.toFixed(0)}, T1X: ${tower1X.toFixed(0)}, T2X: ${tower2X.toFixed(0)})`);
        updateBoxTypes(); // Enforce initial mystery/special box rules immediately
    }
    /** Starts a new game session after character selection. */
    function startGame() {
        const chosenCharData = characterData.find(c => c.id === selectedCharacter);
        if (!chosenCharData) {
            alert("Error starting game: Selected character data not found.");
            resetGame(); // Go back to selection
            return;
        }

        // Stop any previous audio and reset mute button
        stopCharacterAudio();
        removeMuteButton();

        // Play the appropriate audio based on the selected character
        characterAudio = new Audio(selectedCharacter === 'basescu' ? basescuAudioPath : NormalAudioPath);
        characterAudio.loop = true;
        characterAudio.volume = 0.75;
        characterAudio.muted = isMuted; // Respect the mute state
        characterAudio.play().catch(err => console.warn("Audio play failed:", err));

        // Add the mute button to the game area
        createMuteButton();

        if (startMenu) startMenu.style.display = 'none';
        if (gameArea) gameArea.style.display = 'block';

        // Reset core game state variables
        gameOver = false;
        activeProjectile = null;
        if (gameOverMessage) gameOverMessage.style.display = 'none';
        powerUp = null; // Reset ground power-up
        if (ccrMessageDisplay) ccrMessageDisplay.style.display = 'none';
        projectiles = [];
        isPlayerTurn = true;
        playerPowerUp = null; // Reset player's stored powerup
        opponentPowerUp = null; // Reset opponent's stored powerup
        cameraX = 0;
        aimAngle = -Math.PI / 4; // Reset aim
        mousePos = { x: 0, y: 0 };
        isCharging = false;

        // Position Player
        const edgePadding = -75; // Negative padding brings them closer to center
        player = {
            x: edgePadding,
            y: canvas.height - CHARACTER_HEIGHT - 10, // Position above ground
            width: CHARACTER_WIDTH,
            height: CHARACTER_HEIGHT,
            hp: 100,
            id: chosenCharData.id,
            name: chosenCharData.name,
            img: loadedGameImages[chosenCharData.id],
            isHit: false, // For hit animation state
            hitStartTime: 0 // Timestamp for hit animation
        };

        // Select and Position Opponent
        const availableOpponents = characterData.filter(c => c.id !== selectedCharacter);
        const randomOpponentData = availableOpponents.length > 0
            ? availableOpponents[Math.floor(Math.random() * availableOpponents.length)]
            : chosenCharData; // Fallback if only one character exists
        opponent = {
            x: canvas.width - CHARACTER_WIDTH - edgePadding,
            y: canvas.height - CHARACTER_HEIGHT - 10,
            width: CHARACTER_WIDTH,
            height: CHARACTER_HEIGHT,
            hp: 100,
            id: randomOpponentData.id,
            name: randomOpponentData.name,
            img: loadedGameImages[randomOpponentData.id],
            isHit: false,
            hitStartTime: 0
        };

        // Initial camera position (centered between players)
        const worldMidPoint = (player.x + player.width / 2 + opponent.x + opponent.width / 2) / 2;
        // Calculate cameraX so the world midpoint appears at canvas center
        cameraX = canvas.width / 2 - worldMidPoint;

        spawnBoxTowers(); // Spawn towers after players are positioned

        updateUI(); // Set initial HP display and turn indicator

        // Add game input listeners
        if (canvas) {
            canvas.addEventListener('mousedown', handleMouseDown);
            canvas.addEventListener('mouseup', handleMouseUp);
            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('mouseleave', handleMouseLeave);
        } else {
            console.error("FATAL: Canvas element lost after game start!");
            alert("Critical error: Canvas disappeared!");
            return;
        }

        console.log("Game setup complete. Starting game loop...");
        requestAnimationFrame(gameLoop); // Start the main game loop
    }

    /** Resets the game state to return to the start menu. */
    function resetGame() {
        console.log("Resetting game state for new selection or restart.");

        // Remove game event listeners
        if (canvas) {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
        }

        // Stop audio and remove mute button
        stopCharacterAudio();
        removeMuteButton();

        // Clear all game state variables
        selectedCharacter = null;
        player = null;
        opponent = null;
        projectiles = [];
        boxTower1 = [];
        boxTower2 = [];
        isPlayerTurn = true;
        isCharging = false;
        gameOver = false;
        aimAngle = -Math.PI / 4;
        mousePos = { x: 0, y: 0 };
        cameraX = 0;
        activeProjectile = null;
        powerUp = null;
        playerPowerUp = null;
        opponentPowerUp = null;

        // Reset UI elements to initial state
        if (ccrMessageDisplay) ccrMessageDisplay.style.display = 'none';
        if (startButton) startButton.disabled = true; // Disable start until selection
        document.querySelectorAll('.character-option')
            .forEach(opt => opt.classList.remove('selected')); // Deselect character cards
        if (powerMeterContainer) powerMeterContainer.style.display = 'none'; // Hide power meter

        updateUI(); // Clear HP displays etc.
        if (turnIndicator) turnIndicator.textContent = "Select Character"; // Update turn text

        populateCharacterSelection(); // Refill character selection options
    }

    // =========================================================================
    // Audio & Mute Button Helper Functions
    // =========================================================================

    /** Creates and adds the mute button to the game area. */
    function createMuteButton() {
        if (!gameArea) return; // Need game area to append to
        removeMuteButton(); // Ensure no duplicates

        muteButton = document.createElement('img');
        muteButton.id = 'mute-button';
        muteButton.src = isMuted ? muteIconPath : unmuteIconPath;
        muteButton.alt = isMuted ? 'Unmute' : 'Mute';
        muteButton.title = isMuted ? 'Unmute Sound' : 'Mute Sound';

        // Apply styles directly
        Object.assign(muteButton.style, {
            position: 'absolute',
            top: '15%', // Position relative to game area
            right: '10px',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            zIndex: '150', // Ensure it's above canvas
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            padding: '2px'
        });

        muteButton.onerror = (e) => { e.target.alt = "Mute/Unmute (icon error)"; };
        muteButton.addEventListener('click', toggleMute);
        gameArea.appendChild(muteButton);
    }

    /** Removes the mute button from the DOM if it exists. */
    function removeMuteButton() {
        if (muteButton && muteButton.parentNode) {
            muteButton.removeEventListener('click', toggleMute);
            muteButton.parentNode.removeChild(muteButton);
        }
        muteButton = null; // Clear reference
    }

    /** Toggles the mute state and updates the button icon/audio. */
    function toggleMute() {
        isMuted = !isMuted;
        // Update button appearance
        if (muteButton) {
            muteButton.src = isMuted ? muteIconPath : unmuteIconPath;
            muteButton.alt = isMuted ? 'Unmute' : 'Mute';
            muteButton.title = isMuted ? 'Unmute Sound' : 'Mute Sound';
        }
        // Apply mute state to audio element
        if (characterAudio) {
            characterAudio.muted = isMuted;
        }
        console.log(`Sound ${isMuted ? 'muted' : 'unmuted'}.`);
    }

    /** Stops and resets the current background audio. */
    function stopCharacterAudio() {
        if (characterAudio) {
            characterAudio.pause();
            characterAudio.currentTime = 0; // Reset playback position
            characterAudio = null; // Clear reference
        }
    }

    // =========================================================================
    // Player Input Handling
    // =========================================================================

    /** Handles mouse button press down (start charging). */
    function handleMouseDown(event) {
        // Only allow charging if it's player's turn, game not over, and not already charging
        if (!isPlayerTurn || gameOver || isCharging || !player) return;

        isCharging = true;
        chargeStartTime = Date.now();
        updateAimAngle(); // Update aim based on current mouse pos when charge starts
        if (powerMeterContainer) powerMeterContainer.style.display = 'flex'; // Show meter
        updatePowerMeter(); // Update meter display immediately
    }

    /** Handles mouse button release (fire projectile). */
    function handleMouseUp(event) {
        // Only fire if it was player's turn, charging, game not over
        if (!isPlayerTurn || !isCharging || gameOver || !player) return;

        // Calculate power based on charge duration
        const chargeTime = Math.min(Date.now() - chargeStartTime, MAX_CHARGE_TIME);
        const powerRatio = chargeTime / MAX_CHARGE_TIME; // Ratio 0 to 1

        // Calculate projectile speed based on power
        const baseSpeed = 6;
        const maxAddedSpeed = 18;
        const power = baseSpeed + powerRatio * maxAddedSpeed;

        // Calculate base damage based on power
        let baseDamage = Math.max(
            MIN_DAMAGE,
            Math.ceil(MIN_DAMAGE + powerRatio * (MAX_DAMAGE - MIN_DAMAGE))
        );

        // Calculate initial velocity vector
        const velocityX = Math.cos(aimAngle) * power;
        const velocityY = Math.sin(aimAngle) * power;

        // Calculate projectile start position (offset from character center)
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;
        const startOffset = player.width / 2 + PROJECTILE_RADIUS + 2; // Offset beyond character edge
        const startX = playerCenterX + Math.cos(aimAngle) * startOffset;
        const startY = playerCenterY + Math.sin(aimAngle) * startOffset;

        // Create the projectile object
        const newProjectile = {
            x: startX, y: startY,
            vx: velocityX, vy: velocityY,
            radius: PROJECTILE_RADIUS,
            owner: 'player',
            damage: baseDamage,
            bouncesLeft: PROJECTILE_BOUNCES,
            alpha: 1, // For potential fading effects (currently unused)
            powerRatio: powerRatio, // Store the power ratio used
            isEmpowered: false, // Flag for ground power-up effect
            originalRadius: PROJECTILE_RADIUS, // Store base radius for collision checks
            didHitTarget: false, // Flag to prevent multiple hits from one shot (mostly handled by removal)
            customBallImage: null // Image override from power-ups
        };

        // Apply player's stored power-up if available
        if (playerPowerUp) {
            console.log(`Player using power-up: ${playerPowerUp.type}`);
            // Modify damage based on multiplier
            newProjectile.damage = Math.ceil(baseDamage * playerPowerUp.multiplier);
            // Use custom projectile image and size if provided
            if (playerPowerUp.ballImage) {
                newProjectile.customBallImage = playerPowerUp.ballImage;
                newProjectile.radius *= 1.3; // Increase visual size slightly
            }
            // If it was the 'Consti Target' powerup (from opponent hitting Arme), show message
            if (playerPowerUp.type === 'consti_target') {
                showCCRMessage();
            }
            playerPowerUp = null; // Consume the power-up
        }

        projectiles.push(newProjectile);
        activeProjectile = newProjectile; // Track this projectile for camera focus
        isCharging = false; // Stop charging state
        if (powerMeterContainer) powerMeterContainer.style.display = 'none'; // Hide meter

        switchTurn(); // End player's turn
    }

    /** Handles mouse movement over the canvas (updates aim). */
    function handleMouseMove(event) {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        // Calculate mouse position relative to the canvas element
        mousePos.x = event.clientX - rect.left;
        mousePos.y = event.clientY - rect.top;

        // Update aim angle only if it's player's turn and game is active
        if (isPlayerTurn && !gameOver && player) {
            updateAimAngle();
        }
    }

    /** Handles mouse leaving the canvas area (cancels charge). */
    function handleMouseLeave(event) {
        if (isCharging) {
            isCharging = false; // Cancel the charge
            if (powerMeterContainer) powerMeterContainer.style.display = 'none'; // Hide meter
            console.log("Charge cancelled: Mouse left canvas.");
        }
    }

    /** Calculates the aim angle based on mouse position relative to the player. */
    function updateAimAngle() {
        if (!player) return;
        // Convert canvas mouse coordinates to world coordinates
        const worldMouseX = mousePos.x - cameraX;
        const worldMouseY = mousePos.y; // Y is not affected by horizontal camera scroll

        // Calculate player center in world coordinates
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;

        // Calculate angle using atan2
        aimAngle = Math.atan2(worldMouseY - playerCenterY, worldMouseX - playerCenterX);
    }

    /** Updates the power meter display while charging. */
    function updatePowerMeter() {
        if (!isCharging || !powerValueDisplay || !powerBarFg) return;

        const elapsedTime = Date.now() - chargeStartTime;
        const chargeRatio = Math.min(elapsedTime / MAX_CHARGE_TIME, 1); // Clamp ratio 0-1
        const powerPercent = Math.round(chargeRatio * 100);

        // Update text and bar width
        powerValueDisplay.textContent = String(powerPercent);
        powerBarFg.style.width = `${powerPercent}%`;
    }

    // =========================================================================
    // Opponent AI Logic
    // =========================================================================

    /** Simulates the opponent's turn. */
    function opponentTurn() {
        if (gameOver || !opponent || !player) return; // Check game state
        if (turnIndicator) turnIndicator.textContent = "Opponent's Turn";
        activeProjectile = null; // Clear focus from previous projectile

        // Add a delay to simulate thinking
        setTimeout(() => {
            // Double check state in case game ended during delay
            if (!player || !opponent || gameOver || isPlayerTurn) return;

            // --- AI Calculation ---
            // Target the center of the player character
            const targetX = player.x + player.width / 2;
            const targetY = player.y + player.height / 2;

            // Opponent center
            const opponentCenterX = opponent.x + opponent.width / 2;
            const opponentCenterY = opponent.y + opponent.height / 2;

            // Calculate direct angle to target
            const dx = targetX - opponentCenterX;
            const dy = targetY - opponentCenterY;
            let baseAngle = Math.atan2(dy, dx);

            // Add some random inaccuracy to the aim
            const inaccuracy = (Math.random() - 0.5) * (Math.PI / 10); // +/- 9 degrees
            const opponentAimAngle = baseAngle + inaccuracy;

            // Choose a random charge time/power
            const chargeTime = (0.4 + Math.random() * 0.6) * MAX_CHARGE_TIME; // 40% to 100% charge
            const powerRatio = chargeTime / MAX_CHARGE_TIME;

            // Calculate speed based on chosen power
            const baseSpeed = 6;
            const maxAddedSpeed = 18;
            const power = baseSpeed + powerRatio * maxAddedSpeed;

            // Calculate base damage
            let baseDamage = Math.max(
                MIN_DAMAGE,
                Math.ceil(MIN_DAMAGE + powerRatio * (MAX_DAMAGE - MIN_DAMAGE))
            );

            // Calculate velocity vector
            const velocityX = Math.cos(opponentAimAngle) * power;
            const velocityY = Math.sin(opponentAimAngle) * power;

            // Calculate start position (offset from opponent center)
            const startOffset = opponent.width / 2 + PROJECTILE_RADIUS + 2;
            const startX = opponentCenterX + Math.cos(opponentAimAngle) * startOffset;
            const startY = opponentCenterY + Math.sin(opponentAimAngle) * startOffset;

            // Create the projectile
            const newProjectile = {
                x: startX, y: startY,
                vx: velocityX, vy: velocityY,
                radius: PROJECTILE_RADIUS,
                owner: 'opponent',
                damage: baseDamage,
                bouncesLeft: PROJECTILE_BOUNCES,
                alpha: 1,
                powerRatio: powerRatio,
                isEmpowered: false,
                originalRadius: PROJECTILE_RADIUS,
                didHitTarget: false,
                customBallImage: null
            };

            // Apply opponent's stored power-up if available
            if (opponentPowerUp) {
                console.log(`Opponent using power-up: ${opponentPowerUp.type}`);
                newProjectile.damage = Math.ceil(baseDamage * opponentPowerUp.multiplier);
                if (opponentPowerUp.ballImage) {
                    newProjectile.customBallImage = opponentPowerUp.ballImage;
                    newProjectile.radius *= 1.3;
                }
                // If it was the 'Consti Target' powerup (from player hitting Arme), show message
                if (opponentPowerUp.type === 'consti_target') {
                    showCCRMessage();
                }
                opponentPowerUp = null; // Consume power-up
            }

            projectiles.push(newProjectile);
            activeProjectile = newProjectile; // Track for camera

            // Wait a short moment after firing before switching turn back
            if (!gameOver) {
                setTimeout(() => {
                    if (!gameOver) switchTurn();
                }, 500); // Delay before player can act again
            }

        }, 1000 + Math.random() * 1000); // Delay before firing (1-2 seconds)
    }

    // =========================================================================
    // Game Loop, Physics & Collision Updates
    // =========================================================================

    /** Updates the camera position smoothly based on game state. */
    function updateCamera() {
        if (!player || !opponent || !canvas) return;

        let targetWorldX;       // The X coordinate in the game world the camera should focus on
        let targetViewportX;    // The desired position of the target within the canvas viewport

        // Determine the camera target
        if (activeProjectile && activeProjectile.bouncesLeft >= 0) {
            // Focus on the active projectile
            targetWorldX = activeProjectile.x;
            targetViewportX = canvas.width / 2; // Center the projectile
        } else if (isPlayerTurn) {
            // Focus on the player (slightly to the left)
            targetWorldX = player.x + player.width / 2;
            targetViewportX = canvas.width * (1 / 3); // Player on left third
        } else {
            // Focus on the opponent (slightly to the right)
            targetWorldX = opponent.x + opponent.width / 2;
            targetViewportX = canvas.width * (2 / 3); // Opponent on right third
        }

        // Calculate the desired cameraX based on target world/viewport positions
        // cameraX = viewportTargetX - worldTargetX
        let desiredCameraX = targetViewportX - targetWorldX;

        // Calculate world boundaries for clamping the camera view
        let worldMinX = player?.x ?? 0;
        let worldMaxX = opponent?.x + opponent?.width ?? canvas.width;
        const firstTowerX = boxTower1.length > 0 && boxTower1[0] ? boxTower1[0].x : worldMinX;
        const secondTowerX = boxTower2.length > 0 && boxTower2[0] ? boxTower2[0].x : worldMaxX;
        // Include towers in world bounds calculation
        worldMinX = Math.min(worldMinX, firstTowerX);
        worldMaxX = Math.max(worldMaxX, secondTowerX + BOX_WIDTH);

        const worldEdgeBuffer = 50; // Prevent camera hitting the absolute edge
        const minVisibleWorldX = worldMinX - worldEdgeBuffer;
        const maxVisibleWorldX = worldMaxX + worldEdgeBuffer;

        // Calculate min/max allowable cameraX values to keep the world bounds visible
        const maxAllowableCameraX = -(minVisibleWorldX); // Max positive cameraX (world shifted left)
        const minAllowableCameraX = canvas.width - maxVisibleWorldX; // Min negative cameraX (world shifted right)

        // Clamp the desiredCameraX within the allowable range
        // Ensure minAllowableCameraX is not greater than maxAllowableCameraX (can happen if world is smaller than canvas)
        if (minAllowableCameraX < maxAllowableCameraX) {
             desiredCameraX = Math.max(minAllowableCameraX, Math.min(maxAllowableCameraX, desiredCameraX));
        } else {
            // If world is smaller than canvas, just center the world
             const worldMidPointFallback = worldMinX + (maxVisibleWorldX - minVisibleWorldX) / 2;
             desiredCameraX = canvas.width / 2 - worldMidPointFallback;
        }

        // Smoothly move the camera towards the desired position
        cameraX += (desiredCameraX - cameraX) * CAMERA_SMOOTHING;
    }

    /** Updates position and physics for all active projectiles. */
    function updateProjectiles() {
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const p = projectiles[i];
            if (!p) continue; // Should not happen, but safety check

            // Update position based on velocity
            p.x += p.vx;
            p.y += p.vy;
            // Apply gravity
            p.vy += GRAVITY;

            // --- Projectile Removal Conditions ---
            // Check if projectile is way off-screen
            const offScreenBuffer = canvas.width; // Generous buffer
            const viewLeft = -cameraX - offScreenBuffer;
            const viewRight = -cameraX + canvas.width + offScreenBuffer;
            const viewBottom = canvas.height + offScreenBuffer * 2;
            const viewTop = -offScreenBuffer; // Allow space above canvas

            if (p.x < viewLeft || p.x > viewRight || p.y > viewBottom || p.y < viewTop ) {
                 console.log("Projectile removed: Off-screen");
                 if (activeProjectile === p) activeProjectile = null; // Stop camera tracking
                 projectiles.splice(i, 1); // Remove the projectile
                 continue; // Move to the next projectile
            }

            // Check if projectile has stopped after bouncing out
            if (p.bouncesLeft === -1 && Math.abs(p.vx) < 0.1 && Math.abs(p.vy) < 0.1) {
                console.log("Projectile removed: Stopped");
                if (activeProjectile === p) activeProjectile = null; // Stop camera tracking
                projectiles.splice(i, 1); // Remove the projectile
                continue; // Move to the next projectile
            }
        }
    }

    /** Applies gravity to boxes and makes them fall if unsupported. */
    function updateBoxPhysics() {
        const groundLevelY = canvas.height - 10;
        // The Y-coordinate where the bottom of a box should rest on the ground/offset
        const towerBaseRestY = groundLevelY - TOWER_BASE_Y_OFFSET;

        // Helper function to process physics for a single tower
        const updateTower = (tower) => {
            // Iterate backwards to handle removals safely if needed (though boxes aren't removed here)
            for (let i = tower.length - 1; i >= 0; i--) {
                const box = tower[i];
                if (!box.active) continue; // Skip inactive boxes

                let supported = false;
                const boxBottom = box.y + box.height;

                // Check if resting on the ground (or ground offset level)
                // Use a small tolerance (e.g., 1 pixel) for landing
                if (boxBottom >= towerBaseRestY - 1) {
                    box.y = towerBaseRestY - box.height; // Snap exactly to rest position
                    box.vy = 0;
                    box.isFalling = false;
                    supported = true;
                } else {
                  // Check for support from another active box directly below
                  let supportBoxY = -20; // Y-coordinate of the highest supporting box found
                  for (let j = 0; j < tower.length; j++) {
                      if (i === j) continue; // Don't check against self
                      const lowerBox = tower[j];

                      // Check if lowerBox is active, approximately aligned horizontally,
                      // and positioned below the current box
                      if (lowerBox.active &&
                          Math.abs(box.x - lowerBox.x) < 2 && // Allow slight horizontal misalign
                          box.y < lowerBox.y) {              // Ensure lowerBox is actually below

                          // --- ÎNLOCUIEȘTE LOGICA DE VERIFICARE CU ACEASTA ---
                          const targetLandingY = lowerBox.y - box.height; // Y-ul ideal unde cutia ar trebui să aterizeze

                          // Verifică dacă fundul cutiei este EXACT pe sau foarte aproape (ex. 1px toleranță)
                          // de partea de sus a cutiei de dedesubt SAU dacă va ajunge/depăși în frame-ul următor
                          const boxBottom = box.y + box.height;
                          const lowerBoxTop = lowerBox.y;
                          const tolerance = 1; // 1 pixel toleranță pentru aterizare

                          if (boxBottom >= lowerBoxTop - tolerance && boxBottom <= lowerBoxTop + tolerance + BOX_FALL_SPEED) {
                              // Verifică dacă această cutie de suport este cea mai înaltă găsită până acum
                              if(lowerBox.y > supportBoxY) {
                                  supportBoxY = lowerBox.y; // Păstrează Y-ul cutiei de suport (nu y-ul de aterizare)
                              }
                          }
                          // --- SFÂRȘITUL LOGICII ÎNLOCUITE ---
                      }
                  } // Sfârșitul buclei interioare (j)

                  // If a supporting box was found below
                  if (supportBoxY > -1) {
                       // Asigură-te că aterizează EXACT deasupra cutiei de suport
                       box.y = supportBoxY - box.height;
                       box.vy = 0;
                       box.isFalling = false;
                       supported = true;
                   }
                }

                // If not supported by ground or another box, make it fall
                if (!supported) {
                    box.isFalling = true;
                    box.y += BOX_FALL_SPEED; // Apply constant fall speed

                    // Check if it landed on the ground level during this fall step
                    if (box.y + box.height >= towerBaseRestY) {
                        box.y = towerBaseRestY - box.height; // Snap to ground rest position
                        box.vy = 0;
                        box.isFalling = false;
                    }
                }
            }
        };

        // Update physics for both towers
        updateTower(boxTower1);
        updateTower(boxTower2);
    }

    /** Updates box types based on their position (top boxes are special, others mystery). */
    function updateBoxTypes() {
        // Helper function to process type updates for a single tower
        const processTower = (tower) => {
            if (tower.length === 0) return;

            // Find the Y coordinate of the highest active box in the tower
            let highestActiveY = Infinity;
            for (const box of tower) {
                if (box.active && box.y < highestActiveY) {
                    highestActiveY = box.y;
                }
            }
            // If no active boxes left, do nothing
            if (highestActiveY === Infinity) return;

            // Iterate through all boxes in the tower
            for (let i = 0; i < tower.length; i++) {
                const box = tower[i];
                if (!box.active) continue; // Skip inactive boxes

                // Check if this box is one of the highest active boxes
                let isHighest = (Math.abs(box.y - highestActiveY) < 1); // Tolerance check

                // Check if there is another active box directly above this one
                let hasActiveBoxDirectlyAbove = false;
                for (let j = 0; j < tower.length; j++) {
                    if (i === j) continue; // Don't check against self
                    const otherBox = tower[j];
                    // Check if otherBox is active, aligned horizontally, and its bottom touches this box's top
                    if (otherBox.active &&
                        Math.abs(box.x - otherBox.x) < 5 && // Horizontal alignment check
                        Math.abs(otherBox.y + otherBox.height - box.y) < 5) { // Vertical position check
                        hasActiveBoxDirectlyAbove = true;
                        break; // Found one, no need to check further
                    }
                }

                let targetType = box.type; // Assume type doesn't change initially
                let typeChanged = false;

                // Rule 1: If a box has an active box directly above it, it must be a 'mystery' box.
                if (hasActiveBoxDirectlyAbove) {
                    if (box.type !== 'mystery') {
                        targetType = 'mystery';
                        typeChanged = true;
                        // console.log(`Box at (${box.x}, ${box.y}) forced to mystery (covered).`);
                    }
                }
                // Rule 2: If a box is the highest active box AND is currently 'mystery', change it
                //         to one of the initial special types randomly.
                else if (isHighest) {
                     if (box.type === 'mystery') {
                         targetType = initialBoxTypes[Math.floor(Math.random() * initialBoxTypes.length)];
                         typeChanged = true;
                         // console.log(`Highest box at (${box.x}, ${box.y}) changed from mystery to ${targetType}.`);
                     }
                 }


                // If the type needs to change, update the box properties
                if (typeChanged) {
                    box.type = targetType;
                    // Update the image based on the new type, fallback to mystery image if needed
                    box.img = loadedPropImages[targetType] || loadedPropImages.mystery;
                }
            }
        };

        // Process both towers
        processTower(boxTower1);
        processTower(boxTower2);
    }


    /** Checks for collisions between projectiles and game elements. */
    function checkCollisions() {
        if (!canvas) return;
        const groundY = canvas.height - 10; // Ground level Y

        // Iterate backwards through projectiles for safe removal
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const p = projectiles[i];
            if (!p) continue; // Safety check

            let projectileRemovedThisCheck = false; // Flag to skip further checks if removed

            // --- 1. Check Collision with Characters ---
            let targetCharacter = null;
            // Player's projectile hitting opponent?
            if (p.owner === 'player' && opponent && !opponent.isHit && isColliding(p, opponent)) {
                targetCharacter = opponent;
            }
            // Opponent's projectile hitting player?
            else if (p.owner === 'opponent' && player && !player.isHit && isColliding(p, player)) {
                targetCharacter = player;
            }

            if (targetCharacter) {
                let finalDamage = p.damage;
                // Apply CCR ground power-up effect if projectile was empowered
                if (p.isEmpowered) {
                    console.log(`CCR Ground Power-Up Effect Active on Hit!`);
                    showCCRMessage(); // Show message for effect
                    p.isEmpowered = false; // Consume empowerment
                }

                // Apply damage and trigger hit state
                targetCharacter.hp = Math.max(0, targetCharacter.hp - finalDamage);
                targetCharacter.isHit = true;
                targetCharacter.hitStartTime = Date.now();
                p.didHitTarget = true; // Mark projectile as having hit

                console.log(`${p.owner} hit ${targetCharacter.name} for ${finalDamage} damage.`);

                if (activeProjectile === p) activeProjectile = null; // Stop camera tracking
                projectiles.splice(i, 1); // Remove projectile after hit
                projectileRemovedThisCheck = true;
                updateUI(); // Update HP display immediately
                checkGameOver(); // Check if this hit ended the game
                continue; // Move to next projectile
            }

            // --- 2. Check Collision with Box Towers ---
            if (!projectileRemovedThisCheck) {
                let hitBox = null;
                let hitTower = null;

                // Helper to check collision with boxes in a single tower
                const findHitBox = (tower) => {
                    for (let j = tower.length - 1; j >= 0; j--) {
                        const box = tower[j];
                        // Check collision only with active boxes
                        if (box.active && isColliding(p, box)) {
                             return { box: box, tower: tower }; // Return the hit box and its tower
                        }
                    }
                    return null; // No hit in this tower
                };

                // Check both towers
                const hitResult = findHitBox(boxTower1) || findHitBox(boxTower2);

                if (hitResult) {
                    hitBox = hitResult.box;
                    hitTower = hitResult.tower; // Keep track of which tower was hit (though not used currently)
                    const originalType = hitBox.type; // Store type before deactivation

                    console.log(`Projectile hit box of type: ${originalType}`);

                    // Deactivate the hit box
                    hitBox.active = false;
                    hitBox.vy = 0; // Stop any potential velocity (though usually handled by physics)
                    hitBox.isFalling = false; // Ensure it's not marked as falling

                    // Check if hit with enough power to grant a power-up from a special box
                    if (p.powerRatio >= POWER_THRESHOLD && specialBoxTypes.includes(originalType)) {
                        console.log(`Box hit with ~${(p.powerRatio * 100).toFixed(0)}% power! Granting power-up: ${originalType} to ${p.owner}`);
                        const hittingPlayerIsPlayer = (p.owner === 'player');

                         // Assign power-up based on box type
                         switch (originalType) {
                            case 'spaga':
                                if (hittingPlayerIsPlayer) {
                                    playerPowerUp = { type: 'spaga', multiplier: SPAGA_MULTIPLIER, ballImage: loadedPropImages.spagaBall };
                                } else {
                                    opponentPowerUp = { type: 'spaga', multiplier: SPAGA_MULTIPLIER, ballImage: loadedPropImages.spagaBall };
                                }
                                break;
                            case 'dosare':
                                 if (hittingPlayerIsPlayer) {
                                     playerPowerUp = { type: 'dosare', multiplier: DOSARE_MULTIPLIER, ballImage: null };
                                 } else {
                                     opponentPowerUp = { type: 'dosare', multiplier: DOSARE_MULTIPLIER, ballImage: null };
                                 }
                                break;
                                case 'arme': // 'Arme' gives the *other* player the Consti/CCR power-up
                                const damageToApply = 5; // Definim damage-ul fix
                                if (hittingPlayerIsPlayer) {
                                    console.log("Player hit ARME box, Opponent gets Consti buff for next shot AND takes damage.");
                                    opponentPowerUp = { type: 'consti_target', multiplier: POWERUP_DAMAGE_MULTIPLIER, ballImage: null };
   
                                    // --- ADAUGĂ ACESTE LINII ---
                                    if (opponent) { // Verifică dacă oponentul există
                                        opponent.hp = Math.max(0, opponent.hp - damageToApply); // Aplică damage-ul
                                        opponent.isHit = true; // Activează animația de lovitură
                                        opponent.hitStartTime = Date.now();
                                        console.log(`Opponent took ${damageToApply} damage from Arme box hit.`);
                                        showCCRMessage(); // <--- ADAUGĂ ACEASTĂ LINIE PENTRU A AFIȘA MESAJUL
                                        updateUI(); // Actualizează HP-ul pe ecran
                                        checkGameOver(); // Verifică dacă jocul s-a terminat
                                    }
                                    // --- SFÂRȘIT LINII ADĂUGATE ---
   
                                } else {
                                    console.log("Opponent hit ARME box, Player gets Consti buff for next shot AND takes damage.");
                                    playerPowerUp = { type: 'consti_target', multiplier: POWERUP_DAMAGE_MULTIPLIER, ballImage: null };
   
                                    // --- ADAUGĂ ACESTE LINII ---
                                     if (player) { // Verifică dacă jucătorul există
                                        player.hp = Math.max(0, player.hp - damageToApply); // Aplică damage-ul
                                        player.isHit = true; // Activează animația de lovitură
                                        player.hitStartTime = Date.now();
                                        console.log(`Player took ${damageToApply} damage from Arme box hit.`);
                                        showCCRMessage(); // <--- ADAUGĂ ACEASTĂ LINIE PENTRU A AFIȘA MESAJUL
                                        updateUI(); // Actualizează HP-ul pe ecran
                                        checkGameOver(); // Verifică dacă jocul s-a terminat
                                    }
                                    // --- SFÂRȘIT LINII ADĂUGATE ---
                                }
                                break;
                        }
                    } else if (specialBoxTypes.includes(originalType)) {
                         // Hit a special box, but not hard enough for power-up
                         console.log("Special box hit, but not with enough power for power-up.");
                    }

                    // Remove the projectile after hitting a box
                    if (activeProjectile === p) activeProjectile = null;
                    projectiles.splice(i, 1);
                    projectileRemovedThisCheck = true;
                    // updateBoxTypes(); // Update immediately after a box is removed (might reveal a new top box) - Let main loop handle it?
                    continue; // Move to next projectile
                }
            }

             // --- 3. Check Collision with Ground Power-Up ---
            if (!projectileRemovedThisCheck && powerUp && powerUp.active && loadedPropImages.constiPowerUp) {
                 if (isColliding(p, powerUp)) {
                     console.log("Projectile hit CCR ground power-up!");
                     powerUp.active = false; // Deactivate the ground power-up
                     p.isEmpowered = true; // Empower the projectile itself
                     // Change projectile appearance to show empowerment
                     p.customBallImage = loadedPropImages.constiPowerUp;
                     p.radius *= 1.5; // Make it visually larger
                     // Note: Projectile continues flying after hitting ground power-up
                 }
             }

            // --- 4. Check Collision with Ground ---
            if (!projectileRemovedThisCheck && p.y + p.radius >= groundY) {
                 p.y = groundY - p.radius; // Position projectile right on the ground

                 if (p.bouncesLeft > 0) {
                     // Bounce
                     p.bouncesLeft--;
                     p.vy = -p.vy * 0.6; // Reverse and dampen vertical velocity
                     p.vx *= 0.8; // Reduce horizontal velocity (friction)

                     // If bounce results in very low velocity, stop bouncing early
                     if (Math.abs(p.vy) < 1 && Math.abs(p.vx) < 0.5) {
                          p.bouncesLeft = -1; // Mark as finished bouncing
                          p.vy = 0;
                          p.vx = 0;
                     }
                     console.log(`Projectile bounced. Bounces left: ${p.bouncesLeft}`);

                 } else {
                     // Out of bounces, skid to a halt
                     p.bouncesLeft = -1; // Mark as finished bouncing
                     p.vy = 0; // Stop vertical movement
                     p.vx *= 0.5; // Apply strong friction
                     if (Math.abs(p.vx) < 0.1) p.vx = 0; // Stop completely if slow enough
                 }

                 // If the projectile has finished its movement (stopped or bounced out), stop camera tracking
                 if (p.bouncesLeft === -1 && activeProjectile === p) {
                     activeProjectile = null;
                 }
            }
        } // End projectile loop
    }


    /**
     * Checks collision between a circular projectile and a rectangular object.
     * @param {object} circle - Projectile object { x, y, radius, originalRadius }
     * @param {object} rect - Target object { x, y, width, height }
     * @returns {boolean} True if colliding, false otherwise.
     */
    function isColliding(circle, rect) {
        if (!rect || !circle) return false;

        // Use dimensions from rect object, fallback to powerup defaults if needed (for ground powerup)
        const rectX = rect.x;
        const rectY = rect.y;
        const rectWidth = rect.width || POWERUP_WIDTH;
        const rectHeight = rect.height || POWERUP_HEIGHT;

        // Find the closest point on the rectangle to the center of the circle
        const closestX = Math.max(rectX, Math.min(circle.x, rectX + rectWidth));
        const closestY = Math.max(rectY, Math.min(circle.y, rectY + rectHeight));

        // Calculate the distance between the circle's center and this closest point
        const distanceX = circle.x - closestX;
        const distanceY = circle.y - closestY;

        // Calculate squared distance (more efficient than square root)
        const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

        // Use the original radius for collision, even if visually scaled by power-up
        const collisionRadius = circle.originalRadius || circle.radius;

        // Collision occurs if the distance squared is less than the radius squared
        return distanceSquared < (collisionRadius * collisionRadius);
    }

    /** Checks if either player's HP has reached zero and ends the game. */
    function checkGameOver() {
        if (gameOver) return; // Don't check if already over

        let winner = null;
        if (player && player.hp <= 0) {
            winner = opponent ? `${opponent.name} Wins!` : "Opponent Wins!";
        } else if (opponent && opponent.hp <= 0) {
            winner = player ? `${player.name} Wins!` : "Player Wins!";
        }

        if (winner) {
            endGame(winner); // Trigger game over sequence
        }
    }

    /** Handles the game over sequence. */
    function endGame(message) {
        if (gameOver) return; // Prevent multiple calls
        console.log(`Game Over: ${message}`);
        gameOver = true;
        isCharging = false; // Ensure charging stops
        activeProjectile = null; // Stop camera tracking

        // Stop game audio and remove controls
        stopCharacterAudio();
        removeMuteButton();

        // Hide in-game UI elements
        if (powerMeterContainer) powerMeterContainer.style.display = 'none';

        // Display the game over message and restart button
        if (winnerMessage) winnerMessage.textContent = message;
        if (gameOverMessage) gameOverMessage.style.display = 'block';
        if (turnIndicator) turnIndicator.textContent = "Game Over";

        // Remove canvas event listeners to prevent further input
        if(canvas) {
             canvas.removeEventListener('mousedown', handleMouseDown);
             canvas.removeEventListener('mouseup', handleMouseUp);
             canvas.removeEventListener('mousemove', handleMouseMove);
             canvas.removeEventListener('mouseleave', handleMouseLeave);
        }
    }

    // =========================================================================
    // Power-Up Logic (Original Ground Spawn - CCR/Consti)
    // =========================================================================

    /** Spawns the CCR/Consti power-up item on the ground between players. */
    function spawnPowerUp() {
        // Only spawn if image loaded and no active powerup exists
        if (!powerUpImage || (powerUp && powerUp.active)) return;
        if (!player || !opponent) return; // Need players for positioning

        console.log("Spawning CCR GROUND Power-Up!");

        // Calculate spawn position centered between players, halfway up canvas
        const playerCenterX = player.x + player.width / 2;
        const opponentCenterX = opponent.x + opponent.width / 2;
        const spawnX = (playerCenterX + opponentCenterX) / 2 - POWERUP_WIDTH / 2;
        // Place it roughly in the vertical center of the playable area
        const spawnY = canvas.height / 2 - POWERUP_HEIGHT / 2; // Adjust as needed

        console.log(`Ground Power-up spawn position: X=${spawnX.toFixed(1)}, Y=${spawnY.toFixed(1)}`);

        // Create the power-up object
        powerUp = {
            x: spawnX,
            y: spawnY,
            width: POWERUP_WIDTH,
            height: POWERUP_HEIGHT,
            active: true // Mark as active
        };
    }

    /** Shows the CCR/Consti power-up activation message temporarily. */
    function showCCRMessage() {
        if (ccrMessageDisplay) {
            console.log("Displaying CCR Power-Up message.");
            ccrMessageDisplay.style.display = 'block';
            // Hide the message after a duration
            setTimeout(() => {
                if (ccrMessageDisplay) ccrMessageDisplay.style.display = 'none';
                console.log("Hiding CCR Power-Up message.");
            }, CCR_MESSAGE_DURATION);
        } else {
            console.warn("CCR message display element not found, cannot show message.");
        }
    }

    // =========================================================================
    // Drawing Functions
    // =========================================================================

    /** Draws the ground line. */
    function drawGround() {
        ctx.fillStyle = '#5d5745'; // Dark earth color
        // Draw a wide rectangle to cover scrolled areas
        const groundWidth = canvas.width * 5; // Make it very wide
        const groundStartX = -canvas.width * 2; // Start drawing far left
        ctx.fillRect(groundStartX, canvas.height - 10, groundWidth, 20); // Height of 10px, Y pos at bottom
    }

    /** Draws a character with HP bar and hit effect. */
    function drawCharacter(char) {
        if (!char) return; // Don't draw if character object doesn't exist

        const bounceDistance = 5;    // How far character moves back when hit
        const bounceDuration = 300; // ms for the bounce animation
        const currentTime = Date.now();

        let drawX = char.x;
        let drawY = char.y;

        // Apply hit bounce effect
        if (char.isHit && currentTime - char.hitStartTime < bounceDuration) {
            const elapsedTime = currentTime - char.hitStartTime;
            const progress = elapsedTime / bounceDuration; // 0 to 1
            // Use sine wave for smooth bounce in/out
            const bounceOffset = bounceDistance * Math.sin(progress * Math.PI);
            // Player bounces left, opponent bounces right
            drawX += (char === player) ? -bounceOffset : bounceOffset;
        }

        // Reset hit state after full effect duration
        if (char.isHit && currentTime - char.hitStartTime >= HIT_EFFECT_DURATION) {
            char.isHit = false;
        }

        const drawWidth = char.width;
        const drawHeight = char.height;
        const shouldFlip = (char === opponent); // Flip opponent sprite horizontally

        ctx.save(); // Save context state before potential flip/draw

        // Flip context horizontally for the opponent
        if (shouldFlip) {
            ctx.translate(drawX + drawWidth / 2, 0); // Move origin to center of char
            ctx.scale(-1, 1); // Flip horizontally
            ctx.translate(-(drawX + drawWidth / 2), 0); // Move origin back
        }

        // Draw character image or fallback rectangle
        if (char.img) {
            ctx.drawImage(char.img, drawX, drawY, drawWidth, drawHeight);
        } else {
            // Fallback drawing if image failed to load
            ctx.fillStyle = (char === player) ? 'rgba(0, 0, 255, 0.7)' : 'rgba(255, 0, 0, 0.7)';
            ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.strokeRect(drawX, drawY, drawWidth, drawHeight);
        }

        ctx.restore(); // Restore context state (removes flip)

        // --- Draw HP Bar ---
        const hpBarWidth = drawWidth * 0.8; // Bar width relative to character width
        const hpBarHeight = 8;
        // Center the HP bar above the character
        const hpBarX = char.x + (drawWidth - hpBarWidth) / 2;
        const hpBarY = char.y - hpBarHeight - 7; // Position above character sprite

        // Ensure HP is a valid number
        const currentHp = typeof char.hp === 'number' ? Math.max(0, char.hp) : 0;
        const maxHp = 100;
        // Calculate the width of the green/yellow/red part of the bar
        const currentHpWidth = Math.max(0, (currentHp / maxHp) * hpBarWidth);

        // Draw background of HP bar (dark grey)
        ctx.fillStyle = '#555';
        ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

        // Draw the current HP level with color based on HP percentage
        ctx.fillStyle = currentHp < maxHp * 0.3 ? '#dc3545' // Red (low HP)
                      : currentHp < maxHp * 0.6 ? '#ffc107' // Yellow (medium HP)
                      : '#28a745'; // Green (high HP)
        if (currentHpWidth > 0) { // Only draw if HP > 0
            ctx.fillRect(hpBarX, hpBarY, currentHpWidth, hpBarHeight);
        }

        // Draw border around HP bar
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
    }

    /** Draws all active boxes in a given tower array. */
    function drawBoxTowers(tower) {
        tower.forEach(box => {
            if (box.active) { // Only draw active boxes
                if (box.img) {
                    // Draw box image if available
                    ctx.drawImage(box.img, box.x, box.y, box.width, box.height);
                } else {
                    // Fallback drawing if image missing
                    ctx.fillStyle = 'saddlebrown';
                    ctx.fillRect(box.x, box.y, box.width, box.height);
                    ctx.strokeStyle = 'black';
                    ctx.strokeRect(box.x, box.y, box.width, box.height);
                }
            }
        });
    }

    /** Draws all active projectiles. */
    function drawProjectiles() {
        projectiles.forEach(p => {
            ctx.save(); // Save context state (e.g., for alpha)
            ctx.globalAlpha = p.alpha; // Apply alpha (currently always 1)

            const drawRadius = p.radius; // Use current radius (might be scaled by powerup)
            const drawX = p.x - drawRadius; // Top-left corner for drawImage
            const drawY = p.y - drawRadius;

            if (p.customBallImage) {
                // Draw custom image if set by power-up
                ctx.drawImage(p.customBallImage, drawX, drawY, drawRadius * 2, drawRadius * 2);
            } else {
                // Draw default colored circle
                ctx.fillStyle = p.owner === 'player' ? '#4ecdc4' : '#ff6b6b'; // Player vs Opponent color
                ctx.beginPath();
                // Draw using the original radius for consistency if needed, but visual radius `p.radius` looks better
                ctx.arc(p.x, p.y, p.originalRadius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore(); // Restore context state
        });
    }

    /** Draws the aiming indicator for the player. */
    function drawAimIndicator() {
        // Only draw if it's player's turn, game active, player exists, and not currently charging
        if (!isPlayerTurn || gameOver || !player || isCharging) return;

        const arrowLength = 45;     // Length of the arrow line
        const arrowHeadSize = 10;   // Size of the arrowhead lines
        // Start drawing arrow slightly outside the character sprite
        const distanceFromCharCenter = player.width / 2 + 5;
        const arrowColor = 'rgba(255, 255, 255, 0.8)'; // Semi-transparent white
        const arrowLineWidth = 2;

        // Calculate center of the player
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;

        // Calculate start point of the arrow line (base)
        const arrowBaseX = playerCenterX + Math.cos(aimAngle) * distanceFromCharCenter;
        const arrowBaseY = playerCenterY + Math.sin(aimAngle) * distanceFromCharCenter;

        // Calculate end point of the arrow line (tip)
        const arrowTipX = arrowBaseX + Math.cos(aimAngle) * arrowLength;
        const arrowTipY = arrowBaseY + Math.sin(aimAngle) * arrowLength;

        ctx.save(); // Save context state

        // Draw the main arrow line
        ctx.beginPath();
        ctx.moveTo(arrowBaseX, arrowBaseY);
        ctx.lineTo(arrowTipX, arrowTipY);
        ctx.strokeStyle = arrowColor;
        ctx.lineWidth = arrowLineWidth;
        ctx.stroke();

        // Draw the arrowhead
        ctx.translate(arrowTipX, arrowTipY); // Move origin to arrow tip
        ctx.rotate(aimAngle); // Rotate context to align with arrow direction
        ctx.beginPath();
        ctx.moveTo(0, 0); // Start at the tip
        ctx.lineTo(-arrowHeadSize, -arrowHeadSize / 2); // Line for one side of head
        ctx.moveTo(0, 0); // Back to tip
        ctx.lineTo(-arrowHeadSize, arrowHeadSize / 2); // Line for other side of head
        ctx.strokeStyle = arrowColor;
        ctx.lineWidth = arrowLineWidth;
        ctx.stroke();

        ctx.restore(); // Restore context state
    }


      // =========================================================================
      // Main Game Loop
      // =========================================================================
      function gameLoop(timestamp) {
          if (gameOver) return; // Stop the loop if game has ended

          // --- Logic Updates ---
          updateCamera();       // Update camera position first
          updateProjectiles();  // Move projectiles and check off-screen
          updateBoxPhysics();   // Apply gravity to boxes, check support
          updateBoxTypes();     // Enforce mystery/special box rules based on position
          checkCollisions();    // Check projectile collisions with characters, boxes, ground
          if (isCharging && isPlayerTurn) {
              updatePowerMeter(); // Update power meter UI if charging
          }

          // --- Drawing ---
          // Clear the entire canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.save(); // Save default context state

          // --- Draw Background (Scaled Fill + Pan) ---
          if (backgroundImage) {
              const canvasWidth = canvas.width;
              const canvasHeight = canvas.height;
              const bgW = backgroundImage.naturalWidth;
              const bgH = backgroundImage.naturalHeight;

              // Calculate scale factor to ensure background covers canvas (like 'background-size: cover')
              const scale = Math.max(canvasWidth / bgW, canvasHeight / bgH);
              const scaledW = bgW * scale; // Scaled width of the background image
              const scaledH = bgH * scale; // Scaled height of the background image

              // Calculate World Bounds (min/max X coordinates of game elements) dynamically
              const buffer = 50; // Extra space around world edges for panning buffer
              let worldMinX = (player?.x ?? 0);
              let worldMaxX = (opponent?.x + opponent?.width ?? canvasWidth);
              const firstTowerX = boxTower1.length > 0 && boxTower1[0] ? boxTower1[0].x : worldMinX;
              const secondTowerX = boxTower2.length > 0 && boxTower2[0] ? boxTower2[0].x : worldMaxX;
              // Include towers and buffer in world bounds
              worldMinX = Math.min(worldMinX, firstTowerX) - buffer;
              worldMaxX = Math.max(worldMaxX, secondTowerX + BOX_WIDTH) + buffer;
              const worldWidth = worldMaxX - worldMinX;

              // Determine how far the camera *can* scroll within the world
              const cameraScrollRange = Math.max(0, worldWidth - canvasWidth);

              // Calculate the camera's current position within its scroll range
              // cameraX = position of world 0 relative to canvas 0
              // -cameraX = position of canvas 0 relative to world 0 (camera's left edge in world coords)
              const cameraLeftEdgeInWorld = -cameraX;
              // Calculate how far the camera's left edge has moved from the minimum world X
              const cameraOffset = Math.max(0, Math.min(cameraScrollRange, cameraLeftEdgeInWorld - worldMinX));
              // Calculate camera's scroll progress (0 to 1) across its range
              const cameraProgress = (cameraScrollRange > 0) ? (cameraOffset / cameraScrollRange) : 0.5; // Default to center if no scroll range

              // Calculate how much the SCALED background image can be panned horizontally within the canvas view
              const bgPannableWidth = Math.max(0, scaledW - canvasWidth);

              // Calculate the background's horizontal draw position based on camera progress
              // When cameraProgress is 0 (far left), bgDrawX is 0
              // When cameraProgress is 1 (far right), bgDrawX is -bgPannableWidth
              const bgDrawX = -(cameraProgress * bgPannableWidth);

              // Calculate the background's vertical draw position to center it vertically
              const bgDrawY = (canvasHeight - scaledH) / 2;

              // Draw the background image without camera translation (relative to canvas 0,0)
              ctx.drawImage(backgroundImage, bgDrawX, bgDrawY, scaledW, scaledH);

          } else {
               // Fallback: Fill canvas with a solid color if background image failed
               ctx.fillStyle = '#1c2a3e'; // Dark blue fallback
               ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          // --- End Draw Background ---


          // --- Draw World Elements (with camera translation applied) ---
          ctx.translate(cameraX, 0); // Apply camera offset for all world elements

          drawGround();
          if (player) drawCharacter(player);
          if (opponent) drawCharacter(opponent);
          drawBoxTowers(boxTower1); // Draw first tower
          drawBoxTowers(boxTower2); // Draw second tower
          // Draw ground power-up if active
          if (powerUp && powerUp.active && powerUpImage) {
              ctx.drawImage(powerUpImage, powerUp.x, powerUp.y, powerUp.width, powerUp.height);
          }
          drawProjectiles();
          drawAimIndicator(); // Draw player's aim arrow

          ctx.restore(); // Restore context (removes camera translation)


          // Request the next frame for smooth animation
          requestAnimationFrame(gameLoop);
      }

    // =========================================================================
    // UI Update & Turn Switching
    // =========================================================================

    /** Updates the HP displays and turn indicator text/style. */
    function updateUI() {
        // Update Player HP Display
        if (playerHpDisplay) {
            const playerHp = player ? Math.max(0, player.hp) : 0;
            playerHpDisplay.textContent = player ? String(playerHp) : '---';
            // Change color based on HP level
            if (player) {
                playerHpDisplay.style.color = playerHp < 30 ? '#dc3545' // Red
                                        : playerHp < 60 ? '#ffc107' // Yellow
                                        : 'white'; // Green/Default
            } else {
                playerHpDisplay.style.color = 'white'; // Default color if no player
            }
        }
        // Update Opponent HP Display
        if (opponentHpDisplay) {
             const opponentHp = opponent ? Math.max(0, opponent.hp) : 0;
             opponentHpDisplay.textContent = opponent ? String(opponentHp) : '---';
             // Change color based on HP level
             if (opponent) {
                 opponentHpDisplay.style.color = opponentHp < 30 ? '#dc3545'
                                             : opponentHp < 60 ? '#ffc107'
                                             : 'white';
             } else {
                  opponentHpDisplay.style.color = 'white';
             }
        }
        // Update Turn Indicator
        if (turnIndicator) {
            if (gameOver) {
                turnIndicator.textContent = "Game Over";
                turnIndicator.style.backgroundColor = 'grey';
            } else {
                turnIndicator.textContent = isPlayerTurn ? "Your Turn" : "Opponent's Turn";
                // Change background color based on whose turn it is
                turnIndicator.style.backgroundColor = isPlayerTurn
                    ? 'rgba(78, 205, 196, 0.8)' // Teal for player
                    : 'rgba(255, 107, 107, 0.8)'; // Red for opponent
            }
        }
    }

    /** Switches the turn between player and opponent. */
    function switchTurn() {
        if (gameOver) return; // Don't switch turns if game is over

        isPlayerTurn = !isPlayerTurn; // Toggle turn flag
        activeProjectile = null; // Clear active projectile focus
        console.log(`Switching turn to: ${isPlayerTurn ? 'Player' : 'Opponent'}`);
        updateUI(); // Update turn indicator display

        // If it's now the opponent's turn, trigger their AI after a short delay
        if (!isPlayerTurn) {
            setTimeout(opponentTurn, 500); // Delay before opponent acts
        }
    }

    // =========================================================================
    // Initial Setup Function (Called after assets attempt loading)
    // =========================================================================
    function initializeGame() {
        // Verify all essential DOM elements are present before proceeding
        const elementsExist = canvas && startButton && powerMeterContainer &&
                              characterOptionsContainer && startMenu && gameArea &&
                              playerHpDisplay && opponentHpDisplay && turnIndicator &&
                              gameOverMessage && restartButton && ccrMessageDisplay &&
                              popupAd && closeAdBtn; // Check all required elements

        if (elementsExist) {
             console.log("Essential UI elements verified. Initializing game setup.");
             resetGame(); // Set initial game state (clears variables, populates selection)
             if (startMenu) startMenu.style.display = 'flex'; // Show start menu
             if (gameArea) gameArea.style.display = 'none'; // Hide game area
             if (gameOverMessage) gameOverMessage.style.display = 'none'; // Hide game over screen
        } else {
             console.error("FATAL: Cannot initialize game - one or more essential UI elements missing!");
             alert("Error initializing game UI. Critical HTML elements might be missing. Please check the console (F12) for details.");
             // Stop further execution if UI is broken
        }
    }

    // Note: Game initialization is triggered inside the .finally() block
    // after the Promise.all(loadingPromises) completes.

}); // End of DOMContentLoaded Listener
