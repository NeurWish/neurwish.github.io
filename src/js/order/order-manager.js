class OrderManager {
    constructor() {
        this.configManager = new ConfigManager();
        this.dbService = new DatabaseService();
        this.initializeEventListeners();
        this.checkDatabaseConfig();
    }

    async checkDatabaseConfig() {
        await this.configManager.loadConfig();
        
        if (!this.configManager.hasMySQLCredentials()) {
            console.log('未設定 MySQL 帳號，將使用 SQLite 模式');
            
            // 顯示配置選項（可選）
            const showConfigOption = confirm('是否要設定 MySQL 資料庫帳號？\n點擊「確定」設定 MySQL，點擊「取消」使用 SQLite');
            if (showConfigOption) {
                this.configManager.showConfigForm();
            }
        }
    }

    initializeEventListeners() {
        const orderForm = document.getElementById('orderForm');
        if (orderForm) {
            orderForm.addEventListener('submit', this.handleOrderSubmit.bind(this));
        }
    }

    async handleOrderSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const orderData = {
            clientName: formData.get('clientName'),
            clientEmail: formData.get('clientEmail'),
            serviceType: formData.get('serviceType'),
            projectDescription: formData.get('projectDescription'),
            budget: formData.get('budget'),
            createdAt: new Date().toISOString(),
            status: 'pending'
        };

        try {
            const response = await this.dbService.insertOrder(orderData);
            this.showOrderSuccess(response.orderId);
            event.target.reset();
        } catch (error) {
            this.showOrderError(error.message);
        }
    }

    async getOrderStatus(orderId) {
        try {
            const order = await this.dbService.getOrderById(orderId);
            return order ? order.status : null;
        } catch (error) {
            console.error('獲取訂單狀態失敗:', error);
            return null;
        }
    }

    async updateOrderStatus(orderId, newStatus) {
        try {
            await this.dbService.updateOrderStatus(orderId, newStatus);
            return true;
        } catch (error) {
            console.error('更新訂單狀態失敗:', error);
            return false;
        }
    }

    showOrderSuccess(orderId) {
        const orderContainer = document.querySelector('.order-container');
        const successMessage = document.createElement('div');
        successMessage.className = 'order-success';
        successMessage.innerHTML = `
            <h3>訂單提交成功！</h3>
            <p>訂單編號: ${orderId}</p>
            <p>儲存方式: ${this.dbService.dbType === 'mysql' ? 'MySQL 資料庫' : 'SQLite 資料庫'}</p>
            <p>我們將在 24 小時內與您聯繫，感謝您選擇 NMStudio！</p>
        `;
        
        // Remove existing messages
        this.removeMessages();
        orderContainer.appendChild(successMessage);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            successMessage.remove();
        }, 5000);
    }

    showOrderError(message) {
        const orderContainer = document.querySelector('.order-container');
        const errorMessage = document.createElement('div');
        errorMessage.className = 'order-error';
        errorMessage.innerHTML = `
            <h3>提交失敗</h3>
            <p>${message}</p>
        `;
        
        // Remove existing messages
        this.removeMessages();
        orderContainer.appendChild(errorMessage);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            errorMessage.remove();
        }, 5000);
    }

    removeMessages() {
        const existingMessages = document.querySelectorAll('.order-success, .order-error');
        existingMessages.forEach(msg => msg.remove());
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OrderManager();
});
