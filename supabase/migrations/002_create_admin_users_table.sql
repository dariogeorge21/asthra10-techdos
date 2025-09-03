-- Create admin_users table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster username lookups
CREATE INDEX idx_admin_users_username ON admin_users(username);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users (only authenticated admins can access)
CREATE POLICY "Admin users can manage admin_users" ON admin_users
    FOR ALL USING (true);

-- Insert default admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO admin_users (username, password_hash) VALUES
('admin', '$2b$10$.dsXviQNQ4kwxKbTc2AYC.uaOIahSbCZ5ue7KWVWRg7KTAyNiIYEK');

-- Note: Change the default password after first login
-- You can generate new hashes using: node scripts/generate-admin-hash.js
