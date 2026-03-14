import { api } from './client'
import type { User } from '../types/auth'

export type SessionHistoryItem = {
  id: string
  lessonId?: string
  lessonName?: string
  wpm: number
  accuracy: number
  durationSec: number
  createdAt: string
}

export type UserStats = {
  avgWpm: number
  accuracy: number
  totalSessions: number
  bestWpm: number
  totalTimeSec: number
  wpmTrend: number
  wpmOverTime: { date: string; wpm: number }[]
}

export async function fetchMySessions(limit?: number): Promise<SessionHistoryItem[]> {
  const url = limit ? `/api/users/me/sessions?limit=${limit}` : '/api/users/me/sessions'
  const data = await api.get<SessionHistoryItem[]>(url)
  return Array.isArray(data) ? data : []
}

export async function fetchMyStats(): Promise<UserStats | null> {
  try {
    const data = await api.get<UserStats>('/api/users/me/stats')
    return data
  } catch {
    return null
  }
}

export async function fetchMyProfile(): Promise<User | null> {
  try {
    return await api.get<User>('/api/users/me')
  } catch {
    return null
  }
}

export async function updateMyProfile(name: string): Promise<User> {
  return api.patch<User>('/api/users/me', { name })
}

export type SessionAnalytics = {
  rawErrors: number
  correctedErrors: number
  uncorrectedErrors: number
  weakKeys: { key: string; errors: number }[]
  backspacesPer100Chars: number
  speedOverTime: { windowStartSec: number; windowEndSec: number; wpm: number }[]
  insights: string[]
}

export type SessionDetail = {
  id: string
  lessonId?: string
  lessonName?: string
  wpm: number
  accuracy: number
  durationSec: number
  createdAt: string
  mistakes: { expected: string; typed: string; position: number }[] | string
  analytics?: SessionAnalytics
}

export type OverallHeatmapEntry = {
  key: string
  errors: number
}

export async function fetchSessionById(
  sessionId: string
): Promise<SessionDetail | null> {
  try {
    return await api.get<SessionDetail>(
      `/api/users/me/sessions/${sessionId}`
    )
  } catch {
    return null
  }
}

export async function fetchOverallHeatmap(): Promise<
  OverallHeatmapEntry[]
> {
  try {
    const data = await api.get<OverallHeatmapEntry[]>(
      '/api/users/me/overall-heatmap'
    )
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}
