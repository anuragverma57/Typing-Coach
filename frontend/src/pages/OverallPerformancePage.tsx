import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchMyStats,
  fetchOverallHeatmap,
  type UserStats,
  type OverallHeatmapEntry,
} from '../api/users'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { KeyAccuracyHeatmap } from '../components/typing/KeyAccuracyHeatmap'

function formatTotalTime(sec: number): string {
  const hours = Math.floor(sec / 3600)
  const mins = Math.floor((sec % 3600) / 60)
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

export function OverallPerformancePage() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [heatmap, setHeatmap] = useState<OverallHeatmapEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchMyStats(), fetchOverallHeatmap()])
      .then(([s, h]) => {
        if (!cancelled) {
          setStats(s ?? null)
          setHeatmap(h)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            to="/app/reports"
            className="text-sm text-text-muted hover:text-accent"
          >
            ← Reports
          </Link>
          <h2 className="mt-1 text-2xl font-bold text-text-primary">
            Overall Performance
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Aggregated stats and weak keys across all your tests
          </p>
        </div>
        <Link to="/app/practice">
          <Button>New Practice</Button>
        </Link>
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="text-center">
            <p className="text-sm text-text-muted">Avg WPM</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">
              {stats.avgWpm.toFixed(1)}
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-text-muted">Best WPM</p>
            <p className="mt-1 text-2xl font-bold text-accent">
              {stats.bestWpm.toFixed(1)}
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-text-muted">Total Practice Time</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">
              {formatTotalTime(stats.totalTimeSec)}
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-text-muted">Total Sessions</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">
              {stats.totalSessions}
            </p>
          </Card>
        </div>
      )}

      <Card>
        <h3 className="mb-4 text-lg font-semibold text-text-primary">
          Overall Keyboard Heatmap
        </h3>
        <p className="mb-4 text-sm text-text-muted">
          Cumulative error counts per key across all your typing sessions
        </p>
        {heatmap.length > 0 ? (
          <KeyAccuracyHeatmap heatmapData={heatmap} />
        ) : (
          <p className="py-8 text-center text-sm text-text-muted">
            No data yet. Complete some practice sessions to see your overall
            weak keys.
          </p>
        )}
      </Card>
    </div>
  )
}
