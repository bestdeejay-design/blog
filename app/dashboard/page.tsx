import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'
import { getChannels, getUsers } from '@/lib/db'

const SECRET = new TextEncoder().encode('your-secret-key-change-this-in-production')

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')

  if (!token) {
    redirect('/login')
  }

  try {
    const { payload } = await jwtVerify(token.value, SECRET)
    const channels = await getChannels()
    const users = await getUsers()

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <nav className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Админка
                </h1>
              </div>
              <div className="flex items-center">
                <span className="text-gray-700 dark:text-gray-300 mr-4">
                  {String(payload.username)} ({String(payload.role)})
                </span>
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="text-red-600 hover:text-red-500"
                  >
                    Выйти
                  </button>
                </form>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Статистика */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Пользователи
                </h3>
                <p className="text-3xl font-bold text-indigo-600">
                  {users.length}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Каналы
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {channels.length}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Новости
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  0
                </p>
              </div>
            </div>

            {/* Создание пользователя */}
            {payload.role === 'super_admin' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Создать пользователя
                </h2>
                <form
                  action="/api/users/create"
                  method="POST"
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    setTimeout(() => {
                      window.location.reload()
                    }, 500)
                  }}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Логин
                    </label>
                    <input
                      type="text"
                      name="username"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white px-3 py-2 border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Пароль
                    </label>
                    <input
                      type="password"
                      name="password"
                      required
                      minLength={6}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white px-3 py-2 border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Имя
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white px-3 py-2 border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Роль
                    </label>
                    <select
                      name="role"
                      defaultValue="editor"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white px-3 py-2 border"
                    >
                      <option value="editor">Редактор</option>
                      <option value="admin">Админ</option>
                      <option value="super_admin">Супер-админ</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
                  >
                    Создать
                  </button>
                </form>
              </div>
            )}

            {/* Создание канала */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Создать канал
              </h2>
              <form
                action="/api/channels/create"
                method="POST"
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  const form = e.currentTarget
                  setTimeout(() => {
                    window.location.reload()
                  }, 500)
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Название
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white px-3 py-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ключ (slug)
                  </label>
                  <input
                    type="text"
                    name="slug"
                    required
                    pattern="[a-z0-9-]+"
                    title="Только lowercase буквы, цифры и дефисы"
                    placeholder="main-news"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white px-3 py-2 border"
                  />
                  <p className="text-xs text-gray-500 mt-1">По этому ключу новости будут транслироваться на сайте</p>
                </div>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Создать канал
                </button>
              </form>
            </div>

            {/* Создание новости */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Создать новость
              </h2>
              <form
                action="/api/news/create"
                method="POST"
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  setTimeout(() => {
                    window.location.reload()
                  }, 500)
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Заголовок
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white px-3 py-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Текст новости
                  </label>
                  <textarea
                    name="content"
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white px-3 py-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Канал
                  </label>
                  <select
                    name="channel_id"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white px-3 py-2 border"
                  >
                    <option value="">Выберите канал</option>
                    {channels.map((channel: any) => (
                      <option key={channel.id} value={channel.id}>
                        {channel.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Статус
                  </label>
                  <select
                    name="status"
                    defaultValue="draft"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white px-3 py-2 border"
                  >
                    <option value="draft">Черновик</option>
                    <option value="published">Опубликовано</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Создать новость
                </button>
              </form>
            </div>

            {/* Списки */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Пользователи */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Пользователи
                </h3>
                <ul className="space-y-2">
                  {users.map((user: any) => (
                    <li key={user.id} className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">
                        {user.full_name} (@{user.username})
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">
                        {user.role}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Каналы */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Каналы
                </h3>
                <ul className="space-y-2">
                  {channels.map((channel: any) => (
                    <li key={channel.id} className="flex justify-between items-center">
                      <div>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {channel.name}
                        </span>
                        <p className="text-xs text-gray-500">{channel.url}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        Активен
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    redirect('/login')
  }
}
