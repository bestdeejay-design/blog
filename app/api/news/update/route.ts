import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function PUT(request: Request) {
  try {
    const { id, title, content, status, channel_ids, update_created_at } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID новости обязателен' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Собираем данные для обновления
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    
    // Если флаг update_created_at установлен - обновляем дату создания
    if (update_created_at) {
      updateData.created_at = new Date().toISOString()
    }
    
    // Если меняем статус на published - ставим published_at
    if (status !== undefined) {
      updateData.status = status
      if (status === 'published') {
        updateData.published_at = new Date().toISOString()
      } else {
        updateData.published_at = null
      }
    }

    console.log('Updating news:', { id, updateData })

    const { data: newsItem, error: newsError } = await supabaseAdmin
      .from('news')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (newsError) {
      console.error('Supabase error:', newsError)
      throw newsError
    }

    // Обновляем каналы если переданы
    if (channel_ids && channel_ids.length > 0) {
      // Удаляем старые записи
      await supabaseAdmin
        .from('news_channels')
        .delete()
        .eq('news_id', id)

      // Создаем новые
      const newsChannelRecords = channel_ids.map((channelId: string) => ({
        news_id: id,
        channel_id: channelId,
        published_at: updateData.status === 'published' ? new Date().toISOString() : null
      }))

      await supabaseAdmin
        .from('news_channels')
        .insert(newsChannelRecords)
    }

    console.log('News updated successfully:', newsItem.id)
    return NextResponse.json({ success: true, news: newsItem })
  } catch (error: any) {
    console.error('Update news error:', error)
    return NextResponse.json(
      { error: error.message || 'Ошибка при обновлении новости' },
      { status: 500 }
    )
  }
}
