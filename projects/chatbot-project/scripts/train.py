import torch
from torch.utils.data import DataLoader, Dataset
from transformers import GPT2LMHeadModel, GPT2Tokenizer, AdamW

class ChatDataset(Dataset):
    def __init__(self, data_path, tokenizer, max_len=512):
        with open(data_path, 'r') as f:
            self.data = json.load(f)
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        item = self.data[idx]
        input_text = "User: " + " ".join(item['user']) + " AI: " + " ".join(item['ai'])
        inputs = self.tokenizer(input_text, return_tensors="pt", truncation=True, max_length=self.max_len)
        return inputs.input_ids.squeeze(), inputs.attention_mask.squeeze()

def train():
    tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
    model = GPT2LMHeadModel.from_pretrained('gpt2')
    dataset = ChatDataset('data/processed/chat_data_processed.json', tokenizer)
    dataloader = DataLoader(dataset, batch_size=8, shuffle=True)

    optimizer = AdamW(model.parameters(), lr=5e-5)
    model.train()

    for epoch in range(3):
        for batch in dataloader:
            input_ids, attention_mask = batch
            outputs = model(input_ids, attention_mask=attention_mask, labels=input_ids)
            loss = outputs.loss
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            print(f"Epoch: {epoch}, Loss: {loss.item()}")

    model.save_pretrained('models/trained_model.pt')
    tokenizer.save_pretrained('models/')

if __name__ == "__main__":
    train()
