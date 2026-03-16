import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  calculateAccuracy,
  calculateWPM,
  truncateAtWordBoundary,
} from '../services/typingMetrics'
import type {
  KeystrokeEvent,
  SessionResult,
  SessionStatus,
} from '../types/session'

const DEFAULT_TEXT =
  'The quick brown fox jumps over the lazy dog. Practice makes perfect, and typing is a skill that improves with consistent effort.'

type UseTypingSessionOptions = {
  initialText?: string
  durationSec?: number
  strictMode?: boolean
  onSessionComplete?: (result: SessionResult) => void
  onContentExhausted?: () => Promise<string>
}

type UseTypingSessionReturn = {
  targetText: string
  userInput: string
  status: SessionStatus
  startTime: number | null
  result: SessionResult | null
  startSession: (contentOverride?: string) => void
  resetSession: () => void
  finishSession: () => void
  handleKeyDown: (e: React.KeyboardEvent) => void
  setTargetText: (text: string) => void
  inputRef: React.RefObject<HTMLInputElement | null>
  durationSec: number
  timeRemainingSec: number | null
  strictModeErrorActive: boolean
  strictModeErrorsCount: number
}

export function useTypingSession(
  options: UseTypingSessionOptions | string = {}
): UseTypingSessionReturn {
  const opts = typeof options === 'string' ? { initialText: options } : options
  const initialText = opts.initialText ?? DEFAULT_TEXT
  const durationSec = opts.durationSec ?? 0
  const strictMode = opts.strictMode ?? false
  const onSessionComplete = opts.onSessionComplete
  const onContentExhausted = opts.onContentExhausted
  const [targetText, setTargetText] = useState(initialText)
  const [userInput, setUserInput] = useState('')
  const [status, setStatus] = useState<SessionStatus>('idle')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [result, setResult] = useState<SessionResult | null>(null)
  const [timeRemainingSec, setTimeRemainingSec] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const keystrokeEventsRef = useRef<KeystrokeEvent[]>([])
  const strictModeMistakesRef = useRef<{ expected: string; typed: string; position: number }[]>([])
  const strictModeErrorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [strictModeErrorActive, setStrictModeErrorActive] = useState(false)
  const [strictModeErrorsCount, setStrictModeErrorsCount] = useState(0)

  const computeAndFinish = useCallback(
    (text: string, input: string) => {
      const truncateIdx = truncateAtWordBoundary(input)
      const truncatedTarget = text.slice(0, truncateIdx)
      const truncatedInput = input.slice(0, truncateIdx)
      const totalChars = truncatedInput.length
      let correctChars = 0
      const mistakes: { expected: string; typed: string; position: number }[] =
        []
      for (let i = 0; i < totalChars; i++) {
        if (truncatedInput[i] === truncatedTarget[i]) {
          correctChars++
        } else {
          mistakes.push({
            expected: truncatedTarget[i],
            typed: truncatedInput[i],
            position: i,
          })
        }
      }
      mistakes.push(...strictModeMistakesRef.current)
      const elapsedSec =
        startTime !== null ? (Date.now() - startTime) / 1000 : 0
      const wpm = calculateWPM(correctChars, elapsedSec)
      const accuracy = calculateAccuracy(correctChars, totalChars)
      const resultData: SessionResult = {
        wpm,
        accuracy,
        correctChars,
        totalChars,
        durationSec: elapsedSec,
        mistakes,
        targetText: truncatedTarget,
        userInput: truncatedInput,
        keystrokeEvents:
          keystrokeEventsRef.current.length > 0
            ? [...keystrokeEventsRef.current]
            : undefined,
      }
      setResult(resultData)
      setStatus('finished')
      onSessionComplete?.(resultData)
    },
    [startTime, onSessionComplete]
  )

  const finishSessionManually = useCallback(
    () => {
      if (startTime === null) return
      computeAndFinish(targetText, userInput)
    },
    [startTime, targetText, userInput, computeAndFinish]
  )

  const finishSession = useCallback(
    (truncate = false) => {
      if (startTime === null) return
      if (truncate) {
        computeAndFinish(targetText, userInput)
      } else {
        const totalChars = userInput.length
        let correctChars = 0
        const mistakes: {
          expected: string
          typed: string
          position: number
        }[] = []
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
        mistakes.push(...strictModeMistakesRef.current)
        const durationSecElapsed = (Date.now() - startTime) / 1000
        const wpm = calculateWPM(correctChars, durationSecElapsed)
        const accuracy = calculateAccuracy(correctChars, totalChars)
        const resultData: SessionResult = {
          wpm,
          accuracy,
          correctChars,
          totalChars,
          durationSec: durationSecElapsed,
          mistakes,
          targetText,
          userInput,
          keystrokeEvents:
            keystrokeEventsRef.current.length > 0
              ? [...keystrokeEventsRef.current]
              : undefined,
        }
        setResult(resultData)
        setStatus('finished')
        onSessionComplete?.(resultData)
      }
    },
    [
      startTime,
      userInput,
      targetText,
      onSessionComplete,
      computeAndFinish,
    ]
  )

  useEffect(() => {
    if (status !== 'typing' || durationSec <= 0 || startTime === null) return
    setTimeRemainingSec(durationSec)
    timerRef.current = setInterval(() => {
      setTimeRemainingSec((prev) => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [status, durationSec, startTime])

  useEffect(() => {
    if (
      status === 'typing' &&
      durationSec > 0 &&
      timeRemainingSec === 0 &&
      startTime !== null
    ) {
      computeAndFinish(targetText, userInput)
      setTimeRemainingSec(null)
    }
  }, [
    status,
    timeRemainingSec,
    durationSec,
    startTime,
    targetText,
    userInput,
    computeAndFinish,
  ])

  const startSession = useCallback(
    (contentOverride?: string) => {
      const text = contentOverride ?? targetText
      setTargetText(text)
      setUserInput('')
      setStatus('typing')
      setStartTime(Date.now())
      setResult(null)
      setTimeRemainingSec(durationSec > 0 ? durationSec : null)
      keystrokeEventsRef.current = []
      strictModeMistakesRef.current = []
      setStrictModeErrorsCount(0)
    },
    [durationSec, targetText]
  )

  const resetSession = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (strictModeErrorTimeoutRef.current) {
      clearTimeout(strictModeErrorTimeoutRef.current)
      strictModeErrorTimeoutRef.current = null
    }
    setUserInput('')
    setStatus('idle')
    setStartTime(null)
    setResult(null)
    setTimeRemainingSec(null)
    setStrictModeErrorActive(false)
    setStrictModeErrorsCount(0)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (status !== 'typing' || startTime === null) return

      if (e.ctrlKey || e.metaKey || e.altKey) {
        e.preventDefault()
        return
      }

      const timestamp = Date.now() - startTime
      const cursorPos = userInput.length

      if (e.key === 'Backspace') {
        e.preventDefault()
        const expectedChar = cursorPos > 0 ? targetText[cursorPos - 1] ?? '' : ''
        keystrokeEventsRef.current.push({
          key: 'Backspace',
          expectedChar,
          correct: false,
          timestamp,
          cursorPosition: cursorPos,
          isBackspace: true,
        })
        setUserInput((prev) => prev.slice(0, -1))
        return
      }

      if (e.key.length === 1) {
        e.preventDefault()
        const expectedChar = targetText[cursorPos] ?? ''
        const correct = e.key === expectedChar
        keystrokeEventsRef.current.push({
          key: e.key,
          expectedChar,
          correct,
          timestamp,
          cursorPosition: cursorPos,
          isBackspace: false,
        })
        if (strictMode && !correct) {
          strictModeMistakesRef.current.push({
            expected: expectedChar,
            typed: e.key,
            position: cursorPos,
          })
          setStrictModeErrorsCount((c) => c + 1)
          setStrictModeErrorActive(true)
          if (strictModeErrorTimeoutRef.current) {
            clearTimeout(strictModeErrorTimeoutRef.current)
          }
          strictModeErrorTimeoutRef.current = setTimeout(() => {
            setStrictModeErrorActive(false)
            strictModeErrorTimeoutRef.current = null
          }, 200)
          return
        }
        const newInput = userInput + e.key
        setUserInput(newInput)

        if (newInput.length >= targetText.length && onContentExhausted) {
          onContentExhausted()
            .then((more) => {
              if (more?.trim()) {
                setTargetText((prev) => prev + ' ' + more.trim())
              }
            })
            .catch(() => {})
          return
        }
        if (
          newInput.length >= targetText.length &&
          !onContentExhausted &&
          durationSec <= 0
        ) {
          finishSession(false)
        }
      }
    },
    [
      status,
      userInput,
      targetText,
      startTime,
      strictMode,
      finishSession,
      durationSec,
      onContentExhausted,
    ]
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
    finishSession: finishSessionManually,
    handleKeyDown,
    setTargetText,
    inputRef,
    durationSec,
    timeRemainingSec,
    strictModeErrorActive,
    strictModeErrorsCount,
  }
}
