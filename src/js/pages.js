const pg = document.getElementById('pages');
const pg01logo = document.getElementById('pages-01-logo');
const pg01bt = document.getElementById('pages-01-button');
const pg02bt = document.getElementById('pages-02-button');
const pg03bt = document.getElementById('pages-03-button');
const pginfobg = document.getElementById('pages-info'); // 更新為新的頁面資訊背景
const phonecon = document.getElementById('phone-con');
let currentPage = 1; // 初始化當前頁碼
let pg03info_count = 1;

// 初始隱藏資訊背景
pginfobg.style.display = 'none'; 
phonecon.style.display = 'none';
pg03bt.style.display = 'none';

setTimeout(() => {
    // 添加隱藏樣式
    pg01logo.classList.add('hidden');

    // 等待淡出完成後隱藏元素並顯示新按鈕
    setTimeout(() => {
        pg01logo.style.display = 'none';
        
        // 顯示 pages-02-button，並移除 hidden 類

        pginfobg.style.display = 'block'; // 顯示 pages-info

        pg.classList.add('bg-hidden');

        loadContent(currentPage); // 載入當前頁面內容
        initializeAFrame(); // 初始化 A-Frame
        
    }, 500); // 與 CSS 中的 transition 時間保持一致
}, 5000);

pg01bt.addEventListener('click', (event) => {
    event.preventDefault();
    currentPage++; // 切換到下一頁

    // 當頁數超過 4 時，重置為第 1 頁
    if (currentPage > 4) currentPage = 1;

    loadContent(currentPage); // 載入新頁面的內容
});

pg02bt.addEventListener('click', (event) => {
    event.preventDefault();
    currentPage++; // 切換到下一頁

    // 當頁數超過 4 時，重置為第 1 頁
    if (currentPage > 4) currentPage = 1;

    loadContent(currentPage); // 載入新頁面的內容
});

pg03bt.addEventListener('click', (event) => {
    event.preventDefault();
    pg03info_count = (pg03info_count + 1) % 2; // 切換 pg03info_count 的值為 0 或 1

    if (pg03info_count === 0) {
        // 顯示資訊背景並添加體驗說明文字
        pginfobg.classList.remove('hidden');
        pg03bt.classList.add('back-button');

        // 移除 "體驗說明" div
        const pg03btn_word = document.getElementById('pg03btn-word');
        if (pg03btn_word) {
            pg03bt.removeChild(pg03btn_word);
        }

        // 新增圖片 div
        const newPg03btn_img = document.createElement('div');
        newPg03btn_img.id = 'pg03btn-img';
        newPg03btn_img.className = 'back-button-image';

        const img = document.createElement('img');
        img.src = '../../assets/imgs/pages/03/03-cover/03-back-button.svg';
        img.alt = '返回按鈕';
        newPg03btn_img.appendChild(img);
        pg03bt.appendChild(newPg03btn_img);

        // 新增 pages-03-logo 的 div
        const logoDiv = document.createElement('div');
        logoDiv.className = 'pages-03-logo';

        const logoImg = document.createElement('img');
        logoImg.src = '../../assets/imgs/pages/03/03/03-Logo.png';
        logoImg.alt = '第 03 頁標誌';
        logoDiv.appendChild(logoImg);

        pg03bt.appendChild(logoDiv);
        
    } else {
        // 隱藏資訊背景，移除體驗說明文字
        pginfobg.classList.add('hidden');
        pg03bt.classList.remove('back-button');

        // 創建 "體驗說明" div，如果尚未存在
        let pg03btn_word = document.getElementById('pg03btn-word');
        if (!pg03btn_word) {
            pg03btn_word = document.createElement('div');
            pg03btn_word.id = 'pg03btn-word';
            pg03btn_word.className = 'back-button';
            pg03btn_word.innerHTML = '體驗說明';
            pg03bt.appendChild(pg03btn_word);
        }

        // 移除之前的圖片 div（如果存在）
        const pg03btn_img = document.getElementById('pg03btn-img');
        if (pg03btn_img) {
            pg03bt.removeChild(pg03btn_img); // 確保移除 pg03btn-img
        }

        // 移除 pages-03-logo 的 div（如果存在）
        const logoDiv = document.querySelector('.pages-03-logo');
        if (logoDiv) {
            pg03bt.removeChild(logoDiv); // 確保移除 pages-03-logo
        }
    }
});


async function loadContent(pageNumber) {
    try {
        const response = await fetch('../../src/json/content.json');
        const data = await response.json();
        
        // 動態生成頁面鍵名，如 "page02_01" 或 "page03_01"
        const pageKey = (pageNumber === 4) ? `page03_01` : `page02_0${pageNumber}`;
        const content = data[pageKey];

        // 假設使用中文內容
        if (content) { // 確保content存在
            document.getElementById('title').textContent = content.title;
            document.getElementById('description').innerHTML = content.description.join('</br>');
            
            // 根據當前頁碼的不同，隱藏或顯示相應的資訊背景
            if (currentPage === 1) {
                pg01bt.classList.add('hidden');
                pg01bt.style.display = 'none';

                pg01bt.style.display = 'block';
                pg01bt.style.left = 'unset';
                pg01bt.style.right = 0;
                pg01bt.style.bottom = '5%';
                pg01bt.style.width = '140px';
                pg01bt.style.height = '55px';
                pg01bt.style.fontSize = '20px';
                pg01bt.style.borderRadius = '45px 0 0 45px';
                pg01bt.classList.remove('hidden');
                pg02bt.classList.add('hidden');
                pg03bt.classList.add('hidden');   
                pginfobg.classList.add('hidden');

                pg.style.zIndex = '99';
            } else {
                pginfobg.classList.remove('pages-03'); // 移除 pages-03 類               
                pginfobg.classList.remove('hidden');
                pg01bt.classList.add('hidden');
                pg02bt.classList.remove('hidden');
                pg03bt.classList.remove('hidden');        
                
                pg.style.zIndex = '101';
            }

            if (currentPage === 4) {
                pginfobg.classList.add('hidden'); 
                pginfobg.classList.add('pages-03'); // 添加 pages-03 類

                pg02bt.classList.add('hidden');
                pg02bt.style.display = 'none';

                pg03bt.style.display = 'block';
                pg03bt.style.left = 0;
                pg03bt.style.right = 'unset';
                pg03bt.style.bottom = '5%';
                pg03bt.style.width = '140px';
                pg03bt.style.height = '55px';
                pg03bt.style.fontSize = '20px';
                pg03bt.style.borderRadius = '0 45px 45px 0';
                pg03bt.classList.remove('hidden');
                pginfobg.classList.add('hidden');

                pg.style.zIndex = '99';
            } else {
                pginfobg.classList.remove('pages-03'); // 移除 pages-03 類               
                pg02bt.classList.remove('hidden');
                pginfobg.classList.remove('hidden');
                pg03bt.classList.add('hidden');        
                
                pg.style.zIndex = '101';
            }

            // 根據 currentPage 顯示或隱藏 phonecon
            if (currentPage === 2 || currentPage === 3) {
                pg02bt.style.display = 'block';
                pg02bt.style.left = '5%';
                pg02bt.style.bottom = '5%';
                pg02bt.style.width = '140px';
                pg02bt.style.height = '55px';
                pg02bt.style.borderRadius = '45px 45px 45px 45px';
                pg02bt.classList.remove('hidden');

                phonecon.style.display = 'block'; // 顯示 phonecon
            } else {
                pg02bt.classList.add('hidden');
                phonecon.style.display = 'none'; // 隱藏 phonecon
            }
        } else {
            console.error(`未找到內容: ${pageKey}`);
        }
    } catch (error) {
        console.error("無法加載內容:", error);
    }
}
