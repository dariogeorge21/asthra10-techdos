import { NextRequest, NextResponse } from 'next/server'
import { teamService } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ team_code: string }> }
) {
  try {
    const { team_code } = await params
    const { score, current_level } = await request.json()

    if (typeof score !== 'number' || typeof current_level !== 'number') {
      return NextResponse.json(
        { error: 'Score and current_level must be numbers' },
        { status: 400 }
      )
    }

    const success = await teamService.updateTeamScore(
      team_code,
      score,
      current_level
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update team score' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating team score:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
