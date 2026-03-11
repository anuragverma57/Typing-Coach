# Typing Coach — Feature Specs (Agent Reference)

Reference for Frontend and Backend agents. Each feature has a number. When instructing an agent, say: "Implement Feature N — read docs/FEATURE_SPECS.md". Each agent reads only their section (Frontend Responsibilities or Backend Responsibilities).

**Context**: [prd.md](../prd.md) | [ARCHITECTURE.md](ARCHITECTURE.md)

---

## Feature 1: Core Typing Practice (MVP)

**Phase**: 1  
**Goal**: Users can type text and see basic results. No auth, no DB yet.

### Frontend Responsibilities

- Build typing exercise UI: display target text, capture user input in real time
- Compare user input character-by-character against target text (correct vs incorrect)
- Implement keyboard event handling (keydown/keypress) — avoid copy-paste for accuracy
- Calculate WPM (words per minute): `(correctChars / 5) / (elapsedMinutes)` — standard: 5 chars = 1 word
- Calculate accuracy: `(correctChars / totalChars) * 100`
- Track session start time and elapsed time
- Build simple results screen showing: WPM, accuracy, time taken
- Use React state for: target text, user input, start time, session status (idle / typing / finished)

### Backend Responsibilities

- None for this feature. All logic is client-side.

---

## Feature 2: Mistake Analysis

**Phase**: 2  
**Goal**: Show what went wrong and how to improve.

### Frontend Responsibilities

- Extend character-level tracking: store which characters were wrong and at which position
- Build mistake report UI: list of errors (expected vs typed), grouped by character or pattern
- Build per-key accuracy breakdown or heatmap (e.g. which keys on keyboard had most errors)
- Display improvement suggestions (e.g. "Practice home row: a, s, d, f")
- Derive suggestions from mistake data: if key X has low accuracy, suggest practicing that key/row
- Integrate mistake report into results screen from Feature 1

### Backend Responsibilities

- None for this feature. Analysis is client-side. Backend may consume this data in Feature 4.

---

## Feature 3: Structured Lessons

**Phase**: 3  
**Goal**: Guided modules (home row, top row, bottom row, words, sentences).

### Frontend Responsibilities

- Build lesson selector UI: list or grid of available lessons
- Add routing/navigation to switch between lesson list and typing exercise
- Display lesson metadata: name, description, difficulty
- Fetch lesson content from Backend API (when Feature 4 is done) or use static JSON for now
- Pass selected lesson content to typing exercise component from Feature 1
- Lesson types: beginner, home row, top row, bottom row, word typing, sentence typing

### Backend Responsibilities

- Define lesson data structure (ID, name, description, content, type/category)
- Provide lessons via JSON file or in-memory for now (DB in Feature 4)
- Expose `GET /api/lessons` — list all lessons
- Expose `GET /api/lessons/:id` — get single lesson with content
- Ensure CORS allows frontend origin

---

## Feature 4: Backend & Persistence

**Phase**: 4  
**Goal**: Store lessons, sessions, and user progress.

### Frontend Responsibilities

- Replace static/mock lesson data with API calls to Backend
- Add API client (fetch or axios): base URL configurable (e.g. env variable)
- After typing session ends, send results to Backend: `POST /api/sessions` with payload (lessonId, wpm, accuracy, mistakes, duration)
- Handle loading and error states when calling API
- Configure proxy in Vite for `/api` to backend (or use full URL in dev)

### Backend Responsibilities

- Set up database: SQLite (dev) or PostgreSQL
- Create schema: lessons table, sessions table (id, lesson_id, user_id nullable, wpm, accuracy, mistakes_json, duration_sec, created_at)
- Implement `GET /api/lessons` — from DB
- Implement `GET /api/lessons/:id` — from DB
- Implement `POST /api/sessions` — store session result (user_id nullable for anonymous)
- Add CORS middleware for frontend origin
- Return JSON with proper Content-Type

---

## Feature 5: User Accounts & Dashboard

**Phase**: 5  
**Goal**: Users can sign up, log in, and see their typing history.

### Frontend Responsibilities

- Build signup page: form (email, password, confirm password)
- Build login page: form (email, password)
- Store auth token (JWT) in localStorage or httpOnly cookie
- Implement protected routes: redirect to login if not authenticated
- Build progress dashboard: list of past sessions (date, lesson, WPM, accuracy)
- Fetch `GET /api/sessions` (or `/api/users/me/sessions`) for logged-in user
- Add logout and token refresh handling

### Backend Responsibilities

- Implement signup: `POST /api/auth/signup` — validate, hash password, create user, return JWT
- Implement login: `POST /api/auth/login` — validate credentials, return JWT
- Add users table: id, email, password_hash, created_at
- Add auth middleware: validate JWT on protected routes
- Implement `GET /api/users/me/sessions` — return sessions for authenticated user
- Update `POST /api/sessions` to accept optional user_id from JWT

---

## Feature 6: Hindi Support

**Phase**: 6  
**Goal**: Typing practice in Hindi.

### Frontend Responsibilities

- Support Hindi keyboard layout (e.g. Inscript, Phonetic) — document which layout is used
- Add language switcher in UI: English / Hindi
- Handle Unicode input for Hindi characters (Devanagari)
- Ensure typing exercise and mistake analysis work with Hindi text
- Update lesson selector to filter or display Hindi lessons

### Backend Responsibilities

- Add Hindi lesson content to DB (or JSON)
- Ensure `GET /api/lessons` supports language filter: `?lang=hindi` or `?lang=en`
- Add `language` field to lessons table if not present
- Store and return Hindi content with correct encoding (UTF-8)

---

## Feature 7: Polish & Future

**Phase**: 7  
**Goal**: Optional enhancements and polish.

### Frontend Responsibilities

- Keyboard shortcuts: e.g. start test (Enter), restart (Ctrl+R)
- Community section UI (if in scope): share workflows, view others' tips
- Performance polish: lazy loading, memoization
- UX improvements: loading skeletons, better error messages

### Backend Responsibilities

- Community APIs (if in scope): store and serve shared workflows/tips
- Rate limiting, input validation
- Production readiness: env config, logging

---

## Adding New Features

When a new feature is requested, the tutor will:
1. Assign the next feature number (e.g. Feature 8)
2. Add a new section to this document
3. Fill in Frontend and Backend responsibilities
4. You can then instruct agents by number
