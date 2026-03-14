import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'

export function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup(email, password, confirmPassword)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-medium text-text-primary">Sign up</h2>
        <p className="mt-1 text-sm text-text-muted">
          Create an account to track your progress
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
            placeholder="At least 8 characters"
            required
            minLength={8}
            autoComplete="new-password"
          />
          <Input
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat password"
            required
            autoComplete="new-password"
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-text-muted">
        Already have an account?{' '}
        <Link to="/login" className="text-accent hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}
