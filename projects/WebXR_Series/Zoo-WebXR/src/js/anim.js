document.addEventListener("DOMContentLoaded", async function () {
    const scenes = document.querySelectorAll("a-entity[id^='scene']");
    const animationDurations = [];
    const animationFrames = []; // 新陣列以儲存影格數
    const FPS = 30; // 設定影格率為30 FPS
    let currentSceneIndex = 0;
    let animationTimer = null;
    let hourCheckTimer = null;

    function logCurrentNetworkTime() {
        const currentDate = new Date();
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const formattedTime = new Intl.DateTimeFormat('default', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZoneName: 'short'
        }).format(currentDate);
        console.log(`現在的網路時區時間：${formattedTime}，時區：${timeZone}`);
    }

    scenes.forEach(scene => {
        scene.setAttribute("visible", "false");
        scene.removeAttribute("animation-mixer");
    });

    async function initializeDurations() {
        const promises = Array.from(scenes).map(scene => {
            return new Promise((resolve) => {
                scene.addEventListener('model-loaded', () => {
                    console.log(`模型 ${scene.id} 加載完成`);
                    const object3D = scene.getObject3D('mesh');
                    if (object3D && object3D.animations && object3D.animations.length > 0) {
                        let totalDuration = 0; // 初始化總持續時間
                        let totalFrames = 0; // 初始化總影格數
                        console.log(`模型 ${scene.id} 的動畫片段數量：${object3D.animations.length}`);
                        
                        object3D.animations.forEach((clip, index) => {
                            console.log(`動畫片段 ${index} - 名稱: ${clip.name}, 持續時間: ${clip.duration}`);
                            totalDuration += clip.duration; // 將每個動畫片段的持續時間相加
                            totalFrames += clip.duration * FPS; // 計算每個動畫片段的影格數
                        });

                        animationDurations.push(totalDuration); // 儲存總持續時間（以秒為單位）
                        animationFrames.push(totalFrames); // 儲存影格數
                    } else {
                        console.warn(`模型 ${scene.id} 未檢測到動畫。`);
                    }
                    resolve();
                });
            });
        });
        await Promise.all(promises);
    }

    function calculateDurationAndFrames(index) {
        const duration = animationDurations[index] || 0; // 使用儲存的總持續時間
        const totalFrames = animationFrames[index] || 0; // 確保有預設值
        return { duration: duration * 1000, totalFrames }; // 返回持續時間（轉換為毫秒）
    }

    function activateScene(scene) {
        scene.setAttribute("visible", "true");
        scene.setAttribute("animation-mixer", "clip:*;");
        console.log(`啟動 ${scene.id} 的動畫`);

        const object3D = scene.getObject3D('mesh');
        if (object3D && object3D.animations) {
            object3D.animations.forEach(clip => {
                console.log(`目前播放的動畫片段：${clip.name}`);
                console.log(`動畫持續時間：${clip.duration} 秒`);
            });
        }

        logCurrentNetworkTime();
    }

    function deactivateScene(scene) {
        scene.setAttribute("visible", "false");
        scene.removeAttribute("animation-mixer");
        clearTimeout(animationTimer); // 清除動畫計時器
        console.log(`停止 ${scene.id} 的動畫`);
    }

    function playSceneByIndex(index) {
        if (index >= 0 && index < scenes.length) {
            clearTimeout(animationTimer);
            const currentScene = scenes[currentSceneIndex];

            deactivateScene(currentScene);

            currentSceneIndex = index;
            const nextScene = scenes[currentSceneIndex];

            activateScene(nextScene);

            // 獲取當前場景的動畫總持續時間和影格數
            const { duration, totalFrames } = calculateDurationAndFrames(currentSceneIndex);
            
            console.log(`當前場景 ${currentSceneIndex} 的動畫總持續時間：${(duration / 1000).toFixed(2)} 秒，影格數：${totalFrames}`);

            // 設定計時器以停止動畫並播放下一個場景
            animationTimer = setTimeout(() => {
                deactivateScene(nextScene);
                playNextScene(); // 自動播放下一個場景
            }, duration);
        }
    }

    function playNextScene() {
        if (currentSceneIndex < scenes.length - 1) {
            playSceneByIndex(currentSceneIndex + 1);
        } else {
            console.log("所有場景動畫已播放完成。");
        }
    }

    function checkHourlyPlay() {
        const now = new Date();
        if ((now.getMinutes() === 0 || now.getMinutes() === 30) && now.getSeconds() === 0) {
            console.log(`到達整點 ${now.getHours()}，自動開始播放場景`);
            playSceneByIndex(0);
        }
    }

    await initializeDurations();

    hourCheckTimer = setInterval(checkHourlyPlay, 1000);

    // 初始化播放時不進行自動播放
    // playSceneByIndex(currentSceneIndex);

    document.getElementById("prevSceneBtn").addEventListener("click", (event) => {
        event.preventDefault();
        if (currentSceneIndex > 0) {
            playSceneByIndex(currentSceneIndex - 1);
        }
    });

    document.getElementById("nextSceneBtn").addEventListener("click", (event) => {
        event.preventDefault();
        if (currentSceneIndex < scenes.length - 1) {
            playSceneByIndex(currentSceneIndex + 1);
        }
    });
});
