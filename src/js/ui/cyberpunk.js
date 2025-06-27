class CyberpunkUI {
    constructor() {
        this.config = null;
        this.loadConfig().then(() => {
            this.initializeNavigation();
            this.setupScrollEffects();
            this.initializeGlowEffects();
            this.initializeMobileAdaptation();
            this.setupLanguageIntegration();
        });
    }

    async loadConfig() {
        try {
            const response = await fetch('./src/json/config.json');
            this.config = await response.json();
        } catch (error) {
            console.error('Failed to load UI config:', error);
            // Fallback config
            this.config = {
                ui: {
                    colors: {
                        primary: '#00ffff',
                        secondary: '#ff6b35'
                    },
                    animations: {
                        glowPulseSpeed: 3000
                    }
                }
            };
        }
    }

    initializeNavigation() {
        const navIcons = document.querySelectorAll('.nav-icon');
        const sections = document.querySelectorAll('section');

        // Handle navigation clicks
        navIcons.forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = icon.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
                
                // Update active state
                navIcons.forEach(nav => nav.classList.remove('active'));
                icon.classList.add('active');
            });
        });

        // Update active navigation on scroll
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.scrollY >= (sectionTop - 200)) {
                    current = section.getAttribute('id');
                }
            });

            navIcons.forEach(icon => {
                icon.classList.remove('active');
                if (icon.getAttribute('href') === '#' + current) {
                    icon.classList.add('active');
                }
            });
        });
    }

    setupScrollEffects() {
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    this.animateSection(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('section').forEach(section => {
            observer.observe(section);
        });
    }

    animateSection(section) {
        const cards = section.querySelectorAll('.service-card, .project-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }

    initializeGlowEffects() {
        // Add glow effect to buttons
        const buttons = document.querySelectorAll('.cyber-btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                this.createGlowPulse(button);
            });
        });

        // Enhanced glow effect for logo and studio name
        const logo = document.querySelector('.logo-main');
        if (logo) {
            // Continuous bright glow for logo
            logo.style.filter = `drop-shadow(0 0 25px ${this.config.ui.colors.primary}) drop-shadow(0 0 50px ${this.config.ui.colors.primary}) brightness(1.3)`;
            
            setInterval(() => {
                if (Math.random() > 0.6) {
                    logo.style.filter = `drop-shadow(0 0 35px ${this.config.ui.colors.primary}) drop-shadow(0 0 70px ${this.config.ui.colors.primary}) brightness(1.5)`;
                    setTimeout(() => {
                        logo.style.filter = `drop-shadow(0 0 25px ${this.config.ui.colors.primary}) drop-shadow(0 0 50px ${this.config.ui.colors.primary}) brightness(1.3)`;
                    }, 400);
                }
            }, this.config.ui.animations.glowPulseSpeed || 2000);
        }

        // Make studio name brighter
        const studioTitle = document.querySelector('.hero-title');
        if (studioTitle) {
            studioTitle.style.textShadow = `0 0 10px ${this.config.ui.colors.primary}, 0 0 20px ${this.config.ui.colors.primary}, 0 0 40px ${this.config.ui.colors.primary}, 2px 2px 4px rgba(0, 0, 0, 0.8)`;
            studioTitle.style.filter = 'brightness(1.4)';
        }
    }

    createGlowPulse(element) {
        element.style.animation = 'none';
        setTimeout(() => {
            element.style.animation = 'glow-pulse 0.6s ease-in-out';
        }, 10);
    }

    setupLanguageIntegration() {
        // 監聽語言變更事件
        document.addEventListener('languageChanged', (event) => {
            const { language, translations } = event.detail;
            console.log(`語言已切換至: ${language}`);
            
            // 可以在這裡執行語言變更後的特殊處理
            this.onLanguageChanged(language, translations);
        });
    }

    onLanguageChanged(language, translations) {
        // 語言變更後的特殊處理
        // 例如：重新載入動態內容、調整佈局等
        
        // 更新頁面標題
        if (translations['hero-title']) {
            document.title = `${translations['hero-title']} - ${translations['hero-subtitle'] || 'Digital Solutions'}`;
        }
        
        // 觸發重新渲染動畫
        setTimeout(() => {
            this.refreshAnimations();
        }, 100);
    }

    refreshAnimations() {
        // 重新觸發動畫效果
        const animatedElements = document.querySelectorAll('.service-card, .project-card');
        animatedElements.forEach(element => {
            element.style.animation = 'none';
            setTimeout(() => {
                element.style.animation = '';
            }, 10);
        });
    }

    // TODO: Replace with actual API call
    async callBotAPI(message) {
        // Placeholder for future API integration
        const response = await fetch('/api/bot/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });
        return await response.json();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CyberpunkUI();
});

// Add CSS animation for glow pulse and mobile styles
const style = document.createElement('style');
style.textContent = `
    @keyframes glow-pulse {
        0% { box-shadow: 0 0 5px currentColor; }
        50% { box-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
        100% { box-shadow: 0 0 5px currentColor; }
    }
    
    .service-card, .project-card {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s ease;
    }

    /* Enhanced studio name brightness */
    .hero-title {
        text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 40px #00ffff, 2px 2px 4px rgba(0, 0, 0, 0.8) !important;
        filter: brightness(1.4) !important;
        animation: title-glow 3s ease-in-out infinite alternate;
    }

    @keyframes title-glow {
        0% { 
            text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 40px #00ffff, 2px 2px 4px rgba(0, 0, 0, 0.8);
            filter: brightness(1.4);
        }
        100% { 
            text-shadow: 0 0 15px #00ffff, 0 0 30px #00ffff, 0 0 60px #00ffff, 2px 2px 4px rgba(0, 0, 0, 0.8);
            filter: brightness(1.6);
        }
    }

    /* Mobile navigation toggle */
    .mobile-nav-toggle {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 1002;
        background: rgba(0, 0, 0, 0.8);
        border: 2px solid var(--primary-cyan);
        color: var(--primary-cyan);
        font-size: 1.5rem;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
    }

    .mobile-nav-toggle:hover {
        background: rgba(0, 255, 255, 0.2);
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
    }

    /* Contact Section Styles */
    .contact-section {
        padding: 5rem 0;
        background: rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(5px);
    }

    .contact-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
        max-width: 1000px;
        margin: 0 auto;
    }

    .contact-info {
        background: rgba(0, 0, 0, 0.7);
        padding: 2rem;
        border: 1px solid var(--primary-cyan);
        border-radius: 10px;
        backdrop-filter: blur(10px);
    }

    .contact-item {
        display: flex;
        align-items: center;
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: rgba(0, 255, 255, 0.05);
        border-radius: 8px;
        transition: all 0.3s ease;
    }

    .contact-item:hover {
        background: rgba(0, 255, 255, 0.1);
        transform: translateY(-2px);
    }

    .contact-icon {
        font-size: 1.5rem;
        margin-right: 1rem;
        color: var(--primary-orange);
    }

    .contact-details h4 {
        margin: 0 0 0.5rem 0;
        color: var(--primary-cyan);
    }

    .contact-details p {
        margin: 0;
        color: var(--text-light);
    }

    .contact-map {
        background: rgba(0, 0, 0, 0.7);
        border: 1px solid var(--primary-orange);
        border-radius: 10px;
        overflow: hidden;
        backdrop-filter: blur(10px);
    }

    .map-placeholder {
        width: 100%;
        height: 300px;
        background: linear-gradient(45deg, rgba(0, 255, 255, 0.1), rgba(255, 107, 53, 0.1));
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-muted);
        font-size: 1.2rem;
        text-align: center;
    }

    /* Mobile Contact Styles */
    @media (max-width: 768px) {
        .contact-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
        }
    }

    /* ...existing styles... */
`;
document.head.appendChild(style);