import { ThemeToggle } from './ThemeToggle'

export function Header() {
  return (
    <header className="border-b border-[var(--color-border)] bg-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <h1 className="text-lg font-semibold text-text-primary">Typing Coach</h1>
        <ThemeToggle />
      </div>
    </header>
  )
}
