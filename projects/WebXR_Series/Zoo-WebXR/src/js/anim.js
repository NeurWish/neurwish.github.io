document.addEventListener("DOMContentLoaded", async function () {
    const animationDurations = [];
    const animationFrames = [];
    const FPS = 30; // 設定影格率為30 FPS
    let currentSceneIndex = 0;
    let animationTimer = null;
    let hourCheckTimer = null;

    // 固定的場景切換時間（以秒為單位）
    const fixedDurations = [
        420,  // scene01
        20,    // scene02
        20,    // scene03
        370,  // scene04
        10,  // scene05
        5,  // scene06
        120,  // scene07
        5,    // scene08
        120,   // scene09
        340,  // scene10
        20,   // scene11
        360   // scene12
    ];

    function createEntity(modelId, index) {
        const entity = document.createElement('a-entity');
        entity.setAttribute('id', `scene${String(index + 1).padStart(2, '0')}`);
        entity.setAttribute('position', '0 0 0');
        entity.setAttribute('gltf-model', `#${modelId}`);
        entity.setAttribute('scale', '1 1 1');
        entity.setAttribute('gps-entity-place', `latitude: 22.10001; longitude: 120.10001;`);
        entity.setAttribute('visible', 'false');
        document.querySelector('a-scene').appendChild(entity);
    }

    const modelIds = [
        "model01", "model02", "model03", "model04",
        "model05", "model06", "model07", "model08",
        "model09", "model10", "model11", "model12"
    ];

    // 創建所有的 entity
    modelIds.forEach((modelId, index) => {
        createEntity(modelId, index);
    });

    const scenes = document.querySelectorAll("a-entity[id^='scene']");

    // 隱藏所有場景
    scenes.forEach(scene => {
        scene.setAttribute("visible", "false");
        scene.removeAttribute("animation-mixer");
    });

    async function initializeDurations() {
        const promises = Array.from(scenes).map((scene, index) => {
            return new Promise((resolve) => {
                scene.addEventListener('model-loaded', () => {
                    console.log(`模型 ${scene.id} 加載完成`);
                    const object3D = scene.getObject3D('mesh');
                    if (object3D && object3D.animations && object3D.animations.length > 0) {
                        console.log(`模型 ${scene.id} 的動畫片段數量：${object3D.animations.length}`);
                    } else {
                        console.warn(`模型 ${scene.id} 未檢測到動畫。`);
                    }
                    resolve();
                });

                // 嘗試加載模型
                scene.addEventListener('model-loading-error', () => {
                    console.error(`模型 ${scene.id} 加載失敗，正在重試...`);
                    setTimeout(() => {
                        scene.emit('model-load'); // 觸發模型重新加載
                    }, 2000);
                });
            });
        });

        await Promise.all(promises);
        playSceneByIndex(currentSceneIndex);
    }

    function activateScene(scene) {
        scene.setAttribute("visible", "true");
        scene.setAttribute("animation-mixer", "clip:*;");
        console.log(`啟動 ${scene.id} 的動畫`);
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

            const duration = fixedDurations[currentSceneIndex] * 1000; // 將秒轉換為毫秒
            console.log(`當前場景 ${currentSceneIndex} 的固定動畫總持續時間：${(duration / 1000).toFixed(2)} 秒`);

            animationTimer = setTimeout(() => {
                deactivateScene(nextScene);
                playNextScene(); 
            }, duration);
        }
    }

    function playNextScene() {
        if (currentSceneIndex < scenes.length - 1) {
            playSceneByIndex(currentSceneIndex + 1);
        } else {
            console.log("所有場景動畫已播放完成。");
            showFullScreenImage(); 
        }
    }

    function showFullScreenImage() {
        const img = document.createElement("img");
        img.src = "../assets/imgs/pages/04/04.png"; 
        img.style.position = "fixed";
        img.style.top = "0";
        img.style.left = "0";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.zIndex = "1000";
        img.style.objectFit = "cover";
        
        document.body.appendChild(img);
    }

    await initializeDurations();

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
