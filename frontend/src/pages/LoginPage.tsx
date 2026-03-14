import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname
      navigate(from ?? '/app/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-medium text-text-primary">Log in</h2>
        <p className="mt-1 text-sm text-text-muted">
          Enter your credentials to continue
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-incorrect">{error}</p>
          )}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Logging in...' : 'Log in'}
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-text-muted">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="text-accent hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
