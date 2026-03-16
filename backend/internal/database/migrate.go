package database

import (
	"database/sql"
	"log"
)

func MigratePostgres(db *sql.DB) error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			email VARCHAR(255) UNIQUE NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			role VARCHAR(20) DEFAULT 'user',
			created_at TIMESTAMPTZ DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
		`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'`,
		`ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255)`,
		`CREATE TABLE IF NOT EXISTS lessons (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name VARCHAR(255) NOT NULL,
			description TEXT,
			content TEXT NOT NULL,
			type VARCHAR(50) NOT NULL,
			difficulty VARCHAR(20) DEFAULT 'beginner',
			sequence_order INTEGER DEFAULT 0,
			locked BOOLEAN DEFAULT false,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)`,
		`ALTER TABLE lessons ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'beginner'`,
		`ALTER TABLE lessons ADD COLUMN IF NOT EXISTS sequence_order INTEGER DEFAULT 0`,
		`ALTER TABLE lessons ADD COLUMN IF NOT EXISTS locked BOOLEAN DEFAULT false`,
		`ALTER TABLE lessons ADD COLUMN IF NOT EXISTS content_pool JSONB`,
		`CREATE TABLE IF NOT EXISTS lesson_content (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
			content TEXT NOT NULL,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_lesson_content_lesson_id ON lesson_content(lesson_id)`,
		`CREATE TABLE IF NOT EXISTS sessions (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			lesson_id UUID REFERENCES lessons(id),
			user_id UUID,
			wpm DECIMAL(10,2) NOT NULL,
			accuracy DECIMAL(5,2) NOT NULL,
			mistakes_json JSONB,
			duration_sec INTEGER NOT NULL,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_sessions_lesson_id ON sessions(lesson_id)`,
		`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at)`,
		`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS keystroke_events_json JSONB`,
		`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS strict_mode BOOLEAN DEFAULT false`,
	}

	for _, q := range queries {
		if _, err := db.Exec(q); err != nil {
			return err
		}
	}

	_, _ = db.Exec(`UPDATE lessons SET content_pool = jsonb_build_array(content) WHERE content_pool IS NULL AND content IS NOT NULL`)
	log.Println("PostgreSQL migrations applied")
	return nil
}
