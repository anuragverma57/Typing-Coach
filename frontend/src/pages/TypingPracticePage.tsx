import { useCallback, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTypingSession } from '../hooks/useTypingSession'
import { createSession } from '../api/sessions'
import { fetchLessonContent, fetchPracticeContent } from '../api/lessons'
import { TypingText } from '../components/typing/TypingText'
import { LiveMetrics } from '../components/typing/LiveMetrics'
import { SessionControls } from '../components/typing/SessionControls'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import type { Lesson } from '../types/lesson'
import type { SessionResult } from '../types/session'

const DURATION_OPTIONS = [
  { value: 0, label: 'No limit' },
  { value: 30, label: '30s' },
  { value: 60, label: '1 min' },
  { value: 90, label: '90s' },
  { value: 120, label: '2 min' },
] as const

export function TypingPracticePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const lesson = (location.state as { lesson?: Lesson | null })?.lesson ?? null

  const [durationSec, setDurationSec] = useState(0)
  const [contentLoading, setContentLoading] = useState(false)
  const [contentError, setContentError] = useState<string | null>(null)

  const onSessionComplete = useCallback(
    async (result: SessionResult) => {
      const payload = {
        lessonId: lesson?.id ?? null,
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
            lessonName: lesson?.name ?? 'Free Practice',
          },
        })
      }
    },
    [lesson?.id, lesson?.name, navigate, user?.id]
  )

  const onContentExhausted = useCallback(async (): Promise<string> => {
    try {
      if (lesson?.id) {
        return await fetchLessonContent(lesson.id, undefined, true)
      }
      return await fetchPracticeContent(undefined, true)
    } catch {
      return ''
    }
  }, [lesson?.id])

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
    timeRemainingSec,
  } = useTypingSession({
    initialText: '',
    durationSec,
    onSessionComplete,
    onContentExhausted,
  })

  const handleStart = useCallback(async () => {
    setContentError(null)
    setContentLoading(true)
    try {
      const content = lesson?.id
        ? await fetchLessonContent(lesson.id, durationSec > 0 ? durationSec : undefined)
        : await fetchPracticeContent(durationSec > 0 ? durationSec : undefined)
      if (content) {
        startSession(content)
      } else {
        setContentError('Failed to load content')
        startSession()
      }
    } catch {
      setContentError('Failed to load content')
      startSession()
    } finally {
      setContentLoading(false)
    }
  }, [durationSec, lesson?.id, startSession])

  const title = lesson?.name ?? 'Free Practice'

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            className="text-text-muted"
            onClick={() => navigate('/app/lessons')}
          >
            ← Back
          </Button>
        </div>
        <h2 className="mt-2 text-xl font-medium text-text-primary">{title}</h2>
        <p className="mt-1 text-sm text-text-muted">
          Type the text below. Use keyboard only — no copy-paste.
        </p>
      </div>

      {status === 'idle' && (
        <Card className="space-y-4">
          <p className="text-sm font-medium text-text-secondary">
            Duration
          </p>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDurationSec(opt.value)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  durationSec === opt.value
                    ? 'bg-accent text-white'
                    : 'bg-surface-muted text-text-secondary hover:bg-surface-muted/80'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-text-muted">
            {durationSec > 0
              ? 'Timer mode: session ends when time runs out. Results are truncated at the last completed word.'
              : 'No limit: finish the full text.'}
          </p>
        </Card>
      )}

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
            <div className="font-mono text-xl leading-relaxed tracking-wide text-text-muted break-words">
              {targetText}
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
                <span className="font-medium text-text-primary">
                  {durationSec > 0 ? 'Time left' : 'Time'}
                </span>{' '}
                {durationSec > 0
                  ? `${Math.floor(durationSec / 60)}:${(durationSec % 60).toString().padStart(2, '0')}`
                  : '0:00'}
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
              timeRemainingSec={timeRemainingSec}
              durationSec={durationSec}
            />
          )}
          <SessionControls
            status={status}
            onStart={handleStart}
            onReset={resetSession}
            onStop={finishSession}
            showStopButton={durationSec === 0 && status === 'typing'}
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
