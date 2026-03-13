import { useEffect, useState } from 'react'
import { fetchLessons } from '../api/lessons'
import type { Lesson } from '../types/lesson'

type UseLessonsReturn = {
  lessons: Lesson[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useLessons(): UseLessonsReturn {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchLessons()
      setLessons(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load lessons')
      setLessons([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return { lessons, loading, error, refetch: load }
}
