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

func (r *Repository) Create(req CreateSessionRequest, userID *uuid.UUID) (*Session, error) {
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
	`, lessonID, userID, req.WPM, req.Accuracy, mistakes, req.DurationSec).Scan(&id, &createdAt)
	if err != nil {
		return nil, err
	}

	sess := &Session{
		ID:          id,
		LessonID:    lessonID,
		UserID:      userID,
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

type SessionWithLesson struct {
	Session
	LessonName string `json:"lessonName,omitempty"`
}

func (r *Repository) ListByUserID(userID uuid.UUID) ([]SessionWithLesson, error) {
	rows, err := r.db.Query(`
		SELECT s.id, s.lesson_id, s.wpm, s.accuracy, s.mistakes_json, s.duration_sec, s.created_at, l.name
		FROM sessions s
		LEFT JOIN lessons l ON s.lesson_id = l.id
		WHERE s.user_id = $1
		ORDER BY s.created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []SessionWithLesson
	for rows.Next() {
		var s Session
		var lessonName sql.NullString
		s.UserID = &userID
		err := rows.Scan(&s.ID, &s.LessonID, &s.WPM, &s.Accuracy, &s.Mistakes, &s.DurationSec, &s.CreatedAt, &lessonName)
		if err != nil {
			return nil, err
		}
		swl := SessionWithLesson{Session: s}
		if lessonName.Valid {
			swl.LessonName = lessonName.String
		}
		result = append(result, swl)
	}
	return result, rows.Err()
}
