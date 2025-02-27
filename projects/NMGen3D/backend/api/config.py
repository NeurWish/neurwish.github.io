import os
import tensorflow as tf

class Config:
    # 預設配置
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    MODEL_PATH = os.path.join(BASE_DIR, 'backend/models/nmgen3d.h5')  # 修改為 TensorFlow 模型文件格式（.h5 或 .savedmodel）
    OUTPUT_PATH = os.path.join(BASE_DIR, 'outputs/')
    LOG_PATH = os.path.join(BASE_DIR, 'logs/')
    DATASET_PATH = os.path.join(BASE_DIR, 'datasets/')

    # 設定可選參數（如 API 密鑰）
    # GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY', 'your_google_api_key')
    # OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', 'your_openai_api_key')

    # AI 參數
    BATCH_SIZE = 8
    LEARNING_RATE = 0.0001
    EPOCHS = 100

    # 模型加載設置
    DEVICE = "/GPU:0" if tf.config.list_physical_devices('GPU') else "/CPU:0"  # 設置為 TensorFlow 設備

class DevelopmentConfig(Config):
    DEBUG = True
    # 你可以在開發環境中設置其他特定的參數

class ProductionConfig(Config):
    DEBUG = False
    # 產品環境下的一些配置
