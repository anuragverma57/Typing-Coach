import { api } from './client'

export type SessionHistoryItem = {
  id: string
  lessonId?: string
  lessonName?: string
  wpm: number
  accuracy: number
  durationSec: number
  createdAt: string
}

export async function fetchMySessions(): Promise<SessionHistoryItem[]> {
  const data = await api.get<SessionHistoryItem[]>('/api/users/me/sessions')
  return Array.isArray(data) ? data : []
}
