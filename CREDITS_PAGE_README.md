# TechDOS Credits Page

## Overview
A vibrant, celebratory end-of-game credits page that showcases the team behind TechDOS with modern design principles and engaging animations.

## Features

### 🎨 Visual Design
- **Color Palette**: Electric teal (#00D4FF), coral pink (#FF5C7A), sunny yellow (#FFD24C), deep purple (#6B2EFF)
- **Background**: Diagonal gradients with floating abstract shapes
- **Cards**: Glassmorphism effect with backdrop blur and soft shadows
- **Typography**: Clean, modern fonts with proper hierarchy

### ✨ Animations
- **Page Load**: Title fade-in with scale animation
- **Confetti**: Animated sparkles that repeat every 5 seconds
- **Hover Effects**: Cards lift with enhanced shadows
- **Coordinator Badges**: Shimmer animation effect
- **Staggered Animations**: Team members appear with sequential delays

### 👥 Team Structure
- **Faculty Coordinators**: Two featured cards with QR codes for LinkedIn
- **Team Coordinators**: Highlighted with special badges (Dario George, Tippu Sahib)
- **Team Members**: Grid layout with smaller avatars

### 📱 Responsive Design
- **Desktop (1200px+)**: Two-column layout
- **Tablet/Mobile (<1200px)**: Single-column stack
- **Touch Targets**: Minimum 44px for mobile accessibility

### 🔗 Interactive Elements
- **QR Codes**: Click/tap to open modal with LinkedIn QR code
- **Social Links**: LinkedIn, share functionality, and navigation
- **Accessibility**: WCAG AA compliant with proper focus states

## Technical Implementation

### Dependencies
- React/Next.js with TypeScript
- Framer Motion for animations
- QRCode.js for QR code generation
- Tailwind CSS for styling
- shadcn/ui components
- React Icons for social icons

### Key Components
- `Confetti`: Animated particle system
- `QRModal`: Modal dialog for LinkedIn QR codes
- Responsive grid layouts
- Custom Tailwind animations (shimmer, float, pulse-glow)

### Accessibility Features
- Screen reader friendly alt text
- Keyboard navigation support
- High contrast color combinations
- Reduced motion respect
- Semantic HTML structure

## Usage

The page is accessible at `/end-page` and automatically displays when players complete the TechDOS challenge.

### Customization
To update team member information:
1. Edit the `facultyCoordinators` array for faculty details
2. Update `teamCoordinators` for coordinator information
3. Modify `teamMembers` array for team member names
4. Replace LinkedIn URLs in faculty coordinator objects

### QR Code Configuration
Faculty LinkedIn URLs are currently set as placeholders:
- `{Faculty1_LinkedIn_URL}`
- `{Faculty2_LinkedIn_URL}`

Replace these with actual LinkedIn profile URLs.

## Performance
- Optimized animations with GPU acceleration
- Lazy-loaded QR code generation
- Efficient re-renders with React best practices
- Minimal bundle size impact

## Browser Support
- Modern browsers with CSS Grid and Flexbox support
- Progressive enhancement for older browsers
- Graceful fallbacks for animation-disabled environments
