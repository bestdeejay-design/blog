import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    console.log('Creating news...')
    const formData = await request.formData()
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const channelId = formData.get('channel_id') as string
    const status = formData.get('status') as string || 'draft'

    console.log('FormData:', { title, content: content?.substring(0, 50) + '...', channelId, status })

    if (!title || !channelId) {
      console.error('Missing required fields:', { title, channelId })
      return NextResponse.json(
        { error: 'Заголовок и канал обязательны' },
        { status: 400 }
      )
    }

    // Генерируем slug из заголовка (если не передан)
    let slug = formData.get('slug') as string | null
    if (!slug) {
      // Транслитерация и создание slug из заголовка
      slug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .substring(0, 100)
      
      // Добавляем timestamp для уникальности
      slug = slug + '-' + Date.now()
    }

    const supabaseAdmin = getSupabaseAdmin()
    
    // Get current user from cookies - REQUIRED!
    let authorId: string | null = null
    try {
      const { cookies } = await import('next/headers')
      const cookieStore = await cookies()
      const token = cookieStore.get('auth-token')
      
      console.log('🍪 Cookie auth-token:', token ? 'found' : 'not found')
      
      if (!token) {
        console.error('❌ No auth token found')
        return NextResponse.json(
          { error: 'Требуется авторизация' },
          { status: 401 }
        )
      }
      
      // JWT токен уже содержит данные, нам нужно просто получить их из cookies
      // Для простой проверки - пробуем декодировать JWT вручную
      // JWT формат: header.payload.signature (base64url)
      try {
        const parts = token.value.split('.')
        if (parts.length === 3) {
          const payload = parts[1]
          // Добавляем padding для base64
          const padded = payload + '='.repeat((4 - payload.length % 4) % 4)
          const decoded = Buffer.from(padded, 'base64').toString('utf-8')
          const parsed = JSON.parse(decoded)
          authorId = parsed.userId
          console.log('✅ Decoded JWT payload:', { userId: authorId })
        } else {
          console.error('❌ Invalid JWT format')
        }
      } catch (decodeError) {
        console.error('❌ Failed to decode JWT:', decodeError)
      }
      
    } catch (error) {
      console.error('❌ Error reading cookies:', error)
      return NextResponse.json(
        { error: 'Ошибка чтения токена' },
        { status: 500 }
      )
    }
    
    if (!authorId) {
      console.error('❌ Author ID is required but not found')
      return NextResponse.json(
        { error: 'Не удалось определить автора' },
        { status: 401 }
      )
    }
    
    const insertData: any = {
      id: crypto.randomUUID(),
      title,
      slug, // Добавляем slug
      content: content || '',
      channel_id: channelId,
      author_id: authorId, // ALWAYS set author_id
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    console.log('Inserting into database:', insertData)
    
    const { data, error } = await supabaseAdmin
      .from('news')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('News created successfully:', data.id)
    return NextResponse.json({ success: true, news: data })
  } catch (error: any) {
    console.error('Create news error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { error: error.message || 'Ошибка при создании новости' },
      { status: 500 }
    )
  }
}
