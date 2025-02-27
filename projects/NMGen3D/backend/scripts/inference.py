import tensorflow as tf
from utils.model3d_loader import load_model, generate_mesh

MODEL_PATH = "backend/models/nmgen3d.h5"  # 假設你的模型是 .h5 格式

# 加載 AI 模型
model = tf.keras.models.load_model(MODEL_PATH)

# 嘗試使用 GPU（如果可用）
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
        print("成功使用 GPU")
    except RuntimeError as e:
        print(e)
else:
    print("未偵測到 GPU，將使用 CPU")

def generate_3d_mesh(image_path, output_path):
    image = load_image(image_path)  # 讀取圖片
    mesh = generate_mesh(model, image)  # AI 生成 3D 模型
    mesh.save(output_path)  # 儲存 3D 檔案
    return output_path

def load_image(image_path):
    """ 加載圖片（如果需要額外的預處理，請在這裡添加） """
    image = tf.io.read_file(image_path)
    image = tf.image.decode_image(image, channels=3)
    image = tf.image.convert_image_dtype(image, tf.float32)  # 標準化
    image = tf.expand_dims(image, axis=0)  # 增加 batch 維度
    return image
