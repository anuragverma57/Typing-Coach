export type User = {
  id: string
  email: string
  name?: string
  createdAt: string
  isAdmin?: boolean
  role?: string
}

export type AuthResponse = {
  token: string
  user: User
}
