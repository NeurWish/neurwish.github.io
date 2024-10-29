const pg = document.getElementById('pages');
const pg01logo = document.getElementById('pages-01-logo');
const pg01bt = document.getElementById('pages-01-button');
const pg02bt = document.getElementById('pages-02-button');
const pg03bt = document.getElementById('pages-03-button');
const pginfobg = document.getElementById('pages-info'); // 更新為新的頁面資訊背景
const phonecon = document.getElementById('phone-con');
const ti = document.getElementById('title');
const des = document.getElementById('description');
let currentPage = 0; // 初始化當前頁碼
let pg03info_count = 1;

// 初始隱藏資訊背景
pginfobg.style.display = 'none'; 
phonecon.style.display = 'none';
pg03bt.style.display = 'none';

pg01bt.addEventListener('click', (event) => {
    event.preventDefault();
    currentPage++; // 切換到下一頁

    pg01logo.classList.add('hidden');
    pg01logo.style.display = 'none';
        
    // 顯示 pages-02-button，並移除 hidden 類

    pginfobg.style.display = 'block'; // 顯示 pages-info

    loadContent(currentPage); // 載入當前頁面內容
    initializeAFrame(); // 初始化 A-Frame

    // 當頁數超過 4 時，重置為第 1 頁
    if (currentPage > 4) currentPage = 0;

    loadContent(currentPage); // 載入新頁面的內容
});

pg02bt.addEventListener('click', (event) => {
    event.preventDefault();
    currentPage++; // 切換到下一頁

    pg.classList.add('bg-hidden');

    // 當頁數超過 4 時，重置為第 1 頁
    if (currentPage > 4) currentPage = 0;

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

                pg01bt.style.display = 'block';
                pg01bt.style.left = 'unset';
                pg01bt.style.right = 0;
                pg01bt.style.bottom = '5%';
                pg01bt.style.width = '140px';
                pg01bt.style.height = '55px';
                pg01bt.style.fontSize = '20px';
                pg01bt.style.borderRadius = '45px 0 0 45px';
                pg01bt.classList.add('hidden');
                pg02bt.classList.remove('hidden');
                pg03bt.classList.add('hidden');   

                pg.style.zIndex = '99';
            } else {
                pginfobg.classList.remove('pages-03'); // 移除 pages-03 類               
                pginfobg.classList.remove('hidden');
                pginfobg.style.backgroundImage = "url('../../assets/imgs/pages/01/01-bg.png')";

                pg01bt.style.display = 'none';
                pg02bt.classList.add('hidden');
                pg03bt.classList.remove('hidden');   
                
                pg.style.zIndex = '101';
            }

            let dotContainer = document.getElementById('dot-container');

// 根據 currentPage 顯示或隱藏 phonecon
if (currentPage === 2 || currentPage === 3) {
    if (!dotContainer) {
        dotContainer = document.createElement('div');
        dotContainer.id = 'dot-container';
        
        const dotImage = document.createElement('img');
        dotImage.src = currentPage === 2 
            ? '../../assets/imgs/pages/02/02-2.3/page-02-dot-01.png'
            : '../../assets/imgs/pages/02/02-2.3/page-02-dot-02.png';
        
        dotContainer.className = currentPage === 2 ? 'pages-02-dot-01' : 'pages-02-dot-02';
        dotContainer.appendChild(dotImage);
        pginfobg.appendChild(dotContainer);
    } else {
        dotContainer.className = currentPage === 2 ? 'pages-02-dot-01' : 'pages-02-dot-02';
        dotContainer.querySelector('img').src = currentPage === 2 
            ? '../../assets/imgs/pages/02/02-2.3/page-02-dot-01.png'
            : '../../assets/imgs/pages/02/02-2.3/page-02-dot-02.png';
    }

    pg02bt.classList.remove('hidden');
    pg.classList.add('bg-hidden');
    ti.classList.add('hidden');
    des.classList.add('description-page02-01');
} else {
    ti.classList.remove('hidden');
    des.classList.remove('description-page02-01');
    
    if (dotContainer) {
        dotContainer.remove();
    }
}
 

            if (currentPage === 3) {

                phonecon.style.display = 'block';// 顯示 phonecon
                des.classList.add('description-page02-02');
            } else {

                phonecon.style.display = 'none'; // 隱藏 phonecon
                des.classList.remove('description-page02-02');
            }

            if (currentPage === 4) {
                ti.classList.add('title-page03-01');
                des.classList.add('description-page03-01');

                
                pginfobg.classList.add('hidden'); // 添加 pages-03 類

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
                
                pg.style.zIndex = '99';
                // 检查是否已经创建英文部分，如没有则创建
                if (!document.getElementById('title-en')) {
                    const titleEn = document.createElement('div');
                    titleEn.id = 'title-en';
                    titleEn.className = 'title-en';
                    titleEn.textContent = content.title_en;
                    pginfobg.appendChild(titleEn);
                } else {
                    document.getElementById('title-en').textContent = content.title_en;
                }

                if (!document.getElementById('description-en')) {
                    const descriptionEn = document.createElement('div');
                    descriptionEn.id = 'description-en';
                    descriptionEn.className = 'description-en';
                    descriptionEn.innerHTML = content.description_en.join('</br>');
                    pginfobg.appendChild(descriptionEn);
                } else {
                    document.getElementById('description-en').innerHTML = content.description_en.join('</br>');
                }

                // 更新其他样式和按钮信息
                pg02bt.classList.add('hidden');
                pg03bt.classList.remove('hidden');
                pg03bt.style.display = 'block';

            } else {
                ti.classList.remove('title-page03-01');
                des.classList.remove('description-page03-01');

                // 隐藏英文标题和描述
                const titleEn = document.getElementById('title-en');
                const descriptionEn = document.getElementById('description-en');
                if (titleEn) titleEn.style.display = 'none';
                if (descriptionEn) descriptionEn.style.display = 'none';

                // 设置其他页面的内容显示
                pg02bt.classList.remove('hidden');
                pg03bt.classList.add('hidden');
                pginfobg.classList.remove('pages-03');
            
                pg.style.zIndex = '101';
            } 
        } else {
            console.error(`未找到內容: ${pageKey}`);
        }
    } catch (error) {
        console.error("無法加載內容:", error);
    }
}
