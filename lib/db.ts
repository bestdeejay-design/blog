import { supabaseAdmin } from './supabase'
import bcrypt from 'bcryptjs'

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

export async function getUserByUsername(username: string) {
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

export async function createUser(username: string, password: string, role: string, full_name: string) {
  const hashedPassword = bcrypt.hashSync(password, 10)
  
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .insert({
      id: String(Date.now()),
      username,
      password: hashedPassword,
      role,
      full_name,
      is_active: true
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function createChannel(name: string, slug: string, url: string, description?: string) {
  const { data, error } = await supabaseAdmin
    .from('channels')
    .insert({
      id: String(Date.now()),
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
  const { data, error } = await supabaseAdmin
    .from('channels')
    .select('*')
    .order('name')
  
  if (error) return []
  return data
}

export async function getUsers() {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) return []
  return data
}
