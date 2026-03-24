import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Fetching all news...')
    const supabaseAdmin = getSupabaseAdmin()
    
    // Сначала получаем новости
    const { data: news, error } = await supabaseAdmin
      .from('news')
      .select(`
        *,
        user_profiles (
          id,
          username,
          full_name
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching news:', error)
      throw error
    }
    
    // Для каждой новости получаем каналы через news_channels
    const newsWithChannels = await Promise.all(
      (news || []).map(async (newsItem) => {
        const { data: newsChannels } = await supabaseAdmin
          .from('news_channels')
          .select(`
            channel_id,
            channels (
              id,
              name,
              slug
            )
          `)
          .eq('news_id', newsItem.id)
        
        // Преобразуем в массив каналов (для обратной совместимости)
        const channels = (newsChannels || []).map(nc => nc.channels)
        
        return {
          ...newsItem,
          channels: channels.length > 0 ? channels[0] : null, // Первый канал для совместимости
          all_channels: channels // Все каналы
        }
      })
    )
    
    console.log(`✅ Fetched ${newsWithChannels.length} news items`)
    return NextResponse.json({ success: true, news: newsWithChannels })
  } catch (error: any) {
    console.error('Get news error:', error)
    return NextResponse.json(
      { error: error.message || 'Ошибка при получении новостей' },
      { status: 500 }
    )
  }
}
