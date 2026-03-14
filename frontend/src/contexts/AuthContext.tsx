/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { setToken } from '../api/client'
import { login as apiLogin, signup as apiSignup } from '../api/auth'
import type { User } from '../types/auth'

type AuthContextValue = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, confirmPassword: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'typing-coach-token'
const USER_KEY = 'typing-coach-user'

function parseJwtPayload(token: string): { exp?: number } | null {
  try {
    const base64 = token.split('.')[1]
    if (!base64) return null
    return JSON.parse(atob(base64)) as { exp?: number }
  } catch {
    return null
  }
}

function getUserFromStorage(): User | null {
  try {
    const stored = localStorage.getItem(USER_KEY)
    if (!stored) return null
    return JSON.parse(stored) as User
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getUserFromStorage)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    const payload = parseJwtPayload(token)
    if (payload?.exp && payload.exp * 1000 < Date.now()) {
      setToken(null)
      localStorage.removeItem(USER_KEY)
      setUser(null)
    } else {
      setUser(getUserFromStorage())
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password)
    setToken(res.token)
    localStorage.setItem(USER_KEY, JSON.stringify(res.user))
    setUser(res.user)
  }, [])

  const signup = useCallback(
    async (email: string, password: string, confirmPassword: string) => {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match')
      }
      const res = await apiSignup(email, password)
      setToken(res.token)
      localStorage.setItem(USER_KEY, JSON.stringify(res.user))
      setUser(res.user)
    },
    []
  )

  const logout = useCallback(() => {
    setToken(null)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
