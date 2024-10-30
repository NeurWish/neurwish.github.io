document.addEventListener("DOMContentLoaded", async function () {
    const scenes = document.querySelectorAll("a-entity[id^='scene']");
    const animationDurations = [];
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
                        let duration = 0;
                        object3D.animations.forEach(clip => {
                            console.log(`動畫 ${clip.name}：${clip.duration} 秒`);
                            duration += clip.duration * 1000;
                        });
                        animationDurations.push(duration);
                        console.log(`模型 ${scene.id} 的動畫總持續時間：${(duration / 1000).toFixed(2)} 秒`);
                    } else {
                        console.warn(`模型 ${scene.id} 未檢測到動畫。`);
                    }
                    resolve();
                });
            });
        });
        await Promise.all(promises);
    }

    function activateScene(scene) {
        scene.setAttribute("visible", "true");
        scene.setAttribute("animation-mixer", "");
        console.log(`啟動 ${scene.id} 的動畫`);
        logCurrentNetworkTime();
    }

    function deactivateScene(scene) {
        scene.setAttribute("visible", "false");
        scene.removeAttribute("animation-mixer");
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

            const duration = animationDurations[currentSceneIndex] || 5000;
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
        // 檢查當前分鐘是否為 0 或 30
        if ((now.getMinutes() === 0 || now.getMinutes() === 30) && now.getSeconds() === 0) {
            console.log(`到達整點 ${now.getHours()}，自動開始播放場景`);
            playSceneByIndex(0);
        }
    }
    

    await initializeDurations();

    // 設置每秒檢查是否到達整點
    hourCheckTimer = setInterval(checkHourlyPlay, 1000);

    // 初始化播放時不進行自動播放
    // playSceneByIndex(currentSceneIndex);

    document.getElementById("prevSceneBtn").addEventListener("click", () => {
        if (currentSceneIndex > 0) {
            playSceneByIndex(currentSceneIndex - 1);
        }
    });

    document.getElementById("nextSceneBtn").addEventListener("click", () => {
        if (currentSceneIndex < scenes.length - 1) {
            playSceneByIndex(currentSceneIndex + 1);
        }
    });
});
