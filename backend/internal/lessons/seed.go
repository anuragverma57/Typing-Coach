package lessons

import (
	"database/sql"
	"log"
)

var seedLessons = []struct {
	name        string
	description string
	content     string
	lessonType  string
}{
	{
		name:        "Beginner",
		description: "Start with the basics. Type each letter slowly and accurately.",
		content:     "aaa sss ddd fff ggg hhh jjj kkk lll ;;;\naaa sss ddd fff ggg hhh jjj kkk lll ;;;",
		lessonType:  "beginner",
	},
	{
		name:        "Home Row",
		description: "Practice the home row keys: a s d f j k l ;",
		content:     "asdf jkl; asdf jkl; asdf jkl;\nfdsa ;lkj fdsa ;lkj fdsa ;lkj",
		lessonType:  "home_row",
	},
	{
		name:        "Top Row",
		description: "Practice the top row: q w e r t y u i o p",
		content:     "qwert yuiop qwert yuiop\npoiuy trewq poiuy trewq",
		lessonType:  "top_row",
	},
	{
		name:        "Bottom Row",
		description: "Practice the bottom row: z x c v b n m , . /",
		content:     "zxcvb nm,./ zxcvb nm,./\n/.,mn bvcxz /.,mn bvcxz",
		lessonType:  "bottom_row",
	},
	{
		name:        "Word Typing",
		description: "Type common words to build speed.",
		content:     "the quick brown fox jumps over the lazy dog\nThe quick brown fox jumps over the lazy dog.",
		lessonType:  "words",
	},
	{
		name:        "Sentence Typing",
		description: "Practice full sentences with punctuation.",
		content:     "Hello, world! How are you today?\nTyping practice helps improve your skills over time.",
		lessonType:  "sentences",
	},
}

func Seed(db *sql.DB) error {
	var count int
	if err := db.QueryRow("SELECT COUNT(*) FROM lessons").Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		log.Println("Lessons already seeded, skipping")
		return nil
	}

	for _, l := range seedLessons {
		_, err := db.Exec(`
			INSERT INTO lessons (name, description, content, type)
			VALUES ($1, $2, $3, $4)
		`, l.name, l.description, l.content, l.lessonType)
		if err != nil {
			return err
		}
	}
	log.Printf("Seeded %d lessons", len(seedLessons))
	return nil
}
