import { NextRequest, NextResponse } from 'next/server'
import { teamService } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ team_code: string }> }
) {
  try {
    const { team_code } = await params
    const success = await teamService.revertToCheckpoint(team_code)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to revert to checkpoint' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reverting to checkpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
