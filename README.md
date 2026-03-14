# Typing Coach

A typing practice platform to improve typing speed, accuracy, and keyboard skills through structured practice and performance insights.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Go

## Getting Started

### Prerequisites

- Node.js 18+
- Go 1.22+
- Git
- Docker & Docker Compose (optional)

### Environment

Copy `.env.example` to `.env` for custom config (DB credentials, ports, JWT secret). Defaults work without it. `.env` is gitignored.

### Option A: Docker (all services)

```bash
docker compose up --build -d
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- PostgreSQL: localhost:5432
- MongoDB: localhost:27017

See [docs/DOCKER.md](docs/DOCKER.md) for run and test steps.

### Option B: Local development

**Frontend**
```bash
cd frontend
npm install
npm run dev
```
Runs at http://localhost:5173

**Backend**
```bash
cd backend
go run ./cmd/server
```
Runs at http://localhost:8080

## Project Structure

```
typing-coach/
├── frontend/     # React app
├── backend/      # Go API server
├── docs/         # Documentation
└── prd.md        # Product requirements
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [UI Revamp Plan](docs/UI_REVAMP.md)
- [Docker Setup](docs/DOCKER.md)
- [Feature Specs (Agent Reference)](docs/FEATURE_SPECS.md) — numbered features with Frontend/Backend responsibilities
- [Implementation Log](docs/IMPLEMENTATION_LOG.md)
- [Mistakes & Learnings](docs/MISTAKES_AND_LEARNINGS.md)
- [Project Management](docs/PROJECT_MANAGEMENT.md)
