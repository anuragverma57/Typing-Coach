export type User = {
  id: string
  email: string
  createdAt: string
}

export type AuthResponse = {
  token: string
  user: User
}
