import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Название и ключ обязательны' },
        { status: 400 }
      )
    }

    const url = `https://${slug}.example.com`
    
    // Сначала проверяем подключение
    const { data: testData, error: testError } = await supabaseAdmin
      .from('channels')
      .select('*')
      .limit(1)
    
    console.log('Test query result:', testData, testError)
    
    // Вставляем канал
    const { data: channel, error } = await supabaseAdmin
      .from('channels')
      .insert({
        name,
        slug,
        url,
        description: '',
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      throw error
    }

    console.log('Channel created:', channel)

    return NextResponse.json({ success: true, channel: channel })
  } catch (error: any) {
    console.error('Create channel error:', error)
    return NextResponse.json(
      { error: error.message || 'Ошибка при создании канала' },
      { status: 500 }
    )
  }
}
