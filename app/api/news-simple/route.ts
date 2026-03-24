import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = parseInt(searchParams.get('offset') || '0')
    const channelId = searchParams.get('channel_id') // Получаем ID канала напрямую
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    let newsIds = null
    
    // Если указан channel_id - находим новости через junction table
    if (channelId) {
      const { data: newsChannelData } = await supabase
        .from('news_channels')
        .select('news_id')
        .eq('channel_id', channelId)
      
      if (newsChannelData && newsChannelData.length > 0) {
        newsIds = newsChannelData.map(nc => nc.news_id)
      } else {
        // Нет новостей для этого канала
        return NextResponse.json({ 
          success: true, 
          news: [],
          hasMore: false,
          total: 0
        })
      }
    }
    
    // Максимально простой запрос - только news с media
    let query = supabase
      .from('news')
      .select('id,title,content,excerpt,slug,status,published_at,channel_id,media,created_at,updated_at', { count: 'exact' })
      .eq('status', 'published')
    
    // Фильтруем по найденным news_id
    if (newsIds) {
      query = query.in('id', newsIds)
    }
    
    // Сортируем по дате создания (новые сверху)
    query = query.order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    const { data, error, count } = await query
    
    if (error) {
      console.error('API Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Генерируем иконки из медиа
    const newsWithThumbnails = (data || []).map(news => {
      let thumbnail = null
      
      if (news.media) {
        // Обрабатываем media: может быть строкой или объектом
        let mediaArray = news.media
        if (typeof news.media === 'string') {
          try {
            mediaArray = JSON.parse(news.media)
          } catch (e) {
            console.error('Failed to parse media JSON:', e)
            mediaArray = []
          }
        }
        
        if (Array.isArray(mediaArray) && mediaArray.length > 0) {
          const firstMedia = mediaArray[0]
          if (firstMedia.type === 'image') {
            // Для картинок - используем оригинал как thumbnail
            thumbnail = firstMedia.url
          } else if (['youtube', 'rutube', 'vk'].includes(firstMedia.type)) {
            // Для видео - генерируем заглушку или берем poster
            if (firstMedia.type === 'youtube') {
              thumbnail = `https://img.youtube.com/vi/${firstMedia.videoId}/mqdefault.jpg`
            }
            // Для других видео - пока null
          }
        }
      }
      
      return {
        ...news,
        thumbnail
      }
    })
    
    // Добавляем CORS заголовки для GitHub Pages
    const response = NextResponse.json({ 
      success: true, 
      news: newsWithThumbnails,
      hasMore: offset + limit < (count || 0),
      total: count || 0
    })
    
    // Разрешаем запросы с GitHub Pages
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    
    return response
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Обработчик OPTIONS запросов для CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
