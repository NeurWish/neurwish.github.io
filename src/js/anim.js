document.addEventListener("DOMContentLoaded", async function () {
    const FPS = 30;
    let currentSceneIndex = 0;
    let animationTimer = null;
    let progressTimer = null;
    let isDraggingSlider = false;

    const fixedDurations = [
        420, 19, 339, 5, 113, 5, 113, 14, 274, 4, 292, 10
    ];

    // 設定需要淡入淡出延遲的場景和無需淡入淡出的場景
    const noFadeScenes = [1, 9, 10, 11, 12]; // 無需淡入淡出的場景
    const extendedFadeScenes = {
        8: 14000  // scene03 的黑畫面延遲 1.5 秒
  
    };

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
        document.querySelector('a-scene').appendChild(entity);
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

        function updateCircleProgress(progress) {
            const circle = document.querySelector(".progress-ring__circle");
            const radius = circle.r.baseVal.value;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (progress * circumference);
            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            circle.style.strokeDashoffset = offset;
        }

        const promises = Array.from(scenes).map((scene, index) => {
            return new Promise((resolve) => {
                scene.addEventListener("model-loaded", () => {
                    console.log(`模型 ${scene.id} 加載完成`);
                    loadedScenes++;

                    const progress = loadedScenes / totalScenes;
                    updateCircleProgress(progress);

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

    const fadeOverlay = document.getElementById("fadeOverlay");

    function showFadeOverlay() {
        fadeOverlay.classList.add("show");
    }

    function hideFadeOverlay() {
        fadeOverlay.classList.remove("show");
    }

    function playSceneByIndex(index) {
        if (index >= 0 && index < scenes.length) {
            clearTimeout(animationTimer);
            const currentScene = scenes[currentSceneIndex];
            deactivateScene(currentScene);
    
            currentSceneIndex = index;
            const nextScene = scenes[currentSceneIndex];
    
            // 獲取動畫片段和幀數的驗證
            if (currentSceneIndex === scenes.length - 1) {
                const animationMixer = nextScene.components['animation-mixer'];
                if (animationMixer) {
                    const clips = animationMixer.clip; // 獲取動畫片段
                    console.log(`場景 ${currentSceneIndex + 1} 的動畫片段:`, clips);
                    // 檢查幀數
                    const totalFrames = clips.reduce((total, clip) => total + clip.tracks[0].values.length, 0);
                    console.log(`場景 ${currentSceneIndex + 1} 的總幀數: ${totalFrames}`);
                    
                    // 這裡您可以根據實際的幀數計算出持續時間
                    const durationFromFrames = (totalFrames / FPS) * 1000;
                    console.log(`根據幀數計算的持續時間: ${(durationFromFrames / 1000).toFixed(2)} 秒`);
                } else {
                    console.error(`場景 ${currentSceneIndex + 1} 沒有找到動畫片段`);
                }
            }
    
            if (!noFadeScenes.includes(currentSceneIndex + 1)) {
                showFadeOverlay();
                
                const fadeDuration = extendedFadeScenes[currentSceneIndex + 1] || 700;
                
                setTimeout(() => {
                    activateScene(nextScene);
                    hideFadeOverlay();
                }, fadeDuration);
            } else {
                activateScene(nextScene);
            }
    
            const duration = fixedDurations[currentSceneIndex] * 1000;
            console.log(`當前場景 ${currentSceneIndex} 的固定動畫總持續時間：${(duration / 1000).toFixed(2)} 秒`);
    
            updateProgressBar(0);
    
            let elapsedTime = 0;
            let frameCount = 0;
    
            animationTimer = setTimeout(() => {
                deactivateScene(nextScene);
                playNextScene();
            }, duration);
    
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
            
            const lastDuration = 0.2 * 1000;
    
            // 在最後一個場景播放結束後顯示全屏圖片
            setTimeout(showFullScreenImage, lastDuration);
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
        if (currentSceneIndex < scenes.length - 1) {
            playSceneByIndex(currentSceneIndex + 1);
        }
    });
});
