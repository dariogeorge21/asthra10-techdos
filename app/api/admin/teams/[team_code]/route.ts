import { NextRequest, NextResponse } from 'next/server'
import { teamService } from '@/lib/supabase'

// Delete team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ team_code: string }> }
) {
  try {
    const { team_code } = await params
    const success = await teamService.deleteTeam(team_code)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete team' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting team:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
