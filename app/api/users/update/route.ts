import { NextResponse } from 'next/server'
import { updateUser, getUserByUsername } from '@/lib/db'

export async function PUT(request: Request) {
  try {
    console.log('Updating user...')
    const body = await request.json()
    const { userId, username, full_name, role, is_active, password } = body

    console.log('Update data:', { userId, username, full_name, role, is_active, hasPassword: !!password })

    if (!userId) {
      return NextResponse.json(
        { error: 'ID пользователя обязателен' },
        { status: 400 }
      )
    }

    // Validate role if provided
    if (role) {
      const validRoles = ['editor', 'admin', 'super_admin']
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: 'Неверная роль пользователя' },
          { status: 400 }
        )
      }
    }

    // Validate password length if provided
    if (password && password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен быть не менее 6 символов' },
        { status: 400 }
      )
    }

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await getUserByUsername(username)
      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { error: 'Пользователь с таким именем уже существует' },
          { status: 400 }
        )
      }
    }

    const updates: any = {}
    if (username !== undefined) updates.username = username
    if (full_name !== undefined) updates.full_name = full_name
    if (role !== undefined) updates.role = role
    if (is_active !== undefined) updates.is_active = is_active
    if (password !== undefined && password) updates.password = password

    const updatedUser = await updateUser(userId, updates)

    console.log('User updated successfully:', updatedUser.id)

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        role: updatedUser.role,
        full_name: updatedUser.full_name,
        is_active: updatedUser.is_active
      }
    })
  } catch (error: any) {
    console.error('Update user error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    
    const errorMessage = error.message || 'Ошибка при обновлении пользователя'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: error.status || 500 }
    )
  }
}
