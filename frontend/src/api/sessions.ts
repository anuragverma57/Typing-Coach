import { api } from './client'
import type { Mistake } from '../types/session'

type CreateSessionPayload = {
  lessonId?: string | null
  wpm: number
  accuracy: number
  mistakes: Mistake[]
  durationSec: number
}

export async function createSession(payload: CreateSessionPayload): Promise<void> {
  const body = {
    lessonId: payload.lessonId ?? null,
    wpm: payload.wpm,
    accuracy: payload.accuracy,
    mistakes: payload.mistakes,
    durationSec: payload.durationSec,
  }
  await api.post('/api/sessions', body)
}
