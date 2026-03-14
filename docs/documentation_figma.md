# AI Typing Coach - Complete Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Pages & Features](#pages--features)
5. [Design System](#design-system)
6. [Routing Architecture](#routing-architecture)
7. [Components](#components)
8. [Setup & Installation](#setup--installation)
9. [Build Process](#build-process)
10. [Development Guidelines](#development-guidelines)

---

## Project Overview

**AI Typing Coach** is a typing practice platform designed to help students, beginners, and professionals improve their typing speed and accuracy through AI-powered feedback and structured learning.

### Project Goals

- Provide a **distraction-free** typing practice environment
- Offer **real-time feedback** with character-by-character highlighting
- Track user **progress** with detailed analytics
- Deliver **AI-powered error analysis** and personalized suggestions
- Create a **clean, minimal, and modern** interface inspired by Monkeytype and Duolingo

### Target Audience

- Students learning touch typing
- Professionals wanting to improve productivity
- Beginners starting their typing journey
- Anyone looking to increase typing speed and accuracy

### Pricing

- **₹99/month** for Pro Plan with unlimited access to all features

---

## Technology Stack

### Frontend Framework

- **React 18.3.1** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development (via .tsx files)
- **Vite 6.3.5** - Fast build tool and dev server

### Styling

- **Tailwind CSS 4.1.12** - Utility-first CSS framework
- **Inter Font** - Clean, modern typography
- **Radix UI** - Accessible component primitives
- **class-variance-authority** - Component variants
- **tailwind-merge** - Conditional class merging

### Routing

- **React Router 7.13.0** - Client-side routing with data mode pattern

### Data Visualization

- **Recharts 2.15.2** - Charts and graphs for analytics

### UI Components & Icons

- **Lucide React 0.487.0** - Icon library
- **Material UI 7.3.5** - Additional UI components
- **Radix UI Components** - Dialog, Dropdown, Tabs, Progress, etc.

### Form Handling

- **React Hook Form 7.55.0** - Performant form validation

### Animation

- **Motion 12.23.24** - Animation library (modern Framer Motion)

### Other Libraries

- **date-fns 3.6.0** - Date manipulation
- **sonner 2.0.3** - Toast notifications
- **react-dnd 16.0.1** - Drag and drop functionality
- **clsx 2.1.1** - Conditional classNames

---

## Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── ui/               # Reusable UI components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── progress.tsx
│   │   │   │   ├── avatar.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   └── ...
│   │   │   ├── figma/            # Figma-specific components
│   │   │   ├── app-layout.tsx    # Main app layout with sidebar
│   │   │   └── redirect-to-dashboard.tsx
│   │   ├── pages/
│   │   │   ├── landing-page.tsx
│   │   │   ├── dashboard-page.tsx
│   │   │   ├── practice-page.tsx
│   │   │   ├── report-page.tsx
│   │   │   ├── lessons-page.tsx
│   │   │   ├── profile-page.tsx
│   │   │   ├── admin-page.tsx
│   │   │   └── not-found-page.tsx
│   │   ├── App.tsx               # Root component
│   │   └── routes.ts             # Route configuration
│   ├── styles/
│   │   ├── theme.css             # Theme tokens and base styles
│   │   └── fonts.css             # Font imports
│   └── index.tsx                 # Entry point
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## Pages & Features

### 1. Landing Page (`/`)

**Purpose:** Marketing page to attract and convert users

**Features:**

- Hero section with call-to-action
- Feature highlights (3 cards):
  - Track Your Progress
  - AI-Powered Analysis
  - Structured Lessons
- Pricing section (₹99/month)
- Navigation with Login/Sign Up buttons
- Footer with copyright

**Key Components:**

- Navigation bar
- Hero section with CTA button
- Feature cards with icons
- Pricing card with benefits list
- Footer

**Design Elements:**

- Clean white background
- Blue primary color (#3B82F6)
- Large, bold typography
- Icon-based feature cards
- Centered content layout

---

### 2. Dashboard Page (`/app/dashboard`)

**Purpose:** User's main hub showing overview of progress and quick access to features

**Features:**

- Welcome header with user greeting
- "Start New Test" CTA button
- 4 stat cards showing:
  - **Average WPM** (58, +12% from last week)
  - **Accuracy** (94%, +3% from last week)
  - **Practice Sessions** (127 total)
  - **Best WPM** (72)
- Progress chart showing WPM over time (line chart)
- Recent activity section showing last 5 tests
- Quick access buttons:
  - Continue Practice
  - View All Reports

**Data Visualization:**

- Line chart with 10 data points showing WPM progress over dates
- Color-coded stats with trend indicators
- Responsive grid layout

**Key Metrics Displayed:**

- WPM trends
- Accuracy trends
- Total practice sessions
- Personal best scores
- Recent test history

---

### 3. Practice Page (`/app/practice`)

**Purpose:** Core typing practice interface with real-time feedback

**Features:**

- **Start Screen:**
  - Sample text display
  - "Start Typing" button
  - Timer display (starts at 0)
- **Active Practice:**
  - Real-time character-by-character highlighting:
    - **Green** - Correct characters
    - **Red** - Incorrect characters
    - **Gray** - Untyped characters
  - Live stats display:
    - Current WPM
    - Accuracy percentage
    - Timer (counts up)
    - Error count
  - Invisible input field (focus on click)
- **Practice Completion:**
  - Auto-redirect to Report page with test data
  - Pass WPM, accuracy, errors, and time to Report

**Implementation Details:**

- 3 sample texts (randomly selected)
- Timer updates every second
- WPM calculated as: (words typed / time in minutes)
- Accuracy calculated as: (correct characters / total typed) × 100
- Real-time error tracking
- Auto-complete when text matches exactly

**Technical Features:**

- useRef for input field management
- useEffect for timer management
- Real-time state updates
- Navigation with state passing

---

### 4. Report Page (`/app/report`)

**Purpose:** AI-powered analysis of completed typing tests

**Features:**

- **Test Results Summary:**
  - 4 stat cards:
    - Words Per Minute (WPM)
    - Accuracy Percentage
    - Total Errors
    - Time Taken
- **Weak Keys Analysis:**
  - Table showing most problematic keys
  - Columns: Key, Errors, Percentage
  - Top 3 weak keys highlighted
- **Error Heatmap:**
  - Visual keyboard layout
  - Color-coded keys:
    - **Green** - No errors
    - **Yellow** - 1-2 errors
    - **Orange** - 3 errors
    - **Red** - 4+ errors
  - QWERTY layout representation
- **AI Suggestions (3 cards):**
  - "Top Row Practice Needed" - Identifies weak key patterns
  - "Slow Down Slightly" - Pacing recommendations
  - "Finger Position" - Ergonomic tips
- **Action Buttons:**
  - "Practice Again" - Return to practice
  - "View All Reports" - Go to dashboard

**AI Analysis Components:**

- Weak key identification
- Error pattern analysis
- Personalized improvement suggestions
- Visual heatmap representation

**Data Flow:**

- Receives data from Practice page via location.state
- Falls back to default data if no state passed
- Displays historical weak key data

---

### 5. Lessons Page (`/app/lessons`)

**Purpose:** Structured learning path with progressive difficulty

**Features:**

- Lesson categories organized by difficulty
- 9 lesson modules:

  **Beginner Level:**
  1. **Home Row Practice** - A, S, D, F, G, H, J, K, L (100% complete)
  2. **Top Row Practice** - Q, W, E, R, T, Y, U, I, O, P (75% complete)
  3. **Bottom Row Practice** - Z, X, C, V, B, N, M (45% complete)

  **Intermediate Level:** 4. **Number Row** - Numbers and special characters (20% complete) 5. **Word Practice** - Common English words (60% complete) 6. **Sentence Practice** - Full sentences with punctuation (30% complete)

  **Advanced Level:** 7. **Paragraph Typing** - Multi-sentence paragraphs (0% complete) 8. **Speed Challenge** - Timed high-speed tests (0% complete) 9. **Code Typing** - Programming syntax practice (locked)

**Lesson Card Features:**

- Title and description
- Difficulty badge (Beginner/Intermediate/Advanced)
- Progress bar with percentage
- Status indicator:
  - ✓ Completed (green check)
  - ▶ Start/Continue button
  - 🔒 Locked icon
- Lesson status: Completed, In Progress, Not Started, Locked

**Visual Elements:**

- Color-coded difficulty badges
- Progress bars with percentage completion
- Status icons for quick recognition
- Responsive grid layout

---

### 6. Profile Page (`/app/profile`)

**Purpose:** User account management and personal statistics

**Features:**

- **User Information Card:**
  - Profile avatar with initials (JD)
  - Full name: John Doe
  - Email: john.doe@example.com
  - Join date: January 15, 2026
- **Subscription Details:**
  - Plan: Pro
  - Status: Active (green badge)
  - Renewal date: April 15, 2026
  - "Manage Subscription" button
- **Overall Statistics:**
  - Total Tests: 127
  - Total Practice Time: 24h 35m
  - Best WPM: 72
  - Average WPM: 58
  - Average Accuracy: 94%
- **Recent Test History:**
  - Table showing last 5 typing tests
  - Columns:
    - Date & Time
    - WPM
    - Accuracy
    - Duration
  - Newest tests first
- **Account Settings:**
  - Edit Profile button
  - Change Password button
  - Logout button

**Data Display:**

- Avatar with fallback initials
- Subscription status badge
- Comprehensive stats grid
- Detailed test history table
- Account action buttons

---

### 7. Admin Panel (`/app/admin`)

**Purpose:** Administrative dashboard for platform management

**Access:** Only visible to admin users (controlled by isAdmin flag)

**Features:**

- **Admin Stats Overview (4 cards):**
  - Total Users: 1,247
  - Active Users: 892
  - Total Lessons: 9
  - Pending Approvals: 3
- **Tabs Interface:**

  **Tab 1: User Management**
  - Display total and active users
  - User statistics dashboard

  **Tab 2: Lesson Management**
  - Table of all lessons with:
    - Lesson Title
    - Status (Published/Draft)
    - Number of Students
  - Edit/Manage lesson buttons
  - 9 total lessons (8 published, 1 draft)

  **Tab 3: Community Posts (Pending Approvals)**
  - User-submitted content moderation
  - Each post shows:
    - Author name
    - Post title
    - Content preview
    - Date submitted
    - Category badge
  - Action buttons:
    - ✓ Approve (green)
    - ✗ Reject (red)
  - 3 pending posts for review

**Admin Features:**

- Real-time approval/rejection
- Lesson status management
- User engagement metrics
- Community content moderation

**Sample Pending Posts:**

1. "Quick Tips for Improving Speed" by Sarah Johnson
2. "Best Keyboard for Typing Practice" by Mike Chen
3. "Overcoming Top Row Struggles" by Emily Davis

---

### 8. 404 Not Found Page (`*`)

**Purpose:** Handle invalid routes gracefully

**Features:**

- Large "404" heading
- "Page Not Found" message
- Helpful explanation
- Two action buttons:
  - "Go to Dashboard" - Navigate to /app/dashboard
  - "Go Back" - Browser back button
- Clean, centered layout
- Consistent with app design

**Error Handling:**

- Catches all unmatched routes
- Provides clear user guidance
- Easy navigation back to app
- Error boundary integration

---

## Design System

### Color Palette

**Primary Colors:**

- Blue: `#3B82F6` (blue-600) - Primary actions, links
- Light Blue: `#EFF6FF` (blue-50) - Active states, highlights

**Semantic Colors:**

- Green: `#10B981` (green-600) - Success, correct typing
- Red: `#EF4444` (red-600) - Errors, incorrect typing
- Orange: `#F59E0B` (orange-600) - Warnings
- Yellow: `#FCD34D` (yellow-400) - Caution

**Neutral Colors:**

- Gray-50: `#F9FAFB` - Background
- Gray-100: `#F3F4F6` - Subtle backgrounds
- Gray-200: `#E5E7EB` - Borders
- Gray-600: `#4B5563` - Secondary text
- Gray-700: `#374151` - Primary text
- Gray-900: `#111827` - Headings
- White: `#FFFFFF` - Card backgrounds

### Typography

**Font Family:**

- Primary: Inter (imported via Google Fonts)
- Fallback: system-ui, -apple-system, sans-serif

**Font Sizes (Tailwind classes):**

- 5xl (3rem) - Hero headings
- 4xl (2.25rem) - Page titles
- 3xl (1.875rem) - Section headers
- 2xl (1.5rem) - Card titles
- xl (1.25rem) - Large text
- lg (1.125rem) - Emphasized text
- base (1rem) - Body text
- sm (0.875rem) - Small text

**Font Weights:**

- Bold (700) - Headings, stats
- Semibold (600) - Subheadings
- Medium (500) - Emphasis
- Regular (400) - Body text

### Spacing System

Uses Tailwind's spacing scale (4px base):

- 1 = 4px
- 2 = 8px
- 3 = 12px
- 4 = 16px
- 6 = 24px
- 8 = 32px
- 12 = 48px
- 16 = 64px
- 20 = 80px

### Component Styling

**Cards:**

- White background
- Border: 1px solid gray-200
- Border radius: 8px (rounded-lg)
- Padding: 24px (p-6)
- Box shadow: subtle

**Buttons:**

- Primary: Blue background, white text
- Ghost: Transparent, gray text
- Outline: Border with transparent bg
- Sizes: sm, default, lg
- Border radius: 6px (rounded-md)
- Hover states with opacity/color change

**Inputs:**

- Border: 1px solid gray-300
- Focus: Blue ring
- Border radius: 6px
- Padding: 8px 12px

### Layout Principles

**Responsive Design:**

- Mobile-first approach
- Desktop optimized (1280px+ ideal)
- Tablet support (768px+)
- Breakpoints: sm, md, lg, xl

**Grid System:**

- CSS Grid for card layouts
- Flexbox for navigation
- Max-width containers (7xl = 1280px)

**Navigation:**

- Left sidebar (256px width)
- Fixed position
- Active state highlighting
- Icon + text labels

---

## Routing Architecture

### Route Configuration (`/src/app/routes.ts`)

**Pattern:** React Router Data Mode with createBrowserRouter

**Route Structure:**

```
/ (Landing Page)
/app (App Layout - with sidebar)
  ├── /app (redirect to /app/dashboard)
  ├── /app/dashboard (Dashboard Page)
  ├── /app/practice (Practice Page)
  ├── /app/lessons (Lessons Page)
  ├── /app/report (Report Page)
  ├── /app/profile (Profile Page)
  ├── /app/admin (Admin Page - conditional)
  └── /app/* (Not Found Page)
* (Not Found Page - catch-all)
```

**Important Implementation Details:**

1. Uses `react-router` package (NOT react-router-dom)
2. Component property pattern for type safety
3. ErrorBoundary configuration on parent routes
4. Nested routes with Outlet in AppLayout
5. Index route redirects to dashboard

**Navigation Components:**

- AppLayout provides sidebar navigation
- Sidebar shows active route highlighting
- Admin link conditionally rendered based on user role

### State Management

**Location State:**

- Practice → Report: Passes test results (wpm, accuracy, errors, time)
- Used with useLocation() and location.state

**URL Parameters:**

- Not currently used (could be added for lesson IDs)

**Navigation Methods:**

- Link component for declarative navigation
- useNavigate hook for programmatic navigation
- Navigate component for redirects

---

## Components

### Layout Components

**1. AppLayout (`app-layout.tsx`)**

- Main application shell
- Left sidebar navigation
- Outlet for nested routes
- Responsive design
- Admin link conditional rendering

**Navigation Items:**

- Dashboard (LayoutDashboard icon)
- Practice (Keyboard icon)
- Lessons (BookOpen icon)
- Reports (FileText icon)
- Profile (User icon)
- Admin (Shield icon) - conditional

### UI Components (`/components/ui/`)

All components built with Radix UI primitives and Tailwind CSS:

**1. Button (`button.tsx`)**

- Variants: default, destructive, outline, secondary, ghost, link
- Sizes: default, sm, lg, icon
- Accessible and keyboard navigable

**2. Card (`card.tsx`)**

- Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- Composable structure
- Consistent styling

**3. Badge (`badge.tsx`)**

- Variants: default, secondary, destructive, outline
- Used for status indicators

**4. Progress (`progress.tsx`)**

- Visual progress bar
- Percentage-based
- Smooth animations

**5. Avatar (`avatar.tsx`)**

- Avatar, AvatarImage, AvatarFallback
- Circular profile images
- Fallback to initials

**6. Tabs (`tabs.tsx`)**

- Tabs, TabsList, TabsTrigger, TabsContent
- Accessible tab interface
- Used in Admin panel

**7. Input (`input.tsx`)**

- Text input field
- Consistent styling
- Form integration

**8. Label (`label.tsx`)**

- Form labels
- Accessibility support

**9. Select (`select.tsx`)**

- Dropdown selection
- Radix Select primitive

**10. Dialog (`dialog.tsx`)**

- Modal dialogs
- Accessible overlay

### Utility Functions

**cn() function:**

- Combines clsx and tailwind-merge
- Handles conditional className merging
- Prevents Tailwind class conflicts

---

## Setup & Installation

### Prerequisites

- Node.js 18+ or compatible runtime
- pnpm package manager (recommended)
- Modern web browser

### Installation Steps

1. **Clone or create project directory:**

```bash
mkdir ai-typing-coach
cd ai-typing-coach
```

2. **Initialize package.json:**

```bash
npm init -y
```

3. **Install dependencies:**

```bash
pnpm install
```

4. **Install core dependencies:**

```bash
pnpm add react@18.3.1 react-dom@18.3.1 react-router@7.13.0
pnpm add lucide-react recharts
```

5. **Install Tailwind CSS v4:**

```bash
pnpm add -D tailwindcss@4.1.12 @tailwindcss/vite@4.1.12
pnpm add -D vite@6.3.5 @vitejs/plugin-react@4.7.0
```

6. **Install Radix UI components:**

```bash
pnpm add @radix-ui/react-accordion @radix-ui/react-avatar @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-progress @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-tabs @radix-ui/react-tooltip
```

7. **Install utility packages:**

```bash
pnpm add class-variance-authority clsx tailwind-merge
pnpm add react-hook-form@7.55.0 date-fns sonner
```

8. **Install Material UI (optional):**

```bash
pnpm add @mui/material @emotion/react @emotion/styled @mui/icons-material
```

### Project Files Setup

1. **Create folder structure:**

```bash
mkdir -p src/app/{components/ui,pages}
mkdir -p src/styles
```

2. **Copy all component files:**
   - Create all page components in `src/app/pages/`
   - Create all UI components in `src/app/components/ui/`
   - Create AppLayout in `src/app/components/`

3. **Create style files:**
   - `/src/styles/theme.css` - Theme tokens
   - `/src/styles/fonts.css` - Font imports

4. **Create configuration files:**
   - `vite.config.ts`
   - `tsconfig.json`

### Vite Configuration

**vite.config.ts:**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

### Running the Application

**Development server:**

```bash
pnpm dev
```

**Build for production:**

```bash
pnpm build
```

**Preview production build:**

```bash
pnpm preview
```

---

## Build Process

### Vite Build Configuration

**Build Command:** `vite build`

**Output Directory:** `dist/`

**Build Optimizations:**

- Code splitting
- Tree shaking
- Minification
- Asset optimization

### Environment Variables

Currently no environment variables required.

**For future API integration:**

```env
VITE_API_URL=https://api.example.com
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Development Guidelines

### Code Style

**TypeScript/React:**

- Functional components only
- React Hooks for state management
- TypeScript for type safety
- Named exports for components

**File Naming:**

- Components: `kebab-case.tsx` (e.g., `dashboard-page.tsx`)
- Utilities: `kebab-case.ts`
- Types: PascalCase interfaces

**Component Structure:**

```typescript
import { useState } from "react";
import { Button } from "../components/ui/button";

export function ComponentName() {
  const [state, setState] = useState(initialState);

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

### State Management

**Current Approach:**

- React useState for local state
- URL state for navigation data
- No global state management (Redux/Context)

**For Future:**

- Consider React Context for user authentication
- Zustand or Redux for complex state
- React Query for server state

### Styling Guidelines

**Tailwind CSS:**

- Use utility classes inline
- Create reusable components for complex patterns
- Use theme.css for global styles
- Avoid custom CSS when possible

**Component Variants:**

- Use class-variance-authority for variants
- Keep variants in component files
- Document variant props with TypeScript

### Performance Considerations

**Current Optimizations:**

- Code splitting via React Router
- Lazy loading for heavy components
- Memoization where appropriate
- Efficient re-renders

**Future Optimizations:**

- React.lazy for page components
- useMemo for expensive calculations
- useCallback for event handlers
- Virtual scrolling for large lists

### Accessibility

**Current Implementation:**

- Semantic HTML
- Radix UI accessible primitives
- Keyboard navigation
- ARIA labels where needed

**Best Practices:**

- Focus management
- Screen reader support
- Color contrast (WCAG AA)
- Keyboard-only navigation

### Testing Strategy

**Recommended Approach:**

- Unit tests: Vitest
- Component tests: React Testing Library
- E2E tests: Playwright or Cypress
- Type checking: TypeScript

**Test Coverage Areas:**

- Practice page typing logic
- WPM/accuracy calculations
- Route navigation
- User interactions

---

## Future Enhancements

### Backend Integration

- User authentication (Supabase)
- Database for user data and progress
- API for typing tests and reports
- Real AI analysis (OpenAI/Claude API)

### New Features

- Multiplayer typing races
- Custom text upload
- Typing games
- Leaderboards
- Achievement system
- Dark mode
- Multiple language support
- Mobile app version

### Analytics

- Google Analytics integration
- User behavior tracking
- A/B testing
- Performance monitoring

### Content

- More lesson modules
- Specialized typing exercises (coding, medical, legal)
- Video tutorials
- Community forum

---

## Troubleshooting

### Common Issues

**1. React Router 404 errors:**

- Ensure using `react-router` not `react-router-dom`
- Check route configuration in routes.ts
- Verify ErrorBoundary setup

**2. Tailwind classes not working:**

- Check Tailwind CSS v4 configuration
- Verify @tailwindcss/vite plugin in vite.config.ts
- Clear Vite cache: `rm -rf node_modules/.vite`

**3. Component import errors:**

- Check relative paths
- Ensure components are exported correctly
- Verify file extensions (.tsx vs .ts)

**4. Build failures:**

- Check TypeScript errors
- Verify all dependencies installed
- Update to compatible package versions

### Support Resources

- React Router docs: https://reactrouter.com
- Tailwind CSS v4 docs: https://tailwindcss.com
- Radix UI docs: https://www.radix-ui.com
- Recharts docs: https://recharts.org

---

## License & Credits

**Project:** AI Typing Coach
**Created:** 2026
**Framework:** React + TypeScript + Tailwind CSS
**Design Inspiration:** Monkeytype, Duolingo
**Icons:** Lucide React
**Charts:** Recharts
**UI Components:** Radix UI

---

**Document Version:** 1.0  
**Last Updated:** March 13, 2026  
**Maintained By:** Development Team
