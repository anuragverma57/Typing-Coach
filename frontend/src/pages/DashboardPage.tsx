import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { fetchMySessions, type SessionHistoryItem } from '../api/users'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function DashboardPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<SessionHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchMySessions()
      .then((data) => {
        if (!cancelled) setSessions(data)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium text-text-primary">Dashboard</h2>
          <p className="mt-1 text-sm text-text-muted">
            Welcome back, {user?.email}
          </p>
        </div>
        <Link to="/">
          <Button variant="secondary">Practice</Button>
        </Link>
      </div>

      <Card>
        <h3 className="text-sm font-medium text-text-secondary">
          Typing history
        </h3>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : error ? (
          <p className="mt-4 text-sm text-incorrect">{error}</p>
        ) : sessions.length === 0 ? (
          <p className="mt-4 text-sm text-text-muted">
            No sessions yet. Start practicing to see your history here.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {sessions.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] bg-surface px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-text-primary">
                    {s.lessonName ?? 'Free Practice'}
                  </p>
                  <p className="text-xs text-text-muted">
                    {formatDate(s.createdAt)}
                  </p>
                </div>
                <div className="flex gap-4 text-sm text-text-secondary">
                  <span>WPM: {s.wpm.toFixed(1)}</span>
                  <span>Accuracy: {s.accuracy.toFixed(1)}%</span>
                  <span>Time: {formatDuration(s.durationSec)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
