import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useAdaptiveTypingSession } from '../hooks/useAdaptiveTypingSession'
import { createSession } from '../api/sessions'
import { TypingText } from '../components/typing/TypingText'
import { LiveMetrics } from '../components/typing/LiveMetrics'
import { SessionControls } from '../components/typing/SessionControls'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import type { SessionResult } from '../types/session'

export function AdaptivePracticePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [contentLoading, setContentLoading] = useState(false)
  const [contentError, setContentError] = useState<string | null>(null)

  const onSessionComplete = useCallback(
    async (result: SessionResult) => {
      const payload = {
        lessonId: null,
        wpm: result.wpm,
        accuracy: result.accuracy,
        mistakes: result.mistakes,
        durationSec: Math.round(result.durationSec),
        keystrokeEvents: result.keystrokeEvents,
      }
      const created = await createSession(payload).catch(() => null)
      if (user?.id && created?.id) {
        navigate(`/app/reports/${created.id}`)
      } else {
        navigate('/app/report', {
          state: {
            result,
            lessonName: 'Adaptive Practice',
          },
        })
      }
    },
    [navigate, user?.id]
  )

  const {
    targetText,
    userInput,
    status,
    startTime,
    startSession,
    resetSession,
    finishSession,
    handleKeyDown,
    inputRef,
    nextLinePersonalized,
  } = useAdaptiveTypingSession({ onSessionComplete })

  const handleStart = useCallback(async () => {
    setContentError(null)
    setContentLoading(true)
    try {
      await startSession()
    } catch {
      setContentError('Failed to load content')
    } finally {
      setContentLoading(false)
    }
  }, [startSession])

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            className="text-text-muted"
            onClick={() => navigate('/app/practice')}
          >
            ← Back
          </Button>
        </div>
        <h2 className="mt-2 text-xl font-medium text-text-primary">
          Adaptive Practice
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Personalized lines based on your mistakes. Each new line focuses on
          keys you struggle with.
        </p>
        {nextLinePersonalized && status === 'typing' && (
          <p className="mt-2 text-xs text-accent">
            Next line tailored to your mistakes
          </p>
        )}
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
          {status === 'idle' ? (
            <div className="font-mono text-xl leading-relaxed tracking-wide text-text-muted break-words whitespace-pre-wrap">
              {contentLoading
                ? 'Loading...'
                : targetText || 'Click Start to begin'}
            </div>
          ) : (
            <TypingText targetText={targetText} userInput={userInput} />
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          {status === 'idle' ? (
            <div className="flex gap-6 text-sm text-text-secondary">
              <span>
                <span className="font-medium text-text-primary">WPM</span> 0
              </span>
              <span>
                <span className="font-medium text-text-primary">Accuracy</span>{' '}
                100%
              </span>
              <span>
                <span className="font-medium text-text-primary">Errors</span> 0
              </span>
            </div>
          ) : (
            <LiveMetrics
              userInput={userInput}
              targetText={targetText}
              startTime={startTime}
              isActive={status === 'typing'}
              timeRemainingSec={null}
              durationSec={0}
            />
          )}
          <SessionControls
            status={status}
            onStart={handleStart}
            onReset={resetSession}
            onStop={finishSession}
            showStopButton={status === 'typing'}
            startDisabled={contentLoading}
          />
        </div>
        {contentError && (
          <p className="text-sm text-incorrect">{contentError}</p>
        )}
      </Card>
    </div>
  )
}
