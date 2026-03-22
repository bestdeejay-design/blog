'use client'

import { useState, useEffect } from 'react'
import { Modal, StatCard } from './ui-components'

export default function DashboardClient({ payload, initialChannels, initialUsers }: any) {
  const [activeTab, setActiveTab] = useState<'news' | 'channels' | 'users'>('news')
  const [channels, setChannels] = useState([])
  const [users, setUsers] = useState([])
  const [news, setNews] = useState([])
  const [showModal, setShowModal] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [errorModal, setErrorModal] = useState<{show: boolean, message: string, details?: string}>({ show: false, message: '', details: '' })
  const [successModal, setSuccessModal] = useState<{show: boolean, message: string}>({ show: false, message: '' })

  // Hydration fix: wait for mount before rendering
  useEffect(() => {
    setMounted(true)
    setChannels(initialChannels || [])
    setUsers(initialUsers || [])
    // Load news on mount
    loadNews()
  }, [initialChannels, initialUsers])

  const loadNews = async () => {
    try {
      console.log('Loading news...')
      const response = await fetch('/api/news')
      const result = await response.json()
      if (response.ok) {
        setNews(result.news || [])
        console.log(`✅ Loaded ${result.news?.length || 0} news items`)
      } else {
        console.error('Failed to load news:', result.error)
      }
    } catch (error) {
      console.error('Error loading news:', error)
    }
  }

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-gray-600">Загрузка...</div>
    </div>
  }

  const handleSubmit = async (endpoint: string, formData: FormData | any, onSuccess: () => void) => {
    setLoading(true)
    try {
      console.log('🚀 Submit to:', endpoint)
      console.log('📦 Data:', formData instanceof FormData ? Object.fromEntries(formData) : formData)
      
      const response = await fetch(endpoint, {
        method: formData instanceof FormData ? 'POST' : 'PUT',
        body: formData instanceof FormData ? formData : JSON.stringify(formData),
        headers: formData instanceof FormData ? {} : { 'Content-Type': 'application/json' }
      })
      
      const result = await response.json()
      console.log('📥 Response:', response.status, result)
      
      if (response.ok) {
        console.log('✅ Success!')
        setSuccessModal({ show: true, message: '✅ Успешно!' })
        onSuccess()
        setShowModal(null)
        setEditingUser(null)
        // Обновляем список новостей после создания
        if (endpoint === '/api/news/create') {
          await loadNews()
        }
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        console.error('❌ Error:', result)
        const errorMessage = result.error || result.message || 'Неизвестная ошибка'
        // Показываем модальное окно с ошибкой вместо alert
        setErrorModal({
          show: true,
          message: errorMessage,
          details: JSON.stringify(result, null, 2)
        })
      }
    } catch (error: any) {
      console.error('💥 Exception:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      setErrorModal({
        show: true,
        message: `Ошибка: ${error.message}`,
        details: error.stack
      })
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
                  onClick={() => setActiveTab('news')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === 'news'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  📰 Новости
                </button>
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

        {/* News Tab */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📰 Новости</h2>
              <button
                onClick={() => setShowModal('news')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2"
              >
                <span>➕</span><span>Добавить новость</span>
              </button>
            </div>
            
            <div className="grid gap-4">
              {news.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Новостей пока нет</p>
              ) : (
                news.map((item: any) => (
                  <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.status === 'published' ? 'bg-green-100 text-green-800' :
                            item.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status === 'published' ? '✅ Опубликовано' :
                             item.status === 'draft' ? '✏️ Черновик' : item.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            📺 {item.channels?.name || 'Не указан'}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          {item.excerpt || item.content?.substring(0, 200) + '...'}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>👤 {item.user_profiles?.full_name || item.user_profiles?.username || 'Неизвестно'}</span>
                          <span>📅 {new Date(item.created_at).toLocaleDateString('ru-RU')}</span>
                          {item.published_at && (
                            <span>🚀 Опубликован {new Date(item.published_at).toLocaleDateString('ru-RU')}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-700 p-2">
                          ✏️
                        </button>
                        <button className="text-red-600 hover:text-red-700 p-2">
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

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
                      <div className="flex items-center space-x-2">
                        {payload.role === 'super_admin' && (
                          <button
                            onClick={() => {
                              setEditingUser(user)
                              setShowModal('edit-user')
                            }}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            ✏️
                          </button>
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showModal === 'news' && (
        <Modal title="📰 Создать новость" onClose={() => setShowModal(null)}>
          <form onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            // Собираем выбранные каналы
            const selectedChannels = Array.from(e.currentTarget.querySelectorAll('input[name="channel_ids"]:checked')).map((cb: any) => cb.value)
            // Добавляем channel_ids к formData
            fd.set('channel_ids', JSON.stringify(selectedChannels))
            handleSubmit('/api/news/create', fd, () => {})
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Заголовок</label>
              <input type="text" name="title" required className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" placeholder="Введите заголовок" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Текст новости</label>
              <textarea name="content" rows={4} required className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" placeholder="Введите текст" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Каналы (можно несколько)</label>
              <div className="border rounded-lg dark:border-gray-600 p-3 space-y-2 max-h-48 overflow-y-auto">
                {channels.length === 0 ? (
                  <p className="text-gray-500 text-sm">Каналов нет</p>
                ) : (
                  channels.map((channel: any) => (
                    <label key={channel.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="channel_ids"
                        value={channel.id}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{channel.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Статус</label>
              <select name="status" defaultValue="draft" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                <option value="draft">Черновик</option>
                <option value="published">Опубликовано</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50">
              {loading ? '⏳ Создание...' : '✅ Создать новость'}
            </button>
          </form>
        </Modal>
      )}
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
      {showModal === 'edit-user' && editingUser && payload.role === 'super_admin' && (
        <Modal title="✏️ Редактировать пользователя" onClose={() => {
          setShowModal(null)
          setEditingUser(null)
        }}>
          <form onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            const data = {
              userId: editingUser.id,
              username: fd.get('username') as string,
              full_name: fd.get('full_name') as string,
              role: fd.get('role') as string,
              password: fd.get('password') as string || undefined
            }
            handleSubmit('/api/users/update', data, () => {})
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Логин</label>
              <input type="text" name="username" defaultValue={editingUser.username} required className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Пароль</label>
              <input type="password" name="password" placeholder="Оставьте пустым, чтобы не менять" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Имя</label>
              <input type="text" name="full_name" defaultValue={editingUser.full_name || ''} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Роль</label>
              <select name="role" defaultValue={editingUser.role} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                <option value="editor">Редактор</option>
                <option value="admin">Админ</option>
                <option value="super_admin">Супер-админ</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50">
              {loading ? '⏳ Сохранение...' : '💾 Сохранить изменения'}
            </button>
          </form>
        </Modal>
      )}

      {/* Error Modal */}
      {errorModal.show && (
        <Modal 
          title="❌ Ошибка" 
          onClose={() => setErrorModal({ show: false, message: '', details: '' })}
        >
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200 font-medium">{errorModal.message}</p>
            </div>
            
            {errorModal.details && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📋 Детали ошибки (скопируйте для отладки):
                </label>
                <textarea
                  readOnly
                  value={errorModal.details}
                  className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 font-mono text-xs text-gray-800 dark:text-gray-200 focus:outline-none"
                  onClick={(e) => e.currentTarget.select()}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(errorModal.details || '')
                    setSuccessModal({ show: true, message: '✅ Скопировано!' })
                  }}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                >
                  <span>📋</span><span>Копировать</span>
                </button>
              </div>
            )}
            
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setErrorModal({ show: false, message: '', details: '' })}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition-all"
              >
                Закрыть
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Success Modal */}
      {successModal.show && (
        <Modal 
          title="✅ Успешно" 
          onClose={() => setSuccessModal({ show: false, message: '' })}
        >
          <div className="py-4">
            <p className="text-green-800 dark:text-green-200 text-center">{successModal.message}</p>
          </div>
        </Modal>
      )}
    </div>
  )
}
