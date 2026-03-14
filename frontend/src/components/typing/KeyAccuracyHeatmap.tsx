import {
  getKeyAccuracy,
  getKeysForHeatmap,
} from '../../services/mistakeAnalysis'
import type { Mistake } from '../../types/session'

type HeatmapDataEntry = { key: string; errors: number }

type KeyAccuracyHeatmapProps = {
  mistakes?: Mistake[]
  targetText?: string
  userInput?: string
  colorBy?: 'accuracy' | 'errors'
  heatmapData?: HeatmapDataEntry[]
}

function getKeyColorByAccuracy(accuracy: number): string {
  if (accuracy >= 100) return 'bg-surface-muted'
  if (accuracy >= 90) return 'bg-correct/30'
  if (accuracy >= 70) return 'bg-amber-500/30'
  return 'bg-incorrect/40'
}

function getKeyColorByErrors(errors: number): string {
  if (errors === 0) return 'bg-correct/40'
  if (errors <= 2) return 'bg-yellow-500/40'
  if (errors === 3) return 'bg-orange-500/40'
  return 'bg-incorrect/50'
}

export function KeyAccuracyHeatmap({
  mistakes = [],
  targetText = '',
  userInput = '',
  colorBy = 'accuracy',
  heatmapData,
}: KeyAccuracyHeatmapProps) {
  const errorsMap = heatmapData
    ? (() => {
        const m = new Map<string, number>()
        for (const e of heatmapData) {
          const k = e.key.toLowerCase()
          m.set(k, (m.get(k) ?? 0) + e.errors)
        }
        return m
      })()
    : null
  const keyStats =
    !heatmapData && targetText && userInput
      ? getKeyAccuracy(targetText, userInput)
      : null

  const hasData = (heatmapData?.length ?? 0) > 0 || mistakes.length > 0
  if (!hasData) return null

  const rows = getKeysForHeatmap()

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-text-primary">
        {colorBy === 'errors' ? 'Error heatmap' : 'Per-key accuracy'}
      </h4>
      <div className="flex flex-col gap-1 font-mono text-xs">
        {rows.map((rowKeys, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-0.5">
            {rowKeys.map((key) => {
              const errors =
                errorsMap?.get(key) ??
                (keyStats?.get(key)
                  ? keyStats.get(key)!.total - keyStats.get(key)!.correct
                  : 0)
              const stats = keyStats?.get(key)
              const accuracy = stats?.accuracy ?? 100
              const displayKey = key === ' ' ? '␣' : key
              const color =
                colorBy === 'errors' || heatmapData
                  ? getKeyColorByErrors(errors)
                  : getKeyColorByAccuracy(accuracy)
              return (
                <div
                  key={key}
                  className={`flex h-7 min-w-[1.5rem] items-center justify-center rounded px-1 ${color} text-text-primary`}
                  title={
                    stats
                      ? `${key}: ${accuracy}% (${stats.correct}/${stats.total})`
                      : heatmapData
                        ? `${key}: ${errors} errors`
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
        {colorBy === 'errors' ? (
          <>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-incorrect/50" /> 4+ errors
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-correct/40" /> 0 errors
            </span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-incorrect/40" /> Low
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-correct/30" /> High
            </span>
          </>
        )}
      </div>
    </div>
  )
}
