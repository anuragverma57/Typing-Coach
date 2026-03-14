package adaptive

import (
	"math/rand"
	"strings"
	"unicode"
)

const targetWords = 10

type wordPool struct {
	words []string
}

var pool *wordPool

func init() {
	pool = buildPool()
}

func buildPool() *wordPool {
	seen := make(map[string]bool)
	var unique []string
	for _, w := range adaptiveWords {
		norm := strings.ToLower(strings.TrimSpace(w))
		if norm == "" || len(norm) < 2 {
			continue
		}
		ok := true
		for _, r := range norm {
			if !unicode.IsLetter(r) {
				ok = false
				break
			}
		}
		if !ok || seen[norm] {
			continue
		}
		seen[norm] = true
		unique = append(unique, norm)
	}
	return &wordPool{words: unique}
}

type mistakeEntry struct {
	Expected string `json:"expected"`
	Typed    string `json:"typed"`
}

func extractWeakLetters(mistakes []mistakeEntry) map[rune]int {
	counts := make(map[rune]int)
	for _, m := range mistakes {
		if m.Expected == "" {
			continue
		}
		for _, r := range m.Expected {
			lower := unicode.ToLower(r)
			if unicode.IsLetter(lower) {
				counts[lower]++
			}
		}
	}
	return counts
}

func scoreWord(word string, weakCounts map[rune]int) int {
	if len(weakCounts) == 0 {
		return 0
	}
	score := 0
	for _, r := range word {
		lower := unicode.ToLower(r)
		if c, ok := weakCounts[lower]; ok {
			score += c
		}
	}
	return score
}

func selectNextLine(mistakes []mistakeEntry) string {
	weakCounts := extractWeakLetters(mistakes)

	if len(pool.words) == 0 {
		return "the quick brown fox jumps over the lazy dog"
	}

	if len(weakCounts) == 0 {
		return randomLine(pool.words, targetWords)
	}

	type scoredWord struct {
		word  string
		score int
	}
	var scored []scoredWord
	for _, w := range pool.words {
		s := scoreWord(w, weakCounts)
		scored = append(scored, scoredWord{word: w, score: s})
	}

	for i := 0; i < len(scored)-1; i++ {
		for j := i + 1; j < len(scored); j++ {
			if scored[j].score > scored[i].score {
				scored[i], scored[j] = scored[j], scored[i]
			}
		}
	}

	topN := targetWords * 5
	if topN > len(scored) {
		topN = len(scored)
	}
	candidates := make([]string, 0, topN)
	for i := 0; i < topN && i < len(scored); i++ {
		if scored[i].score > 0 {
			candidates = append(candidates, scored[i].word)
		}
	}
	if len(candidates) < targetWords {
		for _, s := range scored {
			if s.score == 0 {
				candidates = append(candidates, s.word)
				if len(candidates) >= topN {
					break
				}
			}
		}
	}
	if len(candidates) == 0 {
		candidates = pool.words
	}

	rand.Shuffle(len(candidates), func(i, j int) {
		candidates[i], candidates[j] = candidates[j], candidates[i]
	})

	selected := make([]string, 0, targetWords)
	used := make(map[string]bool)
	for _, w := range candidates {
		if !used[w] {
			selected = append(selected, w)
			used[w] = true
			if len(selected) >= targetWords {
				break
			}
		}
	}
	if len(selected) < targetWords {
		for _, w := range pool.words {
			if !used[w] {
				selected = append(selected, w)
				used[w] = true
				if len(selected) >= targetWords {
					break
				}
			}
		}
	}
	if len(selected) == 0 {
		return randomLine(pool.words, targetWords)
	}
	return strings.Join(selected, " ")
}

func InitialContent() string {
	if len(pool.words) == 0 {
		return "the quick brown fox jumps over the lazy dog"
	}
	line1 := randomLine(pool.words, targetWords)
	line2 := randomLine(pool.words, targetWords)
	return line1 + "\n" + line2
}

func randomLine(words []string, n int) string {
	if len(words) == 0 {
		return "the quick brown fox jumps over the lazy dog"
	}
	selected := make([]string, 0, n)
	used := make(map[string]bool)
	for len(selected) < n {
		w := words[rand.Intn(len(words))]
		if !used[w] {
			selected = append(selected, w)
			used[w] = true
		}
		if len(used) >= len(words) {
			break
		}
	}
	if len(selected) == 0 {
		selected = append(selected, words[rand.Intn(len(words))])
	}
	return strings.Join(selected, " ")
}
