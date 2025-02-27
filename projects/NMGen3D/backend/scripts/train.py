import tensorflow as tf
from tensorflow import keras
from tensorflow.python.keras import layers, optimizers, losses
import numpy as np
from datasets.nmgen3d_dataset import NMGen3DDataset
from models.unet3d import UNet3D  # 假設你有 TensorFlow 版本的 UNet3D

# 參數設定
EPOCHS = 100
BATCH_SIZE = 8
LEARNING_RATE = 0.0001

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

# 1. 載入數據集
dataset = NMGen3DDataset("datasets/train/")  # 這個類別需要適應 TensorFlow
train_dataset = tf.data.Dataset.from_generator(
    dataset.generator,  # 需要確保 dataset 有 generator() 方法
    output_signature=(
        tf.TensorSpec(shape=(256, 256, 3), dtype=tf.float32),  # 圖片尺寸
        tf.TensorSpec(shape=(256, 256, 3), dtype=tf.float32)   # 目標 3D 影像
    )
).batch(BATCH_SIZE).shuffle(1000)

# 2. 初始化模型
model = UNet3D()  # 假設 UNet3D 是用 TensorFlow/Keras 來寫的
model.compile(
    optimizer=optimizers.Adam(learning_rate=LEARNING_RATE),
    loss=losses.MeanSquaredError()  # PyTorch `nn.MSELoss()` 對應 TensorFlow `MeanSquaredError()`
)

# 3. 訓練模型
model.fit(train_dataset, epochs=EPOCHS)

# 4. 儲存訓練後的模型
model.save("backend/models/nmgen3d.h5")  # TensorFlow 通常儲存為 .h5 或 .pb
print("訓練完成，模型已儲存！")
