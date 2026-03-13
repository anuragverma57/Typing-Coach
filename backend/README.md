# Typing Coach Backend

Go API server for the Typing Coach platform. Uses Fiber, PostgreSQL, and MongoDB.

## Prerequisites

1. Start databases (from project root):
   ```bash
   docker compose up postgres mongo -d
   ```

2. Copy `.env.example` to `.env` at project root and ensure:
   - `POSTGRES_HOST=localhost`
   - `POSTGRES_PORT=5434`
   - `MONGODB_URI=mongodb://localhost:27017`

## Run

```bash
go run ./cmd/server
```

Server runs on http://localhost:8080

## Endpoints

- `GET /` - API info
- `GET /api/health` - Health check (includes Postgres and MongoDB connection status)
