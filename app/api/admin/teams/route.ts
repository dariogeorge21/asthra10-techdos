import { NextRequest, NextResponse } from 'next/server'
import { teamService, generateTeamCode } from '@/lib/supabase'

// Get all teams
export async function GET() {
  try {
    const teams = await teamService.getAllTeams()
    return NextResponse.json(teams)
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create new team
export async function POST(request: NextRequest) {
  try {
    const { team_name } = await request.json()

    if (!team_name) {
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 }
      )
    }

    // Generate unique team code
    let teamCode = generateTeamCode()
    let attempts = 0
    
    // Ensure team code is unique
    while (attempts < 10) {
      const existingTeam = await teamService.getTeam(teamCode)
      if (!existingTeam) break
      teamCode = generateTeamCode()
      attempts++
    }

    if (attempts >= 10) {
      return NextResponse.json(
        { error: 'Failed to generate unique team code' },
        { status: 500 }
      )
    }

    const team = await teamService.createTeam(team_name, teamCode)

    if (!team) {
      return NextResponse.json(
        { error: 'Failed to create team' },
        { status: 500 }
      )
    }

    return NextResponse.json(team)
  } catch (error) {
    console.error('Error creating team:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
