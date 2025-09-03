import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Team {
  team_name: string
  team_code: string
  score: number
  game_loaded: boolean
  checkpoint_score: number
  checkpoint_level: number
  current_level: number
  correct_questions: number
  incorrect_questions: number
  skipped_questions: number
  hint_count: number
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  username: string
  password_hash: string
  created_at: string
}

// Team management functions
export const teamService = {
  async createTeam(teamName: string, teamCode: string): Promise<Team | null> {
    const { data, error } = await supabase
      .from('teams')
      .insert([
        {
          team_name: teamName,
          team_code: teamCode,
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating team:', error)
      return null
    }

    return data
  },

  async getTeam(teamCode: string): Promise<Team | null> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('team_code', teamCode)
      .single()

    if (error) {
      console.error('Error fetching team:', error)
      return null
    }

    return data
  },

  async updateTeamStats(
    teamCode: string, 
    stats: {
      correct_questions?: number
      incorrect_questions?: number
      skipped_questions?: number
      hint_count?: number
    }
  ): Promise<boolean> {
    const { error } = await supabase
      .from('teams')
      .update({
        ...stats,
        updated_at: new Date().toISOString()
      })
      .eq('team_code', teamCode)

    if (error) {
      console.error('Error updating team stats:', error)
      return false
    }

    return true
  },

  async updateTeamScore(
    teamCode: string, 
    score: number, 
    currentLevel: number
  ): Promise<boolean> {
    const { error } = await supabase
      .from('teams')
      .update({
        score,
        current_level: currentLevel,
        updated_at: new Date().toISOString()
      })
      .eq('team_code', teamCode)

    if (error) {
      console.error('Error updating team score:', error)
      return false
    }

    return true
  },

  async saveCheckpoint(
    teamCode: string, 
    checkpointScore: number, 
    checkpointLevel: number
  ): Promise<boolean> {
    const { error } = await supabase
      .from('teams')
      .update({
        checkpoint_score: checkpointScore,
        checkpoint_level: checkpointLevel,
        updated_at: new Date().toISOString()
      })
      .eq('team_code', teamCode)

    if (error) {
      console.error('Error saving checkpoint:', error)
      return false
    }

    return true
  },

  async revertToCheckpoint(teamCode: string): Promise<boolean> {
    // First get the team's checkpoint data
    const team = await this.getTeam(teamCode)
    if (!team) return false

    const { error } = await supabase
      .from('teams')
      .update({
        score: team.checkpoint_score - 200, // Penalty for checkpoint usage
        current_level: team.checkpoint_level,
        updated_at: new Date().toISOString()
      })
      .eq('team_code', teamCode)

    if (error) {
      console.error('Error reverting to checkpoint:', error)
      return false
    }

    return true
  },

  async startGame(teamCode: string): Promise<boolean> {
    const { error } = await supabase
      .from('teams')
      .update({
        game_loaded: true,
        updated_at: new Date().toISOString()
      })
      .eq('team_code', teamCode)

    if (error) {
      console.error('Error starting game:', error)
      return false
    }

    return true
  },

  async getAllTeams(): Promise<Team[]> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('score', { ascending: false })

    if (error) {
      console.error('Error fetching all teams:', error)
      return []
    }

    return data || []
  },

  async deleteTeam(teamCode: string): Promise<boolean> {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('team_code', teamCode)

    if (error) {
      console.error('Error deleting team:', error)
      return false
    }

    return true
  }
}

// Admin user management functions
export const adminService = {
  async getAdminByUsername(username: string): Promise<AdminUser | null> {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .single()

    if (error) {
      console.error('Error fetching admin user:', error)
      return null
    }

    return data
  },

  async createAdmin(username: string, passwordHash: string): Promise<AdminUser | null> {
    const { data, error } = await supabase
      .from('admin_users')
      .insert([
        {
          username,
          password_hash: passwordHash,
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating admin user:', error)
      return null
    }

    return data
  }
}

// Utility functions
export const generateTeamCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const isCheckpointLevel = (level: number): boolean => {
  return [1, 5, 10, 15, 20, 25, 30, 35].includes(level)
}
