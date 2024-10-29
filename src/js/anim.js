document.addEventListener("DOMContentLoaded", async function () {
    const assets = [];
    const animationDurations = [];

    // 自動搜尋並新增具有 scene 前綴的 <a-entity>
    function findSceneEntities() {
        // 查找所有 ID 以 "scene" 開頭的 <a-entity>
        const sceneEntities = document.querySelectorAll("a-entity[id^='scene']");
        sceneEntities.forEach(entity => assets.push(`#${entity.id}`));
        console.log(`場景總數：${sceneEntities.length} 個`); // 顯示場景總數
    }

    // 初始化動畫持續時間
    async function initializeDurations() {
        const promises = assets.map(assetId => {
            return new Promise((resolve) => {
                const model = document.querySelector(assetId);
                model.addEventListener('model-loaded', () => {
                    console.log(`模型 ${model.id} 加載完成`); // 顯示模型加載完成
                    const object3D = model.getObject3D('mesh');
                    if (object3D && object3D.animations && object3D.animations.length > 0) {
                        let duration = 0;
                        // 計算每個動畫片段的持續時間並加總
                        object3D.animations.forEach(clip => {
                            console.log(`動畫 ${clip.name}：${clip.duration} 秒`); // 顯示動畫片段名稱與持續時間
                            duration += clip.duration * 1000; // 將持續時間轉為毫秒
                        });
                        animationDurations.push(duration);
                        console.log(`模型 ${model.id} 的動畫持續時間：${(duration / 1000).toFixed(2)} 秒`); // 顯示模型總動畫持續時間
                    } else {
                        console.warn(`模型 ${model.id} 未檢測到動畫。`); // 若無動畫，顯示警告訊息
                    }
                    resolve();
                });
            });
        });
        await Promise.all(promises);
    }

    // 按順序播放動畫（單一場景同時播放）
    async function playSequence() {
    console.log("開始播放動畫序列"); // 添加日誌顯示開始播放
    const totalDuration = animationDurations.reduce((a, b) => a + b, 0); // 計算所有動畫的總持續時間
    const currentTime = Date.now(); // 取得當前的裝置時間
    const localDate = new Date(currentTime);
    localDate.setMinutes(0, 0, 0); // 設定為整點時間
    const startOfHour = localDate.getTime(); // 獲取整點時間

    // 計算每個場景的播放時間範圍
    for (let i = 0; i < assets.length; i++) {
        const model = document.querySelector(assets[i]);
        const startTime = startOfHour + animationDurations.slice(0, i).reduce((a, b) => a + b, 0); // 計算當前動畫的起始時間
        const endTime = startTime + animationDurations[i]; // 計算當前動畫的結束時間
        
        console.log(`動畫 ${model.id} 起始時間：${new Date(startTime).toLocaleTimeString()}`); // 加入起始時間的日誌
        console.log(`動畫 ${model.id} 結束時間：${new Date(endTime).toLocaleTimeString()}`); // 加入結束時間的日誌

        // 設置動畫混合器的時間並設為可見
        model.setAttribute('animation-mixer', `clip: *; time: 0; loop: repeat`);
        model.setAttribute('visible', true);
        console.log(`播放動畫：${model.id}，可見性：${model.getAttribute('visible')}`); // 顯示目前播放的動畫和可見性

        // 設定播放動畫的時間範圍
        const currentTimeInInterval = Date.now();
        console.log(`當前時間：${new Date(currentTimeInInterval).toLocaleTimeString()}`); // 顯示當前時間
        if (currentTimeInInterval >= startTime && currentTimeInInterval < endTime) {
            const animationOffset = (currentTimeInInterval - startTime) / 1000; // 計算當前動畫的偏移時間
            model.setAttribute('animation-mixer', `clip: *; time: ${animationOffset}; loop: repeat`);
            console.log(`動畫 ${model.id} 偏移時間：${animationOffset.toFixed(2)} 秒`); // 顯示當前動畫的偏移時間
        } else if (currentTimeInInterval >= endTime) {
            model.setAttribute('animation-mixer', `clip: *; time: 0; loop: repeat`); // 如果超過結束時間，暫停動畫
            model.setAttribute('visible', false); // 隱藏模型
            console.log(`動畫 ${model.id} 已結束，隱藏模型。可見性：${model.getAttribute('visible')}`); // 顯示模型隱藏的訊息
        }

        // 等待動畫完成，然後隱藏模型
        await new Promise(resolve => {
            const timeout = endTime - currentTimeInInterval;
            if (timeout > 0) {
                setTimeout(() => {
                    model.setAttribute('animation-mixer', `clip: *; time: 0; loop: repeat`); // 將動畫設為暫停
                    model.setAttribute('visible', false); // 隱藏模型
                    console.log(`動畫 ${model.id} 被暫停並隱藏。可見性：${model.getAttribute('visible')}`); // 確保隱藏狀態被打印
                    resolve();
                }, timeout);
            } else {
                resolve();
            }
        });
    }

    // 計算下一小時的倒數計時，重複播放動畫
    const timeToNextHour = 3600000 - (currentTime - startOfHour);
    setTimeout(playSequence, timeToNextHour);
}


    findSceneEntities(); // 自動搜尋場景實體
    await initializeDurations(); // 初始化動畫持續時間
    await playSequence(); // 開始播放動畫序列
});
