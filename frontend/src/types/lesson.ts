export type Lesson = {
  id: string
  name: string
  description: string
  content: string
  type: string
  difficulty?: string
  sequenceOrder?: number
  locked?: boolean
  progress?: number
  status?: 'completed' | 'not_started' | 'locked'
  createdAt: string
}
