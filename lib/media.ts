import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Загрузка изображения в Supabase Storage
export async function uploadImage(file: File, newsId?: string) {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${newsId || 'temp'}-${Date.now()}.${fileExt}`
    const filePath = `public/${fileName}`
    
    const { data, error } = await supabaseAdmin.storage
      .from('news-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) throw error
    
    // Получаем публичный URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('news-media')
      .getPublicUrl(filePath)
    
    return { success: true, url: publicUrl }
  } catch (error: any) {
    console.error('Image upload error:', error)
    return { success: false, error: error.message }
  }
}

// Извлечение ID видео из ссылки
export function extractVideoId(url: string): { type: string, videoId: string } | null {
  if (!url) return null
  
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)
  if (youtubeMatch) {
    return { type: 'youtube', videoId: youtubeMatch[1] }
  }
  
  // RuTube
  const rutubeMatch = url.match(/rutube\.ru\/video\/(\d+)/)
  if (rutubeMatch) {
    return { type: 'rutube', videoId: rutubeMatch[1] }
  }
  
  // VK Video
  const vkMatch = url.match(/vk\.com\/video(-?\d+)_(\d+)/)
  if (vkMatch) {
    return { type: 'vk', videoId: `${vkMatch[1]}_${vkMatch[2]}` }
  }
  
  return null
}

// Генерация embed ссылки для видео
export function getVideoEmbedUrl(type: string, videoId: string): string {
  switch (type) {
    case 'youtube':
      return `https://www.youtube.com/embed/${videoId}`
    case 'rutube':
      return `https://rutube.ru/play/embed/${videoId}`
    case 'vk':
      return `https://vk.com/video_ext.php?oid=${videoId.replace('_', '&oid=')}`
    default:
      return ''
  }
}
