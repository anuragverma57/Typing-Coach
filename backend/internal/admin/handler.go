package admin

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"typingcoach/backend/internal/auth"
	"typingcoach/backend/internal/lessons"
	"typingcoach/backend/internal/sessions"
)

type Handler struct {
	authRepo    *auth.Repository
	lessonRepo  *lessons.Repository
	sessionRepo *sessions.Repository
}

func NewHandler(authRepo *auth.Repository, lessonRepo *lessons.Repository, sessionRepo *sessions.Repository) *Handler {
	return &Handler{
		authRepo:    authRepo,
		lessonRepo:  lessonRepo,
		sessionRepo: sessionRepo,
	}
}

func (h *Handler) GetStats(c *fiber.Ctx) error {
	if h.authRepo == nil || h.lessonRepo == nil || h.sessionRepo == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"error": "database unavailable"})
	}

	stats, err := h.sessionRepo.GetAdminStats()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(stats)
}

func (h *Handler) GetUsers(c *fiber.Ctx) error {
	if h.authRepo == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"error": "database unavailable"})
	}

	page := 1
	limit := 20
	if v := c.Query("page"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			page = n
		}
	}
	if v := c.Query("limit"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 && n <= 100 {
			limit = n
		}
	}

	users, total, err := h.authRepo.ListUsers(page, limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{
		"users": users,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

func (h *Handler) GetLessons(c *fiber.Ctx) error {
	if h.lessonRepo == nil || h.sessionRepo == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"error": "database unavailable"})
	}

	lessonsWithStats, err := h.lessonRepo.ListWithStudentCount()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(lessonsWithStats)
}

func (h *Handler) GetPosts(c *fiber.Ctx) error {
	return c.JSON([]interface{}{})
}

func (h *Handler) ApprovePost(c *fiber.Ctx) error {
	return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "community posts not implemented"})
}

func (h *Handler) RejectPost(c *fiber.Ctx) error {
	return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "community posts not implemented"})
}
