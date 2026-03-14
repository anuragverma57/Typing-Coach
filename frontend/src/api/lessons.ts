import { api } from './client'
import type { Lesson } from '../types/lesson'

export async function fetchLessons(): Promise<Lesson[]> {
  const data = await api.get<Lesson[]>('/api/lessons')
  return Array.isArray(data) ? data : []
}

export async function fetchLessonById(id: string): Promise<Lesson | null> {
  try {
    return await api.get<Lesson>(`/api/lessons/${id}`)
  } catch {
    return null
  }
}

export async function fetchLessonContent(
  lessonId: string,
  durationSec?: number,
  append?: boolean
): Promise<string> {
  const params = new URLSearchParams()
  if (durationSec && durationSec > 0) params.set('duration', String(durationSec))
  if (append) params.set('append', 'true')
  const query = params.toString()
  const url = `/api/lessons/${lessonId}/content${query ? `?${query}` : ''}`
  const data = await api.get<{ content: string }>(url)
  return data?.content ?? ''
}

export async function fetchPracticeContent(
  durationSec?: number,
  append?: boolean
): Promise<string> {
  const params = new URLSearchParams()
  if (durationSec && durationSec > 0) params.set('duration', String(durationSec))
  if (append) params.set('append', 'true')
  const query = params.toString()
  const url = `/api/practice/content${query ? `?${query}` : ''}`
  const data = await api.get<{ content: string }>(url)
  return data?.content ?? ''
}
