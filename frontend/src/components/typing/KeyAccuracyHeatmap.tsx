import {
  getKeyAccuracy,
  getKeysForHeatmap,
} from '../../services/mistakeAnalysis'
import type { Mistake } from '../../types/session'

type KeyAccuracyHeatmapProps = {
  mistakes: Mistake[]
  targetText: string
  userInput: string
}

function getKeyColor(accuracy: number): string {
  if (accuracy >= 100) return 'bg-surface-muted'
  if (accuracy >= 90) return 'bg-correct/30'
  if (accuracy >= 70) return 'bg-amber-500/30'
  return 'bg-incorrect/40'
}

export function KeyAccuracyHeatmap({
  mistakes,
  targetText,
  userInput,
}: KeyAccuracyHeatmapProps) {
  if (mistakes.length === 0) return null

  const keyStats = getKeyAccuracy(targetText, userInput)
  const rows = getKeysForHeatmap()

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-text-primary">
        Per-key accuracy
      </h4>
      <div className="flex flex-col gap-1 font-mono text-xs">
        {rows.map((rowKeys, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-0.5">
            {rowKeys.map((key) => {
              const stats = keyStats.get(key)
              const accuracy = stats?.accuracy ?? 100
              const displayKey = key === ' ' ? '␣' : key
              return (
                <div
                  key={key}
                  className={`flex h-7 min-w-[1.5rem] items-center justify-center rounded px-1 ${getKeyColor(accuracy)} text-text-primary`}
                  title={
                    stats
                      ? `${key}: ${accuracy}% (${stats.correct}/${stats.total})`
                      : `${key}: not used`
                  }
                >
                  {displayKey}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <div className="flex gap-4 text-xs text-text-muted">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-incorrect/40" /> Low
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-correct/30" /> High
        </span>
      </div>
    </div>
  )
}
