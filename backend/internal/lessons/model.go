package lessons

import (
	"time"

	"github.com/google/uuid"
)

type Lesson struct {
	ID            uuid.UUID `json:"id"`
	Name          string    `json:"name"`
	Description   string    `json:"description"`
	Content       string    `json:"content"`
	Type          string    `json:"type"`
	Difficulty    string    `json:"difficulty"`
	SequenceOrder int       `json:"sequenceOrder"`
	Locked        bool      `json:"locked"`
	CreatedAt     time.Time `json:"createdAt"`
}

type LessonWithProgress struct {
	Lesson
	Progress int    `json:"progress"`
	Status   string `json:"status"`
}
