import { useState, useEffect } from 'react'
import { calculateAccuracy, calculateWPM } from '../../services/typingMetrics'

type LiveMetricsProps = {
  userInput: string
  targetText: string
  startTime: number | null
  isActive: boolean
  timeRemainingSec?: number | null
  durationSec?: number
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

function formatCountdown(sec: number): string {
  const min = Math.floor(sec / 60)
  const s = sec % 60
  return `${min}:${s.toString().padStart(2, '0')}`
}

export function LiveMetrics({
  userInput,
  targetText,
  startTime,
  isActive,
  timeRemainingSec = null,
  durationSec = 0,
}: LiveMetricsProps) {
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!isActive || !startTime) return
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [isActive, startTime])

  const durationMs =
    startTime && isActive ? Date.now() - startTime : 0
  const totalChars = userInput.length
  let correctChars = 0
  for (let i = 0; i < totalChars; i++) {
    if (userInput[i] === targetText[i]) correctChars++
  }
  const errorCount = totalChars - correctChars
  const isTimerMode = durationSec > 0 && timeRemainingSec !== null
  const metrics = {
    wpm: startTime && isActive ? calculateWPM(correctChars, durationMs / 1000) : 0,
    accuracy: totalChars > 0 ? calculateAccuracy(correctChars, totalChars) : 100,
    duration: isTimerMode
      ? formatCountdown(timeRemainingSec)
      : formatDuration(durationMs),
    errors: errorCount,
  }

  return (
    <div className="flex gap-6 text-sm text-text-secondary">
      <span>
        <span className="font-medium text-text-primary">WPM</span>{' '}
        {metrics.wpm.toFixed(1)}
      </span>
      <span>
        <span className="font-medium text-text-primary">Accuracy</span>{' '}
        {metrics.accuracy.toFixed(1)}%
      </span>
      <span>
        <span className="font-medium text-text-primary">Time</span>{' '}
        {metrics.duration}
      </span>
      <span>
        <span className="font-medium text-text-primary">Errors</span>{' '}
        {metrics.errors}
      </span>
    </div>
  )
}
