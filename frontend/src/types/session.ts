export type SessionStatus = 'idle' | 'typing' | 'finished'

export type CharacterStatus = 'correct' | 'incorrect' | 'current' | 'pending'

export type TypingSessionState = {
  targetText: string
  userInput: string
  startTime: number | null
  status: SessionStatus
}

export type SessionResult = {
  wpm: number
  accuracy: number
  correctChars: number
  totalChars: number
  durationSec: number
}
