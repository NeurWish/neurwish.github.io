# crawler/saver.py
import os
import pandas as pd
import requests

def save_to_excel_and_download_images(results, excel_path, image_dir):
    # 1. 建資料夾
    os.makedirs(os.path.dirname(excel_path), exist_ok=True)
    os.makedirs(image_dir, exist_ok=True)

    # 2. 輸出 Excel
    df = pd.DataFrame([{
        "ID": item["id"],
        "Title": item["title"],
        "Content": item["content"],
        "Link": item["link"],
        "ImagePath": ""  # 先空
    } for item in results])
    df.to_excel(excel_path, index=False)

    # 3. 下載圖片並更新 results 裡的 image_path
    for item in results:
        url = item.get("image_url")
        if not url:
            # 沒圖片就跳過
            continue
        try:
            resp = requests.get(url, timeout=10)
            resp.raise_for_status()
            # 以 ID 命名檔案
            ext = url.split(".")[-1].split("?")[0][:4]
            fn = f"{item['id']}.{ext}"
            path = os.path.join(image_dir, fn)
            with open(path, "wb") as f:
                f.write(resp.content)
            item["image_path"] = path
        except Exception as e:
            print(f"[Error] 下載圖片失敗 ID={item['id']} URL={url}：{e}")

    # 4. 圖片有下載到，再把路徑寫回 Excel
    #    （可直接重新 overwrite 整張表格，或 append）
    # 這裡簡單再寫一次整張表格
    df2 = pd.DataFrame([{
        "ID": item["id"],
        "Title": item["title"],
        "Content": item["content"],
        "Link": item["link"],
        "ImagePath": item.get("image_path", "")
    } for item in results])
    df2.to_excel(excel_path, index=False)
