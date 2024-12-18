Chatbot Project

A project to create a conversational AI chatbot using Transformers and PyTorch.

簡介 (Introduction)

本專案旨在使用 Transformers 和 PyTorch 建立一個具備對話功能的人工智慧聊天機器人。

Features (功能)

Trainable model for natural language understanding and response generation

Interactive chatbot interface

Customizable dataset for domain-specific training

使用者可以自訂資料集以進行特定領域的訓練

支援 PyTorch 和 Hugging Face Transformers

Requirements (系統需求)

Python 3.8 或以上版本

必須安裝以下套件：

torch

transformers

datasets

accelerate

Installation (安裝方式)

Clone the repository (複製此儲存庫):

git clone https://github.com/your-repo/chatbot-project.git
cd chatbot-project

Install required packages (安裝必要套件):

pip install -r requirements.txt

Usage (使用方式)

Train the Model (訓練模型)

To train the model on a custom dataset (在自訂資料集上訓練模型):

python app/train.py

Run the Chatbot (運行聊天機器人)

To start the chatbot server (啟動聊天機器人伺服器):

python app/app.py

Access the chatbot interface at http://localhost:5000.

在瀏覽器中打開 http://localhost:5000 以使用聊天機器人介面。

Project Structure (專案結構)

chatbot-project/
│
├── app/
│   ├── app.py             # 主應用程式
│   ├── train.py           # 訓練腳本
│
├── scripts/
│   ├── infer.py           # 推論程式
│   ├── utils.py           # 工具函數
│
├── data/
│   ├── train.json         # 訓練資料集
│   ├── val.json           # 驗證資料集
│
├── models/
│   ├── trained_model.pt   # 儲存的模型權重
│
├── requirements.txt       # 所需的 Python 套件
├── README.md              # 本檔案

Dataset Format (資料集格式)

Training data should be in JSON format with the following structure (訓練資料應為 JSON 格式，結構如下):

[
  {
    "text": "Hello, how are you?",
    "response": "I'm good, thank you!"
  },
  {
    "text": "What is your name?",
    "response": "I am a chatbot."
  }
]

Troubleshooting (疑難排解)

Common Issues (常見問題):

ValueError: The model did not return a loss...

Ensure the model supports training by passing labels during training.

Tokenization Error (標記化錯誤):

Add a pad_token to the tokenizer:

tokenizer.add_special_tokens({'pad_token': '[PAD]'})

License (授權)

This project is licensed under the MIT License. (本專案採用 MIT 授權條款)。

