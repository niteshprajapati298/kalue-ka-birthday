// Confetti system
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let confettiParticles = [];
let isPartyActive = false;

// Music control
const birthdayMusic = document.getElementById('birthdayMusic');
const musicToggle = document.getElementById('musicToggle');
let isMusicPlaying = true;

// Start music on page load
function initMusic() {
    if (birthdayMusic) {
        birthdayMusic.loop = true;
        birthdayMusic.volume = 0.6; // Set volume to 60%
        
        // Play music on first user interaction anywhere on page
        const startMusic = () => {
            if (birthdayMusic.paused && isMusicPlaying) {
                birthdayMusic.play().then(() => {
                    showHinglishMessage('🎵 Ab gaana shuru ho gaya hai! Party mode ON! 🎵', 2500);
                }).catch(e => {
                    console.log('Music play prevented');
                });
            }
        };
        
        // Try multiple ways to start music
        document.addEventListener('click', startMusic, { once: true });
        document.addEventListener('touchstart', startMusic, { once: true });
        document.addEventListener('keydown', startMusic, { once: true });
        
        // Try to play immediately (may not work due to browser policies)
        birthdayMusic.play().catch(e => {
            console.log('Autoplay prevented, waiting for user interaction');
        });
        
        // Ensure music loops (backup)
        birthdayMusic.addEventListener('ended', () => {
            birthdayMusic.currentTime = 0;
            if (isMusicPlaying) {
                birthdayMusic.play();
            }
        });
        
        // Handle any pauses and restart
        birthdayMusic.addEventListener('pause', () => {
            if (isMusicPlaying) {
                // Restart if paused but should be playing
                setTimeout(() => {
                    if (isMusicPlaying && birthdayMusic.paused) {
                        birthdayMusic.play();
                    }
                }, 100);
            }
        });
    }
}

function toggleMusic() {
    if (!birthdayMusic) return;
    
    if (isMusicPlaying) {
        birthdayMusic.pause();
        isMusicPlaying = false;
        musicToggle.classList.add('muted');
        musicToggle.querySelector('.music-text').textContent = 'Gaana OFF Hai';
        musicToggle.querySelector('.music-icon').textContent = '🔇';
    } else {
        birthdayMusic.play();
        isMusicPlaying = true;
        musicToggle.classList.remove('muted');
        musicToggle.querySelector('.music-text').textContent = 'Gaana ON Hai';
        musicToggle.querySelector('.music-icon').textContent = '🎵';
    }
}

// Hero image cycling
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
let bounceCount = 0;

class ConfettiParticle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height - canvas.height;
        this.size = Math.random() * 10 + 5;
        this.speedY = Math.random() * 5 + 3;
        this.speedX = (Math.random() - 0.5) * 2;
        this.color = this.getRandomColor();
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 10;
        this.shape = Math.random() > 0.5 ? 'circle' : 'rect';
    }

    getRandomColor() {
        const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ffd3a5', '#fd9853', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'];
        return colors[Math.floor(Math.random() * colors.length)];
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

function createConfetti() {
    confettiParticles = [];
    for (let i = 0; i < 200; i++) {
        confettiParticles.push(new ConfettiParticle());
    }
}

function animateConfetti() {
    if (!isPartyActive) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    confettiParticles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    requestAnimationFrame(animateConfetti);
}

// Emoji rain function
function createEmojiRain() {
    const emojis = ['🎉', '🎊', '🎁', '🎂', '🎈', '⭐', '✨', '🎀', '🎵', '🎸', '💝', '🎪', '🎭', '🎨'];
    const emojiRainContainer = document.querySelector('.emoji-rain');
    
    for (let i = 0; i < 80; i++) {
        setTimeout(() => {
            const emoji = document.createElement('span');
            emoji.className = 'emoji';
            emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            emoji.style.left = Math.random() * 100 + '%';
            emoji.style.animationDuration = (Math.random() * 3 + 2) + 's';
            emoji.style.fontSize = (Math.random() * 20 + 25) + 'px';
            emojiRainContainer.appendChild(emoji);
            
            setTimeout(() => {
                if (emoji.parentNode) {
                    emoji.remove();
                }
            }, 5000);
        }, i * 80);
    }
}

// Party function
function startParty() {
    if (isPartyActive) return;
    
    isPartyActive = true;
    showHinglishMessage('🎊 AB PARTY SHURU HAI YAAR! DANCE KAR! 🎊', 3000);
    
    // Increase music volume during party
    if (birthdayMusic && isMusicPlaying) {
        birthdayMusic.volume = 0.8;
    }
    
    createConfetti();
    createEmojiRain();
    
    // Increase raining images frequency during party
    if (window.rainingInterval) {
        clearInterval(window.rainingInterval);
    }
    window.rainingInterval = setInterval(() => {
        const rainingContainer = document.getElementById('rainingImages');
        if (!rainingContainer || !isPartyActive) return;
        
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
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
    
    animateConfetti();
    
    // Add party sound effect (visual feedback)
    document.body.style.animation = 'none';
    setTimeout(() => {
        document.body.style.animation = 'gradientShift 3s ease infinite';
    }, 10);
    
    // Make cake bounce more
    const cake = document.querySelector('.cake');
    if (cake) {
        cake.style.animation = 'bounce 0.4s ease-in-out infinite';
        // Cycle images faster during party
        cake.addEventListener('animationiteration', function partyCycle() {
            if (isPartyActive) {
                cycleHeroImage();
            } else {
                cake.removeEventListener('animationiteration', partyCycle);
            }
        });
    }
    
    // Button feedback
    const button = document.querySelector('.party-btn');
    if (button) {
        const span = button.querySelector('span');
        if (span) {
            span.textContent = '🎉 PARTY TIME! 🎉';
        }
        button.style.animation = 'buttonPulse 0.5s ease-in-out infinite';
    }
    
    // Stop party after 15 seconds
    setTimeout(() => {
        isPartyActive = false;
        if (window.rainingInterval) {
            clearInterval(window.rainingInterval);
            createRainingImages(); // Restore normal raining
        }
        if (cake) {
            cake.style.animation = 'bounce 2s ease-in-out infinite';
        }
        if (button) {
            const span = button.querySelector('span');
            if (span) {
                span.textContent = '🎊 Click for Party! 🎊';
            }
            button.style.animation = 'buttonPulse 2s ease-in-out infinite';
        }
        document.body.style.animation = 'gradientShift 15s ease infinite';
        
        // Reset music volume
        if (birthdayMusic && isMusicPlaying) {
            birthdayMusic.volume = 0.6;
        }
    }, 15000);
}

// Lightbox functionality
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

// Open lightbox
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

// Close lightbox
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

function closeLightboxFunc() {
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Navigation
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

// Keyboard navigation
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

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Hero image cycling on bounce
function cycleHeroImage() {
    const heroImage = document.getElementById('heroImage');
    if (!heroImage) return;
    
    // Add fade out
    heroImage.classList.add('fade-out');
    
    setTimeout(() => {
        // Change image
        currentHeroImageIndex = (currentHeroImageIndex + 1) % heroImages.length;
        heroImage.src = heroImages[currentHeroImageIndex];
        
        // Fade in
        heroImage.classList.remove('fade-out');
        heroImage.classList.add('fade-in');
        
        setTimeout(() => {
            heroImage.classList.remove('fade-in');
        }, 500);
    }, 500);
}

// Listen to cake bounce animation - change hero image on each complete bounce cycle
const cake = document.getElementById('cake');
if (cake) {
    let bounceAnimationIteration = 0;
    
    // Use animationiteration event to detect when cake completes a bounce (up-down)
    cake.addEventListener('animationiteration', () => {
        bounceAnimationIteration++;
        // Change image every complete bounce cycle (every 2 iterations = one up-down cycle)
        if (bounceAnimationIteration % 2 === 0) {
            cycleHeroImage();
        }
    });
    
    // Also add initial cycle after first bounce
    setTimeout(() => {
        cycleHeroImage();
    }, 2000);
}

// Raining images effect
function createRainingImages() {
    const rainingContainer = document.getElementById('rainingImages');
    if (!rainingContainer) return;
    
    const allImages = [...heroImages];
    
    function createRainingImage() {
        if (Math.random() > 0.3) return; // Control frequency
        
        const img = document.createElement('img');
        const randomImage = allImages[Math.floor(Math.random() * allImages.length)];
        img.src = randomImage;
        img.className = 'raining-image';
        
        // Random position
        img.style.left = Math.random() * 100 + '%';
        img.style.animationDuration = (Math.random() * 3 + 4) + 's';
        img.style.animationDelay = Math.random() * 1 + 's';
        
        // Random size
        const size = Math.random() * 70 + 80;
        img.style.width = size + 'px';
        img.style.height = size + 'px';
        
        // Random shape
        const shapes = ['circle', 'hexagon', 'diamond', 'star', 'pentagon'];
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        img.style.clipPath = getClipPath(randomShape);
        
        if (randomShape === 'diamond') {
            img.style.transform = 'rotate(45deg)';
        }
        
        // Make it clickable to stop it
        img.style.pointerEvents = 'auto';
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => {
            img.style.animation = 'none';
            img.style.transform += ' scale(2)';
            img.style.opacity = '0';
            setTimeout(() => img.remove(), 300);
        });
        
        rainingContainer.appendChild(img);
        
        // Remove after animation
        setTimeout(() => {
            if (img.parentNode) {
                img.remove();
            }
        }, 7000);
    }
    
    // Clear existing interval if any
    if (window.rainingImagesInterval) {
        clearInterval(window.rainingImagesInterval);
    }
    
    // Create raining images continuously
    window.rainingImagesInterval = setInterval(createRainingImage, 800);
    
    // Initial burst
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

// Interactive gallery items - 3D tilt effect
function add3DTiltEffect() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            item.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
            item.style.boxShadow = `0 ${25 + rotateX}px ${50 + Math.abs(rotateY)}px rgba(0, 0, 0, 0.4)`;
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            item.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.2)';
        });
    });
}

// Parallax effect on hero section
function addParallaxEffect() {
    const heroSection = document.querySelector('.hero-section');
    const heroImageWrapper = document.querySelector('.hero-image-wrapper');
    
    if (!heroSection || !heroImageWrapper) return;
    
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        const moveX = (mouseX - 0.5) * 30;
        const moveY = (mouseY - 0.5) * 30;
        
        heroImageWrapper.style.transform = `translate(${moveX}px, ${moveY}px)`;
        heroImageWrapper.style.transition = 'transform 0.1s ease-out';
    });
}

// Cursor follower effect
function addCursorFollower() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    
    // Add hover effects
    const interactiveElements = document.querySelectorAll('button, .gallery-item, .hero-image-wrapper, .clickable-element, .clickable-badge');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-hover');
        });
    });
}

// Click ripple effect
function createClickEffect(event) {
    const clickX = event.clientX;
    const clickY = event.clientY;
    
    // Create ripple
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = clickX + 'px';
    ripple.style.top = clickY + 'px';
    document.body.appendChild(ripple);
    
    // Create pop text
    const popTexts = ['🎉', '✨', '🎊', '⭐', '💫', '🎈', '🎁', '🌟'];
    const popText = document.createElement('div');
    popText.className = 'click-pop';
    popText.textContent = popTexts[Math.floor(Math.random() * popTexts.length)];
    popText.style.left = clickX + 'px';
    popText.style.top = clickY + 'px';
    document.body.appendChild(popText);
    
    // Remove elements after animation
    setTimeout(() => {
        ripple.remove();
        popText.remove();
    }, 1000);
    
    // Add clicked class to target
    if (event.target.classList.contains('clickable-element') || 
        event.target.classList.contains('clickable-badge') ||
        event.target.closest('.clickable-element')) {
        const target = event.target.closest('.clickable-element') || event.target;
        target.classList.add('clicked');
        setTimeout(() => target.classList.remove('clicked'), 600);
    }
}

// Badge animation
function animateBadge(element) {
    element.classList.add('clicked');
    setTimeout(() => element.classList.remove('clicked'), 500);
}

// Candle blow effect
let candleBlown = false;
function blowCandle() {
    const flame = document.getElementById('flame');
    if (!flame || candleBlown) {
        if (candleBlown) {
            showHinglishMessage('Candle already blow ho chuki hai! 😅', 2000);
        }
        return;
    }
    
    candleBlown = true;
    flame.classList.add('blown');
    
    showHinglishMessage('Wah yaar! Candle blow ho gayi! 🎉 Ab wish kar le bhai! 🎂', 2500);
    
    // Create celebration effect
    setTimeout(() => {
        createConfetti();
        createEmojiRain();
        animateConfetti();
        isPartyActive = true;
        
        setTimeout(() => {
            isPartyActive = false;
            candleBlown = false;
            flame.classList.remove('blown');
        }, 5000);
    }, 500);
}

// Hero image surprise click
let heroClickCount = 0;
function surpriseHeroClick() {
    heroClickCount++;
    const heroImage = document.getElementById('heroImage');
    const clickCounter = document.getElementById('heroClickCounter');
    
    // Update click counter with Hinglish
    if (clickCounter) {
        clickCounter.textContent = `Kitne Baar Click Kiya: ${heroClickCount}`;
        clickCounter.classList.add('show');
        setTimeout(() => {
            clickCounter.classList.remove('show');
        }, 2000);
    }
    
    // Ensure music plays on first click
    if (birthdayMusic && isMusicPlaying && birthdayMusic.paused) {
        birthdayMusic.play();
    }
    
    // Change image immediately
    cycleHeroImage();
    
    // Hinglish messages based on clicks - More funny
    const messages = [
        'Waah bhai! Aur click kar! 😄',
        'Mast hai yaar! Phir se try kar! 🎉',
        'Bohot sahi! Keep going bro! 🚀',
        'Legend hai tu! Ek aur click! 💪',
        'Chal raha hai bhai! Aur kar! 🔥',
        'Shabash! Phir se! 👏'
    ];
    if (heroClickCount <= 4) {
        showHinglishMessage(messages[heroClickCount - 1], 1500);
    }
    
    // Special effects based on click count
    if (heroClickCount % 5 === 0) {
        // Every 5 clicks, do something special
        startParty();
        showHinglishMessage(`${heroClickCount} clicks! PARTY TIME! 🎊`, 2000);
        if (clickCounter) {
            clickCounter.textContent = `🎉 ${heroClickCount} CLICKS! AB PARTY TIME! 🎉`;
            clickCounter.style.background = 'rgba(255, 107, 157, 0.95)';
            setTimeout(() => {
                clickCounter.style.background = 'rgba(118, 75, 162, 0.95)';
            }, 3000);
        }
    } else {
        // Spin effect
        if (heroImage) {
            heroImage.style.animation = 'spin 0.5s ease';
            setTimeout(() => {
                heroImage.style.animation = '';
            }, 500);
        }
    }
}

// Gallery shuffle
function shuffleGallery() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;
    
    const items = Array.from(galleryGrid.children);
    
    // Shuffle array
    for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
    }
    
    // Add shuffle animation
    items.forEach((item, index) => {
        item.style.animation = 'fadeInUp 0.5s ease-out';
        item.style.animationDelay = (index * 0.1) + 's';
        galleryGrid.appendChild(item);
    });
    
    // Create confetti
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const clickX = Math.random() * window.innerWidth;
            const clickY = Math.random() * window.innerHeight;
            const fakeEvent = { clientX: clickX, clientY: clickY };
            createClickEffect(fakeEvent);
        }, i * 50);
    }
    
    // Show Hinglish message
    showHinglishMessage('Wah bhai! Photos shuffle ho gayi! Mix-match ho gaya! 🎉', 2500);
}

// Show Hinglish messages
function showHinglishMessage(message, duration = 3000) {
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, rgba(255, 107, 157, 0.95), rgba(118, 75, 162, 0.95));
        color: white;
        padding: 20px 40px;
        border-radius: 30px;
        font-size: 1.5rem;
        font-weight: 700;
        z-index: 10000;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        animation: messagePop 0.5s ease;
        pointer-events: none;
        text-align: center;
        font-family: 'Poppins', sans-serif;
    `;
    messageEl.textContent = message;
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.style.animation = 'messagePopOut 0.5s ease forwards';
        setTimeout(() => messageEl.remove(), 500);
    }, duration);
}

// Add message animations
const messageStyle = document.createElement('style');
messageStyle.textContent = `
    @keyframes messagePop {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
        }
        100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }
    @keyframes messagePopOut {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
        }
    }
`;
document.head.appendChild(messageStyle);

// Add spin animation
const spinStyle = document.createElement('style');
spinStyle.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg) scale(1); }
        50% { transform: rotate(180deg) scale(1.2); }
        to { transform: rotate(360deg) scale(1); }
    }
`;
document.head.appendChild(spinStyle);

// Create floating particles
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

// Hide scroll indicator on scroll
function handleScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (!scrollIndicator) return;
    
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            scrollIndicator.classList.add('hidden');
        } else {
            scrollIndicator.classList.remove('hidden');
        }
        
        lastScrollTop = scrollTop;
    });
}

// Add some floating emojis on page load
window.addEventListener('load', () => {
    // Initialize music
    initMusic();
    
    // Create particles
    createParticles();
    
    // Handle scroll indicator
    handleScrollIndicator();
    
    setTimeout(() => {
        createEmojiRain();
    }, 1500);
    
    // Initialize raining images
    createRainingImages();
    
    // Add 3D tilt effects
    add3DTiltEffect();
    
    // Add parallax effect
    addParallaxEffect();
    
    // Add custom cursor
    addCursorFollower();
    
    // Add scroll animations with stagger effect
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
                    entry.target.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                }, index * 100);
            }
        });
    }, observerOptions);
    
    // Observe gallery items with enhanced animations
    galleryItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(50px) scale(0.8)';
        
        observer.observe(item);
        
        // Add click effect to gallery items
        item.addEventListener('click', (e) => {
            if (e.target.closest('.gallery-overlay')) return; // Don't trigger if clicking overlay
            
            item.classList.add('clicked');
            
            // Add spin and scale effect
            item.style.animation = 'galleryPop 0.4s ease, gallerySpin 0.6s ease';
            
            setTimeout(() => {
                item.classList.remove('clicked');
                item.style.animation = '';
            }, 600);
            
            createClickEffect(e);
            
            // Random Hinglish messages - More funny and human-like
            const messages = [
                'Photo khul gayi bhai! 👀',
                'Mast photo hai yaar! 📸',
                'Aur photos bhi dekh le bhai! 🖼️',
                'Beautiful lag rahi hai! 💖',
                'Waah! Kya photo hai yaar! 😍',
                'Super duper hit hai! 🔥',
                'Dekh ke accha laga! 🤩',
                'Photo mein tu legend lag raha hai! 🏆'
            ];
            const randomMsg = messages[Math.floor(Math.random() * messages.length)];
            setTimeout(() => showHinglishMessage(randomMsg, 1500), 300);
        });
    });
    
    // Add spin animation for gallery
    const gallerySpinStyle = document.createElement('style');
    gallerySpinStyle.textContent = `
        @keyframes gallerySpin {
            0% { transform: rotateY(0deg) scale(1); }
            50% { transform: rotateY(180deg) scale(1.1); }
            100% { transform: rotateY(360deg) scale(1); }
        }
    `;
    document.head.appendChild(gallerySpinStyle);
    
    // Make title clickable
    const title = document.querySelector('.title');
    if (title) {
        title.addEventListener('click', (e) => {
            createClickEffect(e);
            // Random color change
            const colors = ['#8B1E3F', '#B8860B', '#1E3A8A', '#4B0082', '#8B0000', '#006400'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            title.style.filter = `hue-rotate(${Math.random() * 360}deg)`;
            setTimeout(() => {
                title.style.filter = '';
            }, 1000);
        });
    }
});

// Add random sparkle effects
setInterval(() => {
    if (!isPartyActive && Math.random() > 0.7) {
        const sparkle = document.createElement('div');
        sparkle.innerHTML = '✨';
        sparkle.style.position = 'fixed';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.fontSize = '25px';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '100';
        sparkle.style.animation = 'sparkle 2s ease-out forwards';
        document.body.appendChild(sparkle);
        
        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.remove();
            }
        }, 2000);
    }
}, 2000);

// Add sparkle animation
const style = document.createElement('style');
style.textContent = `
    @keyframes sparkle {
        0% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
        }
        50% {
            opacity: 1;
            transform: scale(1.5) rotate(180deg);
        }
        100% {
            opacity: 0;
            transform: scale(0) rotate(360deg);
        }
    }
`;
document.head.appendChild(style);