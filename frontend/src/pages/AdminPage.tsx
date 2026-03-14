import { useEffect, useState } from 'react'
import {
  fetchAdminStats,
  fetchAdminUsers,
  fetchAdminLessons,
  fetchAdminPosts,
  approvePost,
  rejectPost,
  type AdminStats,
  type AdminUsersResponse,
  type AdminLesson,
  type AdminPost,
} from '../api/admin'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

type TabId = 'users' | 'lessons' | 'posts'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [usersData, setUsersData] = useState<AdminUsersResponse | null>(null)
  const [lessons, setLessons] = useState<AdminLesson[]>([])
  const [posts, setPosts] = useState<AdminPost[]>([])
  const [activeTab, setActiveTab] = useState<TabId>('users')
  const [loading, setLoading] = useState(true)
  const [usersPage, setUsersPage] = useState(1)
  const [postActionLoading, setPostActionLoading] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const [s, u, l, p] = await Promise.all([
          fetchAdminStats(),
          fetchAdminUsers(1),
          fetchAdminLessons(),
          fetchAdminPosts(),
        ])
        if (!cancelled) {
          setStats(s ?? null)
          setUsersData(u ?? null)
          setLessons(l)
          setPosts(p)
        }
      } catch {
        if (!cancelled) setStats(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleApprovePost = async (id: string) => {
    setPostActionLoading(id)
    try {
      await approvePost(id)
      setPosts((p) => p.filter((x) => x.id !== id))
    } catch {
      // Community not implemented - ignore
    } finally {
      setPostActionLoading(null)
    }
  }

  const handleRejectPost = async (id: string) => {
    setPostActionLoading(id)
    try {
      await rejectPost(id)
      setPosts((p) => p.filter((x) => x.id !== id))
    } catch {
      // Community not implemented - ignore
    } finally {
      setPostActionLoading(null)
    }
  }

  useEffect(() => {
    if (activeTab !== 'users') return
    let cancelled = false
    fetchAdminUsers(usersPage).then((data) => {
      if (!cancelled) setUsersData(data ?? null)
    })
    return () => { cancelled = true }
  }, [activeTab, usersPage])

  const tabs: { id: TabId; label: string }[] = [
    { id: 'users', label: 'User Management' },
    { id: 'lessons', label: 'Lesson Management' },
    { id: 'posts', label: 'Community Posts' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Admin Panel</h2>
        <p className="mt-1 text-sm text-text-muted">
          Manage users, lessons, and community content
        </p>
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="text-center">
            <p className="text-sm text-text-muted">Total Users</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">
              {stats.totalUsers}
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-text-muted">Active Users (30d)</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">
              {stats.activeUsers}
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-text-muted">Total Lessons</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">
              {stats.totalLessons}
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-text-muted">Pending Approvals</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">
              {stats.pendingApprovals}
            </p>
          </Card>
        </div>
      )}

      <Card>
        <div className="flex flex-wrap gap-2 border-b border-[var(--color-border)] pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-accent text-white'
                  : 'bg-surface-muted text-text-secondary hover:bg-surface-muted/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : (
          <>
            {activeTab === 'users' && (
              <div className="mt-4">
                {usersData ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[var(--color-border)] text-left text-text-muted">
                            <th className="pb-3 pr-4 font-medium">Email</th>
                            <th className="pb-3 pr-4 font-medium">Name</th>
                            <th className="pb-3 pr-4 font-medium">Role</th>
                            <th className="pb-3 font-medium">Joined</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usersData.users.map((u) => (
                            <tr
                              key={u.id}
                              className="border-b border-[var(--color-border)] last:border-0"
                            >
                              <td className="py-3 pr-4 text-text-primary">
                                {u.email}
                              </td>
                              <td className="py-3 pr-4 text-text-secondary">
                                {u.name ?? '—'}
                              </td>
                              <td className="py-3 pr-4 text-text-secondary">
                                {u.role}
                              </td>
                              <td className="py-3 text-text-secondary">
                                {formatDate(u.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {usersData.total > usersData.limit && (
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-text-muted">
                          Page {usersData.page} of{' '}
                          {Math.ceil(usersData.total / usersData.limit)}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            className="px-3 py-1.5 text-xs"
                            onClick={() =>
                              setUsersPage((p) => Math.max(1, p - 1))
                            }
                            disabled={usersData.page <= 1}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="secondary"
                            className="px-3 py-1.5 text-xs"
                            onClick={() => setUsersPage((p) => p + 1)}
                            disabled={
                              usersData.page >=
                              Math.ceil(usersData.total / usersData.limit)
                            }
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="py-8 text-center text-sm text-text-muted">
                    Failed to load users
                  </p>
                )}
              </div>
            )}

            {activeTab === 'lessons' && (
              <div className="mt-4">
                {lessons.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--color-border)] text-left text-text-muted">
                          <th className="pb-3 pr-4 font-medium">Title</th>
                          <th className="pb-3 pr-4 font-medium">Type</th>
                          <th className="pb-3 pr-4 font-medium">Difficulty</th>
                          <th className="pb-3 pr-4 font-medium">Students</th>
                          <th className="pb-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lessons.map((l) => (
                          <tr
                            key={l.id}
                            className="border-b border-[var(--color-border)] last:border-0"
                          >
                            <td className="py-3 pr-4 text-text-primary">
                              {l.name}
                            </td>
                            <td className="py-3 pr-4 text-text-secondary">
                              {l.type}
                            </td>
                            <td className="py-3 pr-4 text-text-secondary">
                              {l.difficulty}
                            </td>
                            <td className="py-3 pr-4 text-text-secondary">
                              {l.studentCount}
                            </td>
                            <td className="py-3">
                              <div className="flex gap-2">
                                <Button
                                  variant="secondary"
                                  className="px-2 py-1 text-xs"
                                  disabled
                                  title="Coming soon"
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="px-2 py-1 text-xs"
                                  disabled
                                  title="Coming soon"
                                >
                                  Manage
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-text-muted">
                    No lessons found
                  </p>
                )}
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="mt-4">
                {posts.length > 0 ? (
                  <div className="space-y-3">
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        className="flex items-center justify-between rounded border border-[var(--color-border)] p-4"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-text-primary">
                            Post #{post.id}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            className="px-2 py-1 text-xs"
                            onClick={() => handleApprovePost(post.id)}
                            disabled={postActionLoading === post.id}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            className="px-2 py-1 text-xs text-incorrect hover:bg-incorrect/10"
                            onClick={() => handleRejectPost(post.id)}
                            disabled={postActionLoading === post.id}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-text-muted">
                    No pending community posts
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}
