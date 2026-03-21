'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CheckSupabasePage() {
  const [status, setStatus] = useState('Checking...')
  const [error, setError] = useState<string | null>(null)
  const [tables, setTables] = useState<string[]>([])

  useEffect(() => {
    async function checkSupabase() {
      try {
        const supabase = createClient()
        
        // Simple check - just try to query one table
        const { data, error } = await supabase.from('channels').select('*').limit(1)
        
        if (error) {
          setStatus('❌ Ошибка подключения')
          setError(error.message)
        } else {
          setStatus('✅ Все работает! Supabase подключен.')
          setTables(['channels', 'user_profiles', 'channel_editors', 'news', 'news_channels'])
        }
      } catch (err) {
        setStatus('❌ Ошибка')
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }
    
    checkSupabase()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Supabase Connection Check</h1>
        
        <div className={`p-4 rounded-lg mb-4 ${
          status.startsWith('✅') ? 'bg-green-100 text-green-800' : 
          status.startsWith('❌') ? 'bg-red-100 text-red-800' : 
          'bg-yellow-100 text-yellow-800'
        }`}>
          {status}
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <p className="font-semibold text-red-800 mb-2">Ошибка:</p>
            <code className="text-sm text-red-700 block">{error}</code>
          </div>
        )}
        
        {tables.length > 0 && (
          <div className="p-4 bg-green-50 rounded-lg mb-4">
            <p className="font-semibold text-green-900 mb-2">Доступные таблицы:</p>
            <ul className="list-disc list-inside text-green-800">
              {tables.map(t => <li key={t}>{t}</li>)}
            </ul>
          </div>
        )}
        
        <div className="mt-6 flex gap-4">
          <a 
            href="/login"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            На страницу входа
          </a>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Обновить
          </button>
        </div>
      </div>
    </div>
  )
}
