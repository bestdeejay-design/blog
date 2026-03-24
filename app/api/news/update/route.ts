import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function PUT(request: Request) {
  try {
    const { id, title, content, status, channel_ids, update_created_at } = await request.json()

    console.log('📝 Update request:', { id, title: title?.substring(0, 50), channel_ids, status })

    if (!id) {
      console.error('❌ ID is required')
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
      console.log('🔄 Updating channels for news:', { newsId: id, channelCount: channel_ids.length, channels: channel_ids })
      
      // Удаляем старые записи
      const { error: deleteError } = await supabaseAdmin
        .from('news_channels')
        .delete()
        .eq('news_id', id)
      
      if (deleteError) {
        console.error('❌ Error deleting old channels:', deleteError)
      } else {
        console.log('✅ Deleted old channel associations')
      }

      // Создаем новые
      const newsChannelRecords = channel_ids.map((channelId: string) => ({
        news_id: id,
        channel_id: channelId,
        published_at: updateData.status === 'published' ? new Date().toISOString() : null
      }))

      const { error: insertError } = await supabaseAdmin
        .from('news_channels')
        .insert(newsChannelRecords)
      
      if (insertError) {
        console.error('❌ Error creating new channels:', insertError)
      } else {
        console.log('✅ Created new channel associations:', newsChannelRecords.length)
      }
    } else {
      console.warn('⚠️ No channel_ids provided, skipping channel update')
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
