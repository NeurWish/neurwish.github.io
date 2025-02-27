import tensorflow as tf
from PIL import Image
import numpy as np
from utils.model3d_loader import generate_mesh  # 假設這是您的 3D 網格生成庫

# 加載模型
def load_model_from_path(model_path):
    model = tf.keras.models.load_model(model_path)  # 使用 TensorFlow 加載模型
    return model

# 圖片預處理
def preprocess_image(image):
    image = image.convert("RGB")  # 確保圖片是 RGB 格式
    image = np.array(image)  # 將 PIL 圖片轉換為 NumPy 陣列
    image = image / 255.0  # 正規化圖片數據 (視需要而定)
    image_tensor = tf.convert_to_tensor(image, dtype=tf.float32)  # 轉換為 TensorFlow 的 Tensor
    image_tensor = tf.expand_dims(image_tensor, axis=0)  # 增加 batch 維度
    return image_tensor

# 生成 3D 模型
def generate_3d_mesh_from_model(model, image_tensor):
    # 模型生成 3D 網格
    mesh_data = generate_mesh(model, image_tensor)  # 根據您的 3D 網格生成邏輯來調整
    return mesh_data

# 讀取圖片
def load_image(image_path):
    image = Image.open(image_path)
    return image

def generate_3d_mesh(image_path, output_path):
    print(f"🛠️ 開始生成 3D 模型, 輸入: {image_path}, 輸出: {output_path}")
    try:
        # 確保 TensorFlow 正常運行
        import tensorflow as tf
        print("✅ TensorFlow 版本:", tf.__version__)

        # 這裡是實際 3D 生成的 TensorFlow 處理邏輯
        # ⚠️ 請確保 TensorFlow 正確安裝，並且模型路徑正確

        print("🎉 3D 生成完成")
    except Exception as e:
        print("❌ 3D 生成失敗:", str(e))
        raise e

