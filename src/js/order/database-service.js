class DatabaseService {
    constructor() {
        this.config = null;
        this.dbType = null;
        this.loadConfig();
    }

    async loadConfig() {
        try {
            const response = await fetch('/src/json/config.json');
            this.config = await response.json();
            
            // 檢查是否有 MySQL 帳號資料
            const mysqlUser = this.config.database.mysql.user;
            const mysqlPassword = this.config.database.mysql.password;
            
            if (mysqlUser && mysqlPassword) {
                this.dbType = 'mysql';
                console.log('使用 MySQL 資料庫');
            } else {
                this.dbType = 'sqlite';
                console.log('使用 SQLite 資料庫');
            }
        } catch (error) {
            console.error('載入配置檔案失敗:', error);
            this.dbType = 'sqlite'; // 預設使用 SQLite
        }
    }

    async executeQuery(query, params = []) {
        if (!this.config) {
            await this.loadConfig();
        }

        try {
            const response = await fetch('/api/database/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    dbType: this.dbType,
                    config: this.config.database[this.dbType],
                    query: query,
                    params: params
                })
            });

            if (!response.ok) {
                throw new Error('SQL 查詢執行失敗');
            }

            return await response.json();
        } catch (error) {
            console.error('資料庫錯誤:', error);
            // 如果資料庫連接失敗，則使用本地 JSON 儲存
            return await this.fallbackToJsonStorage(query, params);
        }
    }

    async fallbackToJsonStorage(query, params) {
        console.log('資料庫連接失敗，改用本地 JSON 儲存');
        
        // 解析 SQL 查詢類型
        if (query.toLowerCase().startsWith('insert')) {
            return await this.saveToJsonFile(params);
        }
        
        return { success: false, message: '本地儲存僅支援插入操作' };
    }

    async saveToJsonFile(orderData) {
        try {
            const orderId = Date.now().toString();
            const orderWithId = {
                id: orderId,
                ...orderData,
                savedAt: new Date().toISOString(),
                storageType: 'json'
            };

            // 儲存到 data/order 目錄
            const response = await fetch('/api/save-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId: orderId,
                    orderData: orderWithId,
                    path: this.config.orderStorage.jsonPath
                })
            });

            if (!response.ok) {
                throw new Error('JSON 檔案儲存失敗');
            }

            return {
                insertId: orderId,
                success: true,
                storageType: 'json'
            };
        } catch (error) {
            console.error('JSON 儲存錯誤:', error);
            throw error;
        }
    }

    async insertOrder(orderData) {
        const query = `
            INSERT INTO orders (
                client_name, client_email, service_type, 
                project_description, budget, created_at, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            orderData.clientName,
            orderData.clientEmail,
            orderData.serviceType,
            orderData.projectDescription,
            orderData.budget,
            orderData.createdAt,
            orderData.status
        ];

        const result = await this.executeQuery(query, params);
        return {
            orderId: result.insertId,
            success: true,
            storageType: result.storageType || this.dbType
        };
    }

    async getOrderById(orderId) {
        const query = 'SELECT * FROM orders WHERE id = ?';
        const result = await this.executeQuery(query, [orderId]);
        return result.rows[0];
    }

    async updateOrderStatus(orderId, status) {
        const query = 'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        return await this.executeQuery(query, [status, orderId]);
    }

    async getOrdersByStatus(status) {
        const query = 'SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC';
        const result = await this.executeQuery(query, [status]);
        return result.rows;
    }
}
