'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface NewsItem {
  id: string
  title: string
  excerpt?: string
  image_url?: string
  published_at: string
}

interface NewsWidgetProps {
  baseUrl: string
  limit?: number
  variant?: 'list' | 'grid' | 'carousel'
  className?: string
}

export default function NewsWidget({
  baseUrl,
  limit = 3,
  variant = 'list',
  className = ''
}: NewsWidgetProps) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/public/news?limit=${limit}`)
        if (response.ok) {
          const data = await response.json()
          setNews(data)
        }
      } catch (error) {
        console.error('Error fetching news:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNews()
  }, [baseUrl, limit])

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden ${className}`}>
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Последние новости
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {news.map((item) => (
            <a
              key={item.id}
              href={`${baseUrl}/news/${item.id}`}
              className="block hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="p-4 flex gap-4">
                {item.image_url && (
                  <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {item.title}
                  </h4>
                  <time className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                    {format(new Date(item.published_at), 'dd MMM yyyy', { locale: ru })}
                  </time>
                </div>
              </div>
            </a>
          ))}
        </div>
        
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-center">
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

  // Grid variant
  return (
    <div className={`grid gap-4 ${variant === 'grid' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'} ${className}`}>
      {news.map((item) => (
        <a
          key={item.id}
          href={`${baseUrl}/news/${item.id}`}
          className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow group"
        >
          {item.image_url && (
            <div className="h-40 overflow-hidden">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <div className="p-4">
            <time className="text-xs text-gray-500 dark:text-gray-400 block mb-2">
              {format(new Date(item.published_at), 'dd MMMM yyyy', { locale: ru })}
            </time>
            <h4 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {item.title}
            </h4>
          </div>
        </a>
      ))}
    </div>
  )
}
