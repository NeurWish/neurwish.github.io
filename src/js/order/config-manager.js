class ConfigManager {
    constructor() {
        this.configPath = '/src/json/config.json';
        this.loadConfig();
    }

    async loadConfig() {
        try {
            const response = await fetch(this.configPath);
            this.config = await response.json();
            return this.config;
        } catch (error) {
            console.error('載入配置失敗:', error);
            return null;
        }
    }

    async updateMySQLCredentials(user, password, host = 'localhost', database = 'neurwish_orders') {
        try {
            this.config.database.mysql = {
                host: host,
                port: 3306,
                database: database,
                user: user,
                password: password
            };

            const response = await fetch('/api/update-config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.config)
            });

            if (!response.ok) {
                throw new Error('更新配置失敗');
            }

            console.log('MySQL 帳號資料已更新');
            return true;
        } catch (error) {
            console.error('更新 MySQL 帳號失敗:', error);
            return false;
        }
    }

    getMySQLCredentials() {
        return this.config?.database?.mysql || null;
    }

    hasMySQLCredentials() {
        const mysql = this.config?.database?.mysql;
        return mysql && mysql.user && mysql.password;
    }

    showConfigForm() {
        const configForm = document.createElement('div');
        configForm.id = 'configForm';
        configForm.className = 'config-form';
        configForm.innerHTML = `
            <div class="config-overlay">
                <div class="config-modal">
                    <h3>資料庫設定</h3>
                    <form id="mysqlConfigForm">
                        <div class="form-group">
                            <label for="mysqlHost">主機位址:</label>
                            <input type="text" id="mysqlHost" value="localhost" required>
                        </div>
                        <div class="form-group">
                            <label for="mysqlDatabase">資料庫名稱:</label>
                            <input type="text" id="mysqlDatabase" value="neurwish_orders" required>
                        </div>
                        <div class="form-group">
                            <label for="mysqlUser">使用者名稱:</label>
                            <input type="text" id="mysqlUser" required>
                        </div>
                        <div class="form-group">
                            <label for="mysqlPassword">密碼:</label>
                            <input type="password" id="mysqlPassword" required>
                        </div>
                        <div class="form-buttons">
                            <button type="submit">儲存設定</button>
                            <button type="button" id="skipConfig">跳過（使用 SQLite）</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(configForm);

        // 綁定事件
        document.getElementById('mysqlConfigForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const host = document.getElementById('mysqlHost').value;
            const database = document.getElementById('mysqlDatabase').value;
            const user = document.getElementById('mysqlUser').value;
            const password = document.getElementById('mysqlPassword').value;

            const success = await this.updateMySQLCredentials(user, password, host, database);
            if (success) {
                configForm.remove();
                location.reload(); // 重新載入頁面以應用新設定
            } else {
                alert('設定儲存失敗，請重試');
            }
        });

        document.getElementById('skipConfig').addEventListener('click', () => {
            configForm.remove();
        });
    }
}
