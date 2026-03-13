package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"typingcoach/backend/pkg/jwt"
)

func OptionalAuth(secret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		auth := c.Get("Authorization")
		if auth == "" {
			return c.Next()
		}
		const prefix = "Bearer "
		if !strings.HasPrefix(auth, prefix) {
			return c.Next()
		}
		tokenString := strings.TrimPrefix(auth, prefix)
		claims, err := jwt.ParseToken(tokenString, secret)
		if err != nil {
			return c.Next()
		}
		c.Locals("userID", claims.UserID)
		c.Locals("userEmail", claims.Email)
		return c.Next()
	}
}
