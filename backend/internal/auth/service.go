package auth

import (
	"errors"
	"regexp"

	"golang.org/x/crypto/bcrypt"
)

var (
	ErrEmailExists    = errors.New("email already registered")
	ErrInvalidEmail   = errors.New("invalid email format")
	ErrInvalidPass    = errors.New("password must be at least 8 characters")
	ErrInvalidCreds   = errors.New("invalid email or password")
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

func (r *Repository) Signup(email, password string) (*User, error) {
	if !emailRegex.MatchString(email) {
		return nil, ErrInvalidEmail
	}
	if len(password) < 8 {
		return nil, ErrInvalidPass
	}

	existing, _ := r.GetByEmail(email)
	if existing != nil {
		return nil, ErrEmailExists
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	return r.Create(email, string(hash))
}

func (r *Repository) Login(email, password string) (*User, error) {
	user, err := r.GetByEmail(email)
	if err != nil || user == nil {
		return nil, ErrInvalidCreds
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, ErrInvalidCreds
	}
	return user, nil
}
