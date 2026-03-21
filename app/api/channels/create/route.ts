import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  console.log('=== CHANNEL CREATE API CALLED ===')
  
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string

    console.log('Creating channel:', { name, slug })
    console.log('Env check:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'OK' : 'MISSING',
      key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'MISSING'
    })

    if (!name || !slug) {
      console.error('Validation failed: missing name or slug')
      return NextResponse.json(
        { error: 'Название и ключ обязательны' },
        { status: 400 }
      )
    }

    // Создаем URL автоматически из slug
    const url = `https://${slug}.example.com`
    
    // Генерируем UUID заранее
    const id = crypto.randomUUID()
    console.log('Generated UUID:', id)
    
    // Прямой запрос к Supabase REST API с service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    console.log('Sending request to:', `${supabaseUrl}/rest/v1/channels`)
    
    const response = await fetch(`${supabaseUrl}/rest/v1/channels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        id,
        name,
        slug,
        url,
        description: '',
        is_active: true
      })
    })

    console.log('Response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('REST API error:', errorData)
      throw new Error(errorData.message || 'Failed to create channel')
    }

    const channel = await response.json()
    console.log('Channel created successfully:', channel)

    return NextResponse.json({ 
      success: true,
      channel: channel[0] || channel
    })
  } catch (error: any) {
    console.error('Create channel error:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Ошибка при создании канала',
        details: error.toString(),
      },
      { status: 500 }
    )
  }
}
