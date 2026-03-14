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

- None for this feature. Analysis is client-side. Backend may consume this data in Feature 3.

---

## Feature 3: Backend & Persistence

**Phase**: 3  
**Goal**: Set up database and API so lessons and sessions can be stored and served.

### Frontend Responsibilities

- Add API client (fetch or axios): base URL configurable (e.g. env variable)
- After typing session ends, send results to Backend: `POST /api/sessions` with payload (lessonId, wpm, accuracy, mistakes, duration)
- Handle loading and error states when calling API
- Configure proxy in Vite for `/api` to backend (or use full URL in dev)

### Backend Responsibilities

- Set up database: PostgreSQL (and/or MongoDB per project setup)
- Create schema: lessons table, sessions table (id, lesson_id, user_id nullable, wpm, accuracy, mistakes_json, duration_sec, created_at)
- Define lesson data structure (ID, name, description, content, type/category)
- Implement `GET /api/lessons` — list all lessons from DB
- Implement `GET /api/lessons/:id` — get single lesson with content
- Implement `POST /api/sessions` — store session result (user_id nullable for anonymous)
- Seed initial lesson content (beginner, home row, top row, bottom row, words, sentences)
- Add CORS middleware for frontend origin
- Return JSON with proper Content-Type

---

## Feature 4: Structured Lessons

**Phase**: 4  
**Goal**: Guided modules (home row, top row, bottom row, words, sentences). Depends on Feature 3 API.

### Frontend Responsibilities

- Build lesson selector UI: list or grid of available lessons
- Add routing/navigation to switch between lesson list and typing exercise
- Display lesson metadata: name, description, difficulty
- Fetch lesson content from Backend API (Feature 3)
- Pass selected lesson content to typing exercise component from Feature 1
- Lesson types: beginner, home row, top row, bottom row, word typing, sentence typing

### Backend Responsibilities

- None for this feature. Lessons API is implemented in Feature 3. Add more lesson content if needed.

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

- Add Hindi lesson content to DB
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

## Feature 8: Admin Panel

**Phase**: 8  
**Goal**: Admins can manage users, lessons, and moderate community content.

### How to Use Each Tab


| Tab                   | Purpose                          | How to Use                                                                                                                      |
| --------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **User Management**   | View and manage registered users | See list of all users (email, name, join date). Use for support, auditing, or banning abusive accounts. Paginate through users. |
| **Lesson Management** | View and manage lessons          | See all lessons with student count (how many users practiced each). Edit lesson content, reorder, or disable lessons.           |
| **Community Posts**   | Moderate user-generated content  | See pending posts (if community feature exists). Approve or reject posts before they appear publicly.                           |


**Creating an admin**: `UPDATE users SET role = 'admin' WHERE email = 'your@email.com';` then re-login.

### Frontend Responsibilities

- **AdminPage**: Stats cards (Total Users, Active Users, Total Lessons, Pending Approvals), tab navigation
- **User Management tab**: Table of users (email, name, createdAt), pagination (page, limit), search/filter (optional)
- **Lesson Management tab**: Table of lessons (title, difficulty, studentCount), Edit/Manage actions
- **Community tab**: List of pending posts, Approve / Reject buttons per post
- **Access control**: Show Admin link only when `user.isAdmin`; redirect non-admins away from `/app/admin`

### Backend Responsibilities

- `GET /api/admin/stats` — totalUsers, activeUsers, totalLessons, pendingApprovals
- `GET /api/admin/users` — paginated user list (`?page=1&limit=20`)
- `GET /api/admin/lessons` — lessons with studentCount (computed from sessions)
- `GET /api/admin/posts` — pending community posts (stub: empty array until community feature exists)
- `POST /api/admin/posts/:id/approve`, `POST /api/admin/posts/:id/reject` — moderation (stub: 404 until community exists)
- Auth middleware: require `role=admin` on all `/api/admin/*` routes

---

## Feature 10: Content Variety & Timer Mode

**Phase**: 10  
**Goal**: Meaningful content; unlimited typing (new words keep coming); timer mode (30s, 1min, 90s, 2min) with word-boundary truncation.

**Approach**: Option A (content pools in DB) + Option C (expand lesson content via `content_pool`).

### Critical Requirements

1. **Meaningful content**: Words, sentences, and paragraphs must be real and make sense. No "asdf jkl" or random letter combos in Words/Sentences/Paragraph lessons. Use proper grammar, real words, coherent sentences. Row lessons (beginner, home_row, top_row, bottom_row) are for key-position drills — acceptable to use letter patterns there.
2. **Unlimited typing**: User must never wait. When user finishes current text, immediately show more content. No "wait for timer to finish." User can type as many words as they want.
3. **Timer behavior**: When timer ends → stop and show results (truncate at word boundary). When user finishes text → fetch and append more content immediately; do not end session or make user wait.

### Backend Responsibilities

- **Schema**:
  - Add `content_pool` JSONB column to `lessons` table — array of content strings. Fallback to `content` if pool is empty.
  - Add `lesson_content` table for large pools: `id`, `lesson_id`, `content`, `created_at`. Use when a lesson needs 100+ entries.
- **API** `GET /api/lessons/:id/content`:
  - Query param `?duration=30|60|90|120` (seconds). Optional; if omitted, return one random item.
  - Query param `?append=true` — return one more chunk (for infinite mode). Same logic as main request.
  - For **words, sentences, paragraph** lessons: return ONLY meaningful content. Real words, proper sentences. Curated from literature, articles, or quality word lists.
  - `minChars = duration * 8` when duration given. Concatenate entries with spaces; truncate at word boundary.
  - Response: `{ content: string }`.
- **API** `GET /api/practice/content`:
  - Same as above. For Free Practice, use words/sentences/paragraph content only — never row drills. Meaningful content only.
- **Seed data**:
  - **Words**: 100+ real word sequences (phrases, idioms, common sentences). No nonsense.
  - **Sentences**: 50+ full, grammatical sentences. Proper punctuation.
  - **Paragraph**: 20+ coherent paragraphs (3–5 sentences each). Real excerpts or curated text.
  - Row lessons (beginner, home_row, etc.): Key drills for learning layout — acceptable.

### Frontend Responsibilities

- **Duration selector**: 30s, 1min, 90s, 2min, "No limit". Default: no limit.
- **Unlimited / infinite content**:
  - When user types the last character of current text, immediately fetch more via `GET /api/lessons/:id/content?append=true` (or `GET /api/practice/content?append=true`).
  - Append new content to `targetText` (e.g. `targetText + " " + newContent`). User keeps typing; no pause, no waiting.
  - Alternatively: when user reaches ~80% of text, pre-fetch next chunk and append when they finish. Seamless.
- **Timer mode**:
  - When timer reaches 0: truncate at word boundary, compute result, call `onSessionComplete`. Stop.
  - When user finishes text before timer ends: **do not** end session. Fetch and append more content. User continues typing until timer ends.
- **No-limit mode**:
  - Same infinite append. Session never auto-ends. Add explicit "Stop" or "Finish" button so user can end session when they want. On Stop: truncate at word boundary, compute result, show report.
- **Word-boundary truncation**: When timer ends, truncate at last space before current position.
- **Content fetch**: For Practice, always fetch from API. For Free Practice, use `GET /api/practice/content`. Never use hardcoded "quick brown fox" as default.
- **Hook/state**: `useTypingSession` (or equivalent) must support `onContentExhausted: () => Promise<string>` — when user finishes current text, call this to get more content, append to targetText, and let user continue. Do not call `onSessionComplete` in this case (except when timer ends or user clicks Stop).

---

## Feature 9: Reports Section Revamp

**Phase**: 9  
**Goal**: Reports page shows a list of past tests; tapping a test opens its detailed report. A separate "Overall Performance" report shows aggregated stats and keyboard heatmap.

### Desired Behavior

1. **Reports list** (`/app/reports`): Table/list of past typing sessions. Each row is clickable.
2. **Tap on a test** → Navigate to `/app/reports/:sessionId` and show full **Test Results** for that session (WPM, accuracy, errors, time, weak keys table, error heatmap, AI suggestions).
3. **Overall Performance** (`/app/reports/overall` or tab): Aggregated report across all sessions — avg WPM, best WPM, total practice time, and an **overall keyboard heatmap** (cumulative weak keys across all tests).

### Frontend Responsibilities

- **ReportsPage** (`/app/reports`): List of past sessions (date, lesson, WPM, accuracy, time). Each row is a link to `/app/reports/:sessionId`.
- **ReportPage** (`/app/reports/:sessionId`): Fetch single session by ID. Show full Test Results: 4 stat cards, weak keys table, error heatmap, AI suggestions. Derive heatmap and weak keys from stored `mistakes` (no need for targetText/userInput if backend returns per-key stats or mistakes).
- **OverallPerformancePage** (`/app/reports/overall`): Aggregated stats (avg WPM, best WPM, total time, total sessions). Overall keyboard heatmap — aggregate per-key error counts from all user sessions. Fetch `GET /api/users/me/stats` and `GET /api/users/me/overall-heatmap` (or equivalent).
- **Navigation**: Add "Overall Performance" as a tab or link on Reports page. Breadcrumb or back link: Reports → Test #123.
- **Empty states**: No sessions → "Start practicing"; session not found → 404 or redirect to list.

### Backend Responsibilities

- `GET /api/users/me/sessions/:id` — return single session with full details: id, lessonId, lessonName, wpm, accuracy, durationSec, createdAt, **mistakes** (array of { expected, typed, position }). User must own the session. Derive per-key stats from mistakes for heatmap/weak keys.
- `GET /api/users/me/overall-heatmap` — return aggregated per-key error counts across all user sessions: `{ key: string, errors: number }[]` or `Record<string, number>`. Compute from `mistakes_json` in sessions table.
- `POST /api/sessions` — return created session `{ id: string }` so frontend can navigate to `/app/reports/:id` after practice.
- Ensure `GET /api/users/me/sessions` returns `id` for each session (already does).

---

## Feature 11: Typing Analytics System

**Phase**: 11  
**Goal**: Build a typing analytics system, not just a speed test. Capture detailed typing behavior and provide deeper insights about habits, weak keys, and performance trends.

**Context**: Unlike normal typing tests that only show WPM and accuracy, this feature analyzes user typing behavior in depth.

### Sub-features

| Sub-feature | Description |
|-------------|-------------|
| **Keystroke event tracking** | Capture every key event: typed char, expected char, correct/incorrect, timestamp, cursor position. Include backspace usage and corrections. |
| **Raw error detection** | Count all mistakes made during typing, even if user corrects them later. Example: user types "helo" → backspace → fixes → "hello". Raw error = 1. |
| **Corrected vs uncorrected errors** | Corrected = mistakes fixed with backspace. Uncorrected = mistakes remaining in final text. Both metrics required. |
| **Weak key detection** | Track which characters are mistyped most. Example: T → 12, Y → 8, G → 6. Identify weak keys for practice recommendations. |
| **Backspace analysis** | Backspaces per 100 characters typed. Indicates correction frequency and typing uncertainty. |
| **Speed over time** | WPM in time windows (e.g. 0–20s, 20–40s, 40–60s). Reveals fatigue or rhythm loss. |
| **Performance metrics** | WPM = (total chars / 5) / minutes. Accuracy = (correct chars / total chars) × 100. |
| **Performance insights** | Generate insights: frequently mistyped keys, typing consistency, error patterns, correction behavior, speed trends. |

### Frontend Responsibilities

- **Keystroke event capture**: During typing, record each key event: `{ key, expectedChar, correct, timestamp, cursorPosition, isBackspace }`. Store in memory until session ends.
- **Event stream**: On every keydown (including Backspace), append event to array. Track cursor position (length of userInput) at each event.
- **Session payload**: When session ends, send `keystrokeEvents` array to backend with `POST /api/sessions`. Payload extends existing: add `keystrokeEvents: [...]`.
- **Report UI**: Display analytics in report: raw errors, corrected vs uncorrected, weak keys table, backspaces per 100 chars, speed-over-time chart, insights. Fetch from `GET /api/users/me/sessions/:id` (backend returns computed analytics).
- **Live metrics**: Continue showing WPM, accuracy during typing. Backend analytics are for post-session report.

### Backend Responsibilities

- **Schema**: Extend sessions table with `keystroke_events_json` JSONB. Store array of events. Or add `session_events` table if events are large.
- **POST /api/sessions**: Accept `keystrokeEvents` in payload. Store in DB.
- **Compute from events**:
  - **Raw errors**: Count events where `correct === false` (including those later corrected).
  - **Corrected errors**: Mistakes that were followed by backspace(s) and then correct input.
  - **Uncorrected errors**: Mistakes still present in final text.
  - **Weak keys**: Group errors by `expectedChar`; return `{ key, errors }[]` sorted by errors desc.
  - **Backspaces per 100 chars**: `(backspaceCount / totalCharsTyped) * 100`.
  - **Speed over time**: Slice events into time windows (e.g. 20s); compute WPM per window from chars typed in that window.
  - **WPM, accuracy**: Standard formulas. Use final submitted text for accuracy.
- **Insights generation**: From computed metrics, produce insight strings: e.g. "You mistype 'T' frequently — practice top row", "Backspace rate is high — focus on accuracy", "Speed drops after 40s — consider shorter sessions".
- **GET /api/users/me/sessions/:id**: Return session with computed analytics: `rawErrors`, `correctedErrors`, `uncorrectedErrors`, `weakKeys`, `backspacesPer100Chars`, `speedOverTime`, `insights`.
- **GET /api/users/me/overall-heatmap**: Can aggregate weak keys from `keystroke_events_json` across sessions for overall weak key view.

### Event Schema (Reference)

```ts
type KeystrokeEvent = {
  key: string           // key pressed
  expectedChar: string  // what should have been typed
  correct: boolean      // was it correct?
  timestamp: number     // ms since session start
  cursorPosition: number
  isBackspace: boolean
}
```

---

## Feature 12: AI-Powered Adaptive Practice (Phase 1 — Rule-Based)

**Phase**: 12  
**Goal**: Personalized practice that adapts to the user's mistakes. Each new line contains more of the letters the user mistyped, helping them improve weak keys.

**USP**: Unlike static typing tests, this mode generates the next line in real time based on the user's mistakes, creating a personalized practice loop.

### How It Works

1. **Start**: User sees 2 lines (~10 words each) from the normal content pool.
2. **User types line 1**: Frontend tracks mistakes (expected vs typed characters).
3. **User finishes line 1**: Frontend sends mistakes to backend. User continues to line 2.
4. **Pre-fetch**: When user is ~70–80% through line 2, frontend calls `POST /api/practice/adaptive-next` with mistakes from line 1 (and optionally line 2 so far).
5. **Backend**: Extracts weak letters from mistakes, scores words by weak-letter coverage, selects ~10 words, returns next line.
6. **Append**: When user finishes line 2, line 3 is already loaded. Append to `targetText`. Repeat for line 4, 5, etc.

**Transport**: REST API (no WebSockets). We have 20–60 seconds while the user types — enough time to generate the next line.

**Approach**: Rule-based (no ML/LLM). Word selection by weak-letter coverage. No API keys, no external services.

**Definition of "line"**: A segment of ~10 words. Initial content can be "word1 word2 ... word10 word11 ... word20" — line 1 = words 1–10, line 2 = words 11–20. Split by word count or by newline in content.

### Backend Responsibilities

- **Endpoint** `POST /api/practice/adaptive-next`:
  - **Payload**: `{ mistakes: [{ expected: string, typed: string }], sessionId?: string }`
  - **Logic**:
    1. Extract weak letters: from each mistake, take `expected` (the key user should have typed). Count frequency: e.g. `{ "t": 5, "y": 3, "g": 2 }`.
    2. If no mistakes, return random line from normal content pool.
    3. Score words: for each word in pool, count how many weak letters it contains. Weight by mistake frequency. Higher score = more weak letters.
    4. Sample ~8–10 words (weighted random or top-scored). Ensure variety — don't repeat same word.
    5. Join with spaces. Return `{ content: string }`.
  - **Response**: `{ content: string }` — one line, ~10 words.

- **Word pool**:
  - Use existing content pool (words, sentences) or a dedicated `adaptive_words` list.
  - Each word must be indexable by letters it contains. Options:
    - **Option A**: In-memory map `letter → []word` built at startup from JSON/DB.
    - **Option B**: Words table with `letters` column (e.g. "typing" → "g,i,n,p,t,y") for fast lookup.
  - Minimum 1000+ words for variety. Prefer common English words.

- **Scoring formula** (example):
  - For word W, score = sum over weak letters L of (count of L in W × mistakeCount[L])
  - Example: weak letters { t:5, y:3 }, word "typing" → 5+3 = 8. Word "the" → 5. Prefer "typing".

- **Auth**: Optional. Endpoint can work without auth (anonymous adaptive practice) or require auth to persist session.

### Frontend Responsibilities

- **New mode**: "Adaptive Practice" or "AI Practice" — separate from regular Practice. Add route e.g. `/app/practice/adaptive` or a toggle on Practice page.

- **Initial content**: Fetch 2 lines from `GET /api/practice/content` or `GET /api/lessons/:id/content` (no duration). Display as `line1 + "\n" + line2`. Total ~20 words.

- **Mistake tracking**: Reuse existing mistake/keystroke logic. When user completes a line (reaches newline or end of line text), collect mistakes for that line only. Structure: `[{ expected, typed }]`.

- **Line completion detection**: Track which "line" the user is on (by newline or by character count). When user finishes line N, we have mistakes for line N.

- **Pre-fetch timing**: When `userInput.length >= 0.7 * currentLineLength` (user is 70% through current line), call `POST /api/practice/adaptive-next` with mistakes from the **previous** completed line(s). Store response in state.

- **Append flow**: When user types the last character of current line, append the pre-fetched next line to `targetText` (add space or newline before it). User continues typing without pause.

- **Session continuity**: Accumulate mistakes from all completed lines for the request. E.g. after line 3, send mistakes from lines 1, 2, 3. Backend uses full history to weight weak letters.

- **Fallback**: If adaptive-next fails or returns empty, append a random line from normal content pool so user never stalls.

- **UI**: Show "Adaptive Practice" label. Optional: subtle indicator when next line is "personalized" (e.g. "Next line tailored to your mistakes").

### Data Flow Summary

```
User types line 1 → mistakes collected
User finishes line 1 → (mistakes stored, user moves to line 2)
User at 70% of line 2 → POST /api/practice/adaptive-next { mistakes: line1Mistakes }
Backend returns line 3
User finishes line 2 → append line 3 to targetText
User types line 3 → at 70%, POST with mistakes from line 1+2
... repeat
```

### Payload Schema (Reference)

```ts
// Request
type AdaptiveNextRequest = {
  mistakes: { expected: string; typed: string }[]
  sessionId?: string  // optional, for future session continuity
}

// Response
type AdaptiveNextResponse = {
  content: string  // one line, ~10 words
}
```

---

## Adding New Features

When a new feature is requested, the tutor will:

1. Assign the next feature number (e.g. Feature 13)
2. Add a new section to this document
3. Fill in Frontend and Backend responsibilities
4. You can then instruct agents by number

---

## Agent Instructions (Feature 10)

- **Backend**: "Implement Feature 10 (Backend) — read docs/FEATURE_SPECS.md. Content must be meaningful (real words, proper sentences). Add content_pool, lesson_content, GET /api/lessons/:id/content?append=true, GET /api/practice/content. Support ?append=true for infinite mode. Free Practice uses words/sentences/paragraph only — never row drills."
- **Frontend**: "Implement Feature 10 (Frontend) — read docs/FEATURE_SPECS.md. Add unlimited mode: when user finishes text, immediately fetch and append more content. No waiting. Timer mode: when user finishes text before timer ends, append more. Add Stop button for no-limit mode. Content must come from API."

## Agent Instructions (Feature 11)

- **Backend**: "Implement Feature 11 (Backend) — read docs/FEATURE_SPECS.md. Add keystroke_events_json to sessions. Accept keystrokeEvents in POST /api/sessions. Compute raw errors, corrected/uncorrected errors, weak keys, backspaces per 100 chars, speed over time. Generate insights. Return analytics in GET /api/users/me/sessions/:id."
- **Frontend**: "Implement Feature 11 (Frontend) — read docs/FEATURE_SPECS.md. Capture keystroke events during typing (key, expectedChar, correct, timestamp, cursorPosition, isBackspace). Send keystrokeEvents with POST /api/sessions. Display analytics in report: raw errors, corrected/uncorrected, weak keys, backspace rate, speed-over-time chart, insights."

## Agent Instructions (Feature 12)

- **Backend**: "Implement Feature 12 (Backend) — read docs/FEATURE_SPECS.md. Add POST /api/practice/adaptive-next. Accept mistakes array. Extract weak letters, score words by weak-letter coverage, return next line. Use word pool (in-memory or DB). No ML."
- **Frontend**: "Implement Feature 12 (Frontend) — read docs/FEATURE_SPECS.md. Add Adaptive Practice mode. Start with 2 lines. Track mistakes per line. Pre-fetch at 70% of current line. Append next line when user finishes. Call POST /api/practice/adaptive-next with mistakes."

