import { Link } from 'react-router-dom'
import { ThemeToggle } from '../layout/ThemeToggle'
import { Button } from '../ui/Button'
import { useAuth } from '../../contexts/AuthContext'

export function LandingNav() {
  const { isAuthenticated } = useAuth()

  return (
    <nav className="border-b border-[var(--color-border)] bg-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link
          to="/"
          className="text-xl font-bold text-text-primary hover:text-accent transition-colors"
        >
          Typing Coach
        </Link>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Link to="/app/dashboard">
              <Button variant="primary">Go to App</Button>
            </Link>
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
    </nav>
  )
}
