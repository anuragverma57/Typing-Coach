import {
  getKeyAccuracy,
  getSuggestions,
} from '../../services/mistakeAnalysis'
import type { Mistake } from '../../types/session'

type ImprovementSuggestionsProps = {
  mistakes: Mistake[]
  targetText: string
  userInput: string
}

export function ImprovementSuggestions({
  mistakes,
  targetText,
  userInput,
}: ImprovementSuggestionsProps) {
  if (mistakes.length === 0) return null

  const keyStats = getKeyAccuracy(targetText, userInput)
  const suggestions = getSuggestions(keyStats)

  if (suggestions.length === 0) return null

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-text-primary">
        Suggestions
      </h4>
      <ul className="space-y-1.5 text-sm text-text-secondary">
        {suggestions.map((suggestion, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-accent">•</span>
            <span>{suggestion}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
