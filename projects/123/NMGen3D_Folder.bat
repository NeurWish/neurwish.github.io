@echo off
mkdir NMGen3D
cd NMGen3D

:: 建立後端資料夾
mkdir backend
mkdir backend\models
mkdir backend\scripts
mkdir backend\api

:: 建立前端資料夾
mkdir frontend
mkdir frontend\public
mkdir frontend\src
mkdir frontend\src\components
mkdir frontend\src\pages
mkdir frontend\src\styles

:: 建立資源資料夾
mkdir assets
mkdir assets\inputs
mkdir assets\outputs
mkdir assets\textures

:: 建立設定與測試資料夾
mkdir config
mkdir tests

:: 建立必要的文件
type nul > backend\api\app.py
type nul > backend\api\routes.py
type nul > backend\api\config.py
type nul > backend\api\utils.py
type nul > backend\scripts\inference.py
type nul > backend\scripts\train.py
type nul > backend\scripts\preprocess.py
type nul > backend\scripts\postprocess.py
type nul > frontend\index.html
type nul > config\settings.yaml
type nul > config\model_config.json
type nul > tests\test_api.py
type nul > tests\test_ai.py
type nul > requirements.txt
type nul > package.json
type nul > README.md

echo NMGen3D 資料夾結構建立完成！
pause
