import { NextResponse } from 'next/server'
import { createChannel } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const url = formData.get('url') as string
    const description = formData.get('description') as string

    if (!name || !slug || !url) {
      return NextResponse.json(
        { error: 'Название, slug и URL обязательны' },
        { status: 400 }
      )
    }

    const newChannel = createChannel(name, slug, url, description)

    return NextResponse.json({ 
      success: true,
      channel: newChannel
    })
  } catch (error) {
    console.error('Create channel error:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании канала' },
      { status: 500 }
    )
  }
}
