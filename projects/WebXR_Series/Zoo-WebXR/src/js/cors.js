window.onload = async function() {
    await checkExternalResources();
  };
  
  async function checkExternalResources() {
    // 獲取所有外部資源的 URL，包括 img、audio、video 和 a-asset-item
    const externalResources = Array.from(document.querySelectorAll('img, audio, video, a-asset-item'))
      .map(element => {
        const src = element.getAttribute('src');
        return src && src.startsWith('http') ? src : null; // 確保 src 是有效的 HTTP URL
      })
      .filter(src => src); // 過濾掉 null 值
  
    console.log(`找到 ${externalResources.length} 個外部資源：`, externalResources);
  
    // 逐個檢查資源的狀態
    for (const url of externalResources) {
      await checkResourceStatus(url);
    }
  }
  
  async function checkResourceStatus(url) {
    const startTime = performance.now(); // 開始計時
  
    try {
      const response = await fetch(url, { method: 'HEAD' }); // 使用 HEAD 方法檢查資源是否可訪問
  
      // 計算下載時間
      const endTime = performance.now();
      const downloadTime = endTime - startTime;
  
      // 檢查回應是否為 OK（狀態碼 200-299）
      if (response.ok) {
        console.log(`資源 ${url} 可訪問。下載時間：${downloadTime.toFixed(2)} 毫秒`);
      } else {
        console.log(`資源 ${url} 不可訪問。狀態碼：${response.status}`);
      }
    } catch (error) {
      // 如果發生 CORS 錯誤或其他錯誤
      console.error(`獲取資源 ${url} 時發生錯誤：`, error);
      console.log('很可能是該檔案被 CORS 擋住。');
    }
  }
  