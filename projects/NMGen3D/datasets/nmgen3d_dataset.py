import os
import numpy as np
from PIL import Image
import tensorflow as tf

class NMGen3DDataset(tf.keras.utils.Sequence):
    def __init__(self, root_dir, batch_size=8, image_size=(256, 256), transform=None):
        self.root_dir = root_dir
        self.batch_size = batch_size
        self.image_size = image_size
        self.transform = transform
        self.image_paths = [os.path.join(root_dir, f) for f in os.listdir(root_dir) if f.endswith('.png')]  # 假設使用 .png 圖片

    def __len__(self):
        return int(np.floor(len(self.image_paths) / self.batch_size))

    def __getitem__(self, idx):
        batch_paths = self.image_paths[idx * self.batch_size:(idx + 1) * self.batch_size]
        images = []
        targets = []

        for image_path in batch_paths:
            image = Image.open(image_path).convert("RGB")  # 假設是 RGB 圖片
            image = image.resize(self.image_size)  # 調整圖像大小

            # 這裡假設目標是某種 3D 模型，這裡的 target 可以根據你的資料來處理
            target = np.array(image)  # 假設目標與輸入圖像相同

            # 如果有 transform，則應用
            if self.transform:
                image = self.transform(image)

            # 將圖片和目標轉為 TensorFlow 的格式
            images.append(image)
            targets.append(target)

        return np.array(images), np.array(targets)

    def on_epoch_end(self):
        # 可以在每個 epoch 結束時進行一些操作，例如打亂資料集
        pass
