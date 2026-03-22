import { getSupabaseAdmin } from './supabase'
import bcrypt from 'bcryptjs'

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

export async function getUserByUsername(username: string) {
  const supabaseAdmin = getSupabaseAdmin()
  
  // Try to get user by username OR email from user_profiles
  let { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('username', username)
    .single()
  
  // If not found by username, try by email
  if (!data || error) {
    const result = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('email', username)
      .single()
    
    data = result.data
    error = result.error
  }
  
  if (error) {
    console.error('Error fetching user:', error)
    return null
  }
  
  return data
}

export async function createUser(username: string, password: string, role: string, full_name: string, email?: string) {
  const supabaseAdmin = getSupabaseAdmin()
  const hashedPassword = bcrypt.hashSync(password, 10)
  
  // Generate a unique UUID for the user
  const { data: uuidData } = await supabaseAdmin.rpc('gen_random_uuid')
  const userId = uuidData || crypto.randomUUID()
  
  // Use username as email if email not provided (for local auth)
  const userEmail = email || `${username}@local.dev`
  
  try {
    // First, create the auth user using Supabase Admin API
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        username,
        full_name,
        role
      }
    })
    
    if (authError) {
      console.error('Auth user creation error:', authError)
      // If email already exists, try to use a different approach
      if (authError.message.includes('already been registered')) {
        // User exists in auth, just update/create profile
        const existingUser = await getUserByUsername(username)
        if (existingUser) {
          throw new Error('Пользователь с таким именем уже существует')
        }
      }
      throw authError
    }
    
    // Then create the user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: authUser.user.id,
        username,
        email: userEmail,
        password: hashedPassword, // Store hash for compatibility
        full_name,
        role,
        is_active: true
      })
      .select()
      .single()
    
    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      throw profileError
    }
    
    return profile
  } catch (error: any) {
    console.error('Create user error:', error)
    throw error
  }
}

export async function createChannel(name: string, slug: string, url: string, description?: string) {
  const supabaseAdmin = getSupabaseAdmin()
  
  const { data, error } = await supabaseAdmin
    .from('channels')
    .insert({
      name,
      slug,
      url,
      description: description || '',
      is_active: true
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getChannels() {
  const supabaseAdmin = getSupabaseAdmin()
  
  const { data, error } = await supabaseAdmin
    .from('channels')
    .select('*')
    .order('name')
  
  if (error) return []
  return data
}

export async function getUsers() {
  const supabaseAdmin = getSupabaseAdmin()
  
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) return []
  return data
}

export async function updateUser(userId: string, updates: {
  username?: string
  full_name?: string
  role?: string
  is_active?: boolean
  password?: string
}) {
  const supabaseAdmin = getSupabaseAdmin()
  
  const updateData: any = {
    ...updates,
    updated_at: new Date().toISOString()
  }
  
  // Hash password if provided
  if (updates.password) {
    updateData.password = bcrypt.hashSync(updates.password, 10)
  }
  
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) {
    console.error('Update user error:', error)
    throw error
  }
  
  return data
}
