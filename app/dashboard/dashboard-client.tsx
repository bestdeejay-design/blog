'use client'

import { useState, useEffect } from 'react'
import { Modal, StatCard } from './ui-components'

export default function DashboardClient({ payload, initialChannels, initialUsers }: any) {
  const [activeTab, setActiveTab] = useState<'channels' | 'users'>('channels')
  const [channels, setChannels] = useState([])
  const [users, setUsers] = useState([])
  const [showModal, setShowModal] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Hydration fix: wait for mount before rendering
  useEffect(() => {
    setMounted(true)
    setChannels(initialChannels || [])
    setUsers(initialUsers || [])
  }, [initialChannels, initialUsers])

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-gray-600">Загрузка...</div>
    </div>
  }

  const handleSubmit = async (endpoint: string, formData: FormData, onSuccess: () => void) => {
    setLoading(true)
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (response.ok) {
        alert('✅ Успешно!')
        onSuccess()
        setShowModal(null)
        window.location.reload()
      } else {
        alert('❌ Ошибка: ' + result.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Ошибка при создании')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <nav className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📊 Админ-панель</h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('channels')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === 'channels'
                      ? 'bg-green-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  📺 Каналы
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === 'users'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  👥 Пользователи
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 dark:text-gray-300">
                👤 {String(payload.username)} ({String(payload.role)})
              </span>
              <form action="/api/auth/signout" method="POST">
                <button type="submit" className="text-red-600 hover:text-red-500 font-medium">Выйти</button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard title="Каналы" count={channels.length} color="green" icon="📺" />
          <StatCard title="Пользователи" count={users.length} color="purple" icon="👥" />
          <StatCard title="Активность" count={channels.length + users.length} color="indigo" icon="⚡" />
        </div>

        {/* Channels Tab */}
        {activeTab === 'channels' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📺 Каналы</h2>
              <button
                onClick={() => setShowModal('channel')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2"
              >
                <span>➕</span><span>Добавить канал</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {channels.length === 0 ? (
                <p className="text-gray-500 text-center py-8 col-span-full">Каналов пока нет</p>
              ) : (
                channels.map((channel: any) => (
                  <div key={channel.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white text-xl">📺</div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{channel.name}</h3>
                        <p className="text-sm text-gray-500">@{channel.slug}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{channel.description || 'Нет описания'}</p>
                    <a href={channel.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      🔗 {channel.url}
                    </a>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                        Активен
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(channel.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">👥 Пользователи</h2>
              {payload.role === 'super_admin' && (
                <button
                  onClick={() => setShowModal('user')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2"
                >
                  <span>➕</span><span>Добавить пользователя</span>
                </button>
              )}
            </div>
            
            <div className="grid gap-4">
              {users.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Пользователей пока нет</p>
              ) : (
                users.map((user: any) => (
                  <div key={user.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {user.full_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || '👤'}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{user.full_name || user.username}</h3>
                        <p className="text-sm text-gray-500">@{user.username} • {user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === 'super_admin' ? '👑 Супер-админ' : user.role === 'admin' ? '⭐ Админ' : '✏️ Редактор'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showModal === 'channel' && (
        <Modal title="📺 Создать канал" onClose={() => setShowModal(null)}>
          <form onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            handleSubmit('/api/channels/create', fd, () => {})
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Название</label>
              <input type="text" name="name" required className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" placeholder="Введите название" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ключ (slug)</label>
              <input type="text" name="slug" required pattern="[a-z0-9-]+" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" placeholder="main-news" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium disabled:opacity-50">
              {loading ? '⏳ Создание...' : '✅ Создать канал'}
            </button>
          </form>
        </Modal>
      )}
      {showModal === 'user' && payload.role === 'super_admin' && (
        <Modal title="👤 Создать пользователя" onClose={() => setShowModal(null)}>
          <form onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            handleSubmit('/api/users/create', fd, () => {})
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Логин</label>
              <input type="text" name="username" required className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Пароль</label>
              <input type="password" name="password" required minLength={6} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Имя</label>
              <input type="text" name="full_name" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Роль</label>
              <select name="role" defaultValue="editor" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                <option value="editor">Редактор</option>
                <option value="admin">Админ</option>
                <option value="super_admin">Супер-админ</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium disabled:opacity-50">
              {loading ? '⏳ Создание...' : '✅ Создать пользователя'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
