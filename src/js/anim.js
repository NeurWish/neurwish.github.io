document.addEventListener("DOMContentLoaded", async function () {
    const animationDurations = [];
    const FPS = 30;
    let currentSceneIndex = 0;
    let animationTimer = null;
    let progressTimer = null;
    let isAnimationStarted = false;

    const fixedDurations = [
        420,  // scene01
        19,   // scene02
        339,  // scene03
        5,    // scene04
        113,  // scene05
        5,    // scene06
        113,  // scene07
        14,   // scene08
        274,  // scene09
        4,    // scene10
        14,   // scene11
        288   // scene12
    ];

    let isDraggingSlider = false;
    const progressContainer = document.getElementById("progressContainer");
    const progressBar = document.getElementById("progressBar");
    
    function setProgress(progress) {
        progressBar.style.width = `${progress * 100}%`;
        console.log(`當前進度: ${(progress * 100).toFixed(2)}%`);
    }
    
    // 當使用者按下滑動條時啟動拖動
    progressContainer.addEventListener("mousedown", (event) => {
        isDraggingSlider = true;
        updateSlider(event); // 更新滑動條進度
        console.log("開始拖動滑動條");
    });
    
    // 拖動過程中更新滑動條
    document.addEventListener("mousemove", (event) => {
        if (isDraggingSlider) {
            updateSlider(event); // 更新滑動條進度
            console.log("正在拖動滑動條");
        }
    });
    
    // 當使用者放開滑動條時，停止拖動
    document.addEventListener("mouseup", () => {
        if (isDraggingSlider) {
            isDraggingSlider = false;
            console.log("結束拖動滑動條");
        }
    });
    
    // 更新進度條的函數
    function updateSlider(event) {
        const rect = progressContainer.getBoundingClientRect();
        const offsetX = event.clientX - rect.left; // 計算滑鼠點擊的 X 軸位置
        const progress = Math.min(Math.max(offsetX / rect.width, 0), 1); // 進度條比例 0 ~ 1
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
    
    // 在 playSceneByIndex 函數中，添加適當的延遲
    function playSceneByIndex(index) {
        if (index >= 0 && index < scenes.length) {
            clearTimeout(animationTimer);
            const currentScene = scenes[currentSceneIndex];
            deactivateScene(currentScene);
    
            currentSceneIndex = index;
            const nextScene = scenes[currentSceneIndex];
    
            showFadeOverlay(); // 顯示淡入效果
    
            setTimeout(() => {
                activateScene(nextScene);
                hideFadeOverlay(); // 隱藏淡出效果
            }, 700); // 這裡的700是淡入的持續時間
    
            const duration = fixedDurations[currentSceneIndex] * 1000;
            console.log(`當前場景 ${currentSceneIndex} 的固定動畫總持續時間：${(duration / 1000).toFixed(2)} 秒`);
    
            updateProgressBar(0);
    
            animationTimer = setTimeout(() => {
                deactivateScene(nextScene);
                playNextScene(); 
            }, duration);
    
            let elapsedTime = 0;
            progressTimer = setInterval(() => {
                elapsedTime += 1000 / FPS;
                updateProgressBar(elapsedTime / duration);
                if (elapsedTime >= duration) {
                    clearInterval(progressTimer);
                }
            }, 1000 / FPS);
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

    function updateProgressBar(progress) {
        const progressBar = document.getElementById("progressBar");
        progressBar.style.width = `${progress * 100}%`;
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

    // 進度條點擊事件
progressContainer.addEventListener("click", (event) => {
    const rect = progressContainer.getBoundingClientRect();
    const clickPosition = event.clientX - rect.left; // 計算點擊位置
    const clickProgress = clickPosition / rect.width; // 計算點擊比例（0 ~ 1）
    
    // 獲取當前場景的持續時間（秒）
    const currentScene = scenes[currentSceneIndex];
    const sceneDuration = fixedDurations[currentSceneIndex]; // 獲取動畫的持續時間（秒）
    
    // 根據點擊位置計算目標時間（秒）
    const targetTime = clickProgress * sceneDuration;

    // 停止當前動畫並重置進度
    clearInterval(progressTimer);
    clearTimeout(animationTimer);
    deactivateScene(currentScene);
    
    // 啟動動畫並跳轉至新進度
    activateScene(currentScene);
    
    // 設置 animation-mixer 的時間
    currentScene.setAttribute("animation-mixer", {
        clip: '*', // 或者指定具體的 clip 名稱
        time: targetTime // 設置新的播放時間（秒）
    });

    // 隱藏淡入效果（如果已顯示），然後進行淡出
    hideFadeOverlay();
    animationTimer = setTimeout(() => {
        deactivateScene(currentScene);
        playNextScene();
    }, (sceneDuration - targetTime) * 1000); // 計算剩餘的播放時間

    // 更新進度條
    let elapsedTime = targetTime * 1000; // 將秒數轉換為毫秒
    progressBar.style.width = `${(elapsedTime / (sceneDuration * 1000)) * 100}%`; // 更新進度條顯示

    // 設置進度更新計時器
    progressTimer = setInterval(() => {
        elapsedTime += 1000 / FPS; // 每次增加幀時間
        if (elapsedTime >= sceneDuration * 1000) {
            elapsedTime = sceneDuration * 1000; // 確保不超過動畫長度
            clearInterval(progressTimer);
        }
        updateProgressBar(elapsedTime / (sceneDuration * 1000)); // 更新進度條
    }, 1000 / FPS);
});


    

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

function checkHourlyPlay() {
    const now = new Date();
    if ((now.getMinutes() === 0 || now.getMinutes() === 30) && now.getSeconds() === 0) {
        console.log(`到達整點 ${now.getHours()}，自動開始播放場景`);
        playSceneByIndex(0);
    }
}

// 在初始化時設置每分鐘檢查一次
setInterval(() => {
    logCurrentNetworkTime();
    checkHourlyPlay();
}, 60000); // 每60秒檢查一次

    // 初始化場景播放
    // playSceneByIndex(currentSceneIndex);
});
