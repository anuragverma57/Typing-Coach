package lessons

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

func (r *Repository) List() ([]Lesson, error) {
	rows, err := r.db.Query(`
		SELECT id, name, description, content, type, created_at
		FROM lessons
		ORDER BY created_at ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lessons []Lesson
	for rows.Next() {
		var l Lesson
		if err := rows.Scan(&l.ID, &l.Name, &l.Description, &l.Content, &l.Type, &l.CreatedAt); err != nil {
			return nil, err
		}
		lessons = append(lessons, l)
	}
	return lessons, rows.Err()
}

func (r *Repository) GetByID(id uuid.UUID) (*Lesson, error) {
	var l Lesson
	err := r.db.QueryRow(`
		SELECT id, name, description, content, type, created_at
		FROM lessons
		WHERE id = $1
	`, id).Scan(&l.ID, &l.Name, &l.Description, &l.Content, &l.Type, &l.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &l, nil
}
