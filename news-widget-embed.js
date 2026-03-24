<!-- 
  UNIVERSAL NEWS WIDGET
  
  Usage: Set NEWS_WIDGET_CONFIG before including this file
  
  Example:
  <script>
    window.NEWS_WIDGET_CONFIG = {
      channelId: '52b8077c-d760-47f2-bec8-f130c668d50f', // Required: Channel ID
      newsPageUrl: 'news.html', // Optional: URL to full news page (default: 'news.html')
      containerId: 'news-widget-container' // Optional: Container ID (default: 'news-widget-container')
    };
  </script>
  <script src="news-widget-embed.js"></script>
-->

<style>
  /* ===== NEWS WIDGET STYLES ===== */
  .news-widget-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 18px;
    margin-top: 16px;
  }
  
  .news-widget-card {
    background: var(--card, #1e293b);
    border: 1px solid var(--border, rgba(255, 255, 255, 0.1));
    border-radius: var(--radius, 16px);
    overflow: hidden;
    box-shadow: var(--shadow, 0 10px 25px rgba(0, 0, 0, 0.2));
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
  }
  
  .news-widget-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 42px rgba(0,0,0,.15);
  }
  
  .news-widget-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    background: var(--primary-weak, #083344);
  }
  
  .news-widget-content {
    padding: 18px;
    display: flex;
    flex-direction: column;
  }
  
  .news-widget-title {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 8px;
    line-height: 1.4;
    color: var(--ink, #e2e8f0);
  }
  
  .news-widget-excerpt {
    font-size: 0.9rem;
    color: var(--muted, #94a3b8);
    line-height: 1.5;
    margin-bottom: 12px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex-grow: 1;
  }
  
  .news-widget-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    color: var(--muted, #94a3b8);
    margin-top: auto;
    padding-top: 12px;
    border-top: 1px solid var(--border, rgba(255, 255, 255, 0.1));
  }
  
  .news-widget-date {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .news-widget-loading {
    text-align: center;
    padding: 30px;
    color: var(--muted, #94a3b8);
    font-size: 1rem;
  }
  
  .news-widget-empty {
    text-align: center;
    padding: 40px 20px;
    color: var(--muted, #94a3b8);
    font-size: 1.1rem;
  }
  
  .news-widget-view-all {
    text-align: center;
    margin-top: 24px;
  }
  
  .news-widget-view-all a {
    display: inline-block;
    text-decoration: none;
    background: var(--primary, #06b6d4);
    color: #fff;
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 700;
    transition: transform 0.2s;
  }
  
  .news-widget-view-all a:hover {
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    .news-widget-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

<div id="news-widget-container" class="news-widget-wrapper">
  <div id="news-widget-grid" class="news-widget-grid">
    <!-- News will be loaded here -->
  </div>
</div>

<script>
(function() {
  // Configuration
  const config = window.NEWS_WIDGET_CONFIG || {};
  const CHANNEL_ID = config.channelId;
  const NEWS_PAGE_URL = config.newsPageUrl || 'news.html';
  const CONTAINER_ID = config.containerId || 'news-widget-container';
  const API_URL = 'https://blog-three-opal-85.vercel.app/api/news-simple';
  
  if (!CHANNEL_ID) {
    console.error('❌ NEWS WIDGET ERROR: channelId is required in NEWS_WIDGET_CONFIG');
    document.getElementById(CONTAINER_ID).innerHTML = '<div class="news-widget-empty">⚠️ Widget not configured</div>';
    return;
  }
  
  let currentOffset = 0;
  const limit = 12;
  let isLoading = false;
  let hasMore = true;
  let allNews = [];
  
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
        viewAllBtn.innerHTML = '<a href="' + NEWS_PAGE_URL + '">📰 Все новости →</a>';
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
      const date = new Date(news.published_at).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const excerpt = news.excerpt || (news.content ? news.content.substring(0, 150) + '...' : '');
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
  
  function escapeHtmlForAttr(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
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
</script>
