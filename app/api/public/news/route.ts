import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/public/news?channel=slug&limit=10
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const channelSlug = searchParams.get('channel')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    let query = supabase
      .from('news')
      .select(`
        id,
        title,
        slug,
        excerpt,
        image_url,
        published_at,
        channel:channels!inner (
          id,
          name,
          slug
        ),
        author:user_profiles!inner (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (channelSlug) {
      query = query.eq('channels.slug', channelSlug)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching public news:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}
