import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function PUT(request: Request) {
  try {
    console.log('📝 Update request received')
    
    // Определяем тип контента
    const contentType = request.headers.get('content-type') || ''
    let data: any = {}
    
    if (contentType.includes('multipart/form-data')) {
      // FormData с файлами
      const formData = await request.formData()
      data.id = formData.get('id') as string
      data.title = formData.get('title') as string
      data.content = formData.get('content') as string
      data.status = formData.get('status') as string
      data.update_created_at = formData.get('update_created_at') === 'on'
      
      // Парсим каналы из JSON строки
      const channelIdsRaw = formData.get('channel_ids') as string | null
      if (channelIdsRaw) {
        try {
          data.channel_ids = JSON.parse(channelIdsRaw)
        } catch (e) {
          console.error('Failed to parse channel_ids:', e)
          data.channel_ids = []
        }
      }
      
      // Файл картинки
      const mediaImageFile = formData.get('media_image') as File | null
      if (mediaImageFile && mediaImageFile.size > 0) {
        data.media_image = mediaImageFile
      }
      
      // Ссылка на видео
      data.media_video = formData.get('media_video') as string | null
      
      console.log('📦 FormData:', { 
        id: data.id, 
        title: data.title?.substring(0, 50), 
        hasImage: !!data.media_image,
        hasVideo: !!data.media_video,
        channelCount: data.channel_ids?.length 
      })
    } else {
      // JSON (для обратной совместимости)
      data = await request.json()
      console.log('📦 JSON:', { id: data.id, title: data.title?.substring(0, 50), channel_ids: data.channel_ids })
    }
    
    const { id, title, content, status, channel_ids, update_created_at } = data

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
    
    // 📷 Обработка медиа (картинки и видео) - ТОЛЬКО для FormData
    if (contentType.includes('multipart/form-data')) {
      let mediaArray = newsItem.media || []
      if (typeof mediaArray === 'string') {
        try {
          mediaArray = JSON.parse(mediaArray)
        } catch (e) {
          console.error('Failed to parse media JSON:', e)
          mediaArray = []
        }
      }
      
      // Загрузка новой картинки если есть
      if (data.media_image && data.media_image.size > 0) {
        const { uploadImage } = await import('@/lib/media')
        const uploadResult = await uploadImage(data.media_image, id)
        if (uploadResult.success) {
          // Добавляем новую картинку в начало массива
          mediaArray.unshift({
            type: 'image',
            url: uploadResult.url,
            caption: ''
          })
          console.log('✅ Uploaded new image:', uploadResult.url)
        }
      }
      
      // Обработка нового видео если есть ссылка
      if (data.media_video) {
        const { extractVideoId } = await import('@/lib/media')
        const videoInfo = extractVideoId(data.media_video)
        if (videoInfo) {
          mediaArray.push({
            type: videoInfo.type,
            url: data.media_video,
            videoId: videoInfo.videoId
          })
          console.log('✅ Added video:', videoInfo.type, videoInfo.videoId)
        }
      }
      
      // Обновляем новость с новыми медиа
      if (mediaArray.length > 0) {
        await supabaseAdmin
          .from('news')
          .update({ media: mediaArray })
          .eq('id', id)
        
        newsItem.media = mediaArray
        console.log('✅ Updated media:', mediaArray.length, 'items')
      }
    }
    
    return NextResponse.json({ success: true, news: newsItem })
  } catch (error: any) {
    console.error('Update news error:', error)
    return NextResponse.json(
      { error: error.message || 'Ошибка при обновлении новости' },
      { status: 500 }
    )
  }
}
