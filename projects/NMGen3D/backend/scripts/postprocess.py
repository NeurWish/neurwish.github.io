import cv2
import numpy as np
import tensorflow as tf

def preprocess_image(image_path):
    """載入圖片並轉換為 AI 可讀的格式（適用 TensorFlow）"""
    image = cv2.imread(image_path)  # 讀取圖片
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)  # 轉換為 RGB
    image = cv2.resize(image, (256, 256))  # 調整大小

    # 轉換為 TensorFlow 張量格式
    image = np.array(image, dtype=np.float32) / 255.0  # 正規化到 [0,1]
    image = (image - 0.5) / 0.5  # 標準化到 [-1,1]（對應 PyTorch 的 Normalize）
    
    image_tensor = tf.convert_to_tensor(image, dtype=tf.float32)
    image_tensor = tf.expand_dims(image_tensor, axis=0)  # 增加 batch 維度

    return image_tensor  # 返回 AI 可用的 TensorFlow 張量
