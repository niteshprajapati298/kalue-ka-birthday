// Confetti system
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let confettiParticles = [];
let isPartyActive = false;

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
    for (let i = 0; i < 150; i++) {
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
    const emojis = ['🎉', '🎊', '🎁', '🎂', '🎈', '⭐', '✨', '🎀', '🎵', '🎸'];
    const emojiRainContainer = document.querySelector('.emoji-rain');
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const emoji = document.createElement('span');
            emoji.className = 'emoji';
            emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            emoji.style.left = Math.random() * 100 + '%';
            emoji.style.animationDuration = (Math.random() * 3 + 2) + 's';
            emoji.style.fontSize = (Math.random() * 20 + 20) + 'px';
            emojiRainContainer.appendChild(emoji);
            
            setTimeout(() => {
                emoji.remove();
            }, 5000);
        }, i * 100);
    }
}

// Party function
function startParty() {
    if (isPartyActive) return;
    
    isPartyActive = true;
    createConfetti();
    createEmojiRain();
    animateConfetti();
    
    // Add party sound effect (visual feedback)
    document.body.style.animation = 'none';
    setTimeout(() => {
        document.body.style.animation = 'gradientShift 15s ease infinite';
    }, 10);
    
    // Make cake bounce more
    const cake = document.querySelector('.cake');
    cake.style.animation = 'bounce 0.5s ease-in-out infinite';
    
    // Button feedback
    const button = document.querySelector('.party-btn');
    button.textContent = '🎉 PARTY TIME! 🎉';
    button.style.animation = 'buttonPulse 0.5s ease-in-out infinite';
    
    // Stop party after 10 seconds
    setTimeout(() => {
        isPartyActive = false;
        cake.style.animation = 'bounce 2s ease-in-out infinite';
        button.textContent = '🎊 Click for Party! 🎊';
        button.style.animation = 'buttonPulse 2s ease-in-out infinite';
    }, 10000);
}

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Add some floating emojis on page load
window.addEventListener('load', () => {
    setTimeout(() => {
        createEmojiRain();
    }, 1000);
});

// Add random sparkle effects
setInterval(() => {
    if (!isPartyActive && Math.random() > 0.7) {
        const sparkle = document.createElement('div');
        sparkle.innerHTML = '✨';
        sparkle.style.position = 'fixed';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.fontSize = '20px';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '100';
        sparkle.style.animation = 'sparkle 2s ease-out forwards';
        document.body.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 2000);
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
