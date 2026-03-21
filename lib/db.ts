import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

const DB_PATH = path.join(process.cwd(), 'data', 'database.json')

export function readDb() {
  const data = fs.readFileSync(DB_PATH, 'utf8')
  return JSON.parse(data)
}

export function writeDb(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

export function getUserByUsername(username: string) {
  const db = readDb()
  return db.users.find((u: any) => u.username === username)
}

export function createUser(username: string, password: string, role: string, full_name: string) {
  const db = readDb()
  
  const newUser = {
    id: String(Date.now()),
    username,
    password: hashPassword(password),
    role,
    full_name
  }
  
  db.users.push(newUser)
  writeDb(db)
  
  return newUser
}

export function createChannel(name: string, slug: string, url: string, description?: string) {
  const db = readDb()
  
  const newChannel = {
    id: String(Date.now()),
    name,
    slug,
    url,
    description: description || '',
    is_active: true,
    created_at: new Date().toISOString()
  }
  
  db.channels.push(newChannel)
  writeDb(db)
  
  return newChannel
}

export function assignEditorToChannel(userId: string, channelId: string) {
  const db = readDb()
  
  const assignment = {
    id: String(Date.now()),
    user_id: userId,
    channel_id: channelId,
    created_at: new Date().toISOString()
  }
  
  db.channel_editors.push(assignment)
  writeDb(db)
  
  return assignment
}

export function createNews(title: string, content: string, channelId: string, status = 'draft') {
  const db = readDb()
  
  const newNews = {
    id: String(Date.now()),
    title,
    content,
    channel_id: channelId,
    status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  db.news.push(newNews)
  writeDb(db)
  
  return newNews
}
