export type SessionStatus = 'idle' | 'typing' | 'finished'

export type CharacterStatus = 'correct' | 'incorrect' | 'current' | 'pending'

export type TypingSessionState = {
  targetText: string
  userInput: string
  startTime: number | null
  status: SessionStatus
}

export type Mistake = {
  expected: string
  typed: string
  position: number
}

export type KeystrokeEvent = {
  key: string
  expectedChar: string
  correct: boolean
  timestamp: number
  cursorPosition: number
  isBackspace: boolean
}

export type SessionResult = {
  wpm: number
  accuracy: number
  correctChars: number
  totalChars: number
  durationSec: number
  mistakes: Mistake[]
  targetText: string
  userInput: string
  keystrokeEvents?: KeystrokeEvent[]
}
