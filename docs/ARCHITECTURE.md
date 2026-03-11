# Typing Coach — Architecture

## High-Level Overview

```
┌─────────────────┐     HTTP/REST      ┌─────────────────┐
│                 │ ◄────────────────► │                 │
│  React Frontend │                    │   Go Backend    │
│  (Vite + TS)    │                    │   (API Server)  │
│                 │                    │                 │
└─────────────────┘                    └────────┬────────┘
                                                │
                                                │ SQL
                                                ▼
                                       ┌─────────────────┐
                                       │    Database     │
                                       │ (SQLite/PG)     │
                                       └─────────────────┘
```

## Frontend

- **Framework**: React with TypeScript
- **Build tool**: Vite
- **Responsibilities**:
  - Typing exercise UI
  - Results display
  - Lesson selection
  - Progress dashboard
  - Auth flows (login, signup)

## Backend

- **Language**: Go
- **Responsibilities**:
  - REST API for lessons, sessions, users
  - Authentication (JWT)
  - Business logic (WPM, accuracy, mistake analysis)
  - Database access

## Database

- **Options**: SQLite (dev) or PostgreSQL (production)
- **Entities** (to be defined in later phases):
  - Users
  - Lessons
  - Typing sessions
  - Session results

## Data Flow

1. User selects lesson → Frontend fetches from API
2. User types → Frontend tracks input, calculates metrics
3. Session ends → Frontend sends results to API → Backend stores
4. Dashboard → Frontend fetches session history from API

## Notes

- Architecture will be updated as features are implemented.
- CORS will be configured for local development (frontend and backend on different ports).
