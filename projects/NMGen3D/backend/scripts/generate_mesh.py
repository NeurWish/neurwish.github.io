import tensorflow as tf
from utils.model3d_loader import load_model, generate_mesh
from PIL import Image
import numpy as np
import trimesh

MODEL_PATH = "backend/models/nmgen3d.h5"  # 假設你的模型是 .h5 格式

# 加載 AI 模型
model = tf.keras.models.load_model(MODEL_PATH)

def generate_3d_mesh(image_path, output_path):
    image = load_image(image_path)  # 讀取圖片
    image_tensor = preprocess_image(image)  # 預處理圖片
    mesh = generate_mesh_from_model(model, image_tensor)  # AI 生成 3D 模型

    # 將生成的 3D 模型轉換為 Trimesh 格式
    mesh_obj = trimesh.Trimesh(vertices=mesh['vertices'], faces=mesh['faces'])
    mesh_obj.export(output_path)  # 儲存 3D 檔案
    return output_path

def load_image(image_path):
    image = Image.open(image_path).convert("RGB")
    return image

def preprocess_image(image):
    # 預處理圖片以符合模型的需求，這裡可以根據需要進行調整
    image = np.array(image)  # 將圖片轉換為 numpy 陣列
    image = image / 255.0  # 標準化圖像數據
    image_tensor = tf.convert_to_tensor(image, dtype=tf.float32)  # 轉換為 tensor
    image_tensor = tf.expand_dims(image_tensor, axis=0)  # 增加 batch 維度
    return image_tensor

def generate_mesh_from_model(model, image_tensor):
    # 使用你的 AI 模型生成 3D 資料
    prediction = model(image_tensor)  # 假設模型會輸出 3D 顯示（例如：vertices 和 faces）
    return {
        'vertices': prediction['vertices'].numpy(),  # 假設這些是 numpy 格式
        'faces': prediction['faces'].numpy()
    }
