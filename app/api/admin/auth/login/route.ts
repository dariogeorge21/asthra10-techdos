import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { adminService } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const admin = await adminService.getAdminByUsername(username)

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, admin.password_hash)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create a simple session token (in production, use proper JWT)
    const sessionToken = Buffer.from(`${admin.id}:${Date.now()}`).toString('base64')

    const response = NextResponse.json({ 
      success: true, 
      admin: { 
        id: admin.id, 
        username: admin.username 
      } 
    })

    // Set HTTP-only cookie for session
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    return response
  } catch (error) {
    console.error('Error during admin login:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
