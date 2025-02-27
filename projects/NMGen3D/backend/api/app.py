import os
import uvicorn
import uuid
from flask import Flask
from flask_cors import CORS
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from nerf.run_nerf import main as generate_nerf_3d  # 確保 `run_nerf.py` 內有 `generate_nerf_3d()` 可執行

app = FastAPI()

# 啟用 CORS，允許前端存取 API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允許所有來源 (可改為指定的前端網址)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 設定輸出資料夾
INPUT_DIR = "inputs/"
OUTPUT_DIR = "outputs/"
os.makedirs(INPUT_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.post("/generate_3d/")
async def generate_3d(file: UploadFile = File(...)):
    """ 使用 NeRF 生成 3D 模型 """
    try:
        # 產生唯一檔名
        file_extension = os.path.splitext(file.filename)[-1].lower()
        unique_filename = f"{uuid.uuid4().hex}{file_extension}"
        input_path = os.path.join(INPUT_DIR, unique_filename)
        output_path = os.path.join(OUTPUT_DIR, unique_filename.replace(file_extension, ".obj"))

        # 儲存上傳的圖片
        with open(input_path, "wb") as buffer:
            buffer.write(await file.read())

        # 確保 `generate_nerf_3d` 可以接收 `input_path` 並產生 `output_path`
        try:
            generate_nerf_3d(input_path, output_path)  # 確保 `run_nerf.py` 內有此函式
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"NeRF 生成錯誤: {str(e)}")

        # 確保輸出檔案存在
        if not os.path.exists(output_path):
            raise HTTPException(status_code=500, detail="3D 生成失敗，請檢查 NeRF 設定。")

        return JSONResponse(content={"message": "3D 模型生成成功", "3D_model": output_path})

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
    
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)  # 允許所有來源

app.config['UPLOAD_FOLDER'] = 'inputs'  # 設定上傳目錄
