import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 📢 Public API v3 - Clean rebuild
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const channelSlug = searchParams.get('channel') // фильтр по каналу
    const limit = parseInt(searchParams.get('limit') || '10')
    
    console.log('📢 Public API v2 - Fetching news:', { channelSlug, limit })
    
    // Create client inside function to avoid build-time errors
    const supabasePublic = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    let query = supabasePublic
      .from('news')
      .select(`
        id,
        title,
        content,
        excerpt,
        slug,
        status,
        published_at,
        created_at,
        updated_at,
        channel_id,
        channels (
          id,
          name,
          slug,
          url
        )
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(limit)
    
    if (channelSlug) {
      query = query.eq('channels.slug', channelSlug)
    }
    
    const { data: news, error } = await query
    
    if (error) {
      console.error('❌ Public API Error:', error)
      throw error
    }
    
    console.log(`✅ Public API - Fetched ${news?.length || 0} news items`)
    
    return NextResponse.json({ 
      success: true, 
      news: news || [],
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*', // Разрешаем CORS для GitHub Pages
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' // Кэширование
      }
    })
  } catch (error: any) {
    console.error('❌ Public API Error:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch news',
        success: false
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
}

// Обработка preflight запросов
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}
