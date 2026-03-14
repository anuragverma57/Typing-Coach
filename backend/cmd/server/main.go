package main

import (
	"context"
	"database/sql"
	"log"
	"os"

	"typingcoach/backend/config"
	"typingcoach/backend/internal/adaptive"
	"typingcoach/backend/internal/admin"
	"typingcoach/backend/internal/auth"
	"typingcoach/backend/internal/database"
	"typingcoach/backend/internal/lessons"
	"typingcoach/backend/internal/middleware"
	"typingcoach/backend/internal/sessions"
	"typingcoach/backend/internal/users"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
)

func main() {
	_ = godotenv.Load()
	_ = godotenv.Load("../.env")
	cfg := config.Load()

	var postgres *sql.DB
	var mongoClient *mongo.Client

	if pg, err := database.NewPostgres(cfg.PostgresDSN()); err != nil {
		log.Printf("PostgreSQL: %v (will retry on health check)", err)
	} else {
		postgres = pg
		defer postgres.Close()
		if err := database.MigratePostgres(pg); err != nil {
			log.Fatalf("PostgreSQL migration: %v", err)
		}
		if err := lessons.Seed(pg); err != nil {
			log.Fatalf("Lesson seed: %v", err)
		}
	}

	if mc, err := database.NewMongo(cfg.MongoDBURI); err != nil {
		log.Printf("MongoDB: %v (will retry on health check)", err)
	} else {
		mongoClient = mc
		defer func() {
			if err := mc.Disconnect(context.Background()); err != nil {
				log.Printf("MongoDB disconnect: %v", err)
			}
		}()
	}

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
		AllowHeaders: "Content-Type, Authorization",
	}))

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "Typing Coach API",
			"status":  "ok",
		})
	})

	app.Get("/api/health", healthHandler(postgres, mongoClient))

	var lessonRepo *lessons.Repository
	var sessionRepo *sessions.Repository
	var authRepo *auth.Repository
	if postgres != nil {
		lessonRepo = lessons.NewRepository(postgres)
		sessionRepo = sessions.NewRepository(postgres)
		authRepo = auth.NewRepository(postgres)
	}

	lessonHandler := lessons.NewHandler(lessonRepo)
	sessionHandler := sessions.NewHandler(sessionRepo)
	authHandler := auth.NewHandler(authRepo, cfg.JWTSecret)
	usersHandler := users.NewHandler(authRepo, sessionRepo)
	adminHandler := admin.NewHandler(authRepo, lessonRepo, sessionRepo)

	app.Post("/api/auth/signup", authHandler.Signup)
	app.Post("/api/auth/login", authHandler.Login)

	app.Use("/api/lessons", middleware.OptionalAuth(cfg.JWTSecret))
	app.Get("/api/lessons", lessonHandler.List)
	app.Get("/api/lessons/:id/content", lessonHandler.GetContent)
	app.Get("/api/lessons/:id", lessonHandler.GetByID)
	app.Get("/api/practice/content", lessonHandler.GetPracticeContent)

	adaptiveHandler := adaptive.NewHandler()
	app.Get("/api/practice/adaptive-initial", adaptiveHandler.AdaptiveInitial)
	app.Post("/api/practice/adaptive-next", adaptiveHandler.AdaptiveNext)

	app.Use("/api/sessions", middleware.OptionalAuth(cfg.JWTSecret))
	app.Post("/api/sessions", sessionHandler.Create)

	app.Get("/api/users/me", middleware.Auth(cfg.JWTSecret), usersHandler.GetMe)
	app.Patch("/api/users/me", middleware.Auth(cfg.JWTSecret), usersHandler.UpdateMe)
	app.Get("/api/users/me/stats", middleware.Auth(cfg.JWTSecret), usersHandler.GetMyStats)
	app.Get("/api/users/me/overall-heatmap", middleware.Auth(cfg.JWTSecret), usersHandler.GetOverallHeatmap)
	app.Get("/api/users/me/sessions/:id", middleware.Auth(cfg.JWTSecret), usersHandler.GetSessionByID)
	app.Get("/api/users/me/sessions", middleware.Auth(cfg.JWTSecret), usersHandler.GetMySessions)

	app.Post("/api/auth/change-password", middleware.Auth(cfg.JWTSecret), authHandler.ChangePassword)

	app.Get("/api/admin/stats", middleware.AdminAuth(cfg.JWTSecret), adminHandler.GetStats)
	app.Get("/api/admin/users", middleware.AdminAuth(cfg.JWTSecret), adminHandler.GetUsers)
	app.Get("/api/admin/lessons", middleware.AdminAuth(cfg.JWTSecret), adminHandler.GetLessons)
	app.Get("/api/admin/posts", middleware.AdminAuth(cfg.JWTSecret), adminHandler.GetPosts)
	app.Post("/api/admin/posts/:id/approve", middleware.AdminAuth(cfg.JWTSecret), adminHandler.ApprovePost)
	app.Post("/api/admin/posts/:id/reject", middleware.AdminAuth(cfg.JWTSecret), adminHandler.RejectPost)

	addr := ":" + cfg.Port
	log.Printf("Server starting on %s", addr)
	if err := app.Listen(addr); err != nil {
		log.Fatal(err)
		os.Exit(1)
	}
}

func healthHandler(postgres *sql.DB, mongo *mongo.Client) fiber.Handler {
	return func(c *fiber.Ctx) error {
		status := fiber.Map{
			"status": "healthy",
			"postgres": "unknown",
			"mongodb":  "unknown",
		}

		if postgres != nil {
			if err := postgres.Ping(); err != nil {
				status["postgres"] = "disconnected"
				status["postgres_error"] = err.Error()
			} else {
				status["postgres"] = "connected"
			}
		} else {
			status["postgres"] = "not_configured"
		}

		if mongo != nil {
			if err := mongo.Ping(c.Context(), nil); err != nil {
				status["mongodb"] = "disconnected"
				status["mongodb_error"] = err.Error()
			} else {
				status["mongodb"] = "connected"
			}
		} else {
			status["mongodb"] = "not_configured"
		}

		return c.JSON(status)
	}
}
