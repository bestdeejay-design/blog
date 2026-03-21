import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function WelcomePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
            Добро пожаловать!
          </h2>
          <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
            Вы успешно вошли в систему
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-green-100 dark:bg-green-900 rounded">
            <p className="text-green-800 dark:text-green-200">
              Email: <strong>{user.email}</strong>
            </p>
          </div>
          
          {profile && (
            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded">
              <p className="text-blue-800 dark:text-blue-200">
                Роль: <strong className={profile.role === 'super_admin' ? 'text-purple-600' : ''}>{profile.role}</strong>
              </p>
            </div>
          )}
          
          <div className="pt-4">
            <a
              href="/dashboard"
              className="block w-full text-center py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
            >
              Перейти в Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
