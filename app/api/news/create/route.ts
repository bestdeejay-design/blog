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
    
    // Get current user from cookies if available
    const cookieStore = await import('next/headers')
      .then(mod => mod.cookies())
      .catch(() => null)
    
    let authorId = null
    if (cookieStore) {
      const token = await cookieStore.get('auth-token')
      if (token) {
        try {
          const payload = Buffer.from(token.value, 'base64').toString('utf-8')
          const decoded = JSON.parse(payload)
          authorId = decoded.userId
        } catch (e) {
          console.warn('Could not decode auth token')
        }
      }
    }
    
    const insertData: any = {
      id: crypto.randomUUID(),
      title,
      content: content || '',
      channel_id: channelId,
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    if (authorId) {
      insertData.author_id = authorId
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
