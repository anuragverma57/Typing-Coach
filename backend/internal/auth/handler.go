package auth

import (
	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"typingcoach/backend/internal/middleware"
	"typingcoach/backend/pkg/jwt"
)

type Handler struct {
	repo   *Repository
	secret string
}

func NewHandler(repo *Repository, secret string) *Handler {
	return &Handler{repo: repo, secret: secret}
}

func (h *Handler) Signup(c *fiber.Ctx) error {
	if h.repo == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"error": "database unavailable"})
	}

	var req SignupRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	user, err := h.repo.Signup(req.Email, req.Password)
	if err != nil {
		switch err {
		case ErrEmailExists:
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "email already registered"})
		case ErrInvalidEmail:
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid email format"})
		case ErrInvalidPass:
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "password must be at least 8 characters"})
		default:
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
	}

	token, err := jwt.NewToken(user.ID, user.Email, user.Role, h.secret)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create token"})
	}

	return c.Status(fiber.StatusCreated).JSON(AuthResponse{
		Token: token,
		User:  UserToInfo(user),
	})
}

func (h *Handler) Login(c *fiber.Ctx) error {
	if h.repo == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"error": "database unavailable"})
	}

	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	user, err := h.repo.Login(req.Email, req.Password)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid email or password"})
	}

	token, err := jwt.NewToken(user.ID, user.Email, user.Role, h.secret)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create token"})
	}

	return c.JSON(AuthResponse{
		Token: token,
		User:  UserToInfo(user),
	})
}

func (h *Handler) ChangePassword(c *fiber.Ctx) error {
	if h.repo == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"error": "database unavailable"})
	}

	userID, ok := middleware.GetUserID(c)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "authentication required"})
	}

	var req ChangePasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	if len(req.NewPassword) < 8 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "new password must be at least 8 characters"})
	}

	user, err := h.repo.GetByID(userID)
	if err != nil || user == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid current password"})
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.CurrentPassword)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid current password"})
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to update password"})
	}
	if err := h.repo.UpdatePassword(userID, string(hash)); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "password updated"})
}
