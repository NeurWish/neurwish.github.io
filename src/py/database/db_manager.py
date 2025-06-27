import sqlite3
import json
from datetime import datetime
from typing import Dict, List, Optional
import uuid

class DatabaseManager:
    def __init__(self, db_path: str = "nmstudio.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """初始化資料庫表格"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 創建訂單表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                client_name TEXT NOT NULL,
                client_email TEXT NOT NULL,
                service_type TEXT NOT NULL,
                project_description TEXT NOT NULL,
                budget TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        ''')
        
        # 創建客戶表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS clients (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                phone TEXT,
                company TEXT,
                created_at TEXT NOT NULL
            )
        ''')
        
        # 創建專案表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                order_id TEXT,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'planning',
                start_date TEXT,
                end_date TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders (id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def create_order(self, order_data: Dict) -> str:
        """創建新訂單"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        order_id = str(uuid.uuid4())
        current_time = datetime.now().isoformat()
        
        cursor.execute('''
            INSERT INTO orders (
                id, client_name, client_email, service_type, 
                project_description, budget, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            order_id,
            order_data['client_name'],
            order_data['client_email'],
            order_data['service_type'],
            order_data['project_description'],
            order_data['budget'],
            current_time,
            current_time
        ))
        
        conn.commit()
        conn.close()
        return order_id
    
    def get_orders(self, status: Optional[str] = None) -> List[Dict]:
        """獲取訂單列表"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if status:
            cursor.execute('SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC', (status,))
        else:
            cursor.execute('SELECT * FROM orders ORDER BY created_at DESC')
        
        columns = [description[0] for description in cursor.description]
        orders = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        conn.close()
        return orders
    
    def update_order_status(self, order_id: str, status: str) -> bool:
        """更新訂單狀態"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE orders 
            SET status = ?, updated_at = ? 
            WHERE id = ?
        ''', (status, datetime.now().isoformat(), order_id))
        
        success = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return success
    
    def get_order_by_id(self, order_id: str) -> Optional[Dict]:
        """根據ID獲取訂單"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM orders WHERE id = ?', (order_id,))
        row = cursor.fetchone()
        
        if row:
            columns = [description[0] for description in cursor.description]
            order = dict(zip(columns, row))
            conn.close()
            return order
        
        conn.close()
        return None
