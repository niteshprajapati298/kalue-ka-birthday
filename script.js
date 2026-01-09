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
let isMusicUnmuted = false;
let hasUserInteracted = false;

function initAudio() {
    if (!birthdayMusic) return;
    
    // Set initial properties
    birthdayMusic.loop = true;
    birthdayMusic.volume = 0;
    birthdayMusic.muted = true;
    
    // Try to play muted immediately (works in most browsers)
    birthdayMusic.play().catch(e => {
        console.log('Autoplay prevented, will start on interaction');
    });
    
    // Fade in music after page loads
    setTimeout(() => {
        fadeInAudio();
    }, 1500);
    
    // Unmute on first user interaction
    const unmuteOnInteraction = () => {
        if (!hasUserInteracted) {
            hasUserInteracted = true;
            birthdayMusic.muted = false;
            fadeInAudio();
            
            // Remove listeners after first interaction
            document.removeEventListener('click', unmuteOnInteraction);
            document.removeEventListener('touchstart', unmuteOnInteraction);
            document.removeEventListener('keydown', unmuteOnInteraction);
        }
    };
    
    document.addEventListener('click', unmuteOnInteraction, { once: true });
    document.addEventListener('touchstart', unmuteOnInteraction, { once: true });
    document.addEventListener('keydown', unmuteOnInteraction, { once: true });
    
    // Ensure music continues playing
    birthdayMusic.addEventListener('ended', () => {
        birthdayMusic.currentTime = 0;
        birthdayMusic.play();
    });
    
    // Handle visibility change
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
   PAGE LOADER & ENTRY ANIMATION
   ============================================ */
function initPageLoader() {
    const loader = document.getElementById('pageLoader');
    const appContainer = document.getElementById('appContainer');
    
    if (!loader || !appContainer) return;
    
    // Simulate loading progress
    setTimeout(() => {
        loader.classList.add('hidden');
        appContainer.classList.add('loaded');
        
        // Trigger confetti burst
        setTimeout(() => {
            createConfettiBurst();
            animateTitleLetters();
            animateNameLetters();
        }, 300);
    }, 2000);
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
   INITIALIZATION
   ============================================ */
window.addEventListener('load', () => {
    initAudio();
    initPageLoader();
    createParticles();
    createRainingImages();
    initScrollAnimations();
    
    // Start confetti animation loop
    animateConfetti();
});

// Ensure audio starts even if page loads quickly
if (document.readyState === 'complete') {
    initAudio();
} else {
    document.addEventListener('DOMContentLoaded', initAudio);
}
