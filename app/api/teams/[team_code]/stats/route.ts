import { NextRequest, NextResponse } from 'next/server'
import { teamService } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ team_code: string }> }
) {
  try {
    const { team_code } = await params
    const stats = await request.json()

    const success = await teamService.updateTeamStats(team_code, stats)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update team stats' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating team stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
