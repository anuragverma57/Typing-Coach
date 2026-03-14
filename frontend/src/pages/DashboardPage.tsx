import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import {
  fetchMySessions,
  fetchMyStats,
  type SessionHistoryItem,
  type UserStats,
} from '../api/users'
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

function computeStatsFromSessions(
  sessions: SessionHistoryItem[]
): Pick<UserStats, 'avgWpm' | 'accuracy' | 'totalSessions' | 'bestWpm'> {
  if (sessions.length === 0) {
    return { avgWpm: 0, accuracy: 0, totalSessions: 0, bestWpm: 0 }
  }
  const totalWpm = sessions.reduce((s, x) => s + x.wpm, 0)
  const totalAcc = sessions.reduce((s, x) => s + x.accuracy, 0)
  const bestWpm = Math.max(...sessions.map((x) => x.wpm))
  return {
    avgWpm: totalWpm / sessions.length,
    accuracy: totalAcc / sessions.length,
    totalSessions: sessions.length,
    bestWpm,
  }
}

function StatCard({
  label,
  value,
  trend,
  isEmpty,
}: {
  label: string
  value: string | number
  trend?: number
  isEmpty?: boolean
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-surface-muted/50 p-6 shadow-sm">
      <p className="text-sm text-text-muted">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold ${isEmpty ? 'text-text-muted' : 'text-text-primary'}`}
      >
        {value}
      </p>
      {trend !== undefined && trend !== 0 && !isEmpty && (
        <p
          className={`mt-1 text-sm ${trend > 0 ? 'text-correct' : 'text-incorrect'}`}
        >
          {trend > 0 ? '+' : ''}
          {trend.toFixed(1)}% from last week
        </p>
      )}
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [sessions, setSessions] = useState<SessionHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    Promise.allSettled([fetchMyStats(), fetchMySessions(5)]).then(
      ([statsResult, sessionsResult]) => {
        if (cancelled) return

        const statsData =
          statsResult.status === 'fulfilled' ? statsResult.value : null
        const sessionsData =
          sessionsResult.status === 'fulfilled'
            ? Array.isArray(sessionsResult.value)
              ? sessionsResult.value
              : []
            : []

        if (statsData) {
          setStats(statsData)
        } else if (sessionsData.length > 0) {
          const computed = computeStatsFromSessions(sessionsData)
          setStats({
            ...computed,
            totalTimeSec: 0,
            wpmTrend: 0,
            wpmOverTime: [],
          })
        } else {
          setStats({
            avgWpm: 0,
            accuracy: 0,
            totalSessions: 0,
            bestWpm: 0,
            totalTimeSec: 0,
            wpmTrend: 0,
            wpmOverTime: [],
          })
        }

        setSessions(sessionsData)

        const bothFailed =
          statsResult.status === 'rejected' &&
          sessionsResult.status === 'rejected'
        if (bothFailed) {
          setError(
            statsResult.reason instanceof Error
              ? statsResult.reason.message
              : 'Failed to load dashboard'
          )
        }
      }
    ).finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => { cancelled = true }
  }, [])

  const displayStats = stats ?? {
    avgWpm: 0,
    accuracy: 0,
    totalSessions: 0,
    bestWpm: 0,
    totalTimeSec: 0,
    wpmTrend: 0,
    wpmOverTime: [],
  }

  const isEmpty = displayStats.totalSessions === 0
  const userName = user?.email?.split('@')[0] ?? 'there'

  const formatStatValue = (
    val: number,
    suffix: string,
    showDashWhenEmpty = false
  ): string => {
    if (isEmpty && showDashWhenEmpty) return '—'
    if (isEmpty) return `${val}${suffix}`
    return `${val.toFixed(1)}${suffix}`
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-text-primary">Dashboard</h2>
        <p className="text-incorrect">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">
            Welcome back, {userName}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Here&apos;s your typing progress
          </p>
        </div>
        <Link to="/app/practice">
          <Button className="px-6 py-3">Start New Test</Button>
        </Link>
      </div>

      {isEmpty && (
        <p className="rounded-lg border border-[var(--color-border)] bg-surface-muted/30 px-4 py-3 text-sm text-text-muted">
          Complete your first practice to see your stats.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Average WPM"
          value={formatStatValue(displayStats.avgWpm, '', true)}
          trend={displayStats.wpmTrend}
          isEmpty={isEmpty}
        />
        <StatCard
          label="Accuracy"
          value={formatStatValue(displayStats.accuracy, '%', true)}
          isEmpty={isEmpty}
        />
        <StatCard
          label="Practice Sessions"
          value={displayStats.totalSessions}
          isEmpty={isEmpty}
        />
        <StatCard
          label="Best WPM"
          value={formatStatValue(displayStats.bestWpm, '', true)}
          isEmpty={isEmpty}
        />
      </div>

      {displayStats.wpmOverTime.length > 0 && (
        <Card>
          <h3 className="text-sm font-medium text-text-secondary">
            WPM over time (last 30 days)
          </h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayStats.wpmOverTime}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                />
                <XAxis
                  dataKey="date"
                  stroke="var(--color-text-muted)"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => {
                    const d = new Date(v)
                    return `${d.getMonth() + 1}/${d.getDate()}`
                  }}
                />
                <YAxis
                  stroke="var(--color-text-muted)"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => v.toFixed(0)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface-muted)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                  }}
                  formatter={(value) =>
                    value != null ? [`${Number(value).toFixed(1)}`, 'WPM'] : null
                  }
                  labelFormatter={(label) =>
                    label ? new Date(String(label)).toLocaleDateString() : ''
                  }
                />
                <Line
                  type="monotone"
                  dataKey="wpm"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-text-primary">
          Recent activity
        </h3>
        <div className="flex gap-2">
          <Link to="/app/practice">
            <Button variant="secondary">Continue Practice</Button>
          </Link>
          <Link to="/app/reports">
            <Button variant="ghost">View All Reports</Button>
          </Link>
        </div>
      </div>

      <Card>
        {sessions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-text-muted">
              No sessions yet. Start your first practice to see your progress
              here.
            </p>
            <Link to="/app/practice" className="mt-4 inline-block">
              <Button>Start Practice</Button>
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
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
