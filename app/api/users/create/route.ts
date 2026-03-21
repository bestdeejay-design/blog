import { NextResponse } from 'next/server'
import { createUser } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const full_name = formData.get('full_name') as string
    const role = formData.get('role') as string

    if (!username || !password || !role) {
      return NextResponse.json(
        { error: 'Обязательные поля не заполнены' },
        { status: 400 }
      )
    }

    const newUser = await createUser(username, password, role, full_name)

    return NextResponse.json({ 
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        full_name: newUser.full_name
      }
    })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании пользователя' },
      { status: 500 }
    )
  }
}
