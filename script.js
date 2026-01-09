/* ============================================
   INITIALIZATION & CONFIGURATION
   ============================================ */
const CONFIG = {
    music: {
        volume: 0.6,
        fadeInDuration: 2000,
        autoplayMuted: true
    },
    animations: {
        letterDelay: 0.05,
        staggerDelay: 0.1
    },
    confetti: {
        particleCount: 200,
        colors: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ffd3a5', '#fd9853', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff']
    }
};

/* ============================================
   AUDIO SYSTEM - AUTO-PLAY WITH UNMUTE
   ============================================ */
const birthdayMusic = document.getElementById('birthdayMusic');
let hasUserInteracted = false;

function initAudio() {
    if (!birthdayMusic) return;
    
    birthdayMusic.loop = true;
    birthdayMusic.volume = 0;
    birthdayMusic.muted = true;
    
    birthdayMusic.play().catch(() => {
        console.log('Autoplay prevented, will start on interaction');
    });
    
    setTimeout(() => {
        fadeInAudio();
    }, 1500);
    
    const unmuteOnInteraction = () => {
        if (hasUserInteracted) return;
        hasUserInteracted = true;
        birthdayMusic.muted = false;
        birthdayMusic.play().catch(() => {
            console.log('Play blocked, will retry on next interaction');
        });
        fadeInAudio();
        if (!audioCtx) {
            initAudioViz();
        } else if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        document.removeEventListener('click', unmuteOnInteraction);
        document.removeEventListener('touchstart', unmuteOnInteraction);
        document.removeEventListener('keydown', unmuteOnInteraction);
    };
    
    document.addEventListener('click', unmuteOnInteraction, { once: true });
    document.addEventListener('touchstart', unmuteOnInteraction, { once: true });
    document.addEventListener('keydown', unmuteOnInteraction, { once: true });
    
    birthdayMusic.addEventListener('ended', () => {
        birthdayMusic.currentTime = 0;
        birthdayMusic.play();
    });
    
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && birthdayMusic.paused) {
            birthdayMusic.play();
        }
    });
}

function fadeInAudio() {
    if (!birthdayMusic || birthdayMusic.muted) return;
    
    const targetVolume = CONFIG.music.volume;
    const duration = CONFIG.music.fadeInDuration;
    const steps = 30;
    const stepDuration = duration / steps;
    const volumeStep = targetVolume / steps;
    let currentStep = 0;
    
    const fadeInterval = setInterval(() => {
        currentStep++;
        birthdayMusic.volume = Math.min(volumeStep * currentStep, targetVolume);
        
        if (currentStep >= steps) {
            clearInterval(fadeInterval);
            birthdayMusic.volume = targetVolume;
        }
    }, stepDuration);
}

/* ============================================
   AUDIO VISUALIZER
   ============================================ */
let audioCtx;
let analyser;
let dataArray;
let audioVizCtx;

function initAudioViz() {
    const viz = document.getElementById('audioViz');
    if (!viz || !birthdayMusic) return;
    audioVizCtx = viz.getContext('2d');
    viz.width = window.innerWidth;
    viz.height = 120;
    
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(birthdayMusic);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    
    function draw() {
        requestAnimationFrame(draw);
        if (!audioVizCtx || !analyser) return;
        analyser.getByteFrequencyData(dataArray);
        audioVizCtx.clearRect(0, 0, viz.width, viz.height);
        const barWidth = (viz.width / dataArray.length) * 1.5;
        let x = 0;
        for (let i = 0; i < dataArray.length; i++) {
            const barHeight = dataArray[i];
            const grad = audioVizCtx.createLinearGradient(0, viz.height - barHeight, 0, viz.height);
            grad.addColorStop(0, '#ff6b9d');
            grad.addColorStop(0.5, '#feca57');
            grad.addColorStop(1, '#4facfe');
            audioVizCtx.fillStyle = grad;
            audioVizCtx.fillRect(x, viz.height - barHeight, barWidth, barHeight);
            x += barWidth + 2;
        }
    }
    draw();
}

/* ============================================
   PAGE LOADER & ENTRY ANIMATION
   ============================================ */
function initPageLoader() {
    const loader = document.getElementById('pageLoader');
    const appContainer = document.getElementById('appContainer');
    const step1 = document.getElementById('loaderStep1');
    const step2 = document.getElementById('loaderStep2');
    const step3 = document.getElementById('loaderStep3');
    
    if (!loader || !appContainer) return;
    
    // Step messaging
    setTimeout(() => step1 && (step1.style.opacity = '1'), 200);
    setTimeout(() => step2 && (step2.style.opacity = '1'), 900);
    setTimeout(() => step3 && (step3.style.opacity = '1'), 1600);
    
    // Simulate loading progress + orchestrated entry
    setTimeout(() => {
        loader.classList.add('hidden');
        appContainer.classList.add('loaded');
        
        setTimeout(() => {
            createConfettiBurst();
            animateTitleLetters();
            animateNameLetters();
            tiltHeroInit();
        }, 300);
    }, 2600);
}

/* ============================================
   LETTER-BY-LETTER TEXT ANIMATIONS
   ============================================ */
function animateTitleLetters() {
    const title = document.getElementById('titleText');
    if (!title) return;
    
    const letters = title.querySelectorAll('.letter');
    letters.forEach((letter, index) => {
        letter.style.animationDelay = `${index * CONFIG.animations.letterDelay}s`;
    });
}

function animateNameLetters() {
    const name = document.getElementById('nameText');
    if (!name) return;
    
    const letters = name.querySelectorAll('.letter');
    letters.forEach((letter, index) => {
        letter.style.animationDelay = `${index * CONFIG.animations.letterDelay + 0.8}s`;
    });
}

/* ============================================
   CONFETTI SYSTEM
   ============================================ */
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
let confettiParticles = [];
let isPartyActive = false;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class ConfettiParticle {
    constructor(x, y) {
        this.x = x || Math.random() * canvas.width;
        this.y = y || Math.random() * canvas.height - canvas.height;
        this.size = Math.random() * 10 + 5;
        this.speedY = Math.random() * 5 + 3;
        this.speedX = (Math.random() - 0.5) * 2;
        this.color = CONFIG.confetti.colors[Math.floor(Math.random() * CONFIG.confetti.colors.length)];
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 10;
        this.shape = Math.random() > 0.5 ? 'circle' : 'rect';
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
        
        if (this.y > canvas.height) {
            this.y = -this.size;
            this.x = Math.random() * canvas.width;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        
        if (this.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        }
        
        ctx.restore();
    }
}

function createConfetti(count = CONFIG.confetti.particleCount) {
    confettiParticles = [];
    for (let i = 0; i < count; i++) {
        confettiParticles.push(new ConfettiParticle());
    }
}

function createConfettiBurst() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    for (let i = 0; i < 100; i++) {
        const angle = (Math.PI * 2 * i) / 100;
        const velocity = Math.random() * 10 + 5;
        const particle = new ConfettiParticle(centerX, centerY);
        particle.speedX = Math.cos(angle) * velocity;
        particle.speedY = Math.sin(angle) * velocity;
        confettiParticles.push(particle);
    }
}

function animateConfetti() {
    if (!isPartyActive && confettiParticles.length === 0) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    confettiParticles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    requestAnimationFrame(animateConfetti);
}

/* ============================================
   PARTICLE SYSTEM
   ============================================ */
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
        particle.style.width = particle.style.height = (Math.random() * 3 + 2) + 'px';
        particle.style.background = `rgba(255, ${Math.random() * 100 + 150}, ${Math.random() * 100 + 150}, ${Math.random() * 0.5 + 0.5})`;
        particlesContainer.appendChild(particle);
    }
}

/* ============================================
   BALLOON PHYSICS (LIGHT)
   ============================================ */
function initBalloonPhysics() {
    const balloons = Array.from(document.querySelectorAll('.balloon')).map(el => ({
        el,
        y: window.innerHeight + Math.random() * 200,
        x: Math.random() * window.innerWidth,
        vy: -(1 + Math.random() * 1.5),
        vx: (Math.random() - 0.5) * 0.4,
        rot: Math.random() * 360,
        vr: (Math.random() - 0.5) * 0.6
    }));
    
    function step() {
        balloons.forEach(b => {
            b.x += b.vx + Math.sin(Date.now() * 0.001 + b.x) * 0.2;
            b.y += b.vy;
            b.rot += b.vr;
            if (b.y < -200) {
                b.y = window.innerHeight + 150;
                b.x = Math.random() * window.innerWidth;
            }
            b.el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.rot}deg)`;
        });
        requestAnimationFrame(step);
    }
    step();
}

/* ============================================
   RAINING IMAGES
   ============================================ */
const heroImages = [
    'kalaua.png',
    'kalu-2.png',
    'image.png',
    'image-2.png',
    'image-3.png',
    'image-8.png',
    'WhatsApp Image 2026-01-09 at 21.06.31.jpeg',
    'WhatsApp Image 2026-01-09 at 21.08.47.jpeg',
    'WhatsApp Image 2026-01-09 at 21.11.08.jpeg',
    'WhatsApp Image 2026-01-09 at 21.11.49.jpeg',
    'WhatsApp Image 2026-01-09 at 21.12.39.jpeg',
    'WhatsApp Image 2026-01-09 at 21.13.07.jpeg',
    'WhatsApp Image 2026-01-09 at 21.14.06.jpeg'
];

let currentHeroImageIndex = 0;
let heroCycleInterval;

function createRainingImages() {
    const rainingContainer = document.getElementById('rainingImages');
    if (!rainingContainer) return;
    
    function createRainingImage() {
        if (Math.random() > 0.3) return;
        
        const img = document.createElement('img');
        const randomImage = heroImages[Math.floor(Math.random() * heroImages.length)];
        img.src = randomImage;
        img.className = 'raining-image';
        
        img.style.left = Math.random() * 100 + '%';
        img.style.animationDuration = (Math.random() * 3 + 4) + 's';
        img.style.animationDelay = Math.random() * 1 + 's';
        
        const size = Math.random() * 70 + 80;
        img.style.width = size + 'px';
        img.style.height = size + 'px';
        
        const shapes = ['circle', 'hexagon', 'diamond', 'star', 'pentagon'];
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        img.style.clipPath = getClipPath(randomShape);
        
        if (randomShape === 'diamond') {
            img.style.transform = 'rotate(45deg)';
        }
        
        img.addEventListener('click', () => {
            img.style.animation = 'none';
            img.style.transform += ' scale(2)';
            img.style.opacity = '0';
            setTimeout(() => img.remove(), 300);
        });
        
        rainingContainer.appendChild(img);
        
        setTimeout(() => {
            if (img.parentNode) {
                img.remove();
            }
        }, 7000);
    }
    
    if (window.rainingImagesInterval) {
        clearInterval(window.rainingImagesInterval);
    }
    
    window.rainingImagesInterval = setInterval(createRainingImage, 800);
    
    for (let i = 0; i < 5; i++) {
        setTimeout(createRainingImage, i * 500);
    }
}

function getClipPath(shape) {
    const paths = {
        circle: 'circle(50%)',
        hexagon: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
        diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        star: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
        pentagon: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
    };
    return paths[shape] || paths.circle;
}

/* ============================================
   HERO IMAGE CYCLING
   ============================================ */
function cycleHeroImage() {
    const heroImage = document.getElementById('heroImage');
    if (!heroImage) return;
    
    heroImage.style.opacity = '0';
    heroImage.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
        currentHeroImageIndex = (currentHeroImageIndex + 1) % heroImages.length;
        heroImage.src = heroImages[currentHeroImageIndex];
        
        heroImage.style.opacity = '1';
        heroImage.style.transform = 'scale(1)';
    }, 300);
}

function startHeroAutoCycle() {
    if (heroCycleInterval) clearInterval(heroCycleInterval);
    heroCycleInterval = setInterval(() => {
        cycleHeroImage();
        createConfettiBurst();
    }, 3500);
}
const cake = document.getElementById('cake');
if (cake) {
    let bounceCount = 0;
    cake.addEventListener('animationiteration', () => {
        bounceCount++;
        if (bounceCount % 2 === 0) {
            cycleHeroImage();
        }
    });
}

/* ============================================
   HERO PARALLAX / 3D
   ============================================ */
function tiltHeroInit() {
    const wrapper = document.getElementById('heroImageWrapper');
    if (!wrapper) return;
    const strength = 12;
    wrapper.addEventListener('mousemove', (e) => {
        const rect = wrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateY = ((x / rect.width) - 0.5) * strength;
        const rotateX = ((y / rect.height) - 0.5) * -strength;
        wrapper.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });
    wrapper.addEventListener('mouseleave', () => {
        wrapper.style.transform = '';
    });
}

function initHeroParallaxText() {
    const heroText = document.querySelector('.hero-text');
    if (!heroText) return;
    window.addEventListener('scroll', () => {
        const offset = window.scrollY * 0.1;
        heroText.style.transform = `translateY(${offset}px)`;
    });
}

function initMusicReactiveGlow() {
    const title = document.getElementById('titleText');
    const name = document.getElementById('nameText');
    if (!title || !name) return;
    let t = 0;
    function glow() {
        t += 0.02;
        const glow = (Math.sin(t) + 1) * 0.5;
        title.style.filter = `drop-shadow(0 0 ${20 + glow * 20}px rgba(255,255,255,0.8))`;
        name.style.filter = `drop-shadow(0 0 ${15 + glow * 20}px rgba(255,255,255,0.8))`;
        requestAnimationFrame(glow);
    }
    glow();
}

/* ============================================
   PARTY FUNCTION
   ============================================ */
function startParty() {
    if (isPartyActive) return;
    
    isPartyActive = true;
    createConfetti();
    animateConfetti();
    
    // Increase raining images
    if (window.rainingImagesInterval) {
        clearInterval(window.rainingImagesInterval);
    }
    window.rainingImagesInterval = setInterval(() => {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const rainingContainer = document.getElementById('rainingImages');
                if (!rainingContainer) return;
                
                const img = document.createElement('img');
                const randomImage = heroImages[Math.floor(Math.random() * heroImages.length)];
                img.src = randomImage;
                img.className = 'raining-image';
                img.style.left = Math.random() * 100 + '%';
                img.style.animationDuration = (Math.random() * 2 + 2) + 's';
                const size = Math.random() * 80 + 100;
                img.style.width = size + 'px';
                img.style.height = size + 'px';
                
                const shapes = ['circle', 'hexagon', 'diamond', 'star', 'pentagon'];
                const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
                img.style.clipPath = getClipPath(randomShape);
                
                if (randomShape === 'diamond') {
                    img.style.transform = 'rotate(45deg)';
                }
                
                rainingContainer.appendChild(img);
                
                setTimeout(() => {
                    if (img.parentNode) img.remove();
                }, 5000);
            }, i * 200);
        }
    }, 400);
    
    // Speed up cake animation
    if (cake) {
        cake.style.animation = 'bounce 0.4s ease-in-out infinite';
    }
    
    // Stop party after 15 seconds
    setTimeout(() => {
        isPartyActive = false;
        if (cake) {
            cake.style.animation = 'bounce 2s ease-in-out infinite';
        }
        if (window.rainingImagesInterval) {
            clearInterval(window.rainingImagesInterval);
            createRainingImages();
        }
    }, 15000);
}

/* ============================================
   CANDLE BLOW EFFECT
   ============================================ */
let candleBlown = false;

function blowCandle() {
    const flame = document.getElementById('flame');
    if (!flame || candleBlown) return;
    
    candleBlown = true;
    flame.classList.add('blown');
    
    setTimeout(() => {
        createConfettiBurst();
        animateConfetti();
        isPartyActive = true;
        
        setTimeout(() => {
            isPartyActive = false;
            candleBlown = false;
            flame.classList.remove('blown');
        }, 5000);
    }, 500);
}

/* ============================================
   LIGHTBOX FUNCTIONALITY
   ============================================ */
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.querySelector('.lightbox-image');
const galleryItems = document.querySelectorAll('.gallery-item');
const closeLightbox = document.querySelector('.lightbox-close');
const prevBtn = document.querySelector('.lightbox-prev');
const nextBtn = document.querySelector('.lightbox-next');

let currentImageIndex = 0;
const images = Array.from(galleryItems).map(item => {
    const img = item.querySelector('img');
    return img ? img.src : null;
}).filter(Boolean);

galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        currentImageIndex = index;
        openLightbox();
    });
});

function openLightbox() {
    if (lightbox && lightboxImage && images[currentImageIndex]) {
        lightbox.classList.add('active');
        lightboxImage.src = images[currentImageIndex];
        document.body.style.overflow = 'hidden';
    }
}

function closeLightboxFunc() {
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

if (closeLightbox) {
    closeLightbox.addEventListener('click', closeLightboxFunc);
}

if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightboxFunc();
        }
    });
}

if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        if (lightboxImage && images[currentImageIndex]) {
            lightboxImage.src = images[currentImageIndex];
        }
    });
}

if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentImageIndex = (currentImageIndex + 1) % images.length;
        if (lightboxImage && images[currentImageIndex]) {
            lightboxImage.src = images[currentImageIndex];
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') {
        closeLightboxFunc();
    } else if (e.key === 'ArrowLeft') {
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        if (lightboxImage && images[currentImageIndex]) {
            lightboxImage.src = images[currentImageIndex];
        }
    } else if (e.key === 'ArrowRight') {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        if (lightboxImage && images[currentImageIndex]) {
            lightboxImage.src = images[currentImageIndex];
        }
    }
});

/* ============================================
   FUNNY MESSAGES SYSTEM
   ============================================ */
function showHinglishMessage(message, duration = 3000) {
    const funnyContainer = document.getElementById('funnyMessages');
    if (!funnyContainer) return;
    
    const messageEl = document.createElement('div');
    messageEl.className = 'funny-message';
    messageEl.textContent = message;
    funnyContainer.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.style.animation = 'messagePopOut 0.5s ease forwards';
        setTimeout(() => messageEl.remove(), 500);
    }, duration);
}

const funnyMessages = {
    click: [
        'Arey yaar! Phir se? 😂',
        'Click karne ki addiction hai kya? 🎯',
        'Haan bhai, aur kar! 💪',
        'Ek aur click, ek aur surprise! 🎁'
    ],
    gallery: [
        'Photo dekhi? Mast hai na? 📸',
        'Yaar photo mein tu legend lag raha hai! 🏆',
        'Photo dekh ke pura mood ban gaya! 😎'
    ],
    party: [
        '🎊 AB PARTY SHURU HAI YAAR! DANCE KAR! 🎊',
        'Party mode ON! Celebration time! 🎉'
    ]
};

const lovingInsults = [
    'Abe ओवरएक्टिंग स्टार, फिर आ गया! 🤪',
    'Tu drama king/queen hai, but humko pasand hai! 😎',
    'Smart toh hai, par thoda pagal bhi. ❤️',
    'Kitna nautanki karega? Phir bhi cute lagta hai. 🫶',
    'Red Bull piya kya? Hyper ho raha hai! 🪽'
];

const chaosEmojis = ['🤪','😜','🤡','🌀','🎭','🙃','🦄','🔥','🍭','🚀'];

/* ============================================
   INTERACTIVE ELEMENTS
   ============================================ */
const partyBtn = document.getElementById('partyBtn');
if (partyBtn) {
    partyBtn.addEventListener('click', () => {
        startParty();
        if (funnyMessages.party.length > 0) {
            showHinglishMessage(funnyMessages.party[0], 3000);
        }
    });
}

const heroImageWrapper = document.getElementById('heroImageWrapper');
if (heroImageWrapper) {
    let clickCount = 0;
    heroImageWrapper.addEventListener('click', () => {
        clickCount++;
        cycleHeroImage();
        if (clickCount % 3 === 0) {
            createConfettiBurst();
        }
        if (Math.random() > 0.6 && funnyMessages.click.length > 0) {
            const msg = funnyMessages.click[Math.floor(Math.random() * funnyMessages.click.length)];
            showHinglishMessage(msg, 2000);
        }
    });
}

if (cake) {
    cake.addEventListener('click', () => {
        blowCandle();
        showHinglishMessage('Wah yaar! Candle blow ho gayi! 🎉 Ab wish kar le! 🎂', 2500);
    });
}

// Add funny messages to gallery clicks
galleryItems.forEach(item => {
    item.addEventListener('click', (e) => {
        if (e.target.closest('.gallery-overlay')) return;
        if (Math.random() > 0.7 && funnyMessages.gallery.length > 0) {
            const msg = funnyMessages.gallery[Math.floor(Math.random() * funnyMessages.gallery.length)];
            setTimeout(() => showHinglishMessage(msg, 2000), 300);
        }
    });
});

// Auto hero image cycle
startHeroAutoCycle();

/* ============================================
   GALLERY 3D TILT & SWIPE
   ============================================ */
function initGalleryInteractions() {
    galleryItems.forEach(item => {
        // 3D tilt on mouse move
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rotY = ((x / rect.width) - 0.5) * 10;
            const rotX = ((y / rect.height) - 0.5) * -10;
            item.style.transform = `translateY(-5px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        });
        item.addEventListener('mouseleave', () => {
            item.style.transform = '';
        });

        // Swipe navigation on touch
        let startX = 0;
        item.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        item.addEventListener('touchend', (e) => {
            const delta = e.changedTouches[0].clientX - startX;
            if (Math.abs(delta) > 60) {
                if (delta > 0 && prevBtn) prevBtn.click();
                if (delta < 0 && nextBtn) nextBtn.click();
            }
        });

        // Double click / double tap to zoom
        let tapTimeout;
        item.addEventListener('click', () => {
            if (tapTimeout) {
                clearTimeout(tapTimeout);
                tapTimeout = null;
                item.classList.toggle('zoomed');
            } else {
                tapTimeout = setTimeout(() => {
                    tapTimeout = null;
                }, 250);
            }
        });
    });
}

/* ============================================
   FUNNY MICRO-INTERACTIONS
   ============================================ */
function initKonamiCode() {
    const sequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let index = 0;
    document.addEventListener('keydown', (e) => {
        if (e.key === sequence[index]) {
            index++;
            if (index === sequence.length) {
                showHinglishMessage('कोनामी कोड! तू असली गेमर है! 🎮', 3000);
                startParty();
                index = 0;
            }
        } else {
            index = 0;
        }
    });
}

function initRunAwayElements() {
    const runners = document.querySelectorAll('.highlight, .party-btn');
    runners.forEach(el => {
        el.addEventListener('mouseenter', () => {
            const dx = (Math.random() - 0.5) * 80;
            const dy = (Math.random() - 0.5) * 40;
            el.style.transform = `translate(${dx}px, ${dy}px) scale(1.02)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });
}

function initFunnyTooltips() {
    const highlights = document.querySelectorAll('.highlight');
    highlights.forEach(el => {
        el.setAttribute('title', 'मुझे दबाओ, मस्ती पाओ! 🤪');
    });
}

/* ============================================
   ELASTIC BUTTONS
   ============================================ */
function initElasticButtons() {
    const btns = document.querySelectorAll('.party-btn, .highlight');
    btns.forEach(btn => {
        btn.addEventListener('mousedown', () => {
            btn.style.transform += ' scale(0.95)';
        });
        btn.addEventListener('mouseup', () => {
            btn.style.transform = btn.style.transform.replace(' scale(0.95)', '');
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = btn.style.transform.replace(' scale(0.95)', '');
        });
    });
}

/* ============================================
   SCROLL ANIMATIONS
   ============================================ */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0) scale(1)';
                }, index * 100);
            }
        });
    }, observerOptions);
    
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(50px) scale(0.9)';
        item.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        observer.observe(item);
    });
}

/* ============================================
   SCROLL PARALLAX & PROGRESS
   ============================================ */
let confettiMilestoneTriggered = false;
function initScrollSystems() {
    const progress = document.getElementById('scrollProgress');
    const floatingElements = document.querySelector('.floating-elements');
    const particles = document.querySelector('.particles');
    const balloons = document.querySelector('.balloons');
    
    const update = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const progressVal = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        if (progress) progress.style.width = `${progressVal}%`;
        
        const parallax = scrollTop * 0.1;
        if (floatingElements) floatingElements.style.transform = `translateY(${parallax}px)`;
        if (particles) particles.style.transform = `translateY(${parallax * 0.6}px)`;
        if (balloons) balloons.style.transform = `translateY(${parallax * 0.4}px)`;
        
        if (!confettiMilestoneTriggered && progressVal > 50) {
            confettiMilestoneTriggered = true;
            createConfettiBurst();
        }
        requestAnimationFrame(update);
    };
    update();
}

/* ============================================
   RIPPLE & GLITCH EFFECTS
   ============================================ */
function initRippleEffect() {
    document.addEventListener('click', (e) => {
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.left = `${e.clientX}px`;
        ripple.style.top = `${e.clientY}px`;
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 800);
    });
}

function initGlitchEffect() {
    const title = document.getElementById('titleText');
    if (!title) return;
    setInterval(() => {
        title.classList.add('glitch');
        setTimeout(() => title.classList.remove('glitch'), 500);
    }, 8000);
}

/* ============================================
   CUSTOM CURSOR & MAGNETIC EFFECTS
   ============================================ */
function initCustomCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.left = `${mouseX}px`;
        cursor.style.top = `${mouseY}px`;
    });
    
    // Magnetic effect
    const magnetics = document.querySelectorAll('.party-btn, .highlight, .gallery-item');
    magnetics.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('magnetic'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('magnetic'));
        
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.1;
            const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.1;
            el.style.transform = `translate(${dx}px, ${dy}px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });
}

/* ============================================
   CHAOS ENGINE: RANDOM SURPRISES
   ============================================ */
function showChaosMessage(msg) {
    const container = document.getElementById('funnyMessages');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'chaos-message';
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => {
        el.style.animation = 'messagePopOut 0.4s ease forwards';
        setTimeout(() => el.remove(), 400);
    }, 1800);
}

function interruptText() {
    const subtitle = document.getElementById('subtitleText');
    if (!subtitle) return;
    const original = subtitle.textContent;
    const random = lovingInsults[Math.floor(Math.random() * lovingInsults.length)];
    subtitle.textContent = random;
    subtitle.classList.add('wiggle');
    setTimeout(() => {
        subtitle.textContent = original;
        subtitle.classList.remove('wiggle');
    }, 2000);
}

function makeEmojisMisbehave() {
    const emojiLetters = document.querySelectorAll('.emoji-letter');
    emojiLetters.forEach(el => {
        const dx = (Math.random() - 0.5) * 40;
        const dy = (Math.random() - 0.5) * 30;
        const spin = (Math.random() - 0.5) * 40;
        el.style.display = 'inline-block';
        el.style.transition = 'transform 0.5s ease';
        el.style.transform = `translate(${dx}px, ${dy}px) rotate(${spin}deg)`;
        setTimeout(() => {
            el.style.transform = '';
        }, 1200);
    });
}

function randomChaosLoop() {
    const actions = [
        () => showChaosMessage(lovingInsults[Math.floor(Math.random() * lovingInsults.length)]),
        () => showChaosMessage(funnyMessages.click[Math.floor(Math.random() * funnyMessages.click.length)]),
        () => interruptText(),
        () => makeEmojisMisbehave(),
        () => createConfettiBurst()
    ];
    
    setInterval(() => {
        const action = actions[Math.floor(Math.random() * actions.length)];
        action();
    }, 6000);
}

/* ============================================
   INITIALIZATION
   ============================================ */
window.addEventListener('load', () => {
    initAudio();
    initPageLoader();
    createParticles();
    createRainingImages();
    initScrollAnimations();
    initGalleryInteractions();
    initBalloonPhysics();
    tiltHeroInit();
    initHeroParallaxText();
    initMusicReactiveGlow();
    initElasticButtons();
    initKonamiCode();
    initRunAwayElements();
    initFunnyTooltips();
    initRippleEffect();
    initGlitchEffect();
    initCustomCursor();
    initScrollSystems();
    randomChaosLoop();
    
    // Start confetti animation loop
    animateConfetti();
});

// Ensure audio starts even if page loads quickly
if (document.readyState === 'complete') {
    initAudio();
} else {
    document.addEventListener('DOMContentLoaded', initAudio);
}
