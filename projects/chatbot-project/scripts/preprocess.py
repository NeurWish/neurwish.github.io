import os
import json
from nltk.tokenize import word_tokenize

def preprocess_data(input_path, output_path):
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    processed_data = []
    for conversation in data:
        user_input = word_tokenize(conversation['user'].lower())
        ai_response = word_tokenize(conversation['ai'].lower())
        processed_data.append({'user': user_input, 'ai': ai_response})

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(processed_data, f)

if __name__ == "__main__":
    preprocess_data('data/raw/chat_data.json', 'data/processed/chat_data_processed.json')
