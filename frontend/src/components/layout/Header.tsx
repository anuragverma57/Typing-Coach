import { Link } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  return (
    <header className="border-b border-[var(--color-border)] bg-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link
          to="/"
          className="text-lg font-semibold text-text-primary hover:text-accent transition-colors"
        >
          Typing Coach
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}
