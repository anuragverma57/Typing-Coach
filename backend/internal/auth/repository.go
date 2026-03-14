package auth

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

func (r *Repository) Create(email, passwordHash string) (*User, error) {
	var id uuid.UUID
	var createdAt sql.NullTime
	err := r.db.QueryRow(`
		INSERT INTO users (email, password_hash)
		VALUES ($1, $2)
		RETURNING id, created_at
	`, email, passwordHash).Scan(&id, &createdAt)
	if err != nil {
		return nil, err
	}

	user := &User{ID: id, Email: email, PasswordHash: passwordHash}
	if createdAt.Valid {
		user.CreatedAt = createdAt.Time
	}
	return user, nil
}

func (r *Repository) GetByEmail(email string) (*User, error) {
	var u User
	err := r.db.QueryRow(`
		SELECT id, email, password_hash, created_at
		FROM users
		WHERE email = $1
	`, email).Scan(&u.ID, &u.Email, &u.PasswordHash, &u.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *Repository) GetByID(id uuid.UUID) (*User, error) {
	var u User
	err := r.db.QueryRow(`
		SELECT id, email, password_hash, created_at
		FROM users
		WHERE id = $1
	`, id).Scan(&u.ID, &u.Email, &u.PasswordHash, &u.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}
