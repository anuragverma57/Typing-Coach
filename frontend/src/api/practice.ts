import { api } from './client'

export async function fetchAdaptiveInitial(): Promise<string> {
  const data = await api.get<{ content: string }>(
    '/api/practice/adaptive-initial'
  )
  return data?.content ?? ''
}

export type AdaptiveMistake = {
  expected: string
  typed: string
}

export type AdaptiveNextResponse = {
  content: string
}

export async function fetchAdaptiveNext(
  mistakes: AdaptiveMistake[]
): Promise<string> {
  const data = await api.post<AdaptiveNextResponse>(
    '/api/practice/adaptive-next',
    { mistakes }
  )
  return data?.content ?? ''
}
