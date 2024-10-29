document.addEventListener("DOMContentLoaded", async function () {
    const assets = [];
    const animationDurations = [];
    let currentTime;

    // 自動搜尋並新增具有 scene 前綴的 <a-entity>
    function findSceneEntities() {
        const sceneEntities = document.querySelectorAll("a-entity[id^='scene']");
        sceneEntities.forEach(entity => assets.push(`#${entity.id}`));
        console.log(`場景總數：${sceneEntities.length} 個`); // 顯示總共找到的 scene 元素數量
    }

    // 獲取當地時間並轉換為 UTC 毫秒
    async function fetchNetworkTime() {
        const response = await fetch('https://worldtimeapi.org/api/ip'); // 根據用戶 IP 獲取時區
        const data = await response.json();
        
        // 獲取本地時間的毫秒數
        const localTime = new Date(data.datetime).getTime();
        
        // 將 UTC 偏移量應用到時間上，以便根據用戶時區計算整點
        const offset = data.utc_offset; 
        const [hours, minutes] = offset.split(':').map(Number); // 解析偏移時區
        const utcOffsetMilliseconds = (hours * 60 + minutes) * 60 * 1000;

        return localTime - utcOffsetMilliseconds; // 本地時間換算為 UTC 毫秒
    }

    async function initializeDurations() {
        let totalDuration = 0;
    
        const promises = assets.map(assetId => {
            return new Promise((resolve) => {
                const model = document.querySelector(assetId);
                model.addEventListener('model-loaded', () => {
                    const mixer = model.components['animation-mixer'];
                    console.log(mixer); // 確認 mixer 的內容
                    if (mixer && mixer.clips && mixer.clips.length > 0) {
                        let duration = 0;
                        mixer.clips.forEach(clip => {
                            console.log(`Animation ${clip.name}: ${clip.duration} seconds`); // 輸出動畫名稱和持續時間
                            duration += clip.duration * 1000; // 每個 clip 持續時間轉換為毫秒
                        });
                        animationDurations.push(duration);
                        totalDuration += duration; 
                        console.log(`模型 ${model.id} 的動畫持續時間：${(duration / 1000).toFixed(2)} 秒`);
                    } else {
                        console.warn(`模型 ${model.id} 未檢測到動畫。`);
                    }
                    resolve(); // 當加載完成後解決承諾
                });
            });
        });
    
        await Promise.all(promises);
        console.log(`所有 GLB 動畫的總持續時間：${(totalDuration / 1000).toFixed(2)} 秒`);
    }
    
    // 順序播放動畫，並同步到整點
    async function playSequence() {
        currentTime = await fetchNetworkTime();
        
        // 取得當前時間的整點
        const localDate = new Date(currentTime);
        localDate.setMinutes(0, 0, 0); // 將時間設為整點
        const startOfHour = localDate.getTime();

        // 計算距離整點的偏移並開始序列播放
        const offset = currentTime - startOfHour;

        for (let i = 0; i < assets.length; i++) {
            const model = document.querySelector(assets[i]);
            model.setAttribute('animation-mixer', { time: offset }); // 設定動畫起始時間
            model.setAttribute('visible', true); // 顯示當前模型

            // 等待動畫播放結束
            await new Promise(resolve => {
                setTimeout(() => {
                    model.setAttribute('visible', false); // 隱藏模型
                    resolve();
                }, animationDurations[i]);
            });

            // 計算下一個模型的動畫時間偏移
            offset += animationDurations[i]; // 更新偏移量
        }
    }

    // 執行初始化並播放序列
    findSceneEntities();  // 自動搜尋 scene 元素
    await initializeDurations();
    await playSequence();
});
