import { Button } from '../ui/Button'

type SessionControlsProps = {
  status: 'idle' | 'typing' | 'finished'
  onStart: () => void
  onReset: () => void
  onStop?: () => void
  startDisabled?: boolean
  showStopButton?: boolean
}

export function SessionControls({
  status,
  onStart,
  onReset,
  onStop,
  startDisabled = false,
  showStopButton = false,
}: SessionControlsProps) {
  if (status === 'typing') {
    return (
      <div className="flex gap-3">
        {showStopButton && onStop && (
          <Button variant="primary" onClick={onStop}>
            Stop
          </Button>
        )}
        <Button variant="secondary" onClick={onReset}>
          Restart
        </Button>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <Button onClick={onStart} disabled={startDisabled}>
        {startDisabled ? 'Loading...' : 'Start Typing'}
      </Button>
      {status === 'finished' && (
        <Button variant="secondary" onClick={onReset}>
          Practice Again
        </Button>
      )}
    </div>
  )
}
