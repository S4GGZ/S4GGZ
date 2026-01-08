/* -------------------------------------------------------------------------- */
/* AUDIO LOGIC                                                                */
/* -------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
    const onlyFansAudio = new Audio('./assets/audio/onlyfans.mp3');
    const onlyFansButton = document.querySelector(".socials a img[alt='OnlyFans']");

    if (onlyFansButton) {
        onlyFansButton.parentElement.addEventListener('click', function (event) {
            event.preventDefault(); 
            onlyFansAudio.play();
        });
    }
});

/* -------------------------------------------------------------------------- */
/* STARFIELD & PLANET LOGIC                                                   */
/* -------------------------------------------------------------------------- */
const canvas = document.getElementById('starfield');

// --- 1. ÎNCĂRCĂM IMAGINEA PENTRU PLANETĂ ---
const marsImg = new Image();
// Asigură-te că imaginea există aici:
marsImg.src = './assets/images/mars.png'; 

if (canvas) {
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // --- LOGICA PLANETEI ---
    const STATE_KEY = 's4ggz_planet_state';
    let planetState = parseInt(localStorage.getItem(STATE_KEY) || '0');

    if (planetState === 0) {
        if (Math.random() < 0.04) {
            planetState = 1;
        }
    } else if (planetState === 1) {
        planetState = 2; 
    } else if (planetState === 2) {
        planetState = 0; 
    }
    localStorage.setItem(STATE_KEY, planetState.toString());

    // --- SISTEMUL DE STELE ---
    const stars = [];
    const numStars = 150;

   class Star {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2; 
            
            // Viteza pulsării
            this.pulseSpeed = Math.random() * 0.05 + 0.02; 
            this.pulseOffset = Math.random() * Math.PI * 2;
        }

        draw() {
            // Pulsare lentă și profundă (aproape stins -> maxim)
            const sineWave = (Math.sin(Date.now() * 0.015 * this.pulseSpeed + this.pulseOffset) + 1) / 2;
            const alpha = 0.05 + (sineWave * 0.95);

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

            if (alpha > 0.5) {
                ctx.shadowBlur = alpha * 20; 
                ctx.shadowColor = 'white';
            } else {
                ctx.shadowBlur = 0;
            }

            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    for (let i = 0; i < numStars; i++) {
        stars.push(new Star());
    }

    // --- DESENARE PLANETĂ (CU TEXTURĂ PNG) ---
    function drawPlanet() {
        if (planetState === 0) return;

        const radius = 60; 
        let x, y;
        const margin = 120; 

        if (planetState === 1) {
            x = canvas.width - margin; 
            y = canvas.height - margin; 
        } else {
            x = margin; 
            y = canvas.height - margin; 
        }

        // 1. Desenăm GLOW-ul (Aura roșie din spate)
        // Îl desenăm înainte de clipping, ca să iasă în afara cercului
        ctx.save();
        ctx.shadowColor = '#d14e32'; 
        ctx.shadowBlur = 35; // Aura puternică
        ctx.beginPath();
        ctx.arc(x, y, radius - 2, 0, Math.PI * 2); // Puțin mai mic ca să nu se vadă marginea solidă
        ctx.fillStyle = '#d14e32';
        ctx.fill();
        ctx.restore();

        // 2. Pregătim zona pentru IMAGINE (Clipping Mask)
        ctx.save(); // Salvăm contextul
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.clip(); // Tăiem tot ce iese din acest cerc

        // 3. Desenăm IMAGINEA (mars.png)
        if (marsImg.complete) {
            // Desenăm imaginea centrată pe coordonatele x, y
            ctx.drawImage(marsImg, x - radius, y - radius, radius * 2, radius * 2);
        } else {
            // Fallback dacă imaginea nu s-a încărcat încă: culoare solidă
            ctx.fillStyle = '#d14e32';
            ctx.fill();
        }

        // 4. Adăugăm UMBRA peste imagine (Gradient semi-transparent)
        // Asta face ca textura să se vadă, dar să aibă efect 3D (lumină vs întuneric)
        const gradient = ctx.createRadialGradient(x - 20, y - 20, 10, x, y, radius);
        
        // Lumină (Transparent) -> Umbră (Negru/Maro semi-transparent)
        gradient.addColorStop(0, 'rgba(255, 170, 133, 0)');     // Lumină pură (se vede textura 100%)
        gradient.addColorStop(0.5, 'rgba(209, 78, 50, 0.2)');   // Zona medie
        gradient.addColorStop(0.8, 'rgba(60, 15, 5, 0.6)');    // Umbră parțială
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');         // Umbră totală la margini

        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.restore(); // Anulăm clipping-ul pentru restul animației (stele)
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stars.forEach(star => star.draw());
        drawPlanet();
        requestAnimationFrame(animate);
    }

    animate();
}