import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  calculateAccuracy,
  calculateWPM,
} from '../services/typingMetrics'
import type { SessionResult, SessionStatus } from '../types/session'

const DEFAULT_TEXT =
  'The quick brown fox jumps over the lazy dog. Practice makes perfect, and typing is a skill that improves with consistent effort.'

type UseTypingSessionOptions = {
  initialText?: string
  onSessionComplete?: (result: SessionResult) => void
}

type UseTypingSessionReturn = {
  targetText: string
  userInput: string
  status: SessionStatus
  startTime: number | null
  result: SessionResult | null
  startSession: () => void
  resetSession: () => void
  handleKeyDown: (e: React.KeyboardEvent) => void
  setTargetText: (text: string) => void
  inputRef: React.RefObject<HTMLInputElement | null>
}

export function useTypingSession(
  options: UseTypingSessionOptions | string = {}
): UseTypingSessionReturn {
  const opts = typeof options === 'string' ? { initialText: options } : options
  const initialText = opts.initialText ?? DEFAULT_TEXT
  const onSessionComplete = opts.onSessionComplete
  const [targetText, setTargetText] = useState(initialText)
  const [userInput, setUserInput] = useState('')
  const [status, setStatus] = useState<SessionStatus>('idle')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [result, setResult] = useState<SessionResult | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const startSession = useCallback(() => {
    setUserInput('')
    setStatus('typing')
    setStartTime(Date.now())
    setResult(null)
  }, [])

  const resetSession = useCallback(() => {
    setUserInput('')
    setStatus('idle')
    setStartTime(null)
    setResult(null)
  }, [])

  const finishSession = useCallback(() => {
    if (startTime === null) return
    const durationSec = (Date.now() - startTime) / 1000
    const totalChars = userInput.length
    let correctChars = 0
    const mistakes: { expected: string; typed: string; position: number }[] = []
    for (let i = 0; i < totalChars; i++) {
      if (userInput[i] === targetText[i]) {
        correctChars++
      } else {
        mistakes.push({
          expected: targetText[i],
          typed: userInput[i],
          position: i,
        })
      }
    }
    const wpm = calculateWPM(correctChars, durationSec)
    const accuracy = calculateAccuracy(correctChars, totalChars)
    const resultData: SessionResult = {
      wpm,
      accuracy,
      correctChars,
      totalChars,
      durationSec,
      mistakes,
    }
    setResult(resultData)
    setStatus('finished')
    onSessionComplete?.(resultData)
  }, [startTime, userInput, targetText, onSessionComplete])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (status !== 'typing') return

      if (e.ctrlKey || e.metaKey || e.altKey) {
        e.preventDefault()
        return
      }

      if (e.key === 'Backspace') {
        e.preventDefault()
        setUserInput((prev) => prev.slice(0, -1))
        return
      }

      if (e.key.length === 1) {
        e.preventDefault()
        const newInput = userInput + e.key
        setUserInput(newInput)

        if (newInput.length >= targetText.length) {
          finishSession()
        }
      }
    },
    [status, userInput, targetText, finishSession]
  )

  useEffect(() => {
    if (status === 'typing' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [status])

  return {
    targetText,
    userInput,
    status,
    startTime,
    result,
    startSession,
    resetSession,
    handleKeyDown,
    setTargetText,
    inputRef,
  }
}
