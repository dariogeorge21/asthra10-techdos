import { NextResponse } from 'next/server'
import { teamService } from '@/lib/supabase'

export async function GET() {
  try {
    const teams = await teamService.getAllTeams()
    
    // Transform the data to include additional computed fields for leaderboard
    const leaderboardData = teams.map((team, index) => ({
      ...team,
      rank: index + 1,
      total_questions: team.correct_questions + team.incorrect_questions + team.skipped_questions,
      accuracy: team.correct_questions + team.incorrect_questions > 0 
        ? Math.round((team.correct_questions / (team.correct_questions + team.incorrect_questions)) * 100)
        : 0,
      completion_percentage: Math.round(((team.current_level - 1) / 40) * 100)
    }))

    return NextResponse.json({
      success: true,
      data: leaderboardData,
      total_teams: leaderboardData.length,
      last_updated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching leaderboard data:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch leaderboard data',
        data: [],
        total_teams: 0
      },
      { status: 500 }
    )
  }
}
