import { NextRequest, NextResponse } from 'next/server'
import { teamService } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ team_code: string }> }
) {
  try {
    const { team_code } = await params
    const team = await teamService.getTeam(team_code)

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(team)
  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
