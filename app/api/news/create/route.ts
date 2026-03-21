import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const channelId = formData.get('channel_id') as string
    const status = formData.get('status') as string || 'draft'

    if (!title || !channelId) {
      return NextResponse.json(
        { error: 'Заголовок и канал обязательны' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('news')
      .insert({
        id: String(Date.now()),
        title,
        content: content || '',
        channel_id: channelId,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, news: data })
  } catch (error: any) {
    console.error('Create news error:', error)
    return NextResponse.json(
      { error: error.message || 'Ошибка при создании новости' },
      { status: 500 }
    )
  }
}
