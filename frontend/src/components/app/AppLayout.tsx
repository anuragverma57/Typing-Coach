import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { ProtectedRoute } from '../ProtectedRoute'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-surface">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-64">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-[var(--color-border)] bg-surface/80 px-4 backdrop-blur-sm lg:px-8">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-text-secondary hover:bg-surface-muted lg:hidden"
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
