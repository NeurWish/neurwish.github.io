document.addEventListener("DOMContentLoaded", async function () {
    const FPS = 30;
    let currentSceneIndex = 0;
    let animationTimer = null;
    let progressTimer = null;
    let isDraggingSlider = false;

    const fixedDurations = [
        420, 19, 339, 5, 113, 5, 113, 14, 274, 4, 292, 10
    ];

    const noFadeScenes = [1, 2, 6 ,7 , 8, 9, 10, 11, 12]; // 無需淡入淡出的場景

    // 新增矩陣以指定場景切換的延遲
    const sceneDelays = {
        7: 14000
    };
    
     const progressContainer = document.getElementById("progressContainer");
    const progressBar = document.getElementById("progressBar");

    
    function setProgress(progress) {
        progressBar.style.width = `${progress * 100}%`;
        console.log(`當前進度: ${(progress * 100).toFixed(2)}%`);
    }

    progressContainer.addEventListener("mousedown", (event) => {
        isDraggingSlider = true;
        updateSlider(event);
        console.log("開始拖動滑動條");
    });

    document.addEventListener("mousemove", (event) => {
        if (isDraggingSlider) {
            updateSlider(event);
            console.log("正在拖動滑動條");
        }
    });

    document.addEventListener("mouseup", () => {
        if (isDraggingSlider) {
            isDraggingSlider = false;
            console.log("結束拖動滑動條");
        }
    });

    function updateSlider(event) {
        const rect = progressContainer.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const progress = Math.min(Math.max(offsetX / rect.width, 0), 1);
        setProgress(progress);
    }

    function createEntity(modelId, index) {
        const entity = document.createElement('a-entity');
        entity.setAttribute('id', `scene${String(index + 1).padStart(2, '0')}`);
        entity.setAttribute('position', '0 0 0');
        entity.setAttribute('gltf-model', `#${modelId}`);
        entity.setAttribute('scale', '1 1 1');
        entity.setAttribute('gps-entity-place', `latitude: 22.10001; longitude: 120.10001;`);
        entity.setAttribute('visible', 'false');
        entity.setAttribute('material', 'opacity: 0.0; transparent: true');
        document.querySelector('a-scene').appendChild(entity);

        entity.addEventListener("model-loaded", () => {
            const model = entity.getObject3D("mesh");
            if (model) {
                model.traverse((node) => {
                    if (node.isMesh) {
                        node.material.transparent = true;
                        node.material.opacity = 0;
                    }
                });
            }
        });
    }

    const modelIds = [
        "model01", "model02", "model03", "model04",
        "model05", "model06", "model07", "model08",
        "model09", "model10", "model11", "model12"
    ];

    modelIds.forEach((modelId, index) => {
        createEntity(modelId, index);
    });

    const scenes = document.querySelectorAll("a-entity[id^='scene']");
    scenes.forEach(scene => {
        scene.setAttribute("visible", "false");
        scene.removeAttribute("animation-mixer");
    });

    async function initializeDurations() {
        const totalScenes = scenes.length;
        let loadedScenes = 0;

        document.getElementById("loadingOverlay").style.display = "block";

        const promises = Array.from(scenes).map((scene, index) => {
            return new Promise((resolve) => {
                scene.addEventListener("model-loaded", () => {
                    console.log(`模型 ${scene.id} 加載完成`);
                    loadedScenes++;

                    if (loadedScenes === totalScenes) {
                        document.getElementById("loadingOverlay").style.display = "none";
                    }
                    resolve();
                });

                scene.addEventListener("model-loading-error", () => {
                    console.error(`模型 ${scene.id} 加載失敗，正在重試...`);
                    setTimeout(() => {
                        scene.emit("model-load");
                    }, 2000);
                });
            });
        });

        await Promise.all(promises);
    }

    function activateScene(scene) {
        scene.setAttribute("visible", "true");
        scene.setAttribute("animation-mixer", "clip:*;");
        console.log(`啟動 ${scene.id} 的動畫`);
    }

    function deactivateScene(scene) {
        scene.setAttribute("visible", "false");
        scene.removeAttribute("animation-mixer");
        clearTimeout(animationTimer);
        clearInterval(progressTimer);
        console.log(`停止 ${scene.id} 的動畫`);
    }

    function fadeIn(entity, duration) {
        const model = entity.getObject3D("mesh");
        if (model) {
            let opacity = 0;
            const fadeInInterval = setInterval(() => {
                opacity += (1000 / duration) * 0.01;
                if (opacity >= 1) {
                    opacity = 1;
                    clearInterval(fadeInInterval);
                }
                model.traverse((node) => {
                    if (node.isMesh) {
                        node.material.opacity = opacity;
                    }
                });
                console.log(`淡入中: ${entity.id} 的透明度為 ${opacity.toFixed(2)}`);
            }, 10);
        }
    }

    function fadeOut(entity, duration) {
        const model = entity.getObject3D("mesh");
        if (model) {
            let opacity = 1;
            const fadeOutInterval = setInterval(() => {
                opacity -= (1000 / duration) * 0.01;
                if (opacity <= 0) {
                    opacity = 0;
                    clearInterval(fadeOutInterval);
                }
                model.traverse((node) => {
                    if (node.isMesh) {
                        node.material.opacity = opacity;
                    }
                });
                console.log(`淡出中: ${entity.id} 的透明度為 ${opacity.toFixed(2)}`);
            }, 10);
        }
    }

    function playSceneByIndex(index) {
        if (index >= 0 && index < scenes.length) {
            clearTimeout(animationTimer);
            const currentScene = scenes[currentSceneIndex];
            deactivateScene(currentScene);
        
            currentSceneIndex = index;
            const nextScene = scenes[currentSceneIndex];
    
            // 檢查當前場景是否需要淡出
            if (!noFadeScenes.includes(currentSceneIndex + 1)) {
                fadeOut(currentScene, 700);
                
                // 設定延遲時間
                const delay = sceneDelays[currentSceneIndex + 1] || 0; // 使用矩陣獲取延遲
    
                // 在延遲時間後啟動下一個場景
                setTimeout(() => {
                    activateScene(nextScene);
                    fadeIn(nextScene, 700);
                }, delay); // 考慮延遲時間
            } else {
                // 直接切換場景
                activateScene(nextScene);
                const model = nextScene.getObject3D("mesh");
                if (model) {
                    model.traverse((node) => {
                        if (node.isMesh) {
                            node.material.opacity = 1;
                        }
                    });
                }
            }
        
            const duration = fixedDurations[currentSceneIndex] * 1000;
            console.log(`當前場景 ${currentSceneIndex} 的固定動畫總持續時間：${(duration / 1000).toFixed(2)} 秒`);
        
            updateProgressBar(0);
        
            let elapsedTime = 0;
            let frameCount = 0;
        
            // 使用 setTimeout 進行場景播放
            animationTimer = setTimeout(() => {
                deactivateScene(nextScene);
                playNextScene();
            }, duration + (sceneDelays[currentSceneIndex + 1] || 0)); // 考慮延遲時間
    
            // 更新進度條的定時器
            progressTimer = setInterval(() => {
                elapsedTime += 1000 / FPS;
                frameCount++;
                updateProgressBar(elapsedTime / duration);
                console.log(`場景 ${currentSceneIndex + 1}，幀數: ${frameCount}`);
        
                if (elapsedTime >= duration) {
                    clearInterval(progressTimer);
                }
            }, 1000 / FPS);
            
            return true;
        }
        return false;
    }


    function playNextScene() {
        if (currentSceneIndex < scenes.length - 1) {
            playSceneByIndex(currentSceneIndex + 1);
        } else {
            console.log("所有場景動畫已播放完成。");
        }
    }

    function updateProgressBar(progress) {
        const progressBar = document.getElementById("progressBar");
        progressBar.style.width = `${progress * 100}%`;
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

    document.getElementById("prevSceneBtn").addEventListener("click", (event) => {
        event.preventDefault();
        if (currentSceneIndex > 0) {
            playSceneByIndex(currentSceneIndex - 1);
        }
    });

    document.getElementById("nextSceneBtn").addEventListener("click", (event) => {
        event.preventDefault();
        playNextScene();
    });
});
