package adaptive

import (
	"github.com/gofiber/fiber/v2"
)

type Handler struct{}

func NewHandler() *Handler {
	return &Handler{}
}

type AdaptiveNextRequest struct {
	Mistakes   []mistakeEntry `json:"mistakes"`
	SessionID  *string       `json:"sessionId,omitempty"`
}

func (h *Handler) AdaptiveNext(c *fiber.Ctx) error {
	var req AdaptiveNextRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	if req.Mistakes == nil {
		req.Mistakes = []mistakeEntry{}
	}
	content := selectNextLine(req.Mistakes)
	return c.JSON(fiber.Map{"content": content})
}

func (h *Handler) AdaptiveInitial(c *fiber.Ctx) error {
	content := InitialContent()
	return c.JSON(fiber.Map{"content": content})
}
