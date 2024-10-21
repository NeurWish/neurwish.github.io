window.onload = function() {
  const coordinatesDiv = document.getElementById('coordinates');
  const cameraCoordinatesDiv = document.getElementById('camera-coordinates');
  const toggleButton = document.createElement('div');
  toggleButton.id = 'toggle-button';
  toggleButton.innerHTML = '→'; // 箭頭符號
  document.body.appendChild(toggleButton);

  let minimized = false;
  let initialCoordinates = null; // 存儲初始座標
  const gpsCamera = document.querySelector('[gps-camera]');
  const EARTH_RADIUS = 6371000; // 地球半徑（公尺）

  // 監聽三次點擊的透明div
  const clickListener = document.getElementById('click-listener');
  clickListener.style.position = 'absolute';
  clickListener.style.top = '0';
  clickListener.style.left = '0';
  clickListener.style.width = '100vw';
  clickListener.style.height = '100vh';
  clickListener.style.zIndex = '10000'; // 確保點擊區域在最上層
  clickListener.style.backgroundColor = 'transparent'; // 透明背景
  let clickCount = 0;
  let hideTimeout;

  // 顯示UI元素並設置自動隱藏的計時器
  const showUI = () => {
    clearTimeout(hideTimeout); // 清除舊的隱藏計時器
    coordinatesDiv.style.display = 'block';
    cameraCoordinatesDiv.style.display = 'block';
    toggleButton.style.display = 'block';
    document.getElementById('height-controls').style.display = 'flex';
    document.getElementById('switch-button').style.display = 'block';

    // 設置10秒後自動隱藏UI
    hideTimeout = setTimeout(() => {
      coordinatesDiv.style.display = 'none';
      cameraCoordinatesDiv.style.display = 'none';
      toggleButton.style.display = 'none';
      document.getElementById('height-controls').style.display = 'none';
      document.getElementById('switch-button').style.display = 'none';
      clickListener.style.display = 'block'; // 顯示透明div來再次喚醒UI
    }, 10000);
  };

  // 隱藏UI
  const hideUI = () => {
    coordinatesDiv.style.display = 'none';
    cameraCoordinatesDiv.style.display = 'none';
    toggleButton.style.display = 'none';
    document.getElementById('height-controls').style.display = 'none';
    document.getElementById('switch-button').style.display = 'none';
    clickListener.style.display = 'block'; // 顯示透明div來再次喚醒UI
  };

  // 計算點擊次數以觸發UI顯示
  clickListener.addEventListener('click', () => {
    clickCount += 1;
    if (clickCount === 3) {
      clickCount = 0; // 重置點擊次數
      showUI();
      clickListener.style.display = 'none'; // 隱藏透明div
    }
  });

  // 初始化時隱藏所有UI
  hideUI();

  // 建立高度控制按鈕
  const heightControls = document.createElement('div');
  heightControls.id = 'height-controls';
  document.body.appendChild(heightControls);

  const buttonUp = document.createElement('button');
  buttonUp.className = 'height-button';
  buttonUp.innerHTML = '↑'; // 上升按鈕
  heightControls.appendChild(buttonUp);

  const buttonDown = document.createElement('button');
  buttonDown.className = 'height-button';
  buttonDown.innerHTML = '↓'; // 下降按鈕
  heightControls.appendChild(buttonDown);

  // 切換模擬經緯度的按鈕
  const switchButton = document.createElement('button');
  switchButton.id = 'switch-button';
  switchButton.innerHTML = '切換位置'; // 按鈕文字
  document.body.appendChild(switchButton);

  buttonUp.addEventListener('click', (event) => {
    event.preventDefault();  // 阻止預設行為
    var position = gpsCamera.getAttribute('position');
    position.y += 0.1; // 每次點擊增加0.1公尺
    gpsCamera.setAttribute('position', position);
  });

  buttonDown.addEventListener('click', (event) => {
    event.preventDefault();  // 阻止預設行為
    var position = gpsCamera.getAttribute('position');
    position.y -= 0.1; // 每次點擊減少0.1公尺
    gpsCamera.setAttribute('position', position);
  });

  // 切換模擬位置
  let currentLocationIndex = 0; // 初始位置索引為 0
  const locations = [
    { latitude: 22.838301, longitude: 120.416253 }, // 第一個位置
    { latitude: 22.738301, longitude: 120.316253 }, // 第二個位置
    { latitude: 22.572110149552514, longitude: 120.3253901992984 } // 第三個位置
  ];

  switchButton.addEventListener('click', (event) => {
    event.preventDefault(); // 阻止預設行為
    // 隱藏UI
    document.getElementById('coordinates').style.display = 'none';
    document.getElementById('camera-coordinates').style.display = 'none';
    document.getElementById('height-controls').style.display = 'none';
    toggleButton.style.display = 'none';
    
    // 觸發遮罩漸變效果
    const fadeOverlay = document.getElementById('fade-overlay');
    fadeOverlay.style.opacity = 1; // 遮罩漸入（變黑）
  
    // 設置 1 秒的延遲來等待黑屏效果完成
    setTimeout(() => {
      // 切換 GPS 模擬位置
      const { latitude, longitude } = locations[currentLocationIndex];
      gpsCamera.setAttribute('gps-camera', `simulateLatitude: ${latitude}; simulateLongitude: ${longitude}`);
  
      // 更新索引，並確保不會超過位置陣列的長度
      currentLocationIndex = (currentLocationIndex + 1) % locations.length;
  
      // 畫面恢復顯示
      fadeOverlay.style.opacity = 0; // 遮罩漸出（淡出黑屏）
  
      // 恢復UI顯示
      setTimeout(() => {
        document.getElementById('coordinates').style.display = 'block';
        document.getElementById('camera-coordinates').style.display = 'block';
        document.getElementById('height-controls').style.display = 'flex';
        toggleButton.style.display = 'block';
      }, 1000); // 遮罩完全淡出後顯示UI
    }, 1000); // 1 秒的延遲（與遮罩效果一致）
  });

  toggleButton.addEventListener('click', () => {
    minimized = !minimized;
    coordinatesDiv.classList.toggle('minimized', minimized);
    cameraCoordinatesDiv.classList.toggle('minimized', minimized);
    toggleButton.innerHTML = minimized ? '←' : '→';
    if (minimized) {
      toggleButton.style.top = '15px';
    } else {
      const coordinatesHeight = coordinatesDiv.offsetHeight;
      toggleButton.style.top = `${coordinatesHeight + 70}px`;
    }
  });

  if (!gpsCamera) {
    coordinatesDiv.innerHTML = 'GPS camera not found!';
    return;
  }

  navigator.geolocation.watchPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const altitude = position.coords.altitude;

      // 如果初始座標為 null，則設置初始座標
      if (initialCoordinates === null) {
        initialCoordinates = { latitude, longitude, altitude };
        coordinatesDiv.innerHTML = `Initial Coordinates set: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}, Altitude: ${altitude ? altitude.toFixed(2) + ' meters' : 'Unavailable'}`;
      } else {
        // 更新座標顯示
        coordinatesDiv.innerHTML = `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}, Altitude: ${altitude ? altitude.toFixed(2) + ' meters' : 'Unavailable'}`;
      }
    },
    (error) => {
      coordinatesDiv.innerHTML = `Error getting location: ${error.message}`;
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 2700 // 將 timeout 設為更低的數值
    }
  );

  let smoothAccX = 0;
  let smoothAccY = 0;
  let smoothAccZ = 0;

  const smoothingFactor = 0.1; // 可以根據需要調整

  window.addEventListener('devicemotion', function(event) {
    const accX = event.accelerationIncludingGravity.x;
    const accY = event.accelerationIncludingGravity.y;
    const accZ = event.accelerationIncludingGravity.z;

    // 平滑加速度數據
    smoothAccX = smoothAccX * (1 - smoothingFactor) + accX * smoothingFactor;
    smoothAccY = smoothAccY * (1 - smoothingFactor) + accY * smoothingFactor;
    smoothAccZ = smoothAccZ * (1 - smoothingFactor) + accZ * smoothingFactor;

    // 更新相機位置的邏輯...
  });

  const threshold = 0.05; // 根據需要調整閾值

  window.addEventListener('devicemotion', function(event) {
    const accX = event.accelerationIncludingGravity.x;
    const accY = event.accelerationIncludingGravity.y;
    const accZ = event.accelerationIncludingGravity.z;

    // 檢查加速度是否超過閾值
    if (Math.abs(accX) > threshold || Math.abs(accY) > threshold || Math.abs(accZ) > threshold) {
      // 更新相機位置的邏輯...
    }
  });

  gpsCamera.addEventListener('gps-camera-update-position', (event) => {
    const { longitude, latitude, altitude } = event.detail.position;

    if (latitude && longitude) {
      coordinatesDiv.innerHTML = `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}, Altitude: ${altitude ? altitude.toFixed(2) + ' meters' : 'Unavailable'}`;
    } else {
      coordinatesDiv.innerHTML = 'No GPS position data available!';
    }
  });

  gpsCamera.addEventListener('gps-camera-origin-coord-set', () => {
    coordinatesDiv.innerHTML = 'GPS signal initialized. Waiting for first position...';
  });

  gpsCamera.addEventListener('gps-camera-error', (event) => {
    coordinatesDiv.innerHTML = `Error: ${event.detail.error.message}`;
  });

  // 定期更新相機位置
  setInterval(() => {
    const cameraPosition = gpsCamera.object3D.position;
    cameraCoordinatesDiv.innerHTML = `Camera Position: X: ${cameraPosition.x.toFixed(2)}, Y: ${cameraPosition.y.toFixed(2)}, Z: ${cameraPosition.z.toFixed(2)}`;
  }, 100); // 每 100 毫秒更新一次
};
