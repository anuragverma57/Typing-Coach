import { api } from './client'

export type AdminStats = {
  totalUsers: number
  activeUsers: number
  totalLessons: number
  pendingApprovals: number
}

export type AdminUser = {
  id: string
  email: string
  name?: string
  role: string
  isAdmin: boolean
  createdAt: string
}

export type AdminUsersResponse = {
  users: AdminUser[]
  total: number
  page: number
  limit: number
}

export type AdminLesson = {
  id: string
  name: string
  description: string
  type: string
  difficulty: string
  studentCount: number
}

export type AdminPost = {
  id: string
  [key: string]: unknown
}

export async function fetchAdminStats(): Promise<AdminStats | null> {
  try {
    return await api.get<AdminStats>('/api/admin/stats')
  } catch {
    return null
  }
}

export async function fetchAdminUsers(
  page = 1,
  limit = 20
): Promise<AdminUsersResponse | null> {
  try {
    return await api.get<AdminUsersResponse>(
      `/api/admin/users?page=${page}&limit=${limit}`
    )
  } catch {
    return null
  }
}

export async function fetchAdminLessons(): Promise<AdminLesson[]> {
  try {
    const data = await api.get<AdminLesson[]>('/api/admin/lessons')
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export async function fetchAdminPosts(): Promise<AdminPost[]> {
  try {
    const data = await api.get<AdminPost[]>('/api/admin/posts')
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export async function approvePost(id: string): Promise<void> {
  await api.post(`/api/admin/posts/${id}/approve`, {})
}

export async function rejectPost(id: string): Promise<void> {
  await api.post(`/api/admin/posts/${id}/reject`, {})
}
