import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import type { SessionResult } from '../types/session'

type ResultsPageProps = {
  result: SessionResult
  onPracticeAgain: () => void
}

function formatDuration(sec: number): string {
  const min = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${min}:${s.toString().padStart(2, '0')}`
}

export function ResultsPage({ result, onPracticeAgain }: ResultsPageProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-medium text-text-primary">
          Session Complete
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Great job! Here are your results.
        </p>
      </div>

      <Card className="text-center space-y-6">
        <div className="flex flex-wrap justify-center gap-12">
          <div>
            <div className="text-3xl font-semibold text-accent">
              {result.wpm}
            </div>
            <div className="text-sm text-text-muted mt-1">WPM</div>
          </div>
          <div>
            <div className="text-3xl font-semibold text-accent">
              {result.accuracy}%
            </div>
            <div className="text-sm text-text-muted mt-1">Accuracy</div>
          </div>
          <div>
            <div className="text-3xl font-semibold text-accent">
              {formatDuration(result.durationSec)}
            </div>
            <div className="text-sm text-text-muted mt-1">Time</div>
          </div>
        </div>
        <div className="flex justify-center gap-3">
          <Button onClick={onPracticeAgain}>Practice Again</Button>
        </div>
      </Card>
    </div>
  )
}
