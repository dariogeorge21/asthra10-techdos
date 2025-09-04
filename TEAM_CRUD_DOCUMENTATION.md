# 🔧 Team CRUD System Documentation

## Overview

The Team CRUD (Create, Read, Update, Delete) system provides comprehensive team management capabilities in the admin panel, specifically designed to enable easy testing of individual levels during development.

## 🎯 Key Features

### ✅ Complete CRUD Operations
- **Create**: Generate new teams with unique team codes
- **Read**: View all team data and statistics
- **Update**: Edit all team fields except team_code (immutable primary key)
- **Delete**: Remove teams with confirmation dialog

### 🎮 Level Testing Capability
- **Jump to Any Level**: Set `current_level` to any value (1-40) for testing
- **Reset Progress**: Modify scores, statistics, and checkpoint data
- **Game State Control**: Toggle `game_loaded` status
- **Statistics Management**: Adjust question counts and hint usage

## 🛠️ Implementation Details

### Backend API Endpoint

**`PUT /api/admin/teams/[team_code]/update`**

#### Request Body
```json
{
  "team_name": "Updated Team Name",
  "score": 5000,
  "game_loaded": true,
  "checkpoint_score": 3000,
  "checkpoint_level": 10,
  "current_level": 15,
  "correct_questions": 25,
  "incorrect_questions": 5,
  "skipped_questions": 2,
  "hint_count": 8
}
```

#### Response
```json
{
  "success": true,
  "team": {
    // Updated team object with all fields
  }
}
```

#### Validation Rules
- **team_name**: Required, non-empty string, max 100 characters
- **score**: Integer (can be negative)
- **game_loaded**: Boolean
- **checkpoint_score**: Integer (can be negative)
- **checkpoint_level**: Integer between 1-40
- **current_level**: Integer between 1-40
- **correct_questions**: Non-negative integer
- **incorrect_questions**: Non-negative integer
- **skipped_questions**: Non-negative integer
- **hint_count**: Non-negative integer

### Frontend Components

#### TeamEditModal Component
**Location**: `components/admin/TeamEditModal.tsx`

**Features**:
- Comprehensive form with all editable team fields
- Real-time validation with error messages
- Responsive design with grid layout
- Loading states and disabled inputs during submission
- Toast notifications for success/error feedback

#### Admin Panel Integration
**Location**: `app/admin/page.tsx`

**New Features**:
- Edit button (blue pencil icon) for each team in the table
- Modal state management
- Team list refresh after updates
- Consistent styling with existing admin panel

## 🎯 Usage Guide

### For Level Testing

1. **Access Admin Panel**
   - Navigate to `/admin`
   - Login with admin credentials

2. **Create Test Team** (if needed)
   - Click "Create Team" button
   - Enter team name
   - Note the generated team code

3. **Edit Team for Testing**
   - Click the blue edit button (pencil icon) for the team
   - Set `current_level` to desired level (1-40)
   - Optionally adjust other fields:
     - Set `game_loaded` to `true` to enable game access
     - Adjust `score` for testing scoring scenarios
     - Modify question statistics for testing edge cases

4. **Test Level Access**
   - Use the team code to login as that team
   - Navigate to `/levels` - you'll see the team can access the specified level
   - Jump directly to `/levels/level-X` where X is the current_level

### Field Descriptions

| Field | Purpose | Testing Use Case |
|-------|---------|------------------|
| `team_name` | Display name | Update for clarity during testing |
| `current_level` | **Primary testing field** | Set to any level (1-40) to test that specific level |
| `score` | Team's total score | Test scoring calculations and edge cases |
| `game_loaded` | Whether team has started | Enable/disable game access |
| `checkpoint_score` | Score at last checkpoint | Test checkpoint revert functionality |
| `checkpoint_level` | Last checkpoint level | Test checkpoint system |
| `correct_questions` | Total correct answers | Test statistics display |
| `incorrect_questions` | Total incorrect answers | Test failure scenarios |
| `skipped_questions` | Total skipped questions | Test skip functionality |
| `hint_count` | Total hints used | Test hint system |

## 🔒 Security Features

### Validation
- **Server-side validation** for all fields
- **Type checking** for numeric fields
- **Range validation** for level fields (1-40)
- **Non-negative validation** for count fields

### Immutable Fields
- **team_code**: Cannot be changed (serves as primary key)
- **created_at**: Automatically managed
- **updated_at**: Automatically updated on changes

### Error Handling
- **Comprehensive error messages** for validation failures
- **404 handling** for non-existent teams
- **Network error handling** with user feedback
- **Form state management** prevents multiple submissions

## 🚀 Development Workflow

### Testing New Levels

1. **Create Test Team**
   ```
   Team Name: "Level X Test"
   ```

2. **Set Level Access**
   ```
   current_level: X (where X is the level you want to test)
   game_loaded: true
   ```

3. **Test Level**
   - Login with team code
   - Navigate to `/levels/level-X`
   - Verify level functionality

4. **Test Edge Cases**
   - Set different score values
   - Adjust question statistics
   - Test checkpoint scenarios

### Testing Scoring System

1. **Set Base State**
   ```
   score: 0
   correct_questions: 0
   incorrect_questions: 0
   skipped_questions: 0
   hint_count: 0
   ```

2. **Test Scenarios**
   - Complete level with different answer patterns
   - Verify score calculations
   - Test bonus conditions

### Testing Checkpoint System

1. **Set Checkpoint State**
   ```
   current_level: 15 (non-checkpoint level)
   checkpoint_level: 10 (last checkpoint)
   checkpoint_score: 5000
   ```

2. **Test Revert**
   - Trigger checkpoint revert in game
   - Verify team returns to checkpoint level and score

## 📊 Database Impact

### Updated Fields
All updates modify the `updated_at` timestamp automatically.

### Audit Trail
Consider implementing audit logging for production environments to track team modifications.

## 🎉 Benefits

### For Developers
- **Rapid Level Testing**: Jump to any level instantly
- **Edge Case Testing**: Set up specific scenarios quickly
- **Debugging Support**: Modify team state to reproduce issues
- **Flexible Testing**: Test individual components without full gameplay

### For Administrators
- **Team Management**: Full control over team data
- **Game Monitoring**: Real-time team status updates
- **Issue Resolution**: Ability to fix team data if needed
- **Competition Control**: Adjust teams for fair competition

## 🔧 Technical Notes

### Database Schema
No schema changes required - uses existing team table structure.

### API Design
RESTful design following existing patterns in the application.

### Component Architecture
Modular design with reusable components and proper separation of concerns.

### Type Safety
Full TypeScript support with proper type definitions and validation.

---

**The Team CRUD system is now fully operational and ready for comprehensive level testing! 🚀**
