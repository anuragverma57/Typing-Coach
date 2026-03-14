package sessions

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"typingcoach/backend/internal/middleware"
)

type Handler struct {
	repo *Repository
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{repo: repo}
}

func (h *Handler) Create(c *fiber.Ctx) error {
	if h.repo == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"error": "database unavailable"})
	}
	var req CreateSessionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	if req.WPM < 0 || req.Accuracy < 0 || req.Accuracy > 100 || req.DurationSec < 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid wpm, accuracy, or duration"})
	}

	var userID *uuid.UUID
	if id, ok := middleware.GetUserID(c); ok {
		userID = &id
	}

	session, err := h.repo.Create(req, userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(session)
}
