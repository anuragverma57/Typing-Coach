package sessions

import (
	"encoding/json"
	"sort"
)

const windowSec = 20

func ComputeAnalytics(keystrokeEventsRaw []byte, mistakesRaw []byte, durationSec int) *SessionAnalytics {
	analytics := &SessionAnalytics{
		WeakKeys:      []HeatmapEntry{},
		SpeedOverTime: []SpeedWindow{},
		Insights:      []string{},
	}
	if len(keystrokeEventsRaw) == 0 {
		analytics.UncorrectedErrors = len(parseMistakes(mistakesRaw))
		return analytics
	}

	var events []KeystrokeEvent
	if err := json.Unmarshal(keystrokeEventsRaw, &events); err != nil {
		analytics.UncorrectedErrors = len(parseMistakes(mistakesRaw))
		return analytics
	}

	mistakes := parseMistakes(mistakesRaw)
	analytics.UncorrectedErrors = len(mistakes)

	rawErrors := 0
	correctedErrors := 0
	keyErrors := make(map[string]int)
	backspaceCount := 0
	totalCharsTyped := 0

	type cursorState struct {
		pos     int
		correct []bool
	}
	state := cursorState{pos: 0, correct: []bool{}}

	for _, e := range events {
		if e.IsBackspace {
			backspaceCount++
			if state.pos > 0 {
				state.pos--
				if len(state.correct) > 0 {
					lastCorrect := state.correct[len(state.correct)-1]
					state.correct = state.correct[:len(state.correct)-1]
					if !lastCorrect {
						correctedErrors++
					}
				}
			}
			continue
		}

		totalCharsTyped++
		if !e.Correct {
			rawErrors++
			if e.ExpectedChar != "" {
				keyErrors[e.ExpectedChar]++
			}
		}
		state.correct = append(state.correct, e.Correct)
		state.pos++
	}

	analytics.RawErrors = rawErrors
	analytics.CorrectedErrors = correctedErrors
	if analytics.CorrectedErrors > analytics.RawErrors {
		analytics.CorrectedErrors = analytics.RawErrors
	}

	analytics.WeakKeys = weakKeysSorted(keyErrors)

	if totalCharsTyped > 0 {
		analytics.BackspacesPer100Chars = float64(backspaceCount) / float64(totalCharsTyped) * 100
	}

	analytics.SpeedOverTime = computeSpeedOverTime(events, durationSec)
	analytics.Insights = generateInsights(analytics, keyErrors)

	return analytics
}

func parseMistakes(raw []byte) []MistakeEntry {
	if len(raw) == 0 {
		return nil
	}
	var m []MistakeEntry
	_ = json.Unmarshal(raw, &m)
	return m
}

func weakKeysSorted(keyErrors map[string]int) []HeatmapEntry {
	var entries []HeatmapEntry
	for k, v := range keyErrors {
		if k != "" && v > 0 {
			entries = append(entries, HeatmapEntry{Key: k, Errors: v})
		}
	}
	sort.Slice(entries, func(i, j int) bool {
		return entries[i].Errors > entries[j].Errors
	})
	return entries
}

func computeSpeedOverTime(events []KeystrokeEvent, durationSec int) []SpeedWindow {
	if len(events) == 0 || durationSec <= 0 {
		return nil
	}

	var windows []SpeedWindow
	startMs := int64(0)
	if len(events) > 0 {
		startMs = events[0].Timestamp
	}

	for wStart := 0; wStart < durationSec; wStart += windowSec {
		wEnd := wStart + windowSec
		if wEnd > durationSec {
			wEnd = durationSec
		}
		windowStartMs := startMs + int64(wStart*1000)
		windowEndMs := startMs + int64(wEnd*1000)

		correctChars := 0
		for _, e := range events {
			if e.IsBackspace {
				continue
			}
			if e.Timestamp >= windowStartMs && e.Timestamp < windowEndMs && e.Correct {
				correctChars++
			}
		}
		windowDurMin := float64(wEnd-wStart) / 60
		wpm := 0.0
		if windowDurMin > 0 {
			wpm = float64(correctChars) / 5 / windowDurMin
		}
		windows = append(windows, SpeedWindow{
			WindowStartSec: wStart,
			WindowEndSec:   wEnd,
			WPM:            wpm,
		})
	}
	return windows
}

func generateInsights(a *SessionAnalytics, keyErrors map[string]int) []string {
	var insights []string

	if len(a.WeakKeys) > 0 {
		top := a.WeakKeys[0]
		if top.Errors >= 3 {
			insights = append(insights, "You mistype '"+top.Key+"' frequently — practice that key.")
		}
	}

	if a.BackspacesPer100Chars > 0 {
		if a.BackspacesPer100Chars > 8 {
			insights = append(insights, "Backspace rate is high — focus on accuracy before speed.")
		} else if a.BackspacesPer100Chars < 2 && a.RawErrors > 0 {
			insights = append(insights, "Consider pausing to fix mistakes — uncorrected errors hurt accuracy.")
		}
	}

	if len(a.SpeedOverTime) >= 3 {
		first := a.SpeedOverTime[0].WPM
		last := a.SpeedOverTime[len(a.SpeedOverTime)-1].WPM
		if first > 0 && last < first*0.7 {
			insights = append(insights, "Speed drops toward the end — consider shorter sessions to maintain rhythm.")
		}
	}

	if a.RawErrors > 0 && a.CorrectedErrors > a.UncorrectedErrors {
		insights = append(insights, "Good correction habit — you fix many mistakes before moving on.")
	}

	if len(insights) == 0 {
		insights = append(insights, "Keep practicing to unlock personalized insights.")
	}
	return insights
}
