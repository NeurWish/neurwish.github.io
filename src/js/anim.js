document.addEventListener("DOMContentLoaded", async function () {
    const scenes = document.querySelectorAll("a-entity[id^='scene']");
    const animationDurations = [];
    let currentSceneIndex = 0;
    let animationTimer = null;
    let hourCheckTimer = null; // 用于检查每小时整点的计时器
    let lastHourlyPlayTime = null; // 记录上次播放的时间

    // 获取模型的数量
    const assetItems = document.querySelectorAll("a-asset-item");
    const models = [];

    // 根据 <a-asset-item> 的数量生成对应的 <a-entity>
    function generateEntities() {
        assetItems.forEach((item, index) => {
            const modelId = `model${String(index + 1).padStart(2, '0')}`;
            const sceneId = `scene${String(index + 1).padStart(2, '0')}`;

            // 检查场景是否已经存在
            if (!document.getElementById(sceneId)) {
                const entity = document.createElement("a-entity");
                entity.setAttribute("id", sceneId);
                entity.setAttribute("position", "0 0 0");
                entity.setAttribute("gltf-model", `#${modelId}`); // 确保这里的 ID 正确
                entity.setAttribute("scale", "1 1 1");
                entity.setAttribute("gps-entity-place", "latitude: 22.10001; longitude: 120.10001;");
                entity.setAttribute("visible", "false");
                document.querySelector("a-scene").appendChild(entity);
                models.push(entity);
            } else {
                console.log(`场景 ${sceneId} 已经存在，跳过生成。`);
            }
        });
    }

    // 显示网络时区的当前时间及时区名称
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

        console.log(`现在的网络时区时间：${formattedTime}，时区：${timeZone}`);
    }

    // 初始化场景的可见性与动画
    models.forEach(scene => {
        scene.setAttribute("visible", "false");
        scene.removeAttribute("animation-mixer");
    });

    async function initializeDurations() {
        const promises = Array.from(models).map(scene => {
            return new Promise((resolve) => {
                scene.addEventListener('model-loaded', () => {
                    console.log(`模型 ${scene.id} 加载完成`);
                    const object3D = scene.getObject3D('mesh');
                    if (object3D && object3D.animations && object3D.animations.length > 0) {
                        let duration = 0;
                        object3D.animations.forEach(clip => {
                            console.log(`动画 ${clip.name}：${clip.duration} 秒`);
                            duration += clip.duration * 1000;
                        });
                        animationDurations.push(duration);
                        console.log(`模型 ${scene.id} 的动画总持续时间：${(duration / 1000).toFixed(2)} 秒`);
                    } else {
                        console.warn(`模型 ${scene.id} 未检测到动画。`);
                    }
                    resolve();
                });

                // 如果加载失败，添加错误处理
                scene.addEventListener('model-error', () => {
                    console.error(`模型 ${scene.id} 加载失败。`);
                    resolve(); // 确保 Promise 总是解决
                });
            });
        });
        await Promise.all(promises);
    }

    function activateScene(scene) {
        console.log(`尝试启动 ${scene.id} 的动画`);
        scene.setAttribute("visible", "true");
        scene.setAttribute("animation-mixer", ""); // 确保这里可以正确赋值
        console.log(`启动 ${scene.id} 的动画`);
        logCurrentNetworkTime();
    }

    function deactivateScene(scene) {
        scene.setAttribute("visible", "false");
        scene.removeAttribute("animation-mixer");
        console.log(`停止 ${scene.id} 的动画`);
    }

    async function playSceneByIndex(index) {
        if (index >= 0 && index < models.length) {
            clearTimeout(animationTimer);
            const currentScene = models[currentSceneIndex];
            deactivateScene(currentScene);

            currentSceneIndex = index;
            const nextScene = models[currentSceneIndex];

            // 确保模型已加载
            if (nextScene) {
                await new Promise((resolve) => {
                    nextScene.addEventListener('model-loaded', resolve, { once: true });
                });

                activateScene(nextScene);
                const duration = animationDurations[currentSceneIndex] || 5000;
                animationTimer = setTimeout(() => {
                    deactivateScene(nextScene);
                    playNextScene(); // 自动播放下一个场景
                }, duration);
            } else {
                console.error(`模型索引 ${currentSceneIndex} 不存在！`);
            }
        } else {
            console.error(`索引 ${index} 超出范围！`);
        }
    }

    function playNextScene() {
        if (currentSceneIndex < models.length - 1) {
            playSceneByIndex(currentSceneIndex + 1);
        } else {
            console.log("所有场景动画已播放完成。");
        }
    }

    function checkHourlyPlay() {
        const now = new Date();
        if (now.getMinutes() === 0 && now.getSeconds() === 0) {
            if (!lastHourlyPlayTime || now - lastHourlyPlayTime > 60000) { // 确保每小时只播放一次
                console.log(`到达整点 ${now.getHours()}:00，自动开始播放场景`);
                lastHourlyPlayTime = now;

                if (!animationTimer) {
                    console.log("准备播放场景...");
                    playSceneByIndex(0);
                } else {
                    console.log("动画正在播放中，无法自动开始播放");
                }
            } else {
                console.log("已在这个整点播放过动画，跳过播放。");
            }
        }
    }

    // 生成场景实体
    generateEntities();

    await initializeDurations();

    // 设置每秒检查是否到达整点
    hourCheckTimer = setInterval(checkHourlyPlay, 1000);

    // 手动切换场景按钮
    document.getElementById("prevSceneBtn").addEventListener("click", () => {
        if (currentSceneIndex > 0) {
            playSceneByIndex(currentSceneIndex - 1);
        }
    });

    document.getElementById("nextSceneBtn").addEventListener("click", () => {
        if (currentSceneIndex < models.length - 1) {
            playSceneByIndex(currentSceneIndex + 1);
        }
    });
});
