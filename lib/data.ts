import { createClient as createServerClient } from './supabase/server'
import { UserProfile, Channel, News, ChannelEditor } from './types'

export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return profile
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const supabase = await createServerClient()
  
  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  return data || []
}

export async function getChannels(): Promise<Channel[]> {
  const supabase = await createServerClient()
  
  const { data } = await supabase
    .from('channels')
    .select('*')
    .eq('is_active', true)
    .order('name')
  
  return data || []
}

export async function getUserChannels(userId: string): Promise<Channel[]> {
  const supabase = await createServerClient()
  
  const { data } = await supabase
    .from('channel_editors')
    .select(`
      channels (
        id,
        name,
        slug,
        url,
        description,
        logo_url,
        is_active,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', userId)
  
  return data?.map((item: any) => item.channels) || []
}

export async function getChannelEditors(channelId: string): Promise<(ChannelEditor & { user: UserProfile })[]> {
  const supabase = await createServerClient()
  
  const { data } = await supabase
    .from('channel_editors')
    .select(`
      *,
      user_profiles:user_id (
        id,
        email,
        full_name,
        avatar_url,
        role
      )
    `)
    .eq('channel_id', channelId)
  
  return data?.map((item: any) => ({
    ...item,
    user: item.user_profiles
  })) || []
}

export async function getAllChannels(): Promise<Channel[]> {
  const supabase = await createServerClient()
  
  const { data } = await supabase
    .from('channels')
    .select('*')
    .eq('is_active', true)
    .order('name')
  
  return data || []
}

export async function getPublishedNews(channelId?: string, limit: number = 10) {
  const supabase = await createServerClient()
  
  let query = supabase
    .from('news')
    .select(`
      *,
      author:author_id (
        id,
        email,
        full_name,
        avatar_url
      ),
      channel:channel_id (
        id,
        name,
        slug
      )
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)
  
  if (channelId) {
    query = query.eq('channel_id', channelId)
  }
  
  const { data } = await query
  
  return data || []
}

export async function getNewsById(newsId: string) {
  const supabase = await createServerClient()
  
  const { data } = await supabase
    .from('news')
    .select(`
      *,
      author:author_id (
        id,
        email,
        full_name,
        avatar_url
      ),
      channel:channel_id (
        id,
        name,
        slug,
        url
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
    .eq('id', newsId)
    .single()
  
  return data
}

export async function createNews(data: {
  title: string
  content: string
  excerpt?: string
  image_url?: string
  channel_id: string
  author_id: string
  slug: string
}) {
  const supabase = await createServerClient()
  
  const { data: news, error } = await supabase
    .from('news')
    .insert({
      ...data,
      status: 'draft'
    })
    .select()
    .single()
  
  if (error) throw error
  return news
}

export async function updateNews(newsId: string, updates: Partial<typeof createNews.arguments[0]>) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('news')
    .update(updates)
    .eq('id', newsId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function publishNews(newsId: string, channelIds: string[]) {
  const supabase = await createServerClient()
  
  // Update news status
  const { data: news, error: newsError } = await supabase
    .from('news')
    .update({
      status: 'published',
      published_at: new Date().toISOString()
    })
    .eq('id', newsId)
    .select()
    .single()
  
  if (newsError) throw newsError
  
  // Add to selected channels
  const newsChannels = channelIds.map(channelId => ({
    news_id: newsId,
    channel_id: channelId,
    published_at: new Date().toISOString()
  }))
  
  const { error: channelsError } = await supabase
    .from('news_channels')
    .upsert(newsChannels)
  
  if (channelsError) throw channelsError
  
  return news
}
