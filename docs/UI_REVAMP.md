# Typing Coach — UI Revamp Plan

Inspired by [AI Typing Coach Figma](https://near-spiral-83551192.figma.site/). Features and design language from [documentation_figma.md](documentation_figma.md). **Keep existing tech stack** (React, Vite, Tailwind, Go backend). Use our color scheme.

---

## Design Language (from Figma)

### Layout

- **Sidebar navigation** — Left sidebar (256px), fixed, icon + text labels, active state highlighting
- **App shell** — Main content area with sidebar, responsive
- **Max-width containers** — 1280px (7xl) for content
- **Card-based UI** — White/dark cards, 8px radius, subtle shadow, 24px padding

### Typography

- **Font**: Inter (or existing project font)
- **Scale**: Hero (3rem), Page titles (2.25rem), Section (1.875rem), Card (1.5rem), Body (1rem), Small (0.875rem)
- **Weights**: Bold headings, Semibold subheadings, Medium emphasis, Regular body

### Spacing

- Tailwind scale (4px base): p-4, p-6, gap-4, gap-6, space-y-6

### Components

- **Stat cards** — Large number, label, optional trend (+12%)
- **Progress bars** — Percentage completion, color-coded
- **Badges** — Difficulty (Beginner/Intermediate/Advanced), status (Active, Completed)
- **Avatar** — Fallback to initials

---

## Phase 1: Landing Page

### Functionality

- Marketing page: hero, features, pricing, CTA
- Navigation: Login / Sign Up
- Footer

### Frontend Responsibilities

- **LandingPage** (`/`): Hero section, CTA button, feature cards (3), pricing section, footer
- **Feature cards**: Track Progress, AI Analysis, Structured Lessons — icon + title + description
- **Pricing**: Plan details, benefits list (optional — can be placeholder)
- **Navigation**: Logo, Login, Sign Up — links to auth pages
- **Responsive**: Mobile-first, centered layout

### Backend Responsibilities

- None. Static content. Optional: fetch pricing/plans from API later.

---

## Phase 2: App Layout & Navigation

### Functionality

- Sidebar layout for authenticated app
- Nav items: Dashboard, Practice, Lessons, Reports, Profile
- Admin link (conditional)
- Redirect unauthenticated to login

### Frontend Responsibilities

- **AppLayout**: Sidebar + main content area, Outlet for nested routes
- **Sidebar**: Fixed left, 256px, nav items with icons, active route highlight
- **Nav items**: Dashboard, Practice, Lessons, Reports (or Dashboard), Profile
- **Admin link**: Show only when `user.isAdmin` (from backend)
- **Responsive**: Collapsible sidebar on mobile, or bottom nav

### Backend Responsibilities

- Include `isAdmin` or `role` in user object (JWT payload or `GET /api/users/me`)

---

## Phase 3: Dashboard Page

### Functionality

- Welcome header with user name
- "Start New Test" CTA
- 4 stat cards: Average WPM, Accuracy, Practice Sessions, Best WPM
- Progress chart (WPM over time)
- Recent activity (last 5 tests)
- Quick actions: Continue Practice, View All Reports

### Frontend Responsibilities

- **DashboardPage**: Welcome header, Start New Test button
- **Stat cards**: 4 cards with number, label, optional trend (e.g. +12% from last week)
- **Progress chart**: Line chart — WPM vs date (use Recharts or lightweight chart lib)
- **Recent activity**: List/table of last 5 sessions (date, lesson, WPM, accuracy)
- **Empty state**: When no sessions, show "Start your first practice"

### Backend Responsibilities

- `GET /api/users/me/stats` — returns: avgWpm, accuracy, totalSessions, bestWpm, trend data
- `GET /api/users/me/sessions` — already exists, support `?limit=5` for recent
- Aggregate WPM/accuracy from sessions for stats

---

## Phase 4: Practice Page (Revamp)

### Functionality

- Start screen: sample text, "Start Typing" button
- Active: real-time character highlighting (green/red/gray), live stats (WPM, accuracy, timer, error count)
- Completion: redirect to Report with data

### Frontend Responsibilities

- **PracticePage**: Start screen vs active vs (redirect to report)
- **Start screen**: Display sample text, Start Typing button, timer at 0
- **Active practice**: TypingText (green/red/gray), LiveMetrics (WPM, accuracy, timer, error count)
- **Invisible input**: Focus on click, keyboard-only
- **Auto-redirect**: On complete → navigate to Report with state (wpm, accuracy, errors, time, mistakes)

### Backend Responsibilities

- None for practice logic. `POST /api/sessions` on complete (already exists).

---

## Phase 5: Report Page (Revamp)

### Functionality

- Test results: 4 stat cards (WPM, Accuracy, Errors, Time)
- Weak keys table: Key, Errors, Percentage — top 3 highlighted
- Error heatmap: QWERTY layout, color scale (green → yellow → orange → red)
- AI suggestions: 3 cards (e.g. Top Row Practice, Slow Down, Finger Position)
- Actions: Practice Again, View All Reports

### Frontend Responsibilities

- **ReportPage**: Receives data from Practice via location.state
- **Stat cards**: WPM, Accuracy, Total Errors, Time Taken
- **Weak keys table**: Sort by errors, highlight top 3
- **Heatmap**: Same as KeyAccuracyHeatmap, color scale: green (0) → yellow (1–2) → orange (3) → red (4+)
- **Suggestions**: 3 cards from mistake analysis (reuse ImprovementSuggestions logic)
- **Fallback**: Default/empty data if no state passed

### Backend Responsibilities

- None. Analysis is client-side. Session data passed via navigation state or fetched by session ID if we add `GET /api/sessions/:id`.

---

## Phase 6: Lessons Page (Revamp)

### Functionality

- Lesson categories by difficulty (Beginner, Intermediate, Advanced)
- Lesson cards: title, description, difficulty badge, progress bar, status (Completed/In Progress/Not Started/Locked)
- 9 modules: Home Row, Top Row, Bottom Row, Number Row, Word Practice, Sentence Practice, Paragraph, Speed Challenge, Code Typing (locked)

### Frontend Responsibilities

- **LessonsPage**: Categories, grid of lesson cards
- **LessonCard**: Title, description, difficulty badge, progress bar (%), status icon (✓ / ▶ / 🔒)
- **Progress**: Fetch completion from backend (e.g. `lesson.progress` or computed from sessions)
- **Locked state**: Show lock icon, disable click for locked lessons
- **Responsive**: Grid layout (1 col mobile, 2–3 cols desktop)

### Backend Responsibilities

- Add `progress` or `completion` to lesson response — computed from user's sessions for that lesson
- `GET /api/lessons` — include progress when user is authenticated
- Add lesson types: number_row, paragraph, speed_challenge, code_typing (for future)
- Seed additional lessons if needed

---

## Phase 7: Profile Page

### Functionality

- User info: avatar, name, email, join date
- Subscription: plan, status, renewal date (optional)
- Overall stats: Total Tests, Practice Time, Best WPM, Avg WPM, Avg Accuracy
- Recent test history: table (date, WPM, accuracy, duration)
- Account: Edit Profile, Change Password, Logout

### Frontend Responsibilities

- **ProfilePage**: User card, stats grid, recent tests table, account actions
- **Avatar**: Image or initials fallback
- **Stats**: Total tests, total time, best WPM, avg WPM, avg accuracy
- **Recent tests**: Table, last 5–10, sort by date desc
- **Edit Profile / Change Password**: Forms (can be Phase 8)

### Backend Responsibilities

- `GET /api/users/me` — returns: id, email, name, createdAt, (subscription if applicable)
- `GET /api/users/me/stats` — totalTests, totalTimeSec, bestWpm, avgWpm, avgAccuracy
- `GET /api/users/me/sessions` — already exists
- `PATCH /api/users/me` — update name (optional)
- `POST /api/auth/change-password` — change password (optional)

---

## Phase 8: Admin Panel (Optional)

### Functionality

- Admin-only access
- Stats: Total Users, Active Users, Total Lessons, Pending Approvals
- Tabs: User Management, Lesson Management, Community Posts (Pending)

### Frontend Responsibilities

- **AdminPage**: Stats cards, tabs
- **User Management tab**: User list, stats
- **Lesson Management tab**: Table (title, status, students), Edit/Manage
- **Community tab**: Pending posts, Approve/Reject buttons
- **Access control**: Show only if user.isAdmin, else redirect

### Backend Responsibilities

- `GET /api/admin/stats` — totalUsers, activeUsers, totalLessons, pendingApprovals
- `GET /api/admin/users` — user list (paginated)
- `GET /api/admin/lessons` — lessons with student count
- `GET /api/admin/posts` — pending community posts
- `POST /api/admin/posts/:id/approve`, `POST /api/admin/posts/:id/reject`
- Auth middleware: require admin role

---

## Phase 9: 404 Page

### Functionality

- 404 heading, "Page Not Found" message
- Buttons: Go to Dashboard, Go Back

### Frontend Responsibilities

- **NotFoundPage**: Centered, 404 text, two buttons
- **Routing**: Catch-all route `*`

### Backend Responsibilities

- None.

---

## Route Structure (Target)

```
/                    → Landing Page (public)
/login               → Login
/signup              → Sign Up
/app                 → App Layout (auth required)
  /app               → redirect to /app/dashboard
  /app/dashboard     → Dashboard
  /app/practice      → Practice
  /app/report        → Report (receives state from Practice)
  /app/lessons       → Lessons
  /app/profile       → Profile
  /app/admin         → Admin (admin only)
  /app/*             → 404
*                    → 404
```

---

## Summary: Backend API Additions

| Endpoint | Purpose |
|----------|---------|
| `GET /api/users/me` | User profile (name, email, createdAt) |
| `GET /api/users/me/stats` | Aggregated stats (avgWpm, bestWpm, totalSessions, etc.) |
| `PATCH /api/users/me` | Update profile (optional) |
| `GET /api/lessons` | Add `progress` when user authenticated |
| `GET /api/admin/stats` | totalUsers, activeUsers, totalLessons, pendingApprovals |
| `GET /api/admin/users` | User list (paginated: ?page=1&limit=20) |
| `GET /api/admin/lessons` | Lessons with studentCount |
| `GET /api/admin/posts` | Pending posts (stub: empty array) |
| `POST /api/admin/posts/:id/approve` | Approve post (stub: 404) |
| `POST /api/admin/posts/:id/reject` | Reject post (stub: 404) |

**Creating an admin user**: `UPDATE users SET role = 'admin' WHERE email = 'user@example.com';` then re-login to get a new JWT with `isAdmin: true`.

---

## Agent Instructions

- **Frontend**: "Implement UI revamp Phase N — read docs/UI_REVAMP.md and docs/FEATURE_SPECS.md"
- **Backend**: "Implement UI revamp Phase N — read docs/UI_REVAMP.md and docs/FEATURE_SPECS.md"
