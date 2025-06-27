// 注意：請將此檔案放置於 static/js/main.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const resultsDiv = document.querySelector('.results');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    // 顯示載入中
    resultsDiv.innerHTML = '<p>載入中…</p>';

    const mode = form.mode.value;
    const url = form.url.value.trim();
    const keyword = form.keyword ? form.keyword.value.trim() : '';
    const pages = form.pages ? parseInt(form.pages.value, 10) : 1;

    try {
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, keyword, pages })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error('爬蟲失敗');
      }

      // 根據模式渲染
      resultsDiv.innerHTML = '';
      if (mode === 'youtube') {
        // YouTube 留言表格
        const table = document.createElement('table');
        table.innerHTML = `
          <thead>
            <tr>
              <th>ID</th>
              <th>作者</th>
              <th>頻道 ID</th>
              <th>留言內容</th>
              <th>影片連結</th>
            </tr>
          </thead>
          <tbody>
            ${data.results.map(item => `
              <tr>
                <td>${item.id}</td>
                <td>${item.author || ''}</td>
                <td>${item.author_channel_id || ''}</td>
                <td>${item.content || ''}</td>
                <td><a href="${item.link || ''}" target="_blank">連結</a></td>
              </tr>
            `).join('')}
          </tbody>
        `;
        resultsDiv.appendChild(table);
      } else {
        // 一般結果卡片
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'results-cards';

        data.results.forEach(item => {
          const card = document.createElement('div');
          card.className = 'item';

          // 圖片
          if (item.static_url) {
            const img = document.createElement('img');
            img.src = item.static_url;
            img.alt = item.title || '';
            card.appendChild(img);
          }

          // 標題
          const h3 = document.createElement('h3');
          h3.textContent = item.title || '';
          card.appendChild(h3);

          // 內容
          const p = document.createElement('p');
          p.textContent = item.content || '';
          card.appendChild(p);

          // 連結
          if (item.link) {
            const a = document.createElement('a');
            a.href = item.link;
            a.target = '_blank';
            a.textContent = item.link;
            card.appendChild(a);
          }

          cardsContainer.appendChild(card);
        });

        resultsDiv.appendChild(cardsContainer);
      }
    } catch (err) {
      console.error(err);
      resultsDiv.innerHTML = `<p style="color:red;">錯誤：${err.message}</p>`;
    }
  });
});
