package lessons

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

func (h *Handler) List(c *fiber.Ctx) error {
	if h.repo == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"error": "database unavailable"})
	}
	var userID *uuid.UUID
	if id, ok := middleware.GetUserID(c); ok {
		userID = &id
	}
	lessons, err := h.repo.List(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(lessons)
}

func (h *Handler) GetByID(c *fiber.Ctx) error {
	if h.repo == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"error": "database unavailable"})
	}
	idStr := c.Params("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid lesson id"})
	}

	lesson, err := h.repo.GetByID(id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	if lesson == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "lesson not found"})
	}
	if c.Query("random") == "true" {
		content, _ := h.repo.GetContentForLesson(id, 0)
		if content != "" {
			lesson.Content = content
		}
	}
	return c.JSON(lesson)
}

func parseDurationSeconds(s string) int {
	switch s {
	case "30":
		return 30
	case "60":
		return 60
	case "90":
		return 90
	case "120":
		return 120
	default:
		return 0
	}
}

func (h *Handler) GetContent(c *fiber.Ctx) error {
	if h.repo == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"error": "database unavailable"})
	}
	idStr := c.Params("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid lesson id"})
	}
	dur := parseDurationSeconds(c.Query("duration"))
	if c.Query("append") == "true" {
		dur = 0
	}
	content, err := h.repo.GetContentForLesson(id, dur)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"content": content})
}

func (h *Handler) GetPracticeContent(c *fiber.Ctx) error {
	if h.repo == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"error": "database unavailable"})
	}
	dur := parseDurationSeconds(c.Query("duration"))
	if c.Query("append") == "true" {
		dur = 0
	} else if dur == 0 {
		dur = 60
	}
	content, err := h.repo.GetRandomPracticeContent(dur)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"content": content})
}
