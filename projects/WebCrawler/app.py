from flask import Flask, render_template, request, send_file, jsonify, url_for
from flask_cors import CORS
import os
import shutil
import webbrowser
from crawler.fetcher import fetch_pages
from crawler.parser import parse_data
from crawler.saver import save_to_excel_and_download_images

app = Flask(__name__)
CORS(app)  # 允許所有來源

# 確保靜態圖片資料夾存在
static_img_dir = os.path.join(app.static_folder, "images")
os.makedirs(static_img_dir, exist_ok=True)

@app.route("/", methods=["GET"])
def index():
    # 首頁顯示表單
    return render_template("index.html", success=False)

@app.route("/", methods=["POST"])
def crawl_form():
    mode = request.form.get("mode", "generic")
    url = request.form.get("url")
    keyword = request.form.get("keyword", "")
    pages = int(request.form.get("pages", 1))
    print(f"[爬蟲表單] 模式={mode}, URL={url}, 關鍵字={keyword}, 頁數={pages}")

    # 通用與 YouTube 共用解析
    html_pages = fetch_pages(url, keyword, pages)
    results = parse_data(html_pages, url)

    excel_path = os.path.join("output", "results.xlsx")
    image_dir = static_img_dir

    # 清除舊檔案
    if os.path.exists(excel_path):
        os.remove(excel_path)
    if os.path.exists(image_dir):
        shutil.rmtree(image_dir)
    os.makedirs(image_dir, exist_ok=True)

    save_to_excel_and_download_images(results, excel_path, image_dir)
    print(f"[爬蟲表單] 完成，下載 {len(results)} 張, Excel: {excel_path}")

    # 更新 static_url
    for item in results:
        if item.get("image_path"):
            filename = os.path.basename(item["image_path"])
            item["static_url"] = url_for("static", filename=f"images/{filename}")

    return render_template("index.html", results=results, success=True)

@app.route("/api/crawl", methods=["POST"])
def api_crawl():
    data = request.get_json() or {}
    mode = data.get("mode", "generic")
    url = data.get("url")
    keyword = data.get("keyword", "")
    pages = int(data.get("pages", 1))
    print(f"[API] 模式={mode}, URL={url}, 關鍵字={keyword}, 頁數={pages}")

    html_pages = fetch_pages(url, keyword, pages)
    results = parse_data(html_pages, url)

    excel_path = os.path.join("output", "results.xlsx")
    image_dir = static_img_dir

    if os.path.exists(excel_path):
        os.remove(excel_path)
    if os.path.exists(image_dir):
        shutil.rmtree(image_dir)
    os.makedirs(image_dir, exist_ok=True)

    save_to_excel_and_download_images(results, excel_path, image_dir)
    print(f"[API] 完成，下載 {len(results)} 張, Excel: {excel_path}")

    for item in results:
        if item.get("image_path"):
            filename = os.path.basename(item["image_path"])
            item["static_url"] = url_for("static", filename=f"images/{filename}")

    return jsonify({"success": True, "results": results})

@app.route("/download")
def download_excel():
    return send_file("output/results.xlsx", as_attachment=True)

if __name__ == "__main__":
    host = "127.0.0.1"
    port = 5000
    url = f"http://{host}:{port}"
    print(f"即將啟動 Web 爬蟲系統：{url}")
    webbrowser.open(url)
    from waitress import serve
    serve(app, host=host, port=port)
