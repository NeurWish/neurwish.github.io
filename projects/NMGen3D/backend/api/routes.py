from flask import Flask, request, jsonify
import os
from utils import generate_3d_mesh

app = Flask(__name__)

@app.route('/generate_3d', methods=['POST'])
def generate_3d():
    print("🚀 收到請求, Headers:", request.headers)
    print("📂 Files:", request.files)

    if 'image' not in request.files:
        print("❌ 錯誤: 沒有上傳圖片")
        return jsonify({"error": "No image file provided"}), 400

    image = request.files['image']
    
    if image.filename == '':
        print("❌ 錯誤: 沒有選擇圖片")
        return jsonify({"error": "No selected file"}), 400

    os.makedirs('inputs', exist_ok=True)  # 確保目錄存在
    
    image_path = os.path.join('inputs', image.filename)
    image.save(image_path)

    output_path = os.path.join('outputs', 'generated_model.obj')

    try:
        print("🛠️ 生成 3D 模型中...")
        generate_3d_mesh(image_path, output_path)
        print("🎉 3D 模型生成完成")
    except Exception as e:
        print("❌ 3D 生成失敗:", str(e))
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": "3D model generated successfully", "model_path": output_path}), 200

if __name__ == '__main__':
    app.run(debug=True)
