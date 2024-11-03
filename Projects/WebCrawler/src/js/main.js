document.getElementById('crawler-form').addEventListener('submit', function (event) {
  event.preventDefault();

  const url = document.getElementById('url').value;
  const keywords = document.getElementById('keywords').value;
  const engine = document.getElementById('engine').value;

  // 使用 fetch 發送請求到後端
  fetch('/api/crawl', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url, keywords, engine })
  })
  .then(response => response.json())
  .then(data => {
      // 顯示爬取結果
      const resultsDiv = document.getElementById('results');
      resultsDiv.innerHTML = '<h2>爬取結果</h2>' + data.results.map(result => `<p>${result}</p>`).join('');
  })
  .catch(error => {
      console.error('錯誤:', error);
  });
});
