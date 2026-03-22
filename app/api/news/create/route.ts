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

    const supabaseAdmin = getSupabaseAdmin()
    
    // Get current user from cookies - REQUIRED!
    let authorId: string | null = null
    try {
      const { cookies } = await import('next/headers')
      const cookieStore = await cookies()
      const token = cookieStore.get('auth-token')
      
      if (!token) {
        console.error('❌ No auth token found')
        return NextResponse.json(
          { error: 'Требуется авторизация' },
          { status: 401 }
        )
      }
      
      try {
        const payload = Buffer.from(token.value, 'base64').toString('utf-8')
        const decoded = JSON.parse(payload)
        authorId = decoded.userId
        console.log('✅ Author ID:', authorId)
      } catch (e) {
        console.error('❌ Failed to decode token:', e)
        return NextResponse.json(
          { error: 'Неверный токен авторизации' },
          { status: 401 }
        )
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
