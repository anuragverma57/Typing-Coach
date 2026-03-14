import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  fetchMyProfile,
  fetchMySessions,
  fetchMyStats,
  updateMyProfile,
  type SessionHistoryItem,
  type UserStats,
} from '../api/users'
import { changePassword } from '../api/auth'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
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

function formatTotalTime(sec: number): string {
  const hours = Math.floor(sec / 3600)
  const mins = Math.floor((sec % 3600) / 60)
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

function getInitials(name?: string, email?: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }
  if (email?.[0]) return email[0].toUpperCase()
  return '?'
}

export function ProfilePage() {
  const { user, updateUser, logout } = useAuth()
  const [profile, setProfile] = useState(user)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [sessions, setSessions] = useState<SessionHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editName, setEditName] = useState('')
  const [showEditForm, setShowEditForm] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [editSuccess, setEditSuccess] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  })
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const [p, s, sess] = await Promise.all([
          fetchMyProfile(),
          fetchMyStats(),
          fetchMySessions(10),
        ])
        if (!cancelled) {
          if (p) {
            setProfile(p)
            updateUser(p)
            setEditName(p.name ?? '')
          }
          setStats(s ?? null)
          setSessions(sess)
        }
      } catch {
        if (!cancelled) setProfile(user)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (!user?.id) return
    load()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only refetch when user id changes (login), not when profile updates
  }, [user?.id, updateUser])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditError(null)
    setEditSuccess(false)
    try {
      const updated = await updateMyProfile(editName.trim())
      setProfile(updated)
      updateUser(updated)
      setShowEditForm(false)
      setEditSuccess(true)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('New passwords do not match')
      return
    }
    if (passwordForm.new.length < 8) {
      setPasswordError('New password must be at least 8 characters')
      return
    }
    try {
      await changePassword(passwordForm.current, passwordForm.new)
      setShowPasswordForm(false)
      setPasswordForm({ current: '', new: '', confirm: '' })
      setPasswordSuccess(true)
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password')
    }
  }

  const displayUser = profile ?? user

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Profile</h2>
        <p className="mt-1 text-sm text-text-muted">
          Manage your account settings
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : (
        <>
          <Card>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent/20 text-2xl font-semibold text-accent">
                {getInitials(displayUser?.name, displayUser?.email)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-text-primary">
                  {displayUser?.name || displayUser?.email || '—'}
                </p>
                <p className="text-sm text-text-muted">
                  {displayUser?.email}
                </p>
                <p className="mt-1 text-sm text-text-muted">
                  Member since{' '}
                  {displayUser?.createdAt
                    ? new Date(displayUser.createdAt).toLocaleDateString()
                    : '—'}
                </p>
              </div>
              {!showEditForm ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowEditForm(true)
                    setEditName(displayUser?.name ?? '')
                    setEditError(null)
                  }}
                >
                  Edit Profile
                </Button>
              ) : (
                <form
                  onSubmit={handleProfileSubmit}
                  className="flex flex-wrap items-end gap-3"
                >
                  <div>
                    <label className="block text-sm text-text-muted">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="mt-1 rounded border border-[var(--color-border)] bg-surface-muted px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Save</Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowEditForm(false)
                        setEditError(null)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                  {editError && (
                    <p className="w-full text-sm text-incorrect">{editError}</p>
                  )}
                  {editSuccess && (
                    <p className="w-full text-sm text-correct">Profile updated</p>
                  )}
                </form>
              )}
            </div>
          </Card>

          {stats && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Card className="text-center">
                <p className="text-sm text-text-muted">Total Tests</p>
                <p className="mt-1 text-2xl font-bold text-text-primary">
                  {stats.totalSessions}
                </p>
              </Card>
              <Card className="text-center">
                <p className="text-sm text-text-muted">Practice Time</p>
                <p className="mt-1 text-2xl font-bold text-text-primary">
                  {formatTotalTime(stats.totalTimeSec)}
                </p>
              </Card>
              <Card className="text-center">
                <p className="text-sm text-text-muted">Best WPM</p>
                <p className="mt-1 text-2xl font-bold text-text-primary">
                  {stats.bestWpm.toFixed(1)}
                </p>
              </Card>
              <Card className="text-center">
                <p className="text-sm text-text-muted">Avg WPM</p>
                <p className="mt-1 text-2xl font-bold text-text-primary">
                  {stats.avgWpm.toFixed(1)}
                </p>
              </Card>
              <Card className="text-center">
                <p className="text-sm text-text-muted">Avg Accuracy</p>
                <p className="mt-1 text-2xl font-bold text-text-primary">
                  {stats.accuracy.toFixed(1)}%
                </p>
              </Card>
            </div>
          )}

          <Card>
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              Recent Tests
            </h3>
            {sessions.length === 0 ? (
              <p className="py-6 text-center text-sm text-text-muted">
                No sessions yet. Start practicing to see your history.
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
                        className="border-b border-[var(--color-border)] last:border-0"
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

          <Card>
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              Account
            </h3>
            {!showPasswordForm ? (
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowPasswordForm(true)
                    setPasswordForm({ current: '', new: '', confirm: '' })
                    setPasswordError(null)
                  }}
                >
                  Change Password
                </Button>
                <Button variant="ghost" onClick={logout}>
                  Logout
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handlePasswordSubmit}
                className="max-w-md space-y-4"
              >
                <div>
                  <label className="block text-sm text-text-muted">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.current}
                    onChange={(e) =>
                      setPasswordForm((p) => ({ ...p, current: e.target.value }))
                    }
                    className="mt-1 w-full rounded border border-[var(--color-border)] bg-surface-muted px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-muted">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.new}
                    onChange={(e) =>
                      setPasswordForm((p) => ({ ...p, new: e.target.value }))
                    }
                    className="mt-1 w-full rounded border border-[var(--color-border)] bg-surface-muted px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-muted">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) =>
                      setPasswordForm((p) => ({ ...p, confirm: e.target.value }))
                    }
                    className="mt-1 w-full rounded border border-[var(--color-border)] bg-surface-muted px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>
                {passwordError && (
                  <p className="text-sm text-incorrect">{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p className="text-sm text-correct">Password updated</p>
                )}
                <div className="flex gap-3">
                  <Button type="submit">Update Password</Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowPasswordForm(false)
                      setPasswordError(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
