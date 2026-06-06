import { NextResponse } from 'next/server'
import { createUser } from '@/lib/db'

export async function POST(request: Request) {
  try {
    console.log('Creating user...')
    const formData = await request.formData()
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const full_name = formData.get('full_name') as string
    const role = formData.get('role') as string

    console.log('FormData:', { username, full_name, role, passwordLength: password?.length })

    if (!username || !password || !role) {
      console.error('Missing required fields')
      return NextResponse.json(
        { error: 'Обязательные поля не заполнены' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен быть не менее 6 символов' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['editor', 'admin', 'super_admin']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Неверная роль пользователя' },
        { status: 400 }
      )
    }

    const newUser = await createUser(username, password, role, full_name)

    console.log('User created successfully:', newUser.id)

    return NextResponse.json({ 
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        full_name: newUser.full_name
      }
    })
  } catch (error: any) {
    console.error('Create user error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    
    // Return specific error message if available
    const errorMessage = error.message || 'Ошибка при создании пользователя'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: error.status || 500 }
    )
  }
}
