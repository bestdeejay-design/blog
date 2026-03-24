/* 
  UNIVERSAL NEWS WIDGET
/* 
  Usage: Set NEWS_WIDGET_CONFIG before including this file
  
  Example:
  <script>
    window.NEWS_WIDGET_CONFIG = {
      channelId: '52b8077c-d760-47f2-bec8-f130c668d50f',
      newsPageUrl: 'news.html',
      containerId: 'news-widget-container'
    };
  </script>
  <!-- Подключаем стили с повышенной специфичностью -->
  <link rel="stylesheet" href="news-widget-override.css">
  <script src="news-widget.js"></script>
*/

(function() {
  // Configuration
  const config = window.NEWS_WIDGET_CONFIG || {};
  const CHANNEL_ID = config.channelId;
  const NEWS_PAGE_URL = config.newsPageUrl || 'news.html';
  const CONTAINER_ID = config.containerId || 'news-widget-container';
  const API_URL = 'https://blog-three-opal-85.vercel.app/api/news-simple';
  
  if (!CHANNEL_ID) {
    console.error('❌ NEWS WIDGET ERROR: channelId is required in NEWS_WIDGET_CONFIG');
    const container = document.getElementById(CONTAINER_ID);
    if (container) {
      container.innerHTML = '<div class="news-widget-empty">⚠️ Widget not configured</div>';
    }
    return;
  }
  
  let currentOffset = 0;
  const limit = 12;
  let isLoading = false;
  let hasMore = true;
  let allNews = [];
  
  // Ensure container exists
  function ensureContainer() {
    let container = document.getElementById(CONTAINER_ID);
    if (!container) {
      container = document.createElement('div');
      container.id = CONTAINER_ID;
      container.className = 'news-widget-wrapper';
      container.innerHTML = '<div class="container"><div id="news-widget-grid" class="news-widget-grid"></div></div>';
      // Try to append to section or body
      const section = document.querySelector('section#news') || document.querySelector('.section');
      if (section) {
        section.appendChild(container);
      } else {
        document.body.appendChild(container);
      }
    }
    return container;
  }
  
  ensureContainer();
  
  async function loadNews() {
    if (isLoading) return;
    
    isLoading = true;
    const container = document.getElementById('news-widget-grid');
    
    try {
      const response = await fetch(`${API_URL}?limit=${limit}&offset=${currentOffset}&channel_id=${CHANNEL_ID}`);
      const data = await response.json();
      
      if (!data.success || !data.news || data.news.length === 0) {
        if (allNews.length === 0) {
          container.innerHTML = '<div class="news-widget-empty">Новостей пока нет 📭</div>';
        }
        return;
      }
      
      allNews = [...allNews, ...(data.news || [])];
      hasMore = data.hasMore || false;
      currentOffset += limit;
      
      renderNewsList(allNews);
      
      // Add "View All" button
      if (allNews.length > 0 && !document.querySelector('.news-widget-view-all')) {
        const viewAllBtn = document.createElement('div');
        viewAllBtn.className = 'news-widget-view-all';
        const theme = localStorage.getItem('theme') || 'dark';
        viewAllBtn.innerHTML = '<a href="' + NEWS_PAGE_URL + '?theme=' + theme + '">📰 Все новости →</a>';
        document.getElementById(CONTAINER_ID).appendChild(viewAllBtn);
      }
    } catch (error) {
      console.error('Error loading news:', error);
      if (allNews.length === 0) {
        container.innerHTML = '<div class="news-widget-empty">❌ Ошибка загрузки новостей</div>';
      }
    }
    
    isLoading = false;
  }
  
  function renderNewsList(newsList) {
    const container = document.getElementById('news-widget-grid');
    container.innerHTML = '';
    
    newsList.forEach(news => {
      // Используем created_at для даты создания
      const dateRaw = news.created_at || news.published_at;
      const date = new Date(dateRaw).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Use excerpt if available, otherwise generate from content
      let excerpt = '';
      
      if (news.excerpt) {
        // Use custom excerpt if provided
        excerpt = news.excerpt;
      } else if (news.content) {
        // Strip HTML tags and take first 150 characters
        const tmp = document.createElement('div');
        tmp.innerHTML = news.content;
        const plainText = tmp.textContent || tmp.innerText || '';
        excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
      }
      const imageUrl = news.thumbnail || null;
      
      const card = document.createElement('div');
      card.className = 'news-widget-card';
      card.onclick = () => openNewsModal(news);
      card.innerHTML = `
        ${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="" class="news-widget-image" />` : ''}
        <div class="news-widget-content">
          <h3 class="news-widget-title">${escapeHtml(news.title)}</h3>
          <p class="news-widget-excerpt">${escapeHtml(excerpt)}</p>
          <div class="news-widget-meta">
            <span class="news-widget-date">📅 ${date}</span>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }
  
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  function openNewsModal(news) {
    // Try to find modal if it exists
    const modal = document.getElementById('news-modal');
    if (modal) {
      // Use existing modal
      window.showNewsModal && window.showNewsModal(news);
    } else {
      // Redirect to news page
      window.location.href = NEWS_PAGE_URL + '?news=' + news.id;
    }
  }
  
  // Load news on init
  loadNews();
})();
