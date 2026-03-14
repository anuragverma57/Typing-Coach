import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { MistakeReport } from '../components/typing/MistakeReport'
import { KeyAccuracyHeatmap } from '../components/typing/KeyAccuracyHeatmap'
import { getKeyAccuracy, getSuggestions } from '../services/mistakeAnalysis'
import type { SessionResult } from '../types/session'

type ReportState = {
  result: SessionResult
  lessonName?: string
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function ReportPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as ReportState | null
  const result = state?.result
  const lessonName = state?.lessonName ?? 'Free Practice'

  if (!result) {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-text-primary">Report</h2>
        <Card>
          <p className="text-center text-text-muted">
            No report data. Complete a practice session to see your results.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/app/practice">
              <Button>Start Practice</Button>
            </Link>
            <Link to="/app/reports">
              <Button variant="secondary">View All Reports</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  const { targetText, userInput, mistakes } = result
  const keyStats = getKeyAccuracy(targetText, userInput)
  const suggestions = getSuggestions(keyStats)
  const weakKeys = [...keyStats.values()]
    .map((s) => ({
      key: s.key,
      errors: s.total - s.correct,
      percentage: s.accuracy,
    }))
    .filter((k) => k.errors > 0)
    .sort((a, b) => b.errors - a.errors)

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Test Results</h2>
          <p className="mt-1 text-sm text-text-muted">{lessonName}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/app/practice')}>Practice Again</Button>
          <Link to="/app/reports">
            <Button variant="secondary">View All Reports</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-accent">{result.wpm.toFixed(1)}</div>
          <div className="mt-1 text-sm text-text-muted">WPM</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-accent">{result.accuracy.toFixed(1)}%</div>
          <div className="mt-1 text-sm text-text-muted">Accuracy</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-accent">{mistakes.length}</div>
          <div className="mt-1 text-sm text-text-muted">Errors</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-accent">
            {formatDuration(result.durationSec)}
          </div>
          <div className="mt-1 text-sm text-text-muted">Time</div>
        </Card>
      </div>

      {weakKeys.length > 0 && (
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Weak Keys
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-text-muted">
                  <th className="pb-3 pr-4 font-medium">Key</th>
                  <th className="pb-3 pr-4 font-medium">Errors</th>
                  <th className="pb-3 font-medium">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {weakKeys.map((k, i) => (
                  <tr
                    key={k.key}
                    className={`border-b border-[var(--color-border)] last:border-0 ${
                      i < 3 ? 'bg-incorrect/5' : ''
                    }`}
                  >
                    <td className="py-3 pr-4 font-mono text-text-primary">
                      {k.key === ' ' ? '␣' : k.key}
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">{k.errors}</td>
                    <td className="py-3 text-text-secondary">{k.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {mistakes.length > 0 && (
        <Card>
          <KeyAccuracyHeatmap
            mistakes={mistakes}
            targetText={targetText}
            userInput={userInput}
            colorBy="errors"
          />
        </Card>
      )}

      {suggestions.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suggestions.slice(0, 3).map((suggestion, i) => (
            <Card key={i}>
              <p className="text-sm text-text-secondary">{suggestion}</p>
            </Card>
          ))}
        </div>
      )}

      {mistakes.length > 0 && (
        <Card>
          <MistakeReport mistakes={mistakes} />
        </Card>
      )}
    </div>
  )
}
