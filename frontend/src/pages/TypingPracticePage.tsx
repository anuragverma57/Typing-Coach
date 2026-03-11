import { useTypingSession } from '../hooks/useTypingSession'
import { Card } from '../components/ui/Card'
import { TypingText } from '../components/typing/TypingText'
import { LiveMetrics } from '../components/typing/LiveMetrics'
import { SessionControls } from '../components/typing/SessionControls'

export function TypingPracticePage() {
  const {
    targetText,
    userInput,
    status,
    startTime,
    result,
    startSession,
    resetSession,
    handleKeyDown,
    inputRef,
  } = useTypingSession()

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-medium text-text-primary">
          Free Practice
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Type the text below. Use keyboard only — no copy-paste.
        </p>
      </div>

      <Card className="space-y-6 overflow-hidden">
        <div
          className="relative cursor-text min-h-[6rem] overflow-hidden w-full"
          onClick={() => status === 'typing' && inputRef.current?.focus()}
        >
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            className="absolute inset-0 w-full opacity-0 cursor-text"
            aria-label="Typing input"
            onKeyDown={handleKeyDown}
            readOnly
          />
          <TypingText targetText={targetText} userInput={userInput} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <LiveMetrics
            userInput={userInput}
            targetText={targetText}
            startTime={startTime}
            isActive={status === 'typing'}
          />
          <SessionControls
            status={status}
            onStart={startSession}
            onReset={resetSession}
          />
        </div>
      </Card>

      {result && (
        <Card className="text-center space-y-4">
          <h3 className="text-lg font-medium text-text-primary">
            Session Complete
          </h3>
          <div className="flex justify-center gap-8">
            <div>
              <div className="text-2xl font-semibold text-accent">
                {result.wpm}
              </div>
              <div className="text-sm text-text-muted">WPM</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-accent">
                {result.accuracy}%
              </div>
              <div className="text-sm text-text-muted">Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-accent">
                {Math.floor(result.durationSec / 60)}:
                {(Math.floor(result.durationSec) % 60)
                  .toString()
                  .padStart(2, '0')}
              </div>
              <div className="text-sm text-text-muted">Time</div>
            </div>
          </div>
          <SessionControls
            status="finished"
            onStart={startSession}
            onReset={resetSession}
          />
        </Card>
      )}
    </div>
  )
}
