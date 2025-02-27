@echo off
 建立主資料夾
mkdir chatbot_project
cd chatbot_project

 建立後端資料夾和檔案
mkdir backend
cd backend
echo  Node.js 主後端檔案  app.js
mkdir routes
mkdir config
cd ..

 建立前端資料夾和檔案
mkdir frontend
cd frontend
echo !DOCTYPE html^html^head^titleChatbottitle^head^body^body^html  index.html
echo  CSS 樣式   style.css
echo  JavaScript 檔案  script.js
cd ..

 建立環境變數檔案
echo # .env 檔案  .env

 初始化 Node.js 專案
npm init -y

 完成
echo 資料夾結構建立完成！
pause
