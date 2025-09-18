# Level 32 - Video Challenge

## Overview
Level 32 is a unique video-based challenge that tests players' observation skills. Players watch a silent video once and then answer multiple-choice questions based on what they observed.

## Features

### Video System
- **One-time viewing**: Video can only be watched once per game session
- **Silent playback**: Video has no audio to focus on visual elements
- **Custom controls**: Play/pause available, but seeking is disabled
- **Error handling**: Graceful fallback if video fails to load
- **Session tracking**: Uses sessionStorage to prevent re-watching

### User Flow
1. **Rules Modal**: Explains the video challenge format and rules
2. **Video Modal**: Displays the video with custom controls
3. **Questions Interface**: Standard MCQ format testing observation skills
4. **Completion**: Enhanced scoring with observation skills bonus

### Question Format
- 5 multiple-choice questions based on video content
- No hints available (observation-only challenge)
- Questions test attention to detail and memory
- Higher base scores due to difficulty of observation tasks

## Implementation Details

### Components
- `page.tsx`: Main level component with video-specific state management
- `RulesModal.tsx`: Explains video challenge rules and format
- `VideoModal.tsx`: Custom video player with restricted controls

### State Management
- `showRulesModal`: Controls rules modal visibility
- `showVideoModal`: Controls video modal visibility  
- `videoWatched`: Tracks if video has been completed
- `canStartQuestions`: Gates access to questions until video is watched

### Video Requirements
The video file should be placed at `/public/level32-video.mp4` and contain:
1. The word "Google" appearing first on screen
2. 12 clocks appearing in the video
3. "Manorama news" channel being shown
4. Actress "Kalpana" giving a speech
5. A dog named "Snoopy" being shown

### Scoring Algorithm
- **Base Score**: 1800 points per correct answer (higher than standard levels)
- **Time Bonus**: Rewards quick completion after video ends
- **Consecutive Bonus**: 300 points for every 3 consecutive correct answers
- **Penalties**: 500 points for incorrect, 900 points for skipped questions

### Technical Features
- Session-based video tracking prevents replay
- Custom video controls with seeking disabled
- Error handling for missing video files
- Responsive design for various screen sizes
- Accessibility features (ARIA labels, keyboard navigation)

## File Structure
```
app/levels/level-32/
├── page.tsx           # Main level component
├── RulesModal.tsx     # Rules explanation modal
├── VideoModal.tsx     # Custom video player modal
└── README.md          # This documentation
```

## Dependencies
- React hooks for state management
- Lucide React icons
- shadcn/ui components
- Next.js routing
- Supabase integration for scoring

## Testing Notes
- Ensure video file exists at correct path
- Test video playback across different browsers
- Verify one-time viewing restriction works
- Check error handling when video is missing
- Test question flow after video completion
- Validate scoring calculations

## Future Enhancements
- Support for multiple video formats
- Video quality selection
- Subtitles support (if needed)
- Analytics for video engagement
- Dynamic question generation based on video content
