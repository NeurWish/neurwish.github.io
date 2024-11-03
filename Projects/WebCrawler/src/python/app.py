from flask import Flask, request, jsonify
from flask_cors import CORS
import crawler  # 假設你的爬蟲邏輯在 crawler.py 中

app = Flask(__name__)
CORS(app)  # 允許跨來源請求

@app.route('/api/crawl', methods=['POST'])
def crawl():
    data = request.json
    url = data.get('url')
    keywords = data.get('keywords')
    engine = data.get('engine')

    if not url or not keywords:
        return jsonify({'error': 'URL 和關鍵字都是必需的'}), 400

    try:
        # 在這裡調用你的爬蟲函數
        results = crawler.start_crawl(url, keywords, engine)
        return jsonify({'results': results})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
