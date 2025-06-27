class BotManager {
    constructor() {
        this.config = null;
        this.botButton = null;
        this.botPanel = null;
        this.isInitialized = false;
        
        this.loadConfig().then(() => {
            this.initialize();
        });
    }

    async loadConfig() {
        try {
            const response = await fetch('./src/json/config.json');
            this.config = await response.json();
        } catch (error) {
            console.error('Failed to load bot config:', error);
            // Fallback config
            this.config = {
                bot: {
                    name: "NMStudio 助理",
                    avatar: "🤖",
                    status: "線上服務中",
                    welcomeMessage: "您好！我是 NMStudio 的 AI 助理。有什麼可以幫助您的嗎？",
                    responses: {
                        default: "抱歉，我暫時無法理解您的問題。請您稍後再試，或直接聯繫我們的客服人員。",
                        greeting: "您好！歡迎來到 NMStudio！",
                        services: "我們提供 AI 技術開發、3D 模型生成、智慧系統整合等服務。",
                        contact: "您可以透過 email 聯繫我們，或填寫官網的聯絡表單。"
                    },
                    keywords: {
                        greeting: ["你好", "嗨", "hello", "hi"],
                        services: ["服務", "產品", "開發"],
                        contact: ["聯繫", "聯絡", "contact"]
                    },
                    typing: {
                        minDelay: 1000,
                        maxDelay: 2000
                    }
                },
                api: {
                    bot: {
                        endpoint: "/api/v1/chat",
                        timeout: 10000,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                },
                ui: {
                    colors: {
                        primary: '#00ffff',
                        secondary: '#ff6b35',
                        background: '#0a0a0a',
                        text: '#ffffff'
                    }
                }
            };
        }
    }

    initialize() {
        if (this.isInitialized) return;
        
        this.createFloatingBot();
        this.setupBotInteractions();
        this.isInitialized = true;
    }

    createFloatingBot() {
        // Create floating bot button
        const botButton = document.createElement('div');
        botButton.className = 'floating-bot';
        botButton.innerHTML = `
            <div class="bot-icon">${this.config.bot.avatar}</div>
            <div class="bot-pulse"></div>
        `;

        // Create bot panel
        const botPanel = document.createElement('div');
        botPanel.className = 'bot-panel';
        botPanel.innerHTML = `
            <div class="bot-header">
                <div class="bot-avatar">${this.config.bot.avatar}</div>
                <div class="bot-info">
                    <h4>${this.config.bot.name}</h4>
                    <span class="bot-status">${this.config.bot.status}</span>
                </div>
                <button class="bot-close">×</button>
            </div>
            <div class="bot-messages">
                <div class="bot-message bot-message-received">
                    <div class="message-content">
                        ${this.config.bot.welcomeMessage}
                    </div>
                    <div class="message-time">${this.getCurrentTime()}</div>
                </div>
            </div>
            <div class="bot-input-area">
                <input type="text" class="bot-input" placeholder="輸入您的問題...">
                <button class="bot-send">發送</button>
            </div>
        `;

        document.body.appendChild(botButton);
        document.body.appendChild(botPanel);

        this.botButton = botButton;
        this.botPanel = botPanel;

        // Add CSS styles dynamically
        this.addBotStyles();
    }

    setupBotInteractions() {
        const botButton = this.botButton;
        const botPanel = this.botPanel;
        const botClose = botPanel.querySelector('.bot-close');
        const botInput = botPanel.querySelector('.bot-input');
        const botSend = botPanel.querySelector('.bot-send');

        // Toggle bot panel
        botButton.addEventListener('click', () => {
            botPanel.classList.toggle('active');
            if (botPanel.classList.contains('active')) {
                botInput.focus();
            }
        });

        // Close bot panel
        botClose.addEventListener('click', () => {
            botPanel.classList.remove('active');
        });

        // Send message
        const sendMessage = () => {
            const message = botInput.value.trim();
            if (message) {
                this.addUserMessage(message);
                botInput.value = '';
                this.handleUserMessage(message);
            }
        };

        botSend.addEventListener('click', sendMessage);
        botInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!botButton.contains(e.target) && !botPanel.contains(e.target)) {
                botPanel.classList.remove('active');
            }
        });
    }

    addUserMessage(message) {
        const messagesContainer = this.botPanel.querySelector('.bot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'bot-message bot-message-sent';
        messageDiv.innerHTML = `
            <div class="message-content">${this.escapeHtml(message)}</div>
            <div class="message-time">${this.getCurrentTime()}</div>
        `;
        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    async handleUserMessage(userMessage) {
        this.showTypingIndicator();
        
        try {
            // Try API first if configured
            if (this.config.api && this.config.api.bot && this.config.api.bot.endpoint) {
                const response = await this.callBotAPI(userMessage);
                this.hideTypingIndicator();
                
                // 正確解析 API 回應格式
                let botMessage = '';
                if (response.success && response.data && response.data.response) {
                    botMessage = response.data.response;
                } else if (response.message) {
                    botMessage = response.message;
                } else if (typeof response === 'string') {
                    botMessage = response;
                } else {
                    console.warn('未預期的 API 回應格式:', response);
                    botMessage = this.generateLocalResponse(userMessage);
                }
                
                this.addBotMessage(botMessage);
            } else {
                // Fallback to local responses
                const response = this.generateLocalResponse(userMessage);
                setTimeout(() => {
                    this.hideTypingIndicator();
                    this.addBotMessage(response);
                }, this.getRandomDelay());
            }
        } catch (error) {
            console.error('Bot API error:', error);
            // Fallback to local response
            const response = this.generateLocalResponse(userMessage);
            setTimeout(() => {
                this.hideTypingIndicator();
                this.addBotMessage(response);
            }, this.getRandomDelay());
        }
    }

    showTypingIndicator() {
        const messagesContainer = this.botPanel.querySelector('.bot-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'bot-message bot-message-received typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = this.botPanel.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    addBotMessage(message) {
        const messagesContainer = this.botPanel.querySelector('.bot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'bot-message bot-message-received';
        messageDiv.innerHTML = `
            <div class="message-content">${message}</div>
            <div class="message-time">${this.getCurrentTime()}</div>
        `;
        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    generateLocalResponse(userMessage) {
        const message = userMessage.toLowerCase();
        const responses = this.config.bot.responses;
        const keywords = this.config.bot.keywords;

        // Check for keywords and return appropriate response
        for (const [category, categoryKeywords] of Object.entries(keywords)) {
            if (categoryKeywords.some(keyword => message.includes(keyword))) {
                return responses[category] || responses.default;
            }
        }

        return responses.default;
    }

    async callBotAPI(message) {
        const apiConfig = this.config.api.bot;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout || 10000);

        try {
            console.log('發送 API 請求:', { message, context: 'nmstudio_website' });
            
            const response = await fetch(apiConfig.endpoint, {
                method: 'POST',
                headers: apiConfig.headers || {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    message: message,
                    context: 'nmstudio_website'
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const jsonResponse = await response.json();
            console.log('收到 API 回應:', jsonResponse);
            
            return jsonResponse;
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('API 呼叫失敗:', error);
            throw error;
        }
    }

    getCurrentTime() {
        return new Date().toLocaleTimeString('zh-TW', {
            hour: '2-digit', 
            minute: '2-digit'
        });
    }

    getRandomDelay() {
        const config = this.config.bot.typing;
        return Math.random() * (config.maxDelay - config.minDelay) + config.minDelay;
    }

    scrollToBottom() {
        const messagesContainer = this.botPanel.querySelector('.bot-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    addBotStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Floating Bot Styles */
            .floating-bot {
                position: fixed;
                bottom: 2rem;
                left: 2rem;
                width: 60px;
                height: 60px;
                background: linear-gradient(45deg, ${this.config.ui?.colors?.primary || '#00ffff'}, ${this.config.ui?.colors?.secondary || '#ff6b35'});
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                transition: all 0.3s ease;
                box-shadow: 0 4px 20px rgba(0, 255, 255, 0.3);
                animation: bot-float 3s ease-in-out infinite;
            }

            .floating-bot:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 30px rgba(0, 255, 255, 0.5);
            }

            .bot-icon {
                font-size: 1.8rem;
                animation: bot-bounce 2s ease-in-out infinite;
            }

            .bot-pulse {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: rgba(0, 255, 255, 0.3);
                animation: bot-pulse 2s ease-in-out infinite;
            }

            @keyframes bot-float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }

            @keyframes bot-bounce {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            @keyframes bot-pulse {
                0% { transform: scale(1); opacity: 0.7; }
                100% { transform: scale(1.4); opacity: 0; }
            }

            /* Bot Panel Styles */
            .bot-panel {
                position: fixed;
                bottom: 2rem;
                left: calc(2rem + 80px);
                width: 350px;
                height: 500px;
                background: rgba(0, 0, 0, 0.95);
                border: 2px solid ${this.config.ui?.colors?.primary || '#00ffff'};
                border-radius: 15px;
                backdrop-filter: blur(20px);
                box-shadow: 0 10px 40px rgba(0, 255, 255, 0.3);
                z-index: 999;
                transform: translateX(-400px) scale(0.8);
                opacity: 0;
                transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                display: flex;
                flex-direction: column;
            }

            .bot-panel.active {
                transform: translateX(0) scale(1);
                opacity: 1;
            }

            .bot-header {
                display: flex;
                align-items: center;
                padding: 1rem;
                border-bottom: 1px solid rgba(0, 255, 255, 0.3);
                background: linear-gradient(90deg, rgba(0, 255, 255, 0.1), rgba(255, 107, 53, 0.1));
            }

            .bot-avatar {
                font-size: 2rem;
                margin-right: 0.8rem;
            }

            .bot-info h4 {
                margin: 0;
                color: ${this.config.ui?.colors?.primary || '#00ffff'};
                font-size: 1.1rem;
            }

            .bot-status {
                font-size: 0.8rem;
                color: #00ff41;
            }

            .bot-close {
                margin-left: auto;
                background: none;
                border: none;
                color: #888888;
                font-size: 1.5rem;
                cursor: pointer;
                transition: color 0.3s ease;
            }

            .bot-close:hover {
                color: ${this.config.ui?.colors?.secondary || '#ff6b35'};
            }

            .bot-messages {
                flex: 1;
                padding: 1rem;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 0.8rem;
            }

            .bot-message {
                max-width: 80%;
                word-wrap: break-word;
            }

            .bot-message-received {
                align-self: flex-start;
            }

            .bot-message-sent {
                align-self: flex-end;
            }

            .message-content {
                padding: 0.8rem 1rem;
                border-radius: 15px;
                font-size: 0.9rem;
                line-height: 1.4;
            }

            .bot-message-received .message-content {
                background: rgba(0, 255, 255, 0.1);
                border: 1px solid rgba(0, 255, 255, 0.3);
                color: ${this.config.ui?.colors?.text || '#ffffff'};
            }

            .bot-message-sent .message-content {
                background: rgba(255, 107, 53, 0.1);
                border: 1px solid rgba(255, 107, 53, 0.3);
                color: ${this.config.ui?.colors?.text || '#ffffff'};
            }

            .message-time {
                font-size: 0.7rem;
                color: #888888;
                margin-top: 0.3rem;
                text-align: right;
            }

            .bot-message-received .message-time {
                text-align: left;
            }

            .typing-dots {
                display: flex;
                align-items: center;
                gap: 0.3rem;
            }

            .typing-dots span {
                width: 6px;
                height: 6px;
                background: ${this.config.ui?.colors?.primary || '#00ffff'};
                border-radius: 50%;
                animation: typing 1.4s ease-in-out infinite;
            }

            .typing-dots span:nth-child(2) {
                animation-delay: 0.2s;
            }

            .typing-dots span:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                30% { transform: translateY(-10px); opacity: 1; }
            }

            .bot-input-area {
                display: flex;
                padding: 1rem;
                border-top: 1px solid rgba(0, 255, 255, 0.3);
                gap: 0.5rem;
            }

            .bot-input {
                flex: 1;
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(0, 255, 255, 0.3);
                border-radius: 20px;
                padding: 0.8rem 1rem;
                color: ${this.config.ui?.colors?.text || '#ffffff'};
                font-family: 'Orbitron', monospace;
                font-size: 0.9rem;
                outline: none;
                transition: border-color 0.3s ease;
            }

            .bot-input:focus {
                border-color: ${this.config.ui?.colors?.primary || '#00ffff'};
                box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
            }

            .bot-send {
                background: linear-gradient(45deg, ${this.config.ui?.colors?.primary || '#00ffff'}, ${this.config.ui?.colors?.secondary || '#ff6b35'});
                border: none;
                border-radius: 20px;
                padding: 0.8rem 1.2rem;
                color: ${this.config.ui?.colors?.background || '#0a0a0a'};
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: 'Orbitron', monospace;
            }

            .bot-send:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 15px rgba(0, 255, 255, 0.4);
            }

            /* Mobile Bot Styles */
            @media (max-width: 768px) {
                .floating-bot {
                    width: 50px;
                    height: 50px;
                    bottom: 1rem;
                    left: 1rem;
                }

                .bot-icon {
                    font-size: 1.5rem;
                }

                .bot-panel {
                    left: 1rem;
                    right: 1rem;
                    width: auto;
                    bottom: calc(1rem + 70px);
                    height: 400px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BotManager();
});
