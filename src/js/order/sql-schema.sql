CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    project_description TEXT,
    budget DECIMAL(10, 2),
    status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_client_email (client_email)
);

-- 插入測試數據
INSERT INTO orders (client_name, client_email, service_type, project_description, budget) VALUES
('測試客戶', 'test@example.com', 'web-development', '測試項目描述', 5000.00);
