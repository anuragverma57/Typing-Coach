package users

import (
	"github.com/gofiber/fiber/v2"
	"typingcoach/backend/internal/middleware"
	"typingcoach/backend/internal/sessions"
)

type Handler struct {
	sessionRepo *sessions.Repository
}

func NewHandler(sessionRepo *sessions.Repository) *Handler {
	return &Handler{sessionRepo: sessionRepo}
}

func (h *Handler) GetMySessions(c *fiber.Ctx) error {
	if h.sessionRepo == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"error": "database unavailable"})
	}

	userID, ok := middleware.GetUserID(c)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "authentication required"})
	}

	sessList, err := h.sessionRepo.ListByUserID(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(sessList)
}
