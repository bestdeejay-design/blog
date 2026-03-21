import { NextResponse } from 'next/server'
import { createChannel } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Название и ключ обязательны' },
        { status: 400 }
      )
    }

    // Создаем URL автоматически из slug
    const url = `https://${slug}.example.com`
    const newChannel = createChannel(name, slug, url, '')

    return NextResponse.json({ 
      success: true,
      channel: newChannel
    })
  } catch (error: any) {
    console.error('Create channel error:', error)
    return NextResponse.json(
      { error: error.message || 'Ошибка при создании канала' },
      { status: 500 }
    )
  }
}
