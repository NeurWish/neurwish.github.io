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

    // 初始化每個 GLB 動畫的持續時間（假設為 30 fps）
    async function initializeDurations() {
        for (let assetId of assets) {
            const model = document.querySelector(assetId);
            const mixer = model.components['animation-mixer'];
            if (mixer && mixer.clips && mixer.clips.length > 0) {
                // 計算資源中每個動畫的持續時間
                let totalDuration = 0;
                mixer.clips.forEach(clip => {
                    totalDuration += clip.duration * (1000 / 30); // 從幀轉換為毫秒
                });
                animationDurations.push(totalDuration);
            }
        }
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
        let totalDuration = 0;

        for (let i = 0; i < assets.length; i++) {
            const model = document.querySelector(assets[i]);
            model.setAttribute('animation-mixer', { time: offset });
            totalDuration += animationDurations[i];
            await new Promise(resolve => setTimeout(resolve, animationDurations[i]));
            model.setAttribute('visible', false); // 隱藏上一個模型
            document.querySelector(assets[i + 1])?.setAttribute('visible', true); // 顯示下一個模型
        }
    }

    // 執行初始化並播放序列
    findSceneEntities();  // 自動搜尋 scene 元素
    await initializeDurations();
    playSequence();
});
