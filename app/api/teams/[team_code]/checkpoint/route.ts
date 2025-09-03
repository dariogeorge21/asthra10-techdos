import { NextRequest, NextResponse } from 'next/server'
import { teamService } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ team_code: string }> }
) {
  try {
    const { team_code } = await params
    const { checkpoint_score, checkpoint_level } = await request.json()

    if (typeof checkpoint_score !== 'number' || typeof checkpoint_level !== 'number') {
      return NextResponse.json(
        { error: 'Checkpoint score and level must be numbers' },
        { status: 400 }
      )
    }

    const success = await teamService.saveCheckpoint(
      team_code,
      checkpoint_score,
      checkpoint_level
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to save checkpoint' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving checkpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
