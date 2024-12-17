from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import sys
import os

# 添加 scripts 目錄到模塊路徑
print("Current working directory:", os.getcwd())
print("Scripts directory:", os.path.join(os.path.dirname(__file__), '../scripts'))

sys.path.append(os.path.join(os.path.dirname(__file__), '../scripts'))
print("Updated sys.path:", sys.path)

try:
    from infer import generate_response
    print("Import successful")
except ModuleNotFoundError as e:
    print("Error:", e)

# 創建 Flask 應用程式實例
app = Flask(__name__)
CORS(app)  # 啟用 CORS

# 初始化數據庫
def init_db():
    conn = sqlite3.connect("chat_memory.db")
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_input TEXT,
        ai_response TEXT
    )
    """)
    conn.commit()
    conn.close()

# 存儲對話記錄
def save_to_memory(user_input, ai_response):
    conn = sqlite3.connect("chat_memory.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO chat_memory (user_input, ai_response) VALUES (?, ?)", (user_input, ai_response))
    conn.commit()
    conn.close()

# 檢索對話記錄
def retrieve_from_memory(user_input):
    conn = sqlite3.connect("chat_memory.db")
    cursor = conn.cursor()
    cursor.execute("SELECT ai_response FROM chat_memory WHERE user_input = ?", (user_input,))
    result = cursor.fetchone()
    conn.close()
    return result[0] if result else None

@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json["message"]

    # 先檢查記憶庫
    ai_response = retrieve_from_memory(user_input)
    if not ai_response:
        # 若記憶庫無結果，交由模型生成
        ai_response = generate_response(user_input)
        save_to_memory(user_input, ai_response)

    return jsonify({"response": ai_response})

if __name__ == "__main__":
    init_db()
    app.run(debug=True)
    

