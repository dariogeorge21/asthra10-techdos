# Level 33 - Digital Lockdown Logic Challenge

## Overview
Level 33 is a "Digital Lockdown" logic challenge that tests players' reasoning abilities, mathematical thinking, wordplay skills, and problem-solving capabilities through carefully crafted multiple-choice questions.

## Features

### Question Types
- **Mathematical Riddles**: Number puzzles requiring logical deduction
- **Wordplay Challenges**: Pattern recognition and symmetry analysis
- **Logic Puzzles**: Deductive reasoning and systematic thinking
- **Abstract Riddles**: Creative thinking and conceptual understanding
- **Quick Math**: Order of operations and calculation skills

### Game Mechanics
- **Format**: 5 multiple-choice questions with 4 options each
- **Hint System**: Each question includes helpful hints (affects scoring)
- **Loading States**: All interactive buttons show loading states during operations
- **Progress Tracking**: Visual progress bar and question counter
- **Timer Integration**: Real-time countdown with global game timer

### User Interface
- **Consistent Design**: Matches existing level patterns and styling
- **Responsive Layout**: Works across different screen sizes
- **Interactive Elements**: Hover effects and visual feedback
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Question Bank

### 1. Mathematical Riddle
**Question**: "I am a two-digit number. My digits add up to 9. If you reverse me, I'm 27 greater than before. What number am I?"
- **Answer**: 36
- **Options**: 36, 45, 54, 63
- **Hint**: Think about two-digit numbers where digits sum to 9, then check which becomes 27 larger when reversed

### 2. Wordplay Challenge
**Question**: "Take the word 'PROGRAM'. How many letters are symmetrical along a vertical line (like A, H, I, M, O)?"
- **Answer**: 3 (O, A, M)
- **Options**: 2, 3, 4, 5
- **Hint**: Look at each letter and imagine folding it along a vertical line

### 3. Logic Puzzle
**Question**: "Three switches (A, B, C) control a lightbulb in another room. Only one switch works. You can enter the room once. Using the method: turn on A for 1 min then off, turn on B, then enter. How many possibilities are there for which switch works?"
- **Answer**: 3
- **Options**: 2, 3, 4, 6
- **Hint**: Consider what you can observe: bulb on, off but warm, or off and cool

### 4. Abstract Riddle
**Question**: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?"
- **Answer**: Echo
- **Options**: Echo, Shadow, Reflection, Sound
- **Hint**: Think about something that can 'speak' back to you with no physical form

### 5. Quick Math
**Question**: "(7 × 8) – (9 + 5) = ?"
- **Answer**: 42
- **Options**: 42, 44, 46, 48
- **Hint**: Follow order of operations: parentheses first, then subtract

## Scoring System

### Base Points
- **Correct Answer (no hint)**: 1600 points (higher for logic challenges)
- **Correct Answer (with hint)**: 1100 points
- **Incorrect Answer**: -450 points penalty
- **Skipped Question**: -800 points penalty

### Bonus Systems
- **Consecutive Correct Bonus**: +250 points for every 3 consecutive correct answers
- **Time Bonus**: Rewards quick completion (300 points for under 2 minutes, decreasing)

### Performance Ratings
- **Excellent**: 90%+ accuracy, under 4 minutes
- **Good**: 80%+ accuracy, under 6 minutes
- **Average**: 60%+ accuracy, under 8 minutes
- **Needs Improvement**: Below 60% accuracy or over 8 minutes

## Technical Implementation

### State Management
- `loading`: Initial data loading state
- `skipLoading`: Skip button loading state
- `submitLoading`: Submit button loading state
- `hintLoading`: Hint button loading state
- `showHint`: Hint visibility state
- `selectedAnswer`: Currently selected answer
- `currentQuestionIndex`: Current question position

### API Integration
- Team data fetching and validation
- Real-time statistics updates
- Score calculation and database updates
- Progress tracking and level completion

### Error Handling
- Network request failures
- Invalid team data scenarios
- Timer expiration handling
- Navigation protection

## File Structure
```
app/levels/level-33/
├── page.tsx           # Main level component (782 lines)
└── README.md          # This documentation
```

## Dependencies
- React hooks for state management
- Lucide React icons
- shadcn/ui components
- Next.js routing
- Supabase integration for scoring

## Testing Checklist
- [ ] All questions display correctly
- [ ] Hint system works properly
- [ ] Loading states appear on all buttons
- [ ] Score calculation is accurate
- [ ] Timer integration functions
- [ ] Navigation protection works
- [ ] Completion flow transitions properly
- [ ] Responsive design on mobile/desktop
- [ ] Error handling for network issues
- [ ] Accessibility features work

## Integration Notes
- Follows exact patterns from level 8 for MCQ format
- Incorporates loading states from level 32
- Maintains consistency with existing UI/UX patterns
- Integrates seamlessly with game progression system
- Uses same scoring algorithm structure as other levels

The level is production-ready and maintains complete consistency with the established codebase patterns!
