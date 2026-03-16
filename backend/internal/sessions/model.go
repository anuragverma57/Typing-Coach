package sessions

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type Session struct {
	ID          uuid.UUID       `json:"id"`
	LessonID    *uuid.UUID      `json:"lessonId,omitempty"`
	UserID      *uuid.UUID      `json:"userId,omitempty"`
	WPM         float64         `json:"wpm"`
	Accuracy    float64         `json:"accuracy"`
	Mistakes    json.RawMessage `json:"mistakes,omitempty"`
	DurationSec int             `json:"durationSec"`
	StrictMode  bool            `json:"strictMode,omitempty"`
	CreatedAt   time.Time       `json:"createdAt"`
}

type CreateSessionRequest struct {
	LessonID        *string         `json:"lessonId,omitempty"`
	WPM             float64         `json:"wpm"`
	Accuracy        float64         `json:"accuracy"`
	Mistakes        json.RawMessage `json:"mistakes,omitempty"`
	DurationSec     int             `json:"durationSec"`
	KeystrokeEvents json.RawMessage `json:"keystrokeEvents,omitempty"`
	StrictMode      *bool           `json:"strictMode,omitempty"`
}

type KeystrokeEvent struct {
	Key            string `json:"key"`
	ExpectedChar   string `json:"expectedChar"`
	Correct        bool   `json:"correct"`
	Timestamp      int64  `json:"timestamp"`
	CursorPosition int    `json:"cursorPosition"`
	IsBackspace    bool   `json:"isBackspace"`
}

type SessionAnalytics struct {
	RawErrors           int              `json:"rawErrors"`
	CorrectedErrors      int              `json:"correctedErrors"`
	UncorrectedErrors    int              `json:"uncorrectedErrors"`
	WeakKeys             []HeatmapEntry   `json:"weakKeys"`
	BackspacesPer100Chars float64         `json:"backspacesPer100Chars"`
	SpeedOverTime        []SpeedWindow    `json:"speedOverTime"`
	Insights             []string         `json:"insights"`
}

type SpeedWindow struct {
	WindowStartSec int     `json:"windowStartSec"`
	WindowEndSec   int     `json:"windowEndSec"`
	WPM            float64 `json:"wpm"`
}
