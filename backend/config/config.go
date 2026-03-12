package config

import (
	"os"
)

type Config struct {
	Port string

	PostgresHost     string
	PostgresPort     string
	PostgresUser     string
	PostgresPassword string
	PostgresDB       string

	MongoDBURI string
}

func Load() *Config {
	return &Config{
		Port: getEnv("PORT", "8080"),

		PostgresHost:     getEnv("POSTGRES_HOST", "localhost"),
		PostgresPort:     getEnv("POSTGRES_PORT", "5434"),
		PostgresUser:     getEnv("POSTGRES_USER", "typingcoach"),
		PostgresPassword: getEnv("POSTGRES_PASSWORD", "typingcoach"),
		PostgresDB:       getEnv("POSTGRES_DB", "typingcoach"),

		MongoDBURI: getEnv("MONGODB_URI", "mongodb://localhost:27017"),
	}
}

func (c *Config) PostgresDSN() string {
	return "postgres://" + c.PostgresUser + ":" + c.PostgresPassword + "@" + c.PostgresHost + ":" + c.PostgresPort + "/" + c.PostgresDB + "?sslmode=disable"
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
