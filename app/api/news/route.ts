import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Fetching all news...')
    const supabaseAdmin = getSupabaseAdmin()
    
    const { data: news, error } = await supabaseAdmin
      .from('news')
      .select(`
        *,
        channels (
          id,
          name,
          slug
        ),
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
    
    console.log(`✅ Fetched ${news?.length || 0} news items`)
    return NextResponse.json({ success: true, news: news || [] })
  } catch (error: any) {
    console.error('Get news error:', error)
    return NextResponse.json(
      { error: error.message || 'Ошибка при получении новостей' },
      { status: 500 }
    )
  }
}
