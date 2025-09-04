import { NextRequest, NextResponse } from 'next/server'
import { teamService } from '@/lib/supabase'

interface TeamUpdateData {
  team_name?: string
  score?: number
  game_loaded?: boolean
  checkpoint_score?: number
  checkpoint_level?: number
  current_level?: number
  correct_questions?: number
  incorrect_questions?: number
  skipped_questions?: number
  hint_count?: number
}

function validateTeamUpdateData(data: Record<string, unknown>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validate team_name
  if (data.team_name !== undefined) {
    if (typeof data.team_name !== 'string' || data.team_name.trim().length === 0) {
      errors.push('Team name must be a non-empty string')
    } else if (data.team_name.trim().length > 100) {
      errors.push('Team name must be less than 100 characters')
    }
  }

  // Validate score (can be negative)
  if (data.score !== undefined) {
    if (typeof data.score !== 'number' || !Number.isInteger(data.score)) {
      errors.push('Score must be an integer')
    }
  }

  // Validate game_loaded
  if (data.game_loaded !== undefined) {
    if (typeof data.game_loaded !== 'boolean') {
      errors.push('Game loaded must be a boolean')
    }
  }

  // Validate checkpoint_score (can be negative)
  if (data.checkpoint_score !== undefined) {
    if (typeof data.checkpoint_score !== 'number' || !Number.isInteger(data.checkpoint_score)) {
      errors.push('Checkpoint score must be an integer')
    }
  }

  // Validate checkpoint_level (1-40)
  if (data.checkpoint_level !== undefined) {
    if (typeof data.checkpoint_level !== 'number' || !Number.isInteger(data.checkpoint_level)) {
      errors.push('Checkpoint level must be an integer')
    } else if (data.checkpoint_level < 1 || data.checkpoint_level > 40) {
      errors.push('Checkpoint level must be between 1 and 40')
    }
  }

  // Validate current_level (1-40)
  if (data.current_level !== undefined) {
    if (typeof data.current_level !== 'number' || !Number.isInteger(data.current_level)) {
      errors.push('Current level must be an integer')
    } else if (data.current_level < 1 || data.current_level > 40) {
      errors.push('Current level must be between 1 and 40')
    }
  }

  // Validate correct_questions (non-negative)
  if (data.correct_questions !== undefined) {
    if (typeof data.correct_questions !== 'number' || !Number.isInteger(data.correct_questions) || data.correct_questions < 0) {
      errors.push('Correct questions must be a non-negative integer')
    }
  }

  // Validate incorrect_questions (non-negative)
  if (data.incorrect_questions !== undefined) {
    if (typeof data.incorrect_questions !== 'number' || !Number.isInteger(data.incorrect_questions) || data.incorrect_questions < 0) {
      errors.push('Incorrect questions must be a non-negative integer')
    }
  }

  // Validate skipped_questions (non-negative)
  if (data.skipped_questions !== undefined) {
    if (typeof data.skipped_questions !== 'number' || !Number.isInteger(data.skipped_questions) || data.skipped_questions < 0) {
      errors.push('Skipped questions must be a non-negative integer')
    }
  }

  // Validate hint_count (non-negative)
  if (data.hint_count !== undefined) {
    if (typeof data.hint_count !== 'number' || !Number.isInteger(data.hint_count) || data.hint_count < 0) {
      errors.push('Hint count must be a non-negative integer')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ team_code: string }> }
) {
  try {
    const { team_code } = await params
    const updateData = await request.json()

    // Validate input data
    const validation = validateTeamUpdateData(updateData)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      )
    }

    // Check if team exists
    const existingTeam = await teamService.getTeam(team_code)
    if (!existingTeam) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    // Prepare update data (exclude team_code and timestamps)
    const allowedFields: (keyof TeamUpdateData)[] = [
      'team_name',
      'score',
      'game_loaded',
      'checkpoint_score',
      'checkpoint_level',
      'current_level',
      'correct_questions',
      'incorrect_questions',
      'skipped_questions',
      'hint_count'
    ]

    const filteredUpdateData: Partial<TeamUpdateData> = {}
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredUpdateData[field] = updateData[field]
      }
    }

    // If no valid fields to update
    if (Object.keys(filteredUpdateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for update' },
        { status: 400 }
      )
    }

    // Update team in database
    const success = await teamService.updateTeam(team_code, filteredUpdateData)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update team' },
        { status: 500 }
      )
    }

    // Fetch and return updated team data
    const updatedTeam = await teamService.getTeam(team_code)
    
    return NextResponse.json({
      success: true,
      team: updatedTeam
    })

  } catch (error) {
    console.error('Error updating team:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
