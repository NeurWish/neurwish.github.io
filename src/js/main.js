window.onload = function() {
  const coordinatesDiv = document.getElementById('coordinates');
  const cameraCoordinatesDiv = document.getElementById('camera-coordinates');
  const toggleButton = document.getElementById('toggle-button');
  const heightControls = document.getElementById('height-controls');
  const switchButton = document.getElementById('switch-button');
  const fadeOverlay = document.getElementById('fade-overlay');
  const gpsCamera = document.querySelector('[gps-camera]');
  const EARTH_RADIUS = 6371000; // 地球半徑（公尺）

  let minimized = false;
  let initialCoordinates = null;
  let currentLocationIndex = 0;
  let tripleClickTimeout = null;
  let clickCount = 0;
  let uiTimeout = null;

  // 初始化 UI 為隱藏
  hideUI();

  // 建立高度控制按鈕
  const buttonUp = document.createElement('button');
  buttonUp.className = 'height-button';
  buttonUp.innerHTML = '↑'; // 上升按鈕
  heightControls.appendChild(buttonUp);

  const buttonDown = document.createElement('button');
  buttonDown.className = 'height-button';
  buttonDown.innerHTML = '↓'; // 下降按鈕
  heightControls.appendChild(buttonDown);

  buttonUp.addEventListener('click', (event) => {
    event.preventDefault();
    var position = gpsCamera.getAttribute('position');
    position.y += 0.1; // 每次點擊增加 0.1 公尺
    gpsCamera.setAttribute('position', position);
  });

  buttonDown.addEventListener('click', (event) => {
    event.preventDefault();
    var position = gpsCamera.getAttribute('position');
    position.y -= 0.1; // 每次點擊減少 0.1 公尺
    gpsCamera.setAttribute('position', position);
  });

  // 切換模擬位置
  const locations = [
    { latitude: 22.838301, longitude: 120.416253 }, // 第一個位置
    { latitude: 22.738301, longitude: 120.316253 }, // 第二個位置
    { latitude: 22.572110149552514, longitude: 120.3253901992984 } // 第三個位置
  ];

  switchButton.addEventListener('click', (event) => {
    event.preventDefault();
    hideUI();

    fadeOverlay.style.opacity = 1; // 遮罩漸入

    setTimeout(() => {
      const { latitude, longitude } = locations[currentLocationIndex];
      gpsCamera.setAttribute('gps-camera', `simulateLatitude: ${latitude}; simulateLongitude: ${longitude}`);
      currentLocationIndex = (currentLocationIndex + 1) % locations.length;

      fadeOverlay.style.opacity = 0; // 遮罩漸出
      setTimeout(() => showUI(), 1000);
    }, 1000);
  });

  // 點擊偵測
  document.body.addEventListener('click', () => {
    clickCount++;
    if (tripleClickTimeout) clearTimeout(tripleClickTimeout);
    tripleClickTimeout = setTimeout(() => {
      clickCount = 0;
    }, 300);

    if (clickCount === 3) {
      toggleUIVisibility();
      clickCount = 0;
    }
  });

  // 顯示 UI
  function showUI() {
    coordinatesDiv.style.display = 'block';
    cameraCoordinatesDiv.style.display = 'block';
    heightControls.style.display = 'flex';
    toggleButton.style.display = 'block';
    switchButton.style.display = 'block';
    resetUITimeout(); // 重設 10 秒後隱藏 UI 的計時器
  }

  // 隱藏 UI
  function hideUI() {
    coordinatesDiv.style.display = 'none';
    cameraCoordinatesDiv.style.display = 'none';
    heightControls.style.display = 'none';
    toggleButton.style.display = 'none';
    switchButton.style.display = 'none';
    clearTimeout(uiTimeout);
  }

  // 切換 UI 顯示狀態
  function toggleUIVisibility() {
    const isHidden = coordinatesDiv.style.display === 'none';
    if (isHidden) {
      showUI();
    } else {
      hideUI();
    }
  }

  // 重設 10 秒後隱藏 UI 的計時器
  function resetUITimeout() {
    if (uiTimeout) clearTimeout(uiTimeout);
    uiTimeout = setTimeout(() => hideUI(), 10000); // 10 秒後自動隱藏 UI
  }

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

      if (initialCoordinates === null) {
        initialCoordinates = { latitude, longitude, altitude };
        coordinatesDiv.innerHTML = `Initial Coordinates set: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}, Altitude: ${altitude ? altitude.toFixed(2) + ' meters' : 'Unavailable'}`;
      } else {
        coordinatesDiv.innerHTML = `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}, Altitude: ${altitude ? altitude.toFixed(2) + ' meters' : 'Unavailable'}`;
      }
    },
    (error) => {
      coordinatesDiv.innerHTML = `Error getting location: ${error.message}`;
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 2700
    }
  );

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

  setInterval(() => {
    const cameraPosition = gpsCamera.object3D.position;
    cameraCoordinatesDiv.innerHTML = `Camera Position: X: ${cameraPosition.x.toFixed(2)}, Y: ${cameraPosition.y.toFixed(2)}, Z: ${cameraPosition.z.toFixed(2)}`;
  }, 100);
};
