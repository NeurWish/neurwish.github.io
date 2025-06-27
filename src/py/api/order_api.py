from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.db_manager import DatabaseManager

app = Flask(__name__)
CORS(app)

db_manager = DatabaseManager()

@app.route('/api/orders', methods=['POST'])
def create_order():
    """創建新訂單"""
    try:
        data = request.get_json()
        
        # 驗證必要欄位
        required_fields = ['clientName', 'clientEmail', 'serviceType', 'projectDescription', 'budget']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'缺少必要欄位: {field}'}), 400
        
        # 轉換欄位名稱
        order_data = {
            'client_name': data['clientName'],
            'client_email': data['clientEmail'],
            'service_type': data['serviceType'],
            'project_description': data['projectDescription'],
            'budget': data['budget']
        }
        
        order_id = db_manager.create_order(order_data)
        
        return jsonify({
            'success': True,
            'orderId': order_id,
            'message': '訂單創建成功'
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders', methods=['GET'])
def get_orders():
    """獲取訂單列表"""
    try:
        status = request.args.get('status')
        orders = db_manager.get_orders(status)
        return jsonify(orders), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders/<order_id>', methods=['GET'])
def get_order(order_id):
    """獲取特定訂單"""
    try:
        order = db_manager.get_order_by_id(order_id)
        if order:
            return jsonify(order), 200
        else:
            return jsonify({'error': '訂單不存在'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders/<order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    """更新訂單狀態"""
    try:
        data = request.get_json()
        status = data.get('status')
        
        if not status:
            return jsonify({'error': '缺少狀態參數'}), 400
        
        success = db_manager.update_order_status(order_id, status)
        
        if success:
            return jsonify({'message': '狀態更新成功'}), 200
        else:
            return jsonify({'error': '訂單不存在'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
