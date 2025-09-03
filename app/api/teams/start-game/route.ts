import { NextRequest, NextResponse } from 'next/server'
import { teamService } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { team_code } = await request.json()

    if (!team_code) {
      return NextResponse.json(
        { error: 'Team code is required' },
        { status: 400 }
      )
    }

    const success = await teamService.startGame(team_code)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to start game' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error starting game:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
