import { api } from './client'
import type { AuthResponse } from '../types/auth'

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> {
  return api.post<{ message: string }>('/api/auth/change-password', {
    currentPassword,
    newPassword,
  })
}

export async function signup(
  email: string,
  password: string
): Promise<AuthResponse> {
  return api.post<AuthResponse>('/api/auth/signup', { email, password })
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  return api.post<AuthResponse>('/api/auth/login', { email, password })
}
