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
