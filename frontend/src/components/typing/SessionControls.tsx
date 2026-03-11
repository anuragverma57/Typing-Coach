import { Button } from '../ui/Button'

type SessionControlsProps = {
  status: 'idle' | 'typing' | 'finished'
  onStart: () => void
  onReset: () => void
}

export function SessionControls({
  status,
  onStart,
  onReset,
}: SessionControlsProps) {
  if (status === 'typing') {
    return (
      <Button variant="secondary" onClick={onReset}>
        Restart
      </Button>
    )
  }

  return (
    <div className="flex gap-3">
      <Button onClick={onStart}>Start</Button>
      {status === 'finished' && (
        <Button variant="secondary" onClick={onReset}>
          Practice Again
        </Button>
      )}
    </div>
  )
}
