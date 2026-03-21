import { getNewsById } from '@/lib/data'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import Link from 'next/link'

export default async function NewsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const news = await getNewsById(id)

  if (!news) {
    notFound()
  }

  return (
    <article className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 text-sm font-medium"
        >
          ← Назад к ленте
        </Link>
      </div>

      {news.image_url && (
        <div className="w-full h-96 overflow-hidden rounded-lg mb-6">
          <img
            src={news.image_url}
            alt={news.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {news.channel.name}
          </span>
          <time className="text-sm text-gray-500 dark:text-gray-400">
            {format(new Date(news.published_at), 'dd MMMM yyyy', { locale: ru })}
          </time>
          {news.news_channels && news.news_channels.length > 1 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Опубликовано в {news.news_channels.length} каналах
            </span>
          )}
        </div>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {news.title}
        </h1>

        {news.excerpt && (
          <p className="text-xl text-gray-600 dark:text-gray-400 italic border-l-4 border-indigo-600 pl-4">
            {news.excerpt}
          </p>
        )}

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            {news.author.avatar_url ? (
              <img
                src={news.author.avatar_url}
                alt={news.author.full_name || 'Author'}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                {(news.author.full_name || news.author.email)[0].toUpperCase()}
              </div>
            )}
            <span>
              {news.author.full_name || news.author.email}
            </span>
          </div>
          <span>•</span>
          <span>{news.views_count} просмотров</span>
        </div>
      </header>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <div
          className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />
      </div>

      {news.news_channels && news.news_channels.length > 0 && (
        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Также опубликовано в:
          </h3>
          <div className="flex flex-wrap gap-2">
            {news.news_channels.map((nc: any) => (
              <span
                key={nc.channel_id}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              >
                {nc.channels.name}
              </span>
            ))}
          </div>
        </footer>
      )}
    </article>
  )
}
