package sessions

import (
	"database/sql"
	"encoding/json"

	"github.com/google/uuid"
)

type MistakeEntry struct {
	Expected string `json:"expected"`
	Typed    string `json:"typed"`
	Position int    `json:"position"`
}

type HeatmapEntry struct {
	Key    string `json:"key"`
	Errors int    `json:"errors"`
}

type UserStats struct {
	AvgWpm        float64        `json:"avgWpm"`
	Accuracy      float64        `json:"accuracy"`
	TotalSessions int            `json:"totalSessions"`
	TotalTests    int            `json:"totalTests"`
	BestWpm       float64        `json:"bestWpm"`
	TotalTimeSec  int            `json:"totalTimeSec"`
	WpmTrend      float64        `json:"wpmTrend"`
	WpmOverTime   []WpmDataPoint  `json:"wpmOverTime"`
}

type WpmDataPoint struct {
	Date string  `json:"date"`
	Wpm  float64 `json:"wpm"`
}

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(req CreateSessionRequest, userID *uuid.UUID) (*Session, error) {
	var lessonID *uuid.UUID
	if req.LessonID != nil && *req.LessonID != "" {
		id, err := uuid.Parse(*req.LessonID)
		if err != nil {
			return nil, err
		}
		lessonID = &id
	}

	var mistakes []byte
	if len(req.Mistakes) > 0 {
		mistakes = req.Mistakes
	}

	var keystrokeEvents []byte
	if len(req.KeystrokeEvents) > 0 {
		keystrokeEvents = req.KeystrokeEvents
	}

	strictMode := false
	if req.StrictMode != nil {
		strictMode = *req.StrictMode
	}

	var id uuid.UUID
	var createdAt sql.NullTime
	err := r.db.QueryRow(`
		INSERT INTO sessions (lesson_id, user_id, wpm, accuracy, mistakes_json, duration_sec, keystroke_events_json, strict_mode)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at
	`, lessonID, userID, req.WPM, req.Accuracy, mistakes, req.DurationSec, keystrokeEvents, strictMode).Scan(&id, &createdAt)
	if err != nil {
		return nil, err
	}

	sess := &Session{
		ID:          id,
		LessonID:    lessonID,
		UserID:      userID,
		WPM:         req.WPM,
		Accuracy:    req.Accuracy,
		Mistakes:    req.Mistakes,
		DurationSec: req.DurationSec,
		StrictMode:  strictMode,
	}
	if createdAt.Valid {
		sess.CreatedAt = createdAt.Time
	}
	return sess, nil
}

type SessionWithLesson struct {
	Session
	LessonName       string          `json:"lessonName,omitempty"`
	KeystrokeEvents  json.RawMessage `json:"-"`
}

type SessionDetail struct {
	SessionWithLesson
	Analytics *SessionAnalytics `json:"analytics,omitempty"`
}

func (r *Repository) ListByUserID(userID uuid.UUID, limit int) ([]SessionWithLesson, error) {
	query := `
		SELECT s.id, s.lesson_id, s.wpm, s.accuracy, s.mistakes_json, s.duration_sec, s.created_at, l.name
		FROM sessions s
		LEFT JOIN lessons l ON s.lesson_id = l.id
		WHERE s.user_id = $1
		ORDER BY s.created_at DESC
	`
	args := []interface{}{userID}
	if limit > 0 {
		query += ` LIMIT $2`
		args = append(args, limit)
	}

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return []SessionWithLesson{}, err
	}
	defer rows.Close()

	result := make([]SessionWithLesson, 0)
	for rows.Next() {
		var s Session
		var lessonName sql.NullString
		s.UserID = &userID
		err := rows.Scan(&s.ID, &s.LessonID, &s.WPM, &s.Accuracy, &s.Mistakes, &s.DurationSec, &s.CreatedAt, &lessonName)
		if err != nil {
			return nil, err
		}
		swl := SessionWithLesson{Session: s}
		if lessonName.Valid {
			swl.LessonName = lessonName.String
		}
		result = append(result, swl)
	}
	return result, rows.Err()
}

func (r *Repository) GetByIDAndUserID(sessionID, userID uuid.UUID) (*SessionWithLesson, error) {
	return r.getByIDAndUserIDRaw(sessionID, userID, false)
}

func (r *Repository) GetByIDAndUserIDWithAnalytics(sessionID, userID uuid.UUID) (*SessionDetail, error) {
	sess, err := r.getByIDAndUserIDRaw(sessionID, userID, true)
	if err != nil || sess == nil {
		return nil, err
	}
	detail := &SessionDetail{SessionWithLesson: *sess}
	detail.Analytics = ComputeAnalytics(sess.KeystrokeEvents, sess.Mistakes, sess.DurationSec)
	return detail, nil
}

func (r *Repository) getByIDAndUserIDRaw(sessionID, userID uuid.UUID, withKeystrokes bool) (*SessionWithLesson, error) {
	var s Session
	var lessonName sql.NullString
	var keystrokeEvents []byte
	s.UserID = &userID

	query := `SELECT s.id, s.lesson_id, s.wpm, s.accuracy, s.mistakes_json, s.duration_sec, COALESCE(s.strict_mode, false), s.created_at, l.name`
	if withKeystrokes {
		query += `, COALESCE(s.keystroke_events_json, '[]'::jsonb)`
	}
	query += ` FROM sessions s LEFT JOIN lessons l ON s.lesson_id = l.id WHERE s.id = $1 AND s.user_id = $2`

	scanDest := []interface{}{&s.ID, &s.LessonID, &s.WPM, &s.Accuracy, &s.Mistakes, &s.DurationSec, &s.StrictMode, &s.CreatedAt, &lessonName}
	if withKeystrokes {
		scanDest = append(scanDest, &keystrokeEvents)
	}

	err := r.db.QueryRow(query, sessionID, userID).Scan(scanDest...)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	swl := &SessionWithLesson{Session: s}
	if lessonName.Valid {
		swl.LessonName = lessonName.String
	}
	if withKeystrokes {
		swl.KeystrokeEvents = keystrokeEvents
	}
	return swl, nil
}

func (r *Repository) GetStatsByUserID(userID uuid.UUID) (*UserStats, error) {
	stats := &UserStats{
		AvgWpm:        0,
		Accuracy:      0,
		TotalSessions: 0,
		TotalTests:    0,
		BestWpm:       0,
		TotalTimeSec:  0,
		WpmTrend:      0,
		WpmOverTime:   []WpmDataPoint{},
	}
	err := r.db.QueryRow(`
		SELECT
			COALESCE(AVG(wpm), 0),
			COALESCE(AVG(accuracy), 0),
			COUNT(*),
			COALESCE(MAX(wpm), 0),
			COALESCE(SUM(duration_sec), 0)
		FROM sessions
		WHERE user_id = $1
	`, userID).Scan(&stats.AvgWpm, &stats.Accuracy, &stats.TotalSessions, &stats.BestWpm, &stats.TotalTimeSec)
	if err != nil {
		return stats, err
	}
	stats.TotalTests = stats.TotalSessions

	var thisWeekAvg, lastWeekAvg float64
	_ = r.db.QueryRow(`
		SELECT COALESCE(AVG(wpm), 0)
		FROM sessions
		WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
	`, userID).Scan(&thisWeekAvg)
	_ = r.db.QueryRow(`
		SELECT COALESCE(AVG(wpm), 0)
		FROM sessions
		WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days'
	`, userID).Scan(&lastWeekAvg)

	if lastWeekAvg > 0 {
		stats.WpmTrend = ((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100
	}

	rows, err := r.db.Query(`
		SELECT DATE(created_at)::text, AVG(wpm)
		FROM sessions
		WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
		GROUP BY DATE(created_at)
		ORDER BY DATE(created_at) ASC
	`, userID)
	if err != nil {
		return stats, nil
	}
	defer rows.Close()
	for rows.Next() {
		var p WpmDataPoint
		if err := rows.Scan(&p.Date, &p.Wpm); err != nil {
			break
		}
		stats.WpmOverTime = append(stats.WpmOverTime, p)
	}

	return stats, nil
}

type AdminStats struct {
	TotalUsers       int `json:"totalUsers"`
	ActiveUsers      int `json:"activeUsers"`
	TotalLessons     int `json:"totalLessons"`
	PendingApprovals int `json:"pendingApprovals"`
}

func (r *Repository) GetAdminStats() (*AdminStats, error) {
	var stats AdminStats
	err := r.db.QueryRow("SELECT COUNT(*) FROM users").Scan(&stats.TotalUsers)
	if err != nil {
		return nil, err
	}
	_ = r.db.QueryRow(`
		SELECT COUNT(DISTINCT user_id) FROM sessions
		WHERE user_id IS NOT NULL AND created_at >= NOW() - INTERVAL '30 days'
	`).Scan(&stats.ActiveUsers)
	_ = r.db.QueryRow("SELECT COUNT(*) FROM lessons").Scan(&stats.TotalLessons)
	return &stats, nil
}

func (r *Repository) GetOverallHeatmap(userID uuid.UUID) ([]HeatmapEntry, error) {
	keyCounts := make(map[string]int)

	rows, err := r.db.Query(`
		SELECT keystroke_events_json, mistakes_json FROM sessions
		WHERE user_id = $1
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var keystrokesRaw, mistakesRaw []byte
		if err := rows.Scan(&keystrokesRaw, &mistakesRaw); err != nil {
			continue
		}
		if len(keystrokesRaw) > 0 {
			var events []KeystrokeEvent
			if json.Unmarshal(keystrokesRaw, &events) == nil {
				for _, e := range events {
					if !e.Correct && !e.IsBackspace && e.ExpectedChar != "" {
						keyCounts[e.ExpectedChar]++
					}
				}
				continue
			}
		}
		if len(mistakesRaw) > 0 {
			var mistakes []MistakeEntry
			if json.Unmarshal(mistakesRaw, &mistakes) == nil {
				for _, m := range mistakes {
					if m.Expected != "" {
						keyCounts[m.Expected]++
					}
				}
			}
		}
	}

	var result []HeatmapEntry
	for k, v := range keyCounts {
		if v > 0 {
			result = append(result, HeatmapEntry{Key: k, Errors: v})
		}
	}
	return result, rows.Err()
}
