var scene, camera, renderer, clock, deltaTime, totalTime;

var mesh1, raycaster, groundPlane, intersectedPoint, gridHelper;
var gyroscopeData = {alpha: 0, beta: 0, gamma: 0}; // 儲存手機陀螺儀數據

initialize();
animate();

function initialize() {
    scene = new THREE.Scene();

    let ambientLight = new THREE.AmbientLight(0xcccccc, 0.5);
    scene.add(ambientLight);

    camera = new THREE.Camera();
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setClearColor(new THREE.Color('lightgrey'), 0);
    renderer.setSize(640, 480);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    renderer.domElement.style.left = '0px';
    document.body.appendChild(renderer.domElement);

    clock = new THREE.Clock();
    deltaTime = 0;
    totalTime = 0;

    // 設定 raycaster 和地板
    raycaster = new THREE.Raycaster();
    groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);  // 地板水平放置在 y = 0
    intersectedPoint = new THREE.Vector3();

    // 新增網格地板來觀察是否偵測到地板
    gridHelper = new THREE.GridHelper(100, 100); // 大小 100x100 的網格
    scene.add(gridHelper);

    let geometry1 = new THREE.CubeGeometry(1, 1, 1);
    let material1 = new THREE.MeshNormalMaterial({
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
    });

    mesh1 = new THREE.Mesh(geometry1, material1);
    mesh1.visible = false; // 一開始隱藏
    scene.add(mesh1); // 直接加到場景，不加到 marker 上

    setupGyroscope();
}

function setupGyroscope() {
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', function (event) {
            gyroscopeData.alpha = event.alpha; // z 軸旋轉
            gyroscopeData.beta = event.beta; // x 軸旋轉
            gyroscopeData.gamma = event.gamma; // y 軸旋轉
        });
    } else {
        console.log("DeviceOrientationEvent is not supported on this device.");
    }
}

function update() {
    // 使用 raycaster 從攝影機向下偵測地板
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera); // 從畫面中心發射
    var intersects = raycaster.ray.intersectPlane(groundPlane, intersectedPoint);

    // 如果偵測到地板，將 mesh1 放到地板上
    if (intersects) {
        if (!mesh1.visible) {
            mesh1.position.copy(intersectedPoint); // 將 Cube 放置在地板上
            mesh1.position.y += 0.5; // 抬高一點
            mesh1.visible = true; // 顯示 Cube
        }

        // 使用陀螺儀數據來調整物體旋轉
        mesh1.rotation.set(
            THREE.Math.degToRad(gyroscopeData.beta),
            THREE.Math.degToRad(gyroscopeData.alpha),
            THREE.Math.degToRad(gyroscopeData.gamma)
        );
    }
}

function render() {
    renderer.render(scene, camera);
}

function animate() {
    requestAnimationFrame(animate);
    deltaTime = clock.getDelta();
    totalTime += deltaTime;
    update();
    render();
}
