import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ThemeToggle } from '../layout/ThemeToggle'

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { to: '/app/practice', label: 'Practice', icon: PracticeIcon },
  { to: '/app/lessons', label: 'Lessons', icon: LessonsIcon },
  { to: '/app/reports', label: 'Reports', icon: ReportsIcon },
  { to: '/app/profile', label: 'Profile', icon: ProfileIcon },
]

function DashboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  )
}

function PracticeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

function LessonsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 0 0 1 0-5H20" />
    </svg>
  )
}

function ReportsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function AdminIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  )
}

type SidebarProps = {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-accent/10 text-accent'
        : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
    }`

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-64 flex-col border-r border-[var(--color-border)] bg-surface transition-transform duration-200 lg:flex lg:translate-x-0 ${
          isOpen ? 'flex translate-x-0' : 'hidden -translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-[var(--color-border)] px-4">
          <span className="text-lg font-bold text-text-primary">Typing Coach</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted hover:bg-surface-muted lg:hidden"
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass} onClick={onClose}>
              <Icon />
              {label}
            </NavLink>
          ))}
          {user?.isAdmin && (
            <NavLink to="/app/admin" className={linkClass} onClick={onClose}>
              <AdminIcon />
              Admin
            </NavLink>
          )}
        </nav>
        <div className="border-t border-[var(--color-border)] p-4 space-y-2">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-sm font-medium text-accent">
              {user?.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <span className="truncate text-sm text-text-secondary">{user?.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={logout}
              className="flex-1 rounded-lg px-3 py-2 text-left text-sm text-text-secondary hover:bg-surface-muted hover:text-text-primary"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
