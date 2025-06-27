# NMStudio 官方網站

本專案為 NMStudio 官方網站，提供 AI 技術開發、3D 建模動畫、系統整合等服務的展示與訂單系統。網站設計現代、響應式，並支援多語言切換。

## 目錄結構

- `index.html`：主頁，包含所有主要區塊（首頁、服務、專案、訂單、聯絡）。
- `src/css/`：網站樣式檔案（style.css、ui.css、order.css、particles.css 等）。
- `src/js/`：前端互動腳本（主程式、UI、訂單管理、語言切換、機器人管理等）。
- `assets/`：圖片、LOGO、專案圖、icon 等靜態資源。
- `projects/`：專案相關資料與範例。
- `tests/`、`playwright-report/`：自動化測試與測試報告。

## 技術棧

### 前端
- **HTML5**：語意化標記，結構清晰。
- **CSS3**：自訂主題、響應式設計、Cyberpunk 風格、動畫特效。
- **JavaScript (ES6+)**：前端互動、表單驗證、語言切換、UI 動畫。
- **Particles.js**：背景粒子動畫。
- **Google Fonts**：Orbitron 字型。

### 前端模組
- `main.js`：主邏輯與初始化。
- `ui/`：UI 動畫、Cyberpunk 特效、粒子背景。
- `order/`：訂單表單管理與驗證。
- `language/`：多語言切換（中/英）。
- `bot/`：機器人相關功能。

### 測試
- **Playwright**：端對端自動化測試。
- 測試腳本位於 `tests/`，測試報告於 `playwright-report/`。

### 其他
- **多語言支援**：`src/json/translations.json` 管理語言包，`lang-switcher.js` 控制切換。
- **響應式設計**：適用於桌機、平板、手機。
- **現代 UI/UX**：結合動畫、粒子、Cyberpunk 元素。

## 如何啟動

1. 下載或 clone 本專案。
2. 於本地端開啟 `index.html` 即可瀏覽。
3. 若需執行自動化測試：
   - 安裝 Node.js 與 Playwright
   - 執行 `npm install` 安裝依賴
   - 執行 `npx playwright test` 執行測試

## 聯絡方式

- 官方網站：[https://nmstudio.com](https://nmstudio.com)
- Email：contact@nmstudio.com

---

本專案由 NMStudio 團隊維護，歡迎交流指教！
