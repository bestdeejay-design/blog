import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'
import { getChannels, getUsers } from '@/lib/db'
import DashboardClient from './dashboard-client'

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
      <DashboardClient 
        payload={payload} 
        initialChannels={channels} 
        initialUsers={users} 
      />
    )
  } catch (error) {
    redirect('/login')
  }
}
