import { createClient } from '@/lib/supabase/server'
import { getPublishedNews, getCurrentUser } from '@/lib/data'
import Link from 'next/link'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const news = await getPublishedNews(undefined, 20)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Лента новостей
        </h1>
        {user && (
          <Link
            href="/dashboard/news/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            + Добавить новость
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {news.map((item: any) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
          >
            {item.image_url && (
              <div className="h-48 w-full overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {item.channel.name}
                </span>
                <time className="text-xs text-gray-500 dark:text-gray-400">
                  {format(new Date(item.published_at), 'dd MMMM yyyy', { locale: ru })}
                </time>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                {item.excerpt || item.content.substring(0, 150)}...
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Автор: {item.author.full_name || item.author.email}
                </span>
                <Link
                  href={`/dashboard/news/${item.id}`}
                  className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 text-sm font-medium"
                >
                  Читать →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {news.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Новостей пока нет
          </p>
        </div>
      )}
    </div>
  )
}
