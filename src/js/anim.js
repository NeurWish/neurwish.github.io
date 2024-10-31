document.addEventListener("DOMContentLoaded", async function () {
    const animationDurations = [];
    const FPS = 30;
    let currentSceneIndex = 0;
    let animationTimer = null;
    let progressTimer = null;
    let isDraggingSlider = false;
    let isScenePlaying = false; // 用來追蹤是否已播放場景

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
    
            showFadeOverlay();
    
            setTimeout(() => {
                activateScene(nextScene);
                hideFadeOverlay();
            }, 700);
    
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
            return true; // 播放成功
        }
        return false; // 播放失敗
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

    
    setInterval(() => {
        logCurrentNetworkTime();
        checkHourlyPlay();
    }, 10000);  // 每10秒檢查一次
    
});
