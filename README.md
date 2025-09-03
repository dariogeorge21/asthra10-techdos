# 🚀 The Chronos Cypher – A Supabase-Powered Quiz Game

Welcome to the official repository for **The Chronos Cypher**, a **40-level technical quiz game** with real-time scoring, team management, and comprehensive admin controls.

---

## 🛠️ Tech Stack

This project is built using a modern web stack for speed, scalability, and developer experience:

- **Framework:** [Next.js 15](https://nextjs.org/) with App Router
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)  
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Authentication:** Custom admin auth with bcrypt
- **Real-time Features:** Supabase real-time subscriptions

---

## 🎮 Game Features

### Core Gameplay
- **40 Progressive Levels:** Each level unlocks after completing the previous one
- **5-Hour Time Limit:** Global countdown timer across all levels
- **Real-time Scoring:** Dynamic score calculation with multiple factors
- **Checkpoint System:** Automatic saves at levels 1, 5, 10, 15, 20, 25, 30, 35
- **Team-based Competition:** Multiple teams can compete simultaneously

### Scoring System
- **Correct Answer (No hint):** +1500 points
- **Correct Answer (With hint):** +1000 points
- **Incorrect Answer:** -400 points
- **Question Skipped:** -750 points
- **Consecutive Correct Bonus:** +200 points for every 3 consecutive correct answers
- **Checkpoint Usage:** -200 points per checkpoint revert
- **Time Bonus:** Up to +250 points based on level completion time

### Admin Features
- **Team Management:** Create, delete, and monitor teams
- **Real-time Dashboard:** Live statistics and progress tracking
- **Secure Authentication:** Bcrypt-hashed passwords
- **Game Monitoring:** View detailed team statistics and performance

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone and Install
```bash
git clone https://github.com/dariogeorge21/asthra10-techdos.git
cd asthra10-techdos
npm install
```

### 2. Supabase Setup
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Run the database migrations:
   ```bash
   # In your Supabase SQL editor, run:
   # 1. supabase/migrations/001_create_teams_table.sql
   # 2. supabase/migrations/002_create_admin_users_table.sql
   ```

### 3. Environment Configuration
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_JWT_SECRET=your_jwt_secret_for_admin_auth
GAME_DURATION_HOURS=5
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🎯 Usage Guide

### For Participants
1. **Get Team Code:** Obtain your unique team code from organizers
2. **Start Game:** Enter team code on the landing page
3. **Navigate Levels:** Complete levels sequentially from the levels overview
4. **Monitor Progress:** Track your score and time remaining in real-time

### For Administrators
1. **Access Admin Panel:** Navigate to `/admin`
2. **Login:** Use credentials provided by organizers
3. **Manage Teams:** Create teams and monitor their progress
4. **View Statistics:** Real-time dashboard with game analytics

---

## 📂 Project Structure

```
app/
├── admin/                 # Admin panel
│   └── page.tsx          # Admin dashboard
├── api/                  # API routes
│   ├── admin/           # Admin-only endpoints
│   └── teams/           # Team management endpoints
├── levels/              # Game levels
│   ├── page.tsx        # Levels overview
│   └── level-1/        # Individual level pages
│       └── page.tsx
├── globals.css         # Global styles
├── layout.tsx         # Root layout
└── page.tsx           # Landing page

lib/
├── supabase.ts        # Database client and utilities
└── auth.ts           # Authentication helpers

supabase/
└── migrations/       # Database schema migrations
    ├── 001_create_teams_table.sql
    └── 002_create_admin_users_table.sql

components/ui/        # Reusable UI components
```

---

## 🔧 API Reference

### Team Endpoints
- `POST /api/teams/start-game` - Initialize game for team
- `GET /api/teams/[team_code]` - Get team data
- `PUT /api/teams/[team_code]/stats` - Update question statistics
- `PUT /api/teams/[team_code]/score` - Update score and level
- `PUT /api/teams/[team_code]/checkpoint` - Save checkpoint
- `PUT /api/teams/[team_code]/revert` - Revert to checkpoint

### Admin Endpoints
- `POST /api/admin/auth/login` - Admin login
- `POST /api/admin/auth/logout` - Admin logout
- `GET /api/admin/teams` - List all teams
- `POST /api/admin/teams` - Create new team
- `DELETE /api/admin/teams/[team_code]` - Delete team

---

## 🎨 Creating New Levels

### Level Structure
Each level should be created as a separate page in `app/levels/level-X/page.tsx`:

```typescript
// app/levels/level-2/page.tsx
"use client";

import { useState, useEffect } from "react";
// ... other imports

const questions = [
  {
    id: 1,
    question: "Your question here?",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correct: "Option A",
    hint: "Your hint here"
  }
  // ... more questions
];

export default function Level2Page() {
  // Copy the structure from level-1/page.tsx
  // Update level number and questions
}
```

### Level Guidelines
1. **Question Format:** Use multiple choice questions (MCQ)
2. **Difficulty Progression:** Increase complexity with each level
3. **Hints:** Provide helpful but not obvious hints
4. **Checkpoint Levels:** Levels 1, 5, 10, 15, 20, 25, 30, 35 auto-save progress
5. **Navigation Protection:** Prevent accidental page reloads during gameplay

---

## 🤝 Contributing

### Development Workflow
1. **Fork the Repository**
2. **Create Feature Branch:** `git checkout -b feature/level-X`
3. **Implement Changes:** Follow existing patterns and conventions
4. **Test Thoroughly:** Ensure scoring and navigation work correctly
5. **Submit Pull Request:** Include description of changes

### Code Standards
- Use TypeScript for type safety
- Follow existing component patterns
- Implement proper error handling
- Add loading states for async operations
- Maintain responsive design principles

### Adding Levels
1. Create new level directory: `app/levels/level-X/`
2. Copy structure from existing level
3. Update questions and level-specific logic
4. Test scoring calculations
5. Verify checkpoint functionality (if applicable)

---

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm start
```

---

## 🔒 Security Considerations

- **Admin Authentication:** Uses bcrypt for password hashing
- **Environment Variables:** Keep Supabase keys secure
- **Row Level Security:** Enabled on database tables
- **Session Management:** HTTP-only cookies for admin sessions

---

## 📊 Database Schema

### Teams Table
```sql
teams (
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
)
```

### Admin Users Table
```sql
admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

---

## 🐛 Troubleshooting

### Common Issues
1. **Supabase Connection:** Verify URL and API keys in environment variables
2. **Admin Login:** Default credentials are admin/admin123
3. **Team Code Issues:** Ensure team exists in database
4. **Timer Problems:** Check browser timezone settings
5. **Score Calculation:** Verify all API endpoints are responding

### Development Tips
- Use browser dev tools to monitor API calls
- Check Supabase logs for database errors
- Test with multiple teams for concurrent gameplay
- Verify checkpoint system with intentional failures

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database powered by [Supabase](https://supabase.com/)
- Icons from [Lucide React](https://lucide.dev/)

---

**Ready to challenge your teams? Let the games begin! 🎮**
