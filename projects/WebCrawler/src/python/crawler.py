from flask import Flask, request, jsonify
import crawler  # 這裡假設你的爬蟲邏輯在 crawler.py 中

app = Flask(__name__)

@app.route('/api/crawl', methods=['POST'])
def crawl():
    data = request.json
    url = data['url']
    keywords = data['keywords']
    engine = data['engine']
    
    # 在這裡調用你的爬蟲函數
    results = crawler.start_crawl(url, keywords, engine)

    return jsonify({'results': results})

if __name__ == '__main__':
    app.run(debug=True)
