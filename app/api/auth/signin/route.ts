import { NextResponse } from 'next/server'
import { verifyPassword, getUserByUsername } from '@/lib/db'
import { SignJWT } from 'jose'

const SECRET = new TextEncoder().encode('your-secret-key-change-this-in-production')

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Логин и пароль обязательны' },
        { status: 400 }
      )
    }

    const user = await getUserByUsername(username)

    console.log('User found:', user ? { id: user.id, username: user.username, hasPassword: !!user.password } : 'null')

    if (!user) {
      return NextResponse.json(
        { error: 'Неверный логин или пароль' },
        { status: 401 }
      )
    }

    console.log('Verifying password for user:', user.username)

    const isValid = verifyPassword(password, user.password)

    console.log('Password valid:', isValid)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Неверный логин или пароль' },
        { status: 401 }
      )
    }

    // Создаем JWT токен
    const token = await new SignJWT({ 
      userId: user.id, 
      username: user.username,
      role: user.role 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(SECRET)

    const response = NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name
      }
    })

    // Сохраняем токен в cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Ошибка входа' },
      { status: 500 }
    )
  }
}
