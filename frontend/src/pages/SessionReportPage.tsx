import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { fetchSessionById, type SessionDetail } from '../api/users'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { MistakeReport } from '../components/typing/MistakeReport'
import { KeyAccuracyHeatmap } from '../components/typing/KeyAccuracyHeatmap'
import { getSuggestions } from '../services/mistakeAnalysis'
import type { KeyStats } from '../services/mistakeAnalysis'
import type { Mistake } from '../types/session'

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function deriveKeyStatsFromMistakes(mistakes: Mistake[]): Map<string, KeyStats> {
  const keyStats = new Map<string, KeyStats>()
  for (const m of mistakes) {
    const k = m.expected.toLowerCase()
    const s = keyStats.get(k) ?? {
      key: k,
      correct: 0,
      total: 0,
      accuracy: 100,
    }
    s.total++
    keyStats.set(k, s)
  }
  for (const [, s] of keyStats) {
    s.correct = 0
    s.accuracy = s.total > 0 ? 0 : 100
  }
  return keyStats
}

export function SessionReportPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<SessionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!sessionId) {
      setNotFound(true)
      setLoading(false)
      return
    }
    let cancelled = false
    fetchSessionById(sessionId)
      .then((s) => {
        if (!cancelled) {
          setSession(s ?? null)
          setNotFound(!s)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [sessionId])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  if (notFound || !session) {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-text-primary">Session Not Found</h2>
        <Card>
          <p className="text-center text-text-muted">
            This session does not exist or you don't have access to it.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/app/reports">
              <Button>View All Reports</Button>
            </Link>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  let mistakes: Mistake[] = []
  if (Array.isArray(session.mistakes)) {
    mistakes = session.mistakes
  } else if (typeof session.mistakes === 'string') {
    try {
      const parsed = JSON.parse(session.mistakes)
      mistakes = Array.isArray(parsed) ? parsed : []
    } catch {
      mistakes = []
    }
  }
  const keyStats = deriveKeyStatsFromMistakes(mistakes)
  const suggestions = getSuggestions(keyStats)
  const analytics = session.analytics
  const weakKeys =
    analytics?.weakKeys && analytics.weakKeys.length > 0
      ? analytics.weakKeys.map((k) => ({
          key: k.key,
          errors: k.errors,
          percentage: 0,
        }))
      : [...keyStats.values()]
          .map((s) => ({
            key: s.key,
            errors: s.total,
            percentage: s.total > 0 ? 0 : 100,
          }))
          .filter((k) => k.errors > 0)
          .sort((a, b) => b.errors - a.errors)

  const heatmapData =
    analytics?.weakKeys && analytics.weakKeys.length > 0
      ? analytics.weakKeys
      : [...keyStats.values()]
          .filter((s) => s.total > 0)
          .map((s) => ({ key: s.key, errors: s.total }))

  const speedChartData =
    analytics?.speedOverTime?.map((w) => ({
      label: `${w.windowStartSec}-${w.windowEndSec}s`,
      wpm: Math.round(w.wpm * 10) / 10,
    })) ?? []

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
            Test Results
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            {session.lessonName ?? 'Free Practice'} •{' '}
            {new Date(session.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/app/practice')}>Practice Again</Button>
          <Link to="/app/reports">
            <Button variant="secondary">View All Reports</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-accent">
            {session.wpm.toFixed(1)}
          </div>
          <div className="mt-1 text-sm text-text-muted">WPM</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-accent">
            {session.accuracy.toFixed(1)}%
          </div>
          <div className="mt-1 text-sm text-text-muted">Accuracy</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-accent">
            {mistakes.length}
          </div>
          <div className="mt-1 text-sm text-text-muted">Errors</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-accent">
            {formatDuration(session.durationSec)}
          </div>
          <div className="mt-1 text-sm text-text-muted">Time</div>
        </Card>
      </div>

      {analytics && (
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Keystroke Analytics
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-lg bg-surface-muted/50 p-3 text-center">
              <div className="text-xl font-bold text-text-primary">
                {analytics.rawErrors}
              </div>
              <div className="mt-1 text-xs text-text-muted">Raw errors</div>
            </div>
            <div className="rounded-lg bg-surface-muted/50 p-3 text-center">
              <div className="text-xl font-bold text-correct">
                {analytics.correctedErrors}
              </div>
              <div className="mt-1 text-xs text-text-muted">Corrected</div>
            </div>
            <div className="rounded-lg bg-surface-muted/50 p-3 text-center">
              <div className="text-xl font-bold text-incorrect">
                {analytics.uncorrectedErrors}
              </div>
              <div className="mt-1 text-xs text-text-muted">Uncorrected</div>
            </div>
            <div className="rounded-lg bg-surface-muted/50 p-3 text-center">
              <div className="text-xl font-bold text-text-primary">
                {analytics.backspacesPer100Chars.toFixed(1)}
              </div>
              <div className="mt-1 text-xs text-text-muted">
                Backspaces/100 chars
              </div>
            </div>
          </div>
        </Card>
      )}

      {speedChartData.length > 0 && (
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Speed Over Time
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={speedChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                />
                <XAxis
                  dataKey="label"
                  stroke="var(--color-text-muted)"
                  fontSize={12}
                />
                <YAxis
                  stroke="var(--color-text-muted)"
                  fontSize={12}
                  tickFormatter={(v) => `${v} wpm`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [
                    `${value != null ? value : 0} wpm`,
                    'WPM',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="wpm"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-accent)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {analytics?.insights && analytics.insights.length > 0 && (
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Insights
          </h3>
          <ul className="space-y-2">
            {analytics.insights.map((insight, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-text-secondary"
              >
                <span className="text-accent">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {weakKeys.length > 0 && (
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Weak Keys
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-text-muted">
                  <th className="pb-3 pr-4 font-medium">Key</th>
                  <th className="pb-3 pr-4 font-medium">Errors</th>
                  <th className="pb-3 font-medium">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {weakKeys.map((k, i) => (
                  <tr
                    key={k.key}
                    className={`border-b border-[var(--color-border)] last:border-0 ${
                      i < 3 ? 'bg-incorrect/5' : ''
                    }`}
                  >
                    <td className="py-3 pr-4 font-mono text-text-primary">
                      {k.key === ' ' ? '␣' : k.key}
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">
                      {k.errors}
                    </td>
                    <td className="py-3 text-text-secondary">
                      {k.percentage.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {heatmapData.length > 0 && (
        <Card>
          <KeyAccuracyHeatmap heatmapData={heatmapData} />
        </Card>
      )}

      {suggestions.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suggestions.slice(0, 3).map((suggestion, i) => (
            <Card key={i}>
              <p className="text-sm text-text-secondary">{suggestion}</p>
            </Card>
          ))}
        </div>
      )}

      {mistakes.length > 0 && (
        <Card>
          <MistakeReport mistakes={mistakes} />
        </Card>
      )}
    </div>
  )
}
