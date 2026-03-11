# Typing Coach — Docker Setup

## Environment

For custom config, copy `.env.example` to `.env` and adjust:

```bash
cp .env.example .env
```

`.env` holds DB credentials, ports, and JWT secret. It is gitignored. Docker Compose loads `.env` for variable substitution. Defaults work without `.env`.

## Services

| Service   | Port | Description                    |
|-----------|------|--------------------------------|
| frontend  | 3000 | React app (nginx)              |
| backend   | 8080 | Go API                         |
| postgres  | 5432 | PostgreSQL 16                  |
| mongo     | 27017| MongoDB 7                      |

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

### 2. Backend
```bash
curl http://localhost:8080/api/health
```
Expected: `{"status":"healthy"}`

### 3. Frontend → Backend (via proxy)
```bash
curl http://localhost:3000/api/health
```
Expected: `{"status":"healthy"}` (proxied through nginx)

### 4. PostgreSQL
```bash
docker compose exec postgres psql -U typingcoach -d typingcoach -c "SELECT 1"
```
Expected: `1` row with value `1`

### 5. MongoDB
```bash
docker compose exec mongo mongosh --eval "db.runCommand({ ping: 1 })"
```
Expected: `{ ok: 1 }`

## Troubleshooting

- **Port in use**: Change ports in `docker-compose.yml` (e.g. `"3001:80"` for frontend)
- **Build fails**: Run `docker compose build --no-cache` and check logs
- **Backend can't reach DB**: Ensure all services are on the `app` network (default)
