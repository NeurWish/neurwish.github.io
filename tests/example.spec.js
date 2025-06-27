const { test, expect } = require('@playwright/test');

test('NMStudio 首頁載入測試', async ({ page }) => {
    // 使用 file:// 協議載入本地 HTML 檔案
    await page.goto('file:///d:/NeurWish/Neur_Web/neurwish.github.io/index.html');
    
    // 檢查頁面標題
    const title = await page.title();
    expect(title).toContain('NMStudio');
    
    // 檢查主要 logo 是否存在
    await expect(page.locator('.main-logo')).toBeVisible();
    
    // 檢查導航選單是否存在
    await expect(page.locator('.vertical-nav')).toBeVisible();
    
    // 檢查英雄區塊是否存在
    await expect(page.locator('.hero-section')).toBeVisible();
});

test('語言切換功能測試', async ({ page }) => {
    await page.goto('file:///d:/NeurWish/Neur_Web/neurwish.github.io/index.html');
    
    // 點擊英文按鈕
    await page.click('.lang-btn-vertical[data-lang="en"]');
    
    // 等待一下讓 JavaScript 執行
    await page.waitForTimeout(500);
    
    // 點擊中文按鈕
    await page.click('.lang-btn-vertical[data-lang="zh"]');
});