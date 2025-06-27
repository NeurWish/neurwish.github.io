class LanguageSwitcher {
    constructor() {
        this.currentLang = 'zh';
        this.translations = null;
        this.init();
    }

    async init() {
        await this.loadTranslations();
        this.initializeLanguageSwitcher();
        this.loadSavedLanguage();
    }

    async loadTranslations() {
        try {
            const response = await fetch('./src/json/translations.json');
            this.translations = await response.json();
            console.log('語言資料載入成功');
        } catch (error) {
            console.error('載入語言資料失敗:', error);
            // 提供基本的回退翻譯
            this.translations = {
                zh: { "home": "首頁", "services": "服務項目" },
                en: { "home": "Home", "services": "Services" }
            };
        }
    }

    initializeLanguageSwitcher() {
        const langButtons = document.querySelectorAll('.lang-btn-vertical');
        
        langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                if (lang !== this.currentLang) {
                    this.switchLanguage(lang);
                    this.updateButtonStates(langButtons, lang);
                    this.saveLanguagePreference(lang);
                }
            });
        });
    }

    switchLanguage(lang) {
        if (!this.translations || !this.translations[lang]) {
            console.error(`語言 ${lang} 不存在`);
            return;
        }

        this.currentLang = lang;
        this.updatePageContent(lang);
        
        // 觸發語言變更事件
        const event = new CustomEvent('languageChanged', {
            detail: { language: lang, translations: this.translations[lang] }
        });
        document.dispatchEvent(event);
    }

    updatePageContent(lang) {
        const currentTranslations = this.translations[lang];
        
        // 更新所有具有 data-lang 屬性的元素
        const elements = document.querySelectorAll('[data-lang]');
        elements.forEach(element => {
            const key = element.dataset.lang;
            const translation = currentTranslations[key];
            
            if (translation) {
                this.updateElement(element, translation);
            }
        });

        // 更新導航提示文字
        this.updateNavigationTooltips(currentTranslations);
        
        // 更新表單占位符
        this.updateFormPlaceholders(currentTranslations);
    }

    updateElement(element, translation) {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = translation;
        } else if (element.hasAttribute('data-tooltip')) {
            element.setAttribute('data-tooltip', translation);
        } else {
            element.textContent = translation;
        }
    }

    updateNavigationTooltips(translations) {
        const navIcons = document.querySelectorAll('.nav-icon[data-tooltip]');
        navIcons.forEach(icon => {
            const key = icon.dataset.lang;
            const translation = translations[key];
            if (translation) {
                icon.setAttribute('data-tooltip', translation);
            }
        });
    }

    updateFormPlaceholders(translations) {
        // 更新訂單表單
        const formInputs = {
            'clientName': 'client-name',
            'clientEmail': 'client-email', 
            'serviceType': 'service-type',
            'projectDescription': 'project-description',
            'budget': 'budget'
        };

        Object.entries(formInputs).forEach(([inputName, translationKey]) => {
            const input = document.querySelector(`[name="${inputName}"]`);
            if (input && translations[translationKey]) {
                input.placeholder = translations[translationKey];
            }
        });

        // 更新資料庫配置表單
        const configInputs = {
            'mysqlHost': 'mysql-host',
            'mysqlDatabase': 'mysql-database',
            'mysqlUser': 'mysql-user',
            'mysqlPassword': 'mysql-password'
        };

        Object.entries(configInputs).forEach(([inputId, translationKey]) => {
            const input = document.getElementById(inputId);
            if (input && translations[translationKey]) {
                input.placeholder = translations[translationKey];
            }
        });
    }

    updateButtonStates(buttons, activeLang) {
        buttons.forEach(button => {
            button.classList.toggle('active', button.dataset.lang === activeLang);
        });
    }

    saveLanguagePreference(lang) {
        localStorage.setItem('preferred-language', lang);
    }

    loadSavedLanguage() {
        const savedLang = localStorage.getItem('preferred-language');
        if (savedLang && savedLang !== this.currentLang && this.translations[savedLang]) {
            const targetBtn = document.querySelector(`[data-lang="${savedLang}"]`);
            if (targetBtn) {
                targetBtn.click();
            }
        }
    }

    // 公共方法供其他模組使用
    getCurrentLanguage() {
        return this.currentLang;
    }

    getTranslation(key, lang = null) {
        const targetLang = lang || this.currentLang;
        return this.translations && this.translations[targetLang] ? this.translations[targetLang][key] : key;
    }

    getAllTranslations(lang = null) {
        const targetLang = lang || this.currentLang;
        return this.translations && this.translations[targetLang] ? this.translations[targetLang] : {};
    }

    // 動態添加翻譯
    addTranslation(key, translations) {
        if (!this.translations) return;
        
        Object.keys(translations).forEach(lang => {
            if (this.translations[lang]) {
                this.translations[lang][key] = translations[lang];
            }
        });
    }
}

// 創建全域實例
window.languageSwitcher = new LanguageSwitcher();

// 匯出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageSwitcher;
}
