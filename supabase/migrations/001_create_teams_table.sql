-- Create teams table
CREATE TABLE teams (
    team_name TEXT NOT NULL,
    team_code TEXT PRIMARY KEY,
    score INTEGER DEFAULT 0,
    game_loaded BOOLEAN DEFAULT FALSE,
    checkpoint_score INTEGER DEFAULT 0,
    checkpoint_level INTEGER DEFAULT 1,
    current_level INTEGER DEFAULT 1,
    correct_questions INTEGER DEFAULT 0,
    incorrect_questions INTEGER DEFAULT 0,
    skipped_questions INTEGER DEFAULT 0,
    hint_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_teams_score ON teams(score DESC);
CREATE INDEX idx_teams_current_level ON teams(current_level);

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since this is a game application)
-- In production, you might want more restrictive policies
CREATE POLICY "Allow all operations on teams" ON teams
    FOR ALL USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_teams_updated_at 
    BEFORE UPDATE ON teams 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
