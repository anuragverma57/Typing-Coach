import type { Mistake } from '../../types/session'
import { getMistakesGroupedByCharacter } from '../../services/mistakeAnalysis'

type MistakeReportProps = {
  mistakes: Mistake[]
}

export function MistakeReport({ mistakes }: MistakeReportProps) {
  if (mistakes.length === 0) return null

  const grouped = getMistakesGroupedByCharacter(mistakes)
  const entries = [...grouped.entries()].sort(
    (a, b) =>
      b[1].reduce((s, e) => s + e.count, 0) -
      a[1].reduce((s, e) => s + e.count, 0)
  )

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-text-primary">
        Mistakes by character
      </h4>
      <ul className="space-y-2 text-sm">
        {entries.map(([expected, errors]) => (
          <li
            key={expected}
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-text-secondary"
          >
            <span className="font-mono text-incorrect">"{expected}"</span>
            <span className="text-text-muted">→</span>
            {errors.map(({ typed, count }) => (
              <span key={typed} className="font-mono">
                typed "{typed}" {count > 1 && `(${count}×)`}
              </span>
            ))}
          </li>
        ))}
      </ul>
    </div>
  )
}
