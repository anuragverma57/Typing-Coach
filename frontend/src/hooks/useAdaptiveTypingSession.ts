import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  calculateAccuracy,
  calculateWPM,
} from '../services/typingMetrics'
import type {
  KeystrokeEvent,
  SessionResult,
  SessionStatus,
} from '../types/session'
import { fetchAdaptiveNext, fetchAdaptiveInitial } from '../api/practice'
import { fetchPracticeContent } from '../api/lessons'

type LineBoundary = { start: number; end: number }

type AdaptiveMistake = { expected: string; typed: string }

function getLineBoundaries(text: string): LineBoundary[] {
  const lines: LineBoundary[] = []
  let start = 0
  for (let i = 0; i <= text.length; i++) {
    if (i === text.length || text[i] === '\n') {
      lines.push({ start, end: i })
      start = i + 1
    }
  }
  if (lines.length === 0) lines.push({ start: 0, end: 0 })
  return lines
}

function getMistakesForRange(
  target: string,
  input: string,
  start: number,
  end: number
): AdaptiveMistake[] {
  const mistakes: AdaptiveMistake[] = []
  const targetSlice = target.slice(start, end)
  const inputSlice = input.slice(start, end)
  const len = Math.min(targetSlice.length, inputSlice.length)
  for (let i = 0; i < len; i++) {
    if (inputSlice[i] !== targetSlice[i]) {
      mistakes.push({ expected: targetSlice[i], typed: inputSlice[i] })
    }
  }
  for (let i = len; i < targetSlice.length; i++) {
    mistakes.push({ expected: targetSlice[i], typed: '' })
  }
  return mistakes
}

type UseAdaptiveTypingSessionOptions = {
  strictMode?: boolean
  onSessionComplete?: (result: SessionResult) => void
}

type UseAdaptiveTypingSessionReturn = {
  targetText: string
  userInput: string
  status: SessionStatus
  startTime: number | null
  result: SessionResult | null
  startSession: () => void
  resetSession: () => void
  finishSession: () => void
  handleKeyDown: (e: React.KeyboardEvent) => void
  inputRef: React.RefObject<HTMLInputElement | null>
  nextLinePersonalized: boolean
  strictModeErrorActive: boolean
  strictModeErrorsCount: number
}

export function useAdaptiveTypingSession(
  options: UseAdaptiveTypingSessionOptions = {}
): UseAdaptiveTypingSessionReturn {
  const strictMode = options.strictMode ?? false
  const onSessionComplete = options.onSessionComplete
  const [targetText, setTargetText] = useState('')
  const [userInput, setUserInput] = useState('')
  const [status, setStatus] = useState<SessionStatus>('idle')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [result, setResult] = useState<SessionResult | null>(null)
  const [nextLinePersonalized, setNextLinePersonalized] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const keystrokeEventsRef = useRef<KeystrokeEvent[]>([])
  const accumulatedMistakesRef = useRef<AdaptiveMistake[]>([])
  const strictModeMistakesRef = useRef<{ expected: string; typed: string; position: number }[]>([])
  const strictModeErrorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prefetchTriggeredForLineRef = useRef<number>(-1)
  const completedLineEndsRef = useRef<Set<number>>(new Set())
  const [strictModeErrorActive, setStrictModeErrorActive] = useState(false)
  const [strictModeErrorsCount, setStrictModeErrorsCount] = useState(0)

  const finishSessionManually = useCallback(() => {
    if (startTime === null) return
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
    mistakes.push(...strictModeMistakesRef.current)
    const elapsedSec = (Date.now() - startTime) / 1000
    const wpm = calculateWPM(correctChars, elapsedSec)
    const accuracy = calculateAccuracy(correctChars, totalChars)
    const resultData: SessionResult = {
      wpm,
      accuracy,
      correctChars,
      totalChars,
      durationSec: elapsedSec,
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
  }, [startTime, userInput, targetText, onSessionComplete])

  const startSession = useCallback(async () => {
    try {
      const content = await fetchAdaptiveInitial()
      const text = content?.trim() || 'Start typing here.\nContinue with the next line.'
      setTargetText(text)
    } catch {
      setTargetText('Start typing here.\nContinue with the next line.')
    }
    setUserInput('')
    setStatus('typing')
    setStartTime(Date.now())
    setResult(null)
    setNextLinePersonalized(false)
    keystrokeEventsRef.current = []
    accumulatedMistakesRef.current = []
    strictModeMistakesRef.current = []
    prefetchTriggeredForLineRef.current = -1
    completedLineEndsRef.current = new Set()
    setStrictModeErrorsCount(0)
  }, [])

  const resetSession = useCallback(() => {
    if (strictModeErrorTimeoutRef.current) {
      clearTimeout(strictModeErrorTimeoutRef.current)
      strictModeErrorTimeoutRef.current = null
    }
    setUserInput('')
    setStatus('idle')
    setStartTime(null)
    setResult(null)
    setNextLinePersonalized(false)
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

      if (e.key.length !== 1) return

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

      const boundaries = getLineBoundaries(targetText)
      const currentLineIdx = boundaries.findIndex(
        (b) => cursorPos >= b.start && cursorPos < b.end
      )
      const effectiveLineIdx = currentLineIdx >= 0 ? currentLineIdx : boundaries.length - 1
      const currentLine = boundaries[effectiveLineIdx]
      if (!currentLine) return

      for (const b of boundaries) {
        if (
          newInput.length >= b.end &&
          !completedLineEndsRef.current.has(b.end)
        ) {
          completedLineEndsRef.current.add(b.end)
          const lineMistakes = getMistakesForRange(
            targetText,
            newInput,
            b.start,
            b.end
          )
          accumulatedMistakesRef.current.push(...lineMistakes)
        }
      }

      const progressInLine = newInput.length - currentLine.start
      const lineLength = currentLine.end - currentLine.start

      if (
        lineLength > 0 &&
        progressInLine >= 0.7 * lineLength &&
        prefetchTriggeredForLineRef.current !== effectiveLineIdx
      ) {
        prefetchTriggeredForLineRef.current = effectiveLineIdx
        const allMistakes = [...accumulatedMistakesRef.current]
        const appendNextLine = (next: string) => {
          const trimmed = next.trim()
          if (!trimmed) return
          setTargetText((prev) => {
            const newTarget = prev + '\n' + trimmed
            const bounds = getLineBoundaries(newTarget)
            const maxLines = 3
            if (bounds.length > maxLines) {
              const firstLineLen = bounds[0].end - bounds[0].start + 1
              setUserInput((u) => u.slice(firstLineLen))
              completedLineEndsRef.current = new Set()
              accumulatedMistakesRef.current = []
              prefetchTriggeredForLineRef.current = -1
              return newTarget.slice(firstLineLen)
            }
            return newTarget
          })
          setNextLinePersonalized(allMistakes.length > 0)
        }
        fetchAdaptiveNext(allMistakes)
          .then((content) => {
            if (content?.trim()) appendNextLine(content)
          })
          .catch(() => {
            fetchPracticeContent()
              .then((fallback) => {
                if (fallback?.trim()) {
                  const words = fallback.trim().split(/\s+/).slice(0, 10)
                  appendNextLine(words.join(' '))
                }
              })
              .catch(() => {})
          })
      }
    },
    [status, startTime, userInput, targetText, strictMode]
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
    inputRef,
    nextLinePersonalized,
    strictModeErrorActive,
    strictModeErrorsCount,
  }
}
