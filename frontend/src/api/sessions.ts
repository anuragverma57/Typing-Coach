import { api } from './client'
import type { Mistake, KeystrokeEvent } from '../types/session'

type CreateSessionPayload = {
  lessonId?: string | null
  wpm: number
  accuracy: number
  mistakes: Mistake[]
  durationSec: number
  keystrokeEvents?: KeystrokeEvent[]
}

export type CreateSessionResponse = {
  id: string
}

export async function createSession(
  payload: CreateSessionPayload
): Promise<CreateSessionResponse | null> {
  const body: Record<string, unknown> = {
    lessonId: payload.lessonId ?? null,
    wpm: payload.wpm,
    accuracy: payload.accuracy,
    mistakes: payload.mistakes,
    durationSec: payload.durationSec,
  }
  if (payload.keystrokeEvents && payload.keystrokeEvents.length > 0) {
    body.keystrokeEvents = payload.keystrokeEvents
  }
  const res = await api.post<CreateSessionResponse>('/api/sessions', body)
  return res
}
