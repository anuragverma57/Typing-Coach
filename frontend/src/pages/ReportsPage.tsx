import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

export function ReportsPage() {
  const navigate = useNavigate()
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
          <h2 className="text-2xl font-bold text-text-primary">Reports</h2>
          <p className="mt-1 text-sm text-text-muted">
            View all your typing session history
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/app/reports/overall">
            <Button variant="secondary">Overall Performance</Button>
          </Link>
          <Link to="/app/practice">
            <Button>New Practice</Button>
          </Link>
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : error ? (
          <p className="text-sm text-incorrect">{error}</p>
        ) : sessions.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">
            No sessions yet. Start practicing to see your reports here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-text-muted">
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 pr-4 font-medium">Lesson</th>
                  <th className="pb-3 pr-4 font-medium">WPM</th>
                  <th className="pb-3 pr-4 font-medium">Accuracy</th>
                  <th className="pb-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr
                    key={s.id}
                    className="cursor-pointer border-b border-[var(--color-border)] last:border-0 hover:bg-surface-muted/50"
                    onClick={() => navigate(`/app/reports/${s.id}`)}
                  >
                    <td className="py-3 pr-4 text-text-secondary">
                      {formatDate(s.createdAt)}
                    </td>
                    <td className="py-3 pr-4 text-text-primary">
                      {s.lessonName ?? 'Free Practice'}
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">
                      {s.wpm.toFixed(1)}
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">
                      {s.accuracy.toFixed(1)}%
                    </td>
                    <td className="py-3 text-text-secondary">
                      {formatDuration(s.durationSec)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
