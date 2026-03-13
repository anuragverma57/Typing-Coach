package sessions

import (
	"database/sql"

	"github.com/google/uuid"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(req CreateSessionRequest) (*Session, error) {
	var lessonID *uuid.UUID
	if req.LessonID != nil && *req.LessonID != "" {
		id, err := uuid.Parse(*req.LessonID)
		if err != nil {
			return nil, err
		}
		lessonID = &id
	}

	var mistakes []byte
	if len(req.Mistakes) > 0 {
		mistakes = req.Mistakes
	}

	var id uuid.UUID
	var createdAt sql.NullTime
	err := r.db.QueryRow(`
		INSERT INTO sessions (lesson_id, user_id, wpm, accuracy, mistakes_json, duration_sec)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at
	`, lessonID, nil, req.WPM, req.Accuracy, mistakes, req.DurationSec).Scan(&id, &createdAt)
	if err != nil {
		return nil, err
	}

	sess := &Session{
		ID:          id,
		LessonID:    lessonID,
		UserID:      nil,
		WPM:         req.WPM,
		Accuracy:    req.Accuracy,
		Mistakes:    req.Mistakes,
		DurationSec: req.DurationSec,
	}
	if createdAt.Valid {
		sess.CreatedAt = createdAt.Time
	}
	return sess, nil
}
