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
	var role string
	var createdAt sql.NullTime
	err := r.db.QueryRow(`
		INSERT INTO users (email, password_hash)
		VALUES ($1, $2)
		RETURNING id, role, created_at
	`, email, passwordHash).Scan(&id, &role, &createdAt)
	if err != nil {
		return nil, err
	}

	user := &User{ID: id, Email: email, PasswordHash: passwordHash, Role: role}
	if createdAt.Valid {
		user.CreatedAt = createdAt.Time
	}
	return user, nil
}

func (r *Repository) UpdateProfile(id uuid.UUID, name *string) (*User, error) {
	if name != nil {
		_, err := r.db.Exec(`UPDATE users SET name = $1 WHERE id = $2`, *name, id)
		if err != nil {
			return nil, err
		}
	}
	return r.GetByID(id)
}

func (r *Repository) UpdatePassword(id uuid.UUID, passwordHash string) error {
	_, err := r.db.Exec(`UPDATE users SET password_hash = $1 WHERE id = $2`, passwordHash, id)
	return err
}

func (r *Repository) GetByEmail(email string) (*User, error) {
	var u User
	var name sql.NullString
	err := r.db.QueryRow(`
		SELECT id, email, name, password_hash, COALESCE(role, 'user'), created_at
		FROM users
		WHERE email = $1
	`, email).Scan(&u.ID, &u.Email, &name, &u.PasswordHash, &u.Role, &u.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	if name.Valid {
		u.Name = name.String
	}
	return &u, nil
}

func (r *Repository) GetByID(id uuid.UUID) (*User, error) {
	var u User
	var name sql.NullString
	err := r.db.QueryRow(`
		SELECT id, email, name, password_hash, COALESCE(role, 'user'), created_at
		FROM users
		WHERE id = $1
	`, id).Scan(&u.ID, &u.Email, &name, &u.PasswordHash, &u.Role, &u.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	if name.Valid {
		u.Name = name.String
	}
	return &u, nil
}

func (r *Repository) ListUsers(page, limit int) ([]UserInfo, int, error) {
	var total int
	if err := r.db.QueryRow("SELECT COUNT(*) FROM users").Scan(&total); err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	rows, err := r.db.Query(`
		SELECT id, email, name, COALESCE(role, 'user'), created_at
		FROM users
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var users []UserInfo
	for rows.Next() {
		var u User
		var name sql.NullString
		if err := rows.Scan(&u.ID, &u.Email, &name, &u.Role, &u.CreatedAt); err != nil {
			return nil, 0, err
		}
		if name.Valid {
			u.Name = name.String
		}
		users = append(users, UserToInfo(&u))
	}
	return users, total, rows.Err()
}
