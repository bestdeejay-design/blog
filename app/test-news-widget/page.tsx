'use client'

import { useEffect, useState } from 'react'

interface NewsItem {
  id: string
  title: string
  content: string
  excerpt?: string
  published_at: string
  channels?: {
    name: string
  }
  user_profiles?: {
    full_name?: string
    username?: string
  }
}

export default function TestNewsWidget() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadNews() {
      try {
        console.log('Loading news...')
        const response = await fetch('/api/public/news?limit=10')
        const data = await response.json()
        
        console.log('Received data:', data)
        
        if (data.success && data.news && data.news.length > 0) {
          setNews(data.news)
        } else {
          setError('Новостей пока нет')
        }
      } catch (err: any) {
        console.error('Error loading news:', err)
        setError(err.message || 'Ошибка загрузки новостей')
      } finally {
        setLoading(false)
      }
    }

    loadNews()
  }, [])

  const escapeHtml = (text?: string) => {
    if (!text) return ''
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-3">
          📰 Новости
        </h1>
        <p className="text-white/90 text-center mb-12">
          Тест виджета для GitHub Pages
        </p>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            🔥 Последние новости
          </h2>

          {loading ? (
            <div className="text-center py-12 text-gray-500 text-lg">
              ⏳ Загрузка новостей...
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="inline-block bg-red-50 text-red-600 px-6 py-4 rounded-xl border-2 border-red-200">
                ❌ {error}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {news.map((item) => {
                const date = new Date(item.published_at).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })

                const channelName = item.channels?.name || 'Без канала'
                const authorName = item.user_profiles?.full_name || item.user_profiles?.username
                const excerpt = item.excerpt || (item.content ? item.content.substring(0, 200) + '...' : '')

                return (
                  <div
                    key={item.id}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-l-4 border-blue-600 hover:shadow-lg transition-all duration-300 hover:translate-x-1"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {escapeHtml(item.title)}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {escapeHtml(excerpt)}
                    </p>
                    <div className="flex flex-wrap gap-4 items-center text-sm">
                      <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded-full font-medium">
                        📺 {escapeHtml(channelName)}
                      </span>
                      <span className="text-gray-600 flex items-center gap-1.5">
                        📅 {date}
                      </span>
                      {authorName && (
                        <span className="text-gray-600 flex items-center gap-1.5">
                          ✍️ {escapeHtml(authorName)}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <a
            href="/dashboard"
            className="inline-block bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all backdrop-blur-sm"
          >
            ← Вернуться в админку
          </a>
        </div>
      </div>
    </div>
  )
}
