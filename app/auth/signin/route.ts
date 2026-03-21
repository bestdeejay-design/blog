import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Auth error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Вход выполнен успешно'
    })
  } catch (error) {
    console.error('Sign in error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Произошла ошибка при входе' },
      { status: 500 }
    )
  }
}
