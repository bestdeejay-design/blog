import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/public/news/:id
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    const { data, error } = await supabase
      .from('news')
      .select(`
        *,
        channel:channels (
          id,
          name,
          slug,
          url
        ),
        author:user_profiles (
          id,
          full_name,
          avatar_url
        ),
        news_channels (
          channel_id,
          channels (
            id,
            name,
            slug
          )
        )
      `)
      .eq('id', id)
      .eq('status', 'published')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'News not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await supabase
      .from('news')
      .update({ views_count: data.views_count + 1 })
      .eq('id', id)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}
