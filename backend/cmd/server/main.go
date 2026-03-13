package main

import (
	"context"
	"database/sql"
	"log"
	"os"

	"typingcoach/backend/config"
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
	usersHandler := users.NewHandler(sessionRepo)

	app.Post("/api/auth/signup", authHandler.Signup)
	app.Post("/api/auth/login", authHandler.Login)

	app.Get("/api/lessons", lessonHandler.List)
	app.Get("/api/lessons/:id", lessonHandler.GetByID)

	app.Use("/api/sessions", middleware.OptionalAuth(cfg.JWTSecret))
	app.Post("/api/sessions", sessionHandler.Create)

	app.Get("/api/users/me/sessions", middleware.Auth(cfg.JWTSecret), usersHandler.GetMySessions)

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
