package sessions

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type Session struct {
	ID         uuid.UUID       `json:"id"`
	LessonID   *uuid.UUID      `json:"lessonId,omitempty"`
	UserID     *uuid.UUID      `json:"userId,omitempty"`
	WPM        float64         `json:"wpm"`
	Accuracy   float64         `json:"accuracy"`
	Mistakes   json.RawMessage `json:"mistakes,omitempty"`
	DurationSec int            `json:"durationSec"`
	CreatedAt  time.Time       `json:"createdAt"`
}

type CreateSessionRequest struct {
	LessonID   *string         `json:"lessonId,omitempty"`
	WPM        float64         `json:"wpm"`
	Accuracy   float64         `json:"accuracy"`
	Mistakes   json.RawMessage `json:"mistakes,omitempty"`
	DurationSec int            `json:"durationSec"`
}
