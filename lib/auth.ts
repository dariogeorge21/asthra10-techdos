import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'

export interface AdminSession {
  id: string
  username: string
  timestamp: number
}

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10)
}

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash)
}

export const parseSessionToken = (token: string): AdminSession | null => {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [id, timestamp] = decoded.split(':')
    
    if (!id || !timestamp) return null
    
    const sessionTime = parseInt(timestamp)
    const now = Date.now()
    
    // Check if session is expired (24 hours)
    if (now - sessionTime > 24 * 60 * 60 * 1000) {
      return null
    }
    
    return {
      id,
      username: '', // We'll need to fetch this from the database if needed
      timestamp: sessionTime
    }
  } catch {
    return null
  }
}

export const getAdminSession = (request: NextRequest): AdminSession | null => {
  const sessionCookie = request.cookies.get('admin_session')
  
  if (!sessionCookie) return null
  
  return parseSessionToken(sessionCookie.value)
}

export const requireAdminAuth = (request: NextRequest): AdminSession => {
  const session = getAdminSession(request)
  
  if (!session) {
    throw new Error('Unauthorized')
  }
  
  return session
}
