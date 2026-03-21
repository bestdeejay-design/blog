export type UserRole = 'super_admin' | 'admin' | 'editor'

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Channel {
  id: string
  name: string
  slug: string
  url?: string
  description?: string
  logo_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ChannelEditor {
  id: string
  channel_id: string
  user_id: string
  permissions: {
    can_create: boolean
    can_edit: boolean
    can_delete: boolean
    can_publish: boolean
  }
  granted_by?: string
  granted_at: string
}

export interface News {
  id: string
  channel_id: string
  author_id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  image_url?: string
  status: 'draft' | 'published' | 'hidden' | 'archived'
  published_at?: string
  views_count: number
  created_at: string
  updated_at: string
}

export interface NewsChannel {
  id: string
  news_id: string
  channel_id: string
  published_at?: string
}
