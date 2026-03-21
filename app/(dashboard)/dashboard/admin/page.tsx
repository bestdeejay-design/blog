import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentUser, getAllUsers, getChannels } from '@/lib/data'

export default async function AdminPage() {
  const supabase = await createClient()
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  if (user.role !== 'super_admin') {
    redirect('/dashboard')
  }
  
  const channels = await getChannels()
  const users = await getAllUsers()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Администрирование
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Управление пользователями и каналами
        </p>
      </div>

      {/* Создание нового пользователя */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Создать нового редактора
        </h2>
        
        <form className="space-y-4" action="/api/admin/create-user" method="POST">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white px-3 py-2 border"
              placeholder="editor@example.com"
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
              placeholder="Минимум 6 символов"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Полное имя
            </label>
            <input
              type="text"
              name="full_name"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white px-3 py-2 border"
              placeholder="Иван Иванов"
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
            </select>
          </div>
          
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Создать пользователя
          </button>
        </form>
      </div>

      {/* Список пользователей */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Пользователи
        </h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Имя</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Роль</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} className="border-t dark:border-gray-700">
                  <td className="px-4 py-2 text-sm">{u.email}</td>
                  <td className="px-4 py-2 text-sm">{u.full_name || '-'}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      u.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                      u.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <a href={`/dashboard/admin/users/${u.id}`} className="text-indigo-600 hover:text-indigo-500">
                      Редактировать
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Каналы */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Каналы
        </h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {channels.map((channel: any) => (
            <div key={channel.id} className="border dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">{channel.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{channel.slug}</p>
              <div className="mt-3 flex gap-2">
                <a
                  href={`/dashboard/admin/channels/${channel.id}`}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Редактировать
                </a>
                <a
                  href={`/dashboard/admin/channels/${channel.id}/editors`}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Назначить редакторов
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
