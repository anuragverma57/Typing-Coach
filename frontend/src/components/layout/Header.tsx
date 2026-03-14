import { Link } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'

export function Header() {
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <header className="border-b border-[var(--color-border)] bg-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link
          to="/"
          className="text-lg font-semibold text-text-primary hover:text-accent transition-colors"
        >
          Typing Coach
        </Link>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="text-sm text-text-secondary hover:text-text-primary"
              >
                Dashboard
              </Link>
              <span className="text-sm text-text-muted">{user?.email}</span>
              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary">Sign up</Button>
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
