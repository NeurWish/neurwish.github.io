import torch
from transformers import GPT2LMHeadModel, GPT2Tokenizer, Trainer, TrainingArguments
from datasets import Dataset

# 假設 train_data 是一個文本列表，每個元素是一個字符串（即一行文本）
train_data = ["這是第一段文本", "這是第二段文本", "這是第三段文本"]

# 初始化 GPT2 分詞器
tokenizer = GPT2Tokenizer.from_pretrained("gpt2")

# 方法 1：使用 eos_token 作為 pad_token
tokenizer.pad_token = tokenizer.eos_token

# 或者方法 2：添加 [PAD] token
# tokenizer.add_special_tokens({'pad_token': '[PAD]'})

# 將文本轉換為 Dataset 格式
def encode_data(examples):
    return tokenizer(examples['text'], padding="max_length", truncation=True, max_length=512)

# 將列表轉換為 Dataset 物件
train_dataset = Dataset.from_dict({"text": train_data})

# 使用 map 函數對所有數據進行編碼
train_dataset = train_dataset.map(encode_data, batched=True)

# 設定 GPT2 模型
model = GPT2LMHeadModel.from_pretrained("gpt2")

# 訓練參數設定
training_args = TrainingArguments(
    output_dir='./results',                # 儲存結果
    num_train_epochs=3,                    # 訓練輪數
    per_device_train_batch_size=4,         # 訓練批次大小
    save_steps=10_000,                     # 儲存步驟
    save_total_limit=2,                    # 最多儲存2個檢查點
)

# 訓練過程的 Trainer 物件
trainer = Trainer(
    model=model,                           # 使用的模型
    args=training_args,                    # 訓練的參數設定
    train_dataset=train_dataset,           # 訓練數據集
)

# 開始訓練
trainer.train()

# 儲存模型
model.save_pretrained('./models/trained_model')
print("訓練完成，模型已保存！")

# 加載儲存的模型
model = GPT2LMHeadModel.from_pretrained('./models/trained_model')
print("自訓練模型已加載！")

# 測試生成一段文本
input_text = "這是一個測試文本"
input_ids = tokenizer.encode(input_text, return_tensors='pt')

# 使用模型生成文本
generated_output = model.generate(input_ids, max_length=50, num_return_sequences=1, no_repeat_ngram_size=2)

# 解碼生成的文本
generated_text = tokenizer.decode(generated_output[0], skip_special_tokens=True)
print(f"生成的文本: {generated_text}")
