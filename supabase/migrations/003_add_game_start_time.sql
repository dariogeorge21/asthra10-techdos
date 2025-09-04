-- Add game_start_time field to teams table for dynamic timer control
ALTER TABLE teams ADD COLUMN game_start_time TIMESTAMPTZ DEFAULT NULL;

-- Add comment to explain the field
COMMENT ON COLUMN teams.game_start_time IS 'Timestamp when the game timer was started/restarted. NULL when game is not active.';

-- Create index for faster queries on game_start_time
CREATE INDEX idx_teams_game_start_time ON teams(game_start_time);

-- Update existing teams that have game_loaded = true to use created_at as initial game_start_time
-- This ensures backward compatibility for existing active games
UPDATE teams 
SET game_start_time = created_at 
WHERE game_loaded = true AND game_start_time IS NULL;

-- Add a function to automatically handle game_start_time updates
CREATE OR REPLACE FUNCTION handle_game_start_time()
RETURNS TRIGGER AS $$
BEGIN
    -- If game_loaded is being set to true and was previously false (or NULL)
    IF NEW.game_loaded = true AND (OLD.game_loaded = false OR OLD.game_loaded IS NULL) THEN
        NEW.game_start_time = NOW();
    END IF;
    
    -- If game_loaded is being set to false, keep the existing game_start_time
    -- (don't set to NULL to preserve when the game was last started)
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update game_start_time when game_loaded changes
CREATE TRIGGER trigger_handle_game_start_time
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION handle_game_start_time();
