package lessons

import (
	"database/sql"
	"encoding/json"
	"math/rand"
	"strings"

	"github.com/google/uuid"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) List(userID *uuid.UUID) ([]LessonWithProgress, error) {
	rows, err := r.db.Query(`
		SELECT id, name, description, content, type, COALESCE(difficulty, 'beginner'), COALESCE(sequence_order, 0), COALESCE(locked, false), created_at
		FROM lessons
		ORDER BY COALESCE(sequence_order, 0) ASC, created_at ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lessons []LessonWithProgress
	for rows.Next() {
		var l Lesson
		if err := rows.Scan(&l.ID, &l.Name, &l.Description, &l.Content, &l.Type, &l.Difficulty, &l.SequenceOrder, &l.Locked, &l.CreatedAt); err != nil {
			return nil, err
		}
		lwp := LessonWithProgress{Lesson: l, Progress: 0, Status: "not_started"}
		if l.Locked {
			lwp.Status = "locked"
		}
		lessons = append(lessons, lwp)
	}

	if userID != nil {
		completedIDs, _ := r.getCompletedLessonIDs(*userID)
		prevCompleted := true
		for i := range lessons {
			if lessons[i].Locked {
				lessons[i].Status = "locked"
				continue
			}
			if completedIDs[lessons[i].ID] {
				lessons[i].Progress = 100
				lessons[i].Status = "completed"
				prevCompleted = true
			} else {
				if !prevCompleted {
					lessons[i].Status = "locked"
				}
				prevCompleted = false
			}
		}
	}

	return lessons, rows.Err()
}

func (r *Repository) getCompletedLessonIDs(userID uuid.UUID) (map[uuid.UUID]bool, error) {
	rows, err := r.db.Query(`
		SELECT DISTINCT lesson_id FROM sessions WHERE user_id = $1 AND lesson_id IS NOT NULL
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	m := make(map[uuid.UUID]bool)
	for rows.Next() {
		var lid uuid.UUID
		if err := rows.Scan(&lid); err != nil {
			continue
		}
		m[lid] = true
	}
	return m, rows.Err()
}

func (r *Repository) GetByID(id uuid.UUID) (*Lesson, error) {
	var l Lesson
	err := r.db.QueryRow(`
		SELECT id, name, description, content, type, COALESCE(difficulty, 'beginner'), COALESCE(sequence_order, 0), COALESCE(locked, false), created_at
		FROM lessons
		WHERE id = $1
	`, id).Scan(&l.ID, &l.Name, &l.Description, &l.Content, &l.Type, &l.Difficulty, &l.SequenceOrder, &l.Locked, &l.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &l, nil
}

type LessonWithStudentCount struct {
	Lesson
	StudentCount int `json:"studentCount"`
}

func (r *Repository) ListWithStudentCount() ([]LessonWithStudentCount, error) {
	rows, err := r.db.Query(`
		SELECT l.id, l.name, l.description, l.content, l.type, COALESCE(l.difficulty, 'beginner'), COALESCE(l.sequence_order, 0), COALESCE(l.locked, false), l.created_at,
			COALESCE((SELECT COUNT(DISTINCT s.user_id) FROM sessions s WHERE s.lesson_id = l.id AND s.user_id IS NOT NULL), 0)
		FROM lessons l
		ORDER BY COALESCE(l.sequence_order, 0) ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []LessonWithStudentCount
	for rows.Next() {
		var l Lesson
		var count int
		if err := rows.Scan(&l.ID, &l.Name, &l.Description, &l.Content, &l.Type, &l.Difficulty, &l.SequenceOrder, &l.Locked, &l.CreatedAt, &count); err != nil {
			return nil, err
		}
		result = append(result, LessonWithStudentCount{Lesson: l, StudentCount: count})
	}
	return result, rows.Err()
}

func truncateAtWordBoundary(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	trunc := s[:maxLen]
	lastSpace := strings.LastIndex(trunc, " ")
	if lastSpace > 0 {
		return strings.TrimSpace(trunc[:lastSpace])
	}
	return trunc
}

func (r *Repository) GetContentForLesson(lessonID uuid.UUID, durationSec int) (string, error) {
	var content string
	var contentPool []byte

	lesson, err := r.GetByID(lessonID)
	if err != nil || lesson == nil {
		return "", err
	}

	minChars := 0
	if durationSec > 0 {
		minChars = durationSec * 8
	}

	var hasLessonContent int
	_ = r.db.QueryRow(`SELECT COUNT(*) FROM lesson_content WHERE lesson_id = $1`, lessonID).Scan(&hasLessonContent)
	if hasLessonContent > 0 {
		pool := make([]string, 0)
		rows, err := r.db.Query(`SELECT content FROM lesson_content WHERE lesson_id = $1 ORDER BY RANDOM()`, lessonID)
		if err != nil {
			return lesson.Content, nil
		}
		defer rows.Close()
		for rows.Next() {
			var c string
			if err := rows.Scan(&c); err != nil {
				continue
			}
			pool = append(pool, c)
		}
		if len(pool) > 0 {
			return r.buildContentFromPool(pool, minChars)
		}
	}

	err = r.db.QueryRow(`SELECT content_pool FROM lessons WHERE id = $1`, lessonID).Scan(&contentPool)
	if err == nil && len(contentPool) > 0 {
		var pool []string
		if json.Unmarshal(contentPool, &pool) == nil && len(pool) > 0 {
			return r.buildContentFromPool(pool, minChars)
		}
	}

	content = lesson.Content
	if minChars > 0 && len(content) > minChars {
		content = truncateAtWordBoundary(content, minChars)
	}
	return content, nil
}

func (r *Repository) buildContentFromPool(pool []string, minChars int) (string, error) {
	if len(pool) == 0 {
		return "", nil
	}
	if minChars <= 0 {
		return pool[rand.Intn(len(pool))], nil
	}
	var b strings.Builder
	for b.Len() < minChars {
		s := pool[rand.Intn(len(pool))]
		if b.Len() > 0 {
			b.WriteString(" ")
		}
		b.WriteString(s)
	}
	return truncateAtWordBoundary(b.String(), minChars), nil
}

func (r *Repository) GetRandomPracticeContent(durationSec int) (string, error) {
	var lessonID uuid.UUID
	err := r.db.QueryRow(`
		SELECT id FROM lessons WHERE locked = false AND type IN ('words', 'sentences', 'paragraph') ORDER BY RANDOM() LIMIT 1
	`).Scan(&lessonID)
	if err == sql.ErrNoRows || err != nil {
		return "the quick brown fox jumps over the lazy dog", nil
	}
	return r.GetContentForLesson(lessonID, durationSec)
}
