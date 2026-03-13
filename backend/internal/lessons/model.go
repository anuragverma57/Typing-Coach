package lessons

import (
	"time"

	"github.com/google/uuid"
)

type Lesson struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Content     string    `json:"content"`
	Type        string    `json:"type"`
	CreatedAt   time.Time `json:"createdAt"`
}
