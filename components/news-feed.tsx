'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface NewsItem {
  id: string
  title: string
  slug: string
  excerpt?: string
  image_url?: string
  published_at: string
  channel: {
    name: string
    slug: string
  }
}

interface NewsFeedProps {
  baseUrl: string
  channelSlug?: string
  limit?: number
  showImages?: boolean
  showExcerpt?: boolean
  className?: string
}

export default function NewsFeed({
  baseUrl,
  channelSlug,
  limit = 5,
  showImages = true,
  showExcerpt = true,
  className = ''
}: NewsFeedProps) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const url = channelSlug
          ? `${baseUrl}/api/public/news?channel=${channelSlug}&limit=${limit}`
          : `${baseUrl}/api/public/news?limit=${limit}`

        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error('Failed to fetch news')
        }

        const data = await response.json()
        setNews(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchNews()
  }, [baseUrl, channelSlug, limit])

  if (isLoading) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">Загрузка новостей...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-red-500">Ошибка загрузки новостей: {error}</p>
      </div>
    )
  }

  if (news.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">Новостей пока нет</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {news.map((item) => (
        <article
          key={item.id}
          className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {showImages && item.image_url && (
              <div className="md:w-48 h-32 flex-shrink-0 overflow-hidden rounded-lg">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                  {item.channel.name}
                </span>
                <time className="text-xs text-gray-500 dark:text-gray-400">
                  {format(new Date(item.published_at), 'dd MMMM yyyy', { locale: ru })}
                </time>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <a href={`${baseUrl}/news/${item.id}`} className="hover:underline">
                  {item.title}
                </a>
              </h3>
              
              {showExcerpt && item.excerpt && (
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                  {item.excerpt}
                </p>
              )}
              
              <a
                href={`${baseUrl}/news/${item.id}`}
                className="inline-flex items-center mt-3 text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium"
              >
                Читать далее →
              </a>
            </div>
          </div>
        </article>
      ))}
      
      <div className="pt-4 text-center">
        <a
          href={`${baseUrl}/dashboard`}
          className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium"
        >
          Все новости →
        </a>
      </div>
    </div>
  )
}
