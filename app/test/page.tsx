import { createClient } from '@/lib/supabase/server'

export default async function TestPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-green-100 rounded">
          <h2 className="font-semibold text-green-800">✓ Server connection OK</h2>
          <p className="text-sm text-green-700 mt-2">
            Current user: {user ? user.email : 'Not authenticated'}
          </p>
        </div>
        
        <div className="p-4 bg-blue-100 rounded">
          <h2 className="font-semibold text-blue-800">Environment Variables</h2>
          <ul className="text-sm text-blue-700 mt-2 space-y-1">
            <li>SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing'}</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}</li>
            <li>SUPABASE_SERVICE_ROLE_KEY: {process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Set' : '✗ Missing'}</li>
          </ul>
        </div>
        
        <div className="mt-4">
          <a 
            href="/login" 
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Go to Login
          </a>
        </div>
      </div>
    </div>
  )
}
