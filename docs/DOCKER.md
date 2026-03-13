# Typing Coach — Docker Setup

## Environment

Copy `.env.example` to `.env` and adjust:

```bash
cp .env.example .env
```

`.env` holds DB credentials, ports, and JWT secret. It is gitignored. Docker Compose loads `.env` for variable substitution.

**For local backend development** (backend runs on host, not in Docker), ensure `.env` has:
- `POSTGRES_HOST=localhost`
- `POSTGRES_PORT=5434` — Docker maps Postgres to host port 5434 to avoid conflict with a local Postgres on 5432.
- `MONGODB_URI=mongodb://localhost:27017`

## Services

| Service   | Port | Description                    |
|-----------|------|--------------------------------|
| frontend  | 3000 | React app (nginx)              |
| backend   | 8080 | Go API                         |
| postgres  | 5432 | PostgreSQL 16                  |
| mongo     | 27017| MongoDB 7                      |

## Run Databases Only (for local backend dev)

Start only PostgreSQL and MongoDB:

```bash
docker compose up postgres mongo -d
```

Then run the backend locally:

```bash
cd backend && go run ./cmd/server
```

The backend loads `.env` from the project root and connects to `localhost:5432` and `localhost:27017`.

## Run Everything

```bash
docker compose up --build
```

First run builds images; later runs start faster. Use `-d` to run in background.

## Stop

```bash
docker compose down
```

Add `-v` to remove volumes (deletes DB data).

## Test Each Service

### 1. Frontend
Open http://localhost:3000 — you should see the Typing Coach app.

### 2. Backend health (includes DB status)
```bash
curl http://localhost:8080/api/health
```
Expected (when both DBs connected):
```json
{"status":"healthy","postgres":"connected","mongodb":"connected"}
```

### 3. Frontend → Backend (via proxy)
```bash
curl http://localhost:3000/api/health
```
Expected: same JSON as above (proxied through nginx)

### 4. PostgreSQL (direct)
```bash
docker compose exec postgres psql -U typingcoach -d typingcoach -c "SELECT 1"
```
Expected: `1` row with value `1`

### 5. MongoDB (direct)
```bash
docker compose exec mongo mongosh --eval "db.runCommand({ ping: 1 })"
```
Expected: `{ ok: 1 }`

## Troubleshooting

- **Port in use**: Change ports in `docker-compose.yml` (e.g. `"3001:80"` for frontend)
- **Build fails**: Run `docker compose build --no-cache` and check logs
- **Backend can't reach DB**: Ensure all services are on the `app` network (default)
