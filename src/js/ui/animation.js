class AnimationManager {
    constructor() {
        this.initializeAnimations();
        this.setupScrollEffects();
    }

    initializeAnimations() {
        // Terminal typing effect
        this.startTerminalTyping();

        // Glitch effect for hero title
        this.setupGlitchEffect();

        // Background animation
        this.setupBackgroundAnimation();
    }

    startTerminalTyping() {
        const cursor = document.querySelector('.cursor');
        if (cursor) {
            setInterval(() => {
                cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
            }, 500);
        }
    }

    setupGlitchEffect() {
        const glitchElements = document.querySelectorAll('.glitch-text h1');
        glitchElements.forEach(element => {
            setInterval(() => {
                if (Math.random() > 0.9) {
                    element.style.transform = `translateX(${Math.random() * 4 - 2}px)`;
                    setTimeout(() => {
                        element.style.transform = 'translateX(0)';
                    }, 100);
                }
            }, 2000);
        });
    }

    setupBackgroundAnimation() {
        const bgElement = document.querySelector('.bg-animation');
        if (bgElement) {
            let hue = 0;
            setInterval(() => {
                hue = (hue + 1) % 360;
                bgElement.style.filter = `brightness(0.8) hue-rotate(${hue}deg)`;
            }, 100);
        }
    }

    setupScrollEffects() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe all sections
        document.querySelectorAll('section').forEach(section => {
            observer.observe(section);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AnimationManager();
});
